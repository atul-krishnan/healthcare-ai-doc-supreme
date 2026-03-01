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
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-2 text-sm text-[#5c6f80]">
            YourDoc Guide
            <input
              type="text"
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              placeholder={placeholder}
              className="h-14 w-full rounded-2xl border border-[#D8E6E6] bg-[#F4F9FB] px-4 text-sm text-[#1D3557] placeholder:text-[#97938d] outline-none focus:border-[#2A9D8F] transition-colors"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#2A9D8F] px-6 text-sm font-semibold text-white hover:bg-[#21867a] transition-colors"
          >
            {buttonText}
          </button>
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

      {showQuickActions ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={openUploader}
            disabled={uploading}
            className="rounded-full border border-[#D8E6E6] bg-white px-4 py-2.5 text-sm font-medium text-[#1D3557] hover:border-[#2A9D8F] disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload records"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/vault")}
            className="rounded-full border border-[#D8E6E6] bg-white px-4 py-2.5 text-sm font-medium text-[#1D3557] hover:border-[#2A9D8F]"
          >
            Look at my records
          </button>
          <button
            type="button"
            onClick={() => router.push("/consultations")}
            className="rounded-full border border-[#D8E6E6] bg-white px-4 py-2.5 text-sm font-medium text-[#1D3557] hover:border-[#2A9D8F]"
          >
            Talk to a doctor
          </button>
          <button
            type="button"
            onClick={() => router.push("/health-records")}
            className="rounded-full border border-[#D8E6E6] bg-white px-4 py-2.5 text-sm font-medium text-[#1D3557] hover:border-[#2A9D8F]"
          >
            Request a lab
          </button>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-[#5f768b]">
        Create a Doctor Brief you can share with any doctor. Not a diagnosis. For emergencies, go to the nearest ER.
      </p>

      {uploadStatus ? <p className="mt-2 text-xs text-[#2f6f62]">{uploadStatus}</p> : null}
      {uploads.length > 0 ? (
        <p className="mt-1 text-xs text-[#64748B]">{uploads.length} file(s) ready to include in your intake.</p>
      ) : null}
    </div>
  );
}
