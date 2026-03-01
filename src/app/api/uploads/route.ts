import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { extractDocumentInsights } from "@/lib/server/yourdoc/ocr";

const bucket = "brief-files";

function cleanFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function readMaxMb() {
  const parsed = Number(env.UPLOAD_MAX_MB ?? "20");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }
  return parsed;
}

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const anonSessionId = String(formData.get("anonSessionId") ?? "").trim();
  const briefIdRaw = String(formData.get("briefId") ?? "").trim();
  const briefId = briefIdRaw.length > 0 ? briefIdRaw : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  if (!anonSessionId) {
    return NextResponse.json({ error: "Missing anon session id." }, { status: 400 });
  }

  const maxMb = readMaxMb();
  if (file.size > maxMb * 1024 * 1024) {
    return NextResponse.json({ error: `File exceeds ${maxMb}MB limit.` }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileName = cleanFileName(file.name || "upload");
  const storagePath = `${anonSessionId}/${Date.now()}-${randomUUID()}-${fileName}`;

  const { error: storageError } = await admin.storage.from(bucket).upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    cacheControl: "3600",
  });

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const [ocr, authContext] = await Promise.all([
    extractDocumentInsights({ bytes, mimeType: file.type || "application/octet-stream" }),
    createSupabaseServerClient(),
  ]);

  const userId = authContext ? (await authContext.auth.getUser()).data.user?.id ?? null : null;

  if (briefId) {
    const { data: brief } = await admin
      .from("briefs")
      .select("id, user_id, anon_session_id")
      .eq("id", briefId)
      .maybeSingle();

    const userMatch = userId && brief?.user_id === userId;
    const anonMatch = !brief?.user_id && brief?.anon_session_id === anonSessionId;

    if (!brief || (!userMatch && !anonMatch)) {
      return NextResponse.json({ error: "Unable to attach upload to this brief." }, { status: 403 });
    }
  }

  const { data: inserted, error: dbError } = await admin
    .from("uploads")
    .insert({
      brief_id: briefId,
      user_id: userId,
      anon_session_id: anonSessionId,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      original_filename: fileName,
      ocr_text: ocr.ocrText,
      doc_summary: ocr.docSummary,
      extraction_confidence: ocr.extractionConfidence,
    })
    .select("id, mime_type, original_filename, doc_summary")
    .single();

  if (dbError || !inserted) {
    return NextResponse.json({ error: dbError?.message ?? "Unable to save upload." }, { status: 500 });
  }

  if (briefId) {
    const { data: uploads } = await admin.from("uploads").select("id", { count: "exact" }).eq("brief_id", briefId);
    await admin
      .from("briefs")
      .update({ attachment_count: uploads?.length ?? 0, updated_at: new Date().toISOString() })
      .eq("id", briefId);
  }

  return NextResponse.json({
    upload: {
      id: inserted.id,
      mimeType: inserted.mime_type,
      fileName: inserted.original_filename,
      summary: inserted.doc_summary,
    },
  });
}
