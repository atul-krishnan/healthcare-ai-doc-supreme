"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfilePayload = {
  fullName: string;
  phone: string;
  country: string;
  timezone: string;
  dailySummary: boolean;
  consultationUpdates: boolean;
  email: string | null;
};

const defaultProfile: ProfilePayload = {
  fullName: "",
  phone: "",
  country: "India",
  timezone: "Asia/Kolkata",
  dailySummary: true,
  consultationUpdates: true,
  email: null,
};

export function ProfilePanel({ billingEnabled = false }: { billingEnabled?: boolean }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfilePayload>(defaultProfile);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await fetch("/api/profile");
      const body = (await response.json()) as { profile?: ProfilePayload; error?: string };
      setLoading(false);

      if (!response.ok) {
        setStatus(body.error ?? "Unable to load profile");
        return;
      }

      if (body.profile) {
        setProfile(body.profile);
      }
    }

    void load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to save profile");
      return;
    }

    setStatus("Preferences saved.");
  }

  async function signOut() {
    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus(error.message);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <p className="text-base font-semibold text-[var(--text)]">Account Settings</p>
        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[var(--muted)]">Email</p>
            <p className="font-medium text-[var(--text)]">{profile.email ?? "-"}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[var(--muted)]">Timezone</p>
            <p className="font-medium text-[var(--text)]">{profile.timezone}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[var(--muted)]">Country</p>
            <p className="font-medium text-[var(--text)]">{profile.country}</p>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--line)] bg-[var(--brand-50)] p-6 text-center shadow-sm">
        <p className="text-base font-semibold text-[var(--brand-700)]">Subscription</p>
        <p className="mt-2 text-sm text-[var(--muted)]">You are currently on the Free plan.</p>
        {billingEnabled ? (
          <a href="/pay" className="mt-4 inline-flex rounded-xl bg-[var(--brand-600)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[var(--brand-500)]/20 hover:bg-[var(--brand-700)] transition-colors">
            Upgrade to YourDoc Plus
          </a>
        ) : (
          <p className="mt-3 text-xs text-[var(--muted)]">Billing upgrade is coming soon.</p>
        )}
      </article>

      <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <p className="text-base font-semibold text-[var(--text)]">Notification Settings</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Receive proactive health insights in your inbox.</p>

        <div className="mt-4 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
          <label className="flex items-center justify-between gap-3 text-sm text-[var(--text)]">
            Daily Health Summary
            <input
              type="checkbox"
              checked={profile.dailySummary}
              onChange={(event) => setProfile((state) => ({ ...state, dailySummary: event.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-[var(--text)]">
            Consultation Updates
            <input
              type="checkbox"
              checked={profile.consultationUpdates}
              onChange={(event) => setProfile((state) => ({ ...state, consultationUpdates: event.target.checked }))}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm text-[var(--muted)]">
            Full name
            <input
              value={profile.fullName}
              onChange={(event) => setProfile((state) => ({ ...state, fullName: event.target.value }))}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
            />
          </label>
          <label className="grid gap-1 text-sm text-[var(--muted)]">
            Phone
            <span className="text-xs text-[var(--muted)]/80">
              Optional. Used only for care follow-up notifications or callback coordination.
            </span>
            <input
              value={profile.phone}
              onChange={(event) => setProfile((state) => ({ ...state, phone: event.target.value }))}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex rounded-xl bg-[var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[var(--brand-500)]/20 hover:bg-[var(--brand-700)] transition-colors"
        >
          Save Preferences
        </button>
      </form>

      <button
        type="button"
        onClick={signOut}
        className="rounded-2xl border border-[var(--line)] bg-white p-4 text-sm font-semibold text-[#e34f44]"
      >
        Log out
      </button>

      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
    </div>
  );
}
