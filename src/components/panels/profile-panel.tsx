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

export function ProfilePanel() {
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

    setStatus("Profile updated.");
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
    <div className="grid gap-4">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-[var(--line)] p-4">
        <label className="grid gap-1 text-sm">
          Email
          <input value={profile.email ?? ""} disabled className="rounded-lg border border-[var(--line)] px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Full name
          <input
            value={profile.fullName}
            onChange={(event) => setProfile((state) => ({ ...state, fullName: event.target.value }))}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Phone
            <input
              value={profile.phone}
              onChange={(event) => setProfile((state) => ({ ...state, phone: event.target.value }))}
              className="rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Country
            <input
              value={profile.country}
              onChange={(event) => setProfile((state) => ({ ...state, country: event.target.value }))}
              className="rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Timezone
          <input
            value={profile.timezone}
            onChange={(event) => setProfile((state) => ({ ...state, timezone: event.target.value }))}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={profile.dailySummary}
              onChange={(event) => setProfile((state) => ({ ...state, dailySummary: event.target.checked }))}
            />
            Daily summary notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={profile.consultationUpdates}
              onChange={(event) =>
                setProfile((state) => ({ ...state, consultationUpdates: event.target.checked }))
              }
            />
            Consultation updates
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[var(--brand-500)] px-5 py-2 text-sm font-semibold text-white"
          >
            Save Profile
          </button>
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold hover:border-[var(--brand-400)]"
          >
            Log out
          </button>
        </div>
      </form>

      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
    </div>
  );
}
