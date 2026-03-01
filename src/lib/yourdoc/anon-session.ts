const key = "yd_anon_session";

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateAnonSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(key);
  if (existing) {
    document.cookie = `yd_anon_session=${encodeURIComponent(existing)}; path=/; max-age=31536000; samesite=lax`;
    return existing;
  }

  const created = createSessionId();
  window.localStorage.setItem(key, created);
  document.cookie = `yd_anon_session=${encodeURIComponent(created)}; path=/; max-age=31536000; samesite=lax`;
  return created;
}
