import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(180).default(30),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  doctorId: z.string().uuid().optional(),
  action: z.string().trim().min(1).max(80).optional(),
});

type DoctorAccessEvent = {
  id: string;
  source: "doctor_access_log" | "audit_events";
  timestamp: string;
  action: string;
  doctor: {
    id: string | null;
    authUserId: string | null;
    name: string | null;
    specialization: string | null;
  };
  brief: {
    id: string | null;
    title: string | null;
    careSetting: string | null;
    departmentBucket: string | null;
  };
  consultation: {
    id: string | null;
    status: string | null;
    priority: string | null;
    chiefComplaint: string | null;
  };
  metadata: unknown;
};

function sortNewestFirst(a: DoctorAccessEvent, b: DoctorAccessEvent) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    days: searchParams.get("days") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    doctorId: searchParams.get("doctorId") ?? undefined,
    action: searchParams.get("action") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid audit query." }, { status: 400 });
  }

  const since = new Date(Date.now() - parsed.data.days * 24 * 60 * 60 * 1000).toISOString();

  let accessQuery = admin
    .from("doctor_access_log")
    .select("id, doctor_id, brief_id, timestamp, action")
    .gte("timestamp", since)
    .order("timestamp", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.doctorId) {
    accessQuery = accessQuery.eq("doctor_id", parsed.data.doctorId);
  }

  if (parsed.data.action) {
    accessQuery = accessQuery.eq("action", parsed.data.action);
  }

  const { data: accessRows, error: accessError } = await accessQuery;
  if (accessError) {
    return NextResponse.json({ error: accessError.message }, { status: 500 });
  }

  const { data: auditRows, error: auditError } = await admin
    .from("audit_events")
    .select("id, actor_user_id, action, resource_type, resource_id, metadata, created_at")
    .in("action", ["consultation_assigned", "consultation_completed", "consultation_status_updated"])
    .eq("resource_type", "consultation")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (auditError) {
    return NextResponse.json({ error: auditError.message }, { status: 500 });
  }

  const doctorIdsFromAccess = new Set((accessRows ?? []).map((item) => item.doctor_id));
  const doctorAuthIdsFromAudit = new Set((auditRows ?? []).map((item) => item.actor_user_id));
  const briefIds = new Set((accessRows ?? []).map((item) => item.brief_id));

  const [doctorsByIdResult, doctorsByAuthResult, briefsResult] = await Promise.all([
    doctorIdsFromAccess.size > 0
      ? admin
          .from("doctors")
          .select("id, auth_user_id, name, specialization")
          .in("id", [...doctorIdsFromAccess])
      : Promise.resolve({ data: [], error: null }),
    doctorAuthIdsFromAudit.size > 0
      ? admin
          .from("doctors")
          .select("id, auth_user_id, name, specialization")
          .in("auth_user_id", [...doctorAuthIdsFromAudit])
      : Promise.resolve({ data: [], error: null }),
    briefIds.size > 0
      ? admin
          .from("briefs")
          .select("id, title, care_setting, department_bucket")
          .in("id", [...briefIds])
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (doctorsByIdResult.error) {
    return NextResponse.json({ error: doctorsByIdResult.error.message }, { status: 500 });
  }

  if (doctorsByAuthResult.error) {
    return NextResponse.json({ error: doctorsByAuthResult.error.message }, { status: 500 });
  }

  if (briefsResult.error) {
    return NextResponse.json({ error: briefsResult.error.message }, { status: 500 });
  }

  const uniqueDoctorMap = new Map(
    [...(doctorsByIdResult.data ?? []), ...(doctorsByAuthResult.data ?? [])].map((item) => [item.id, item]),
  );
  const uniqueDoctors = [...uniqueDoctorMap.values()];

  const doctorById = new Map(uniqueDoctors.map((item) => [item.id, item]));
  const doctorByAuthUserId = new Map(uniqueDoctors.map((item) => [item.auth_user_id, item]));
  const briefById = new Map((briefsResult.data ?? []).map((item) => [item.id, item]));

  const consultationIds = (auditRows ?? [])
    .filter((item) => item.resource_type === "consultation")
    .map((item) => item.resource_id);

  const { data: consultations, error: consultationError } = consultationIds.length
    ? await admin
        .from("consultations")
        .select("id, status, priority, chief_complaint")
        .in("id", consultationIds)
    : { data: [], error: null };

  if (consultationError) {
    return NextResponse.json({ error: consultationError.message }, { status: 500 });
  }

  const consultationById = new Map((consultations ?? []).map((item) => [item.id, item]));

  const accessEvents: DoctorAccessEvent[] = (accessRows ?? []).map((item) => {
    const doctor = doctorById.get(item.doctor_id);
    const brief = briefById.get(item.brief_id);

    return {
      id: item.id,
      source: "doctor_access_log",
      timestamp: item.timestamp,
      action: item.action,
      doctor: {
        id: doctor?.id ?? item.doctor_id,
        authUserId: doctor?.auth_user_id ?? null,
        name: doctor?.name ?? null,
        specialization: doctor?.specialization ?? null,
      },
      brief: {
        id: brief?.id ?? item.brief_id,
        title: brief?.title ?? null,
        careSetting: brief?.care_setting ?? null,
        departmentBucket: brief?.department_bucket ?? null,
      },
      consultation: {
        id: null,
        status: null,
        priority: null,
        chiefComplaint: null,
      },
      metadata: {},
    };
  });

  const auditEvents: DoctorAccessEvent[] = (auditRows ?? []).map((item) => {
    const consultation = consultationById.get(item.resource_id);
    const doctor = doctorByAuthUserId.get(item.actor_user_id);

    return {
      id: item.id,
      source: "audit_events",
      timestamp: item.created_at,
      action: item.action,
      doctor: {
        id: doctor?.id ?? null,
        authUserId: doctor?.auth_user_id ?? item.actor_user_id,
        name: doctor?.name ?? null,
        specialization: doctor?.specialization ?? null,
      },
      brief: {
        id: null,
        title: null,
        careSetting: null,
        departmentBucket: null,
      },
      consultation: {
        id: consultation?.id ?? item.resource_id,
        status: consultation?.status ?? null,
        priority: consultation?.priority ?? null,
        chiefComplaint: consultation?.chief_complaint ?? null,
      },
      metadata: item.metadata,
    };
  });

  let merged = [...accessEvents, ...auditEvents].sort(sortNewestFirst);

  if (parsed.data.doctorId) {
    merged = merged.filter((item) => item.doctor.id === parsed.data.doctorId);
  }

  if (parsed.data.action) {
    merged = merged.filter((item) => item.action === parsed.data.action);
  }

  const summary = merged.reduce<Record<string, number>>((acc, item) => {
    acc[item.action] = (acc[item.action] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    events: merged.slice(0, parsed.data.limit),
    summary,
    doctorOptions: uniqueDoctors.map((item) => ({
      id: item.id,
      name: item.name,
      specialization: item.specialization,
    })),
  });
}
