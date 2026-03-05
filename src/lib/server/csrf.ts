import { NextResponse } from "next/server";
import { env } from "@/lib/env";

function normalizeOrigin(origin: string): string | null {
  try {
    const parsed = new URL(origin);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port;
    const isDefaultPort =
      port === "" || (protocol === "https:" && port === "443") || (protocol === "http:" && port === "80");

    return `${protocol}//${hostname}${isDefaultPort ? "" : `:${port}`}`;
  } catch {
    return null;
  }
}

function allowedOriginsForRequest(request: Request) {
  const requestOrigin = normalizeOrigin(new URL(request.url).origin);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.trim().toLowerCase() ?? "";
  const forwardedHost = request.headers.get("x-forwarded-host")?.trim().toLowerCase() ?? "";
  const host = request.headers.get("host")?.trim().toLowerCase() ?? "";
  const configuredOrigin = (() => {
    try {
      return normalizeOrigin(new URL(env.NEXT_PUBLIC_APP_URL).origin);
    } catch {
      return requestOrigin;
    }
  })();

  const forwardedOrigin =
    forwardedProto && (forwardedHost || host)
      ? normalizeOrigin(`${forwardedProto}://${forwardedHost || host}`)
      : null;

  const normalizedAllowed = new Set<string>();
  if (requestOrigin) {
    normalizedAllowed.add(requestOrigin);
  }
  if (configuredOrigin) {
    normalizedAllowed.add(configuredOrigin);
  }
  if (forwardedOrigin) {
    normalizedAllowed.add(forwardedOrigin);
  }

  return normalizedAllowed;
}

export function validateRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (request.headers.get("sec-fetch-site") === "same-origin") {
    return null;
  }

  const allowedOrigins = allowedOriginsForRequest(request);

  if (!allowedOrigins.has(normalizedOrigin)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  return null;
}
