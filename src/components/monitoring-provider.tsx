"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        posthog?: {
            init: (key: string, options: Record<string, unknown>) => void;
            capture: (event: string, properties?: Record<string, unknown>) => void;
            identify: (id: string, properties?: Record<string, unknown>) => void;
        };
    }
}

type MonitoringProviderProps = {
    children: React.ReactNode;
};

/**
 * Sentry setup instructions:
 *
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Set NEXT_PUBLIC_SENTRY_DSN in your .env
 *
 * The wizard creates sentry.client.config.ts, sentry.server.config.ts,
 * and sentry.edge.config.ts automatically. Add PHI redaction in
 * the beforeSend hook:
 *
 *   beforeSend(event) {
 *     if (event.request?.data) {
 *       event.request.data = "[REDACTED]";
 *     }
 *     return event;
 *   }
 */

function initPostHog() {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || typeof window === "undefined") return;

    // Load PostHog via CDN script to avoid dependency
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://us-assets.i.posthog.com/static/array.js";
    script.onload = () => {
        window.posthog?.init(key, {
            api_host: host || "https://us.i.posthog.com",
            capture_pageview: true,
            capture_pageleave: true,
            autocapture: false, // PHI safety — no auto-capture of form data
            disable_session_recording: true, // disabled until DPDPA consent flow built
            persistence: "localStorage+cookie",
            loaded: (posthog: typeof window.posthog) => {
                if (process.env.NODE_ENV !== "production") {
                    posthog?.capture("$opt_out");
                }
            },
        });
    };
    document.head.appendChild(script);
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
    useEffect(() => {
        initPostHog();
    }, []);

    return <>{children}</>;
}

// ─── Analytics helpers ────────────────────────────────────────

export function trackEvent(event: string, properties?: Record<string, unknown>) {
    if (typeof window !== "undefined" && window.posthog) {
        window.posthog.capture(event, properties);
    }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
    if (typeof window !== "undefined" && window.posthog) {
        window.posthog.identify(userId, traits);
    }
}
