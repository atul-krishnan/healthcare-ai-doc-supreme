import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getUserRole } from "@/lib/server/roles";

type DoctorRow = Database["public"]["Tables"]["doctors"]["Row"];

const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function parseTimeToMinutes(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [hh, mm] = value.split(":");
  const hour = Number(hh);
  const minute = Number(mm);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

function fallsWithinAvailability(slotStartIso: string, doctor: DoctorRow) {
  const slotDate = new Date(slotStartIso);
  const day = dayKeys[slotDate.getUTCDay()];
  const configuredDays = new Set((doctor.availability_days ?? []).map((item) => item.toLowerCase()));

  if (configuredDays.size > 0 && !configuredDays.has(day)) {
    return false;
  }

  const startMinutes = parseTimeToMinutes(doctor.availability_start_time);
  const endMinutes = parseTimeToMinutes(doctor.availability_end_time);
  if (startMinutes === null || endMinutes === null) {
    return true;
  }

  const slotMinutes = slotDate.getUTCHours() * 60 + slotDate.getUTCMinutes();
  return slotMinutes >= startMinutes && slotMinutes < endMinutes;
}

export async function getDoctorRowByAuthUserId(supabase: SupabaseClient<Database>, authUserId: string) {
  const role = await getUserRole(supabase, authUserId);

  if (role !== "doctor" && role !== "admin") {
    return null;
  }

  const { data: existing, error } = await supabase
    .from("doctors")
    .select(
      "id, auth_user_id, name, phone, specialization, languages, years_experience, city, registration_number, registration_council, availability_enabled, availability_days, availability_start_time, availability_end_time, role, active, created_at, updated_at",
    )
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return existing;
}

export async function getActiveDoctorRow(supabase: SupabaseClient<Database>, authUserId: string) {
  const role = await getUserRole(supabase, authUserId);
  if (role !== "doctor" && role !== "admin") {
    return null;
  }

  const doctor = await getDoctorRowByAuthUserId(supabase, authUserId);
  if (!doctor || !doctor.active) {
    return null;
  }

  return doctor;
}

export async function pickAvailableDoctorForSlot(admin: SupabaseClient<Database>, slotStartIso: string) {
  const { data: candidates, error: doctorsError } = await admin
    .from("doctors")
    .select(
      "id, auth_user_id, name, phone, specialization, languages, years_experience, city, registration_number, registration_council, availability_enabled, availability_days, availability_start_time, availability_end_time, role, active, created_at, updated_at",
    )
    .eq("active", true)
    .eq("availability_enabled", true);

  if (doctorsError) {
    throw new Error(doctorsError.message);
  }

  const eligible = (candidates ?? []).filter((doctor) => fallsWithinAvailability(slotStartIso, doctor));
  if (eligible.length === 0) {
    return null;
  }

  const eligibleIds = eligible.map((doctor) => doctor.id);
  const { data: queueRows, error: queueError } = await admin
    .from("quickcheck_bookings")
    .select("doctor_id, status")
    .in("doctor_id", eligibleIds)
    .in("status", ["booked", "rescheduled"]);

  if (queueError) {
    throw new Error(queueError.message);
  }

  const queueCountByDoctor = new Map<string, number>();
  for (const row of queueRows ?? []) {
    if (!row.doctor_id) {
      continue;
    }
    queueCountByDoctor.set(row.doctor_id, (queueCountByDoctor.get(row.doctor_id) ?? 0) + 1);
  }

  const sorted = [...eligible].sort((a, b) => {
    const aCount = queueCountByDoctor.get(a.id) ?? 0;
    const bCount = queueCountByDoctor.get(b.id) ?? 0;
    if (aCount !== bCount) {
      return aCount - bCount;
    }
    return a.created_at.localeCompare(b.created_at);
  });

  return sorted[0]?.id ?? null;
}
