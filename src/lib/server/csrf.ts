import { NextResponse } from "next/server";
import { env } from "@/lib/env";

function allowedOriginsForRequest(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = (() => {
    try {
      return new URL(env.NEXT_PUBLIC_APP_URL).origin;
    } catch {
      return requestOrigin;
    }
  })();

  return new Set([requestOrigin, configuredOrigin]);
}

export function validateRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  const allowedOrigins = allowedOriginsForRequest(request);

  if (!allowedOrigins.has(origin)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  return null;
}
