export type PendingHomeUpload = {
  id: string;
  mimeType: string;
  fileName: string;
  summary: string | null;
};

const STORAGE_KEY = "yourdoc.pending_home_uploads";

function hasSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function readPendingHomeUploads(): PendingHomeUpload[] {
  if (!hasSessionStorage()) {
    return [];
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PendingHomeUpload[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item.id === "string")
      .slice(0, 20)
      .map((item) => ({
        id: item.id,
        mimeType: item.mimeType,
        fileName: item.fileName,
        summary: item.summary ?? null,
      }));
  } catch {
    return [];
  }
}

export function writePendingHomeUploads(items: PendingHomeUpload[]) {
  if (!hasSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
}

export function appendPendingHomeUpload(item: PendingHomeUpload) {
  const current = readPendingHomeUploads();
  const next = [item, ...current.filter((existing) => existing.id !== item.id)].slice(0, 20);
  writePendingHomeUploads(next);
}

export function consumePendingHomeUploads() {
  const current = readPendingHomeUploads();
  if (hasSessionStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
  return current;
}

export function clearPendingHomeUploads() {
  if (!hasSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}
