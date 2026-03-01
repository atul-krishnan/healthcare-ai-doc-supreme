"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateAnonSessionId } from "@/lib/yourdoc/anon-session";
import {
  appendPendingHomeUpload,
  readPendingHomeUploads,
  type PendingHomeUpload,
} from "@/lib/yourdoc/pending-home-uploads";

type UploadResponse = {
  upload?: PendingHomeUpload;
  error?: string;
};

interface SymptomInputProps {
  placeholder?: string;
  buttonText?: string;
  className?: string;
  showQuickActions?: boolean;
}

/* ── Icon helpers ──────────────────────────────────────── */
function RecordsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
    </svg>
  );
}

function DoctorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M12 4v2m-3 2h1.5m3 0H15" />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v7l-4 7a2 2 0 001.75 3h8.5A2 2 0 0018 17l-4-7V3" />
      <path d="M8 14h8" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

export function SymptomInput({
  placeholder = "Tell us what is bothering you",
  buttonText = "Start Care Guide",
  className = "",
  showQuickActions = true,
}: SymptomInputProps) {
  const [symptoms, setSymptoms] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploads, setUploads] = useState<PendingHomeUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUploads(readPendingHomeUploads());
  }, []);

  function openUploader() {
    fileInputRef.current?.click();
  }

  async function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const anonSessionId = getOrCreateAnonSessionId();
      const uploadedItems: PendingHomeUpload[] = [];

      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set("file", file);
        form.set("anonSessionId", anonSessionId);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: form,
        });

        const payload = (await response.json()) as UploadResponse;
        if (!response.ok || !payload.upload) {
          throw new Error(payload.error ?? `Failed to upload ${file.name}`);
        }

        appendPendingHomeUpload(payload.upload);
        uploadedItems.push(payload.upload);
      }

      setUploads(readPendingHomeUploads());
      setUploadStatus(
        uploadedItems.length === 1
          ? `${uploadedItems[0].fileName} attached for your intake.`
          : `${uploadedItems.length} files attached for your intake.`,
      );
    } catch (uploadError) {
      setUploadStatus(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (symptoms.trim()) {
      params.set("symptoms", symptoms.trim());
    }

    const query = params.toString();
    router.push(query ? `/intake?${query}` : "/intake");
  }

  return (
    <div className={className}>
      {/* ── Chat-style textarea + submit ─────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-2xl border border-[var(--line)] bg-[var(--brand-50)] px-4 py-4 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/70 outline-none transition-colors focus:border-[var(--brand-500)] focus:bg-white"
          />
          <div className="mt-2 flex items-center justify-between">
            {/* Upload button */}
            <button
              type="button"
              onClick={openUploader}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)] disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              {uploading ? "Uploading..." : "Attach records"}
            </button>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-600)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-all hover:bg-[var(--brand-700)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
            >
              {buttonText}
              <SparkleIcon />
            </button>
          </div>
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,image/*"
        onChange={handleUploadChange}
        className="hidden"
      />

      {/* ── PranaDoc-style action buttons ─────────────── */}
      {showQuickActions ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/vault")}
            className="hover-scale inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
          >
            <RecordsIcon />
            Records
          </button>
          <button
            type="button"
            onClick={() => router.push("/consultations")}
            className="hover-scale inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
          >
            <DoctorIcon />
            Get a Doctor
          </button>
          <button
            type="button"
            onClick={() => router.push("/health-records")}
            className="hover-scale inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
          >
            <LabIcon />
            Request a Lab
          </button>
        </div>
      ) : null}

      {/* ── Disclaimer ───────────────────────────────── */}
      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Create a Doctor Brief you can share with any doctor. Not a diagnosis. For emergencies, go to the nearest ER.
      </p>

      {/* ── Upload status ────────────────────────────── */}
      {uploadStatus ? <p className="mt-2 text-center text-xs text-[var(--brand-700)]">{uploadStatus}</p> : null}
      {uploads.length > 0 ? (
        <p className="mt-1 text-center text-xs text-[var(--muted)]">{uploads.length} file(s) ready to include in your intake.</p>
      ) : null}
    </div>
  );
}
