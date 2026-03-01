"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getOrCreateAnonSessionId } from "@/lib/yourdoc/anon-session";
import type { BriefOutput, CareSetting, DepartmentBucket } from "@/lib/yourdoc/types";

type BriefPayload = {
  brief: {
    id: string;
    title: "Doctor Brief" | "Emergency Brief";
    careSetting: CareSetting;
    departmentBucket: DepartmentBucket;
    summary: BriefOutput & {
      intake_snapshot?: {
        stillUnsure?: boolean;
      };
    };
    createdAt: string;
    quickcheck: {
      show: boolean;
      primary: boolean;
      label: string;
    };
    disclaimers: {
      notDiagnosis: string;
      notDiagnosisHi: string;
      emergency: string;
      emergencyHi: string;
    };
  };
  attachments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    downloadUrl: string | null;
  }>;
  error?: string;
};

type ShareResponse = {
  shareUrl: string;
  expiresAt: string | null;
  hasPin: boolean;
  error?: string;
};

type SlotsResponse = {
  slots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    display: string;
    isBooked: boolean;
  }>;
  yourBooking: {
    id: string;
    slotId: string;
    status: string;
    createdAt: string;
  } | null;
  error?: string;
};

function careSettingLabel(care: CareSetting) {
  switch (care) {
    case "self_care":
      return "Self-care";
    case "opd_24_72h":
      return "OPD in 24-72h";
    case "urgent_today":
      return "Urgent clinic today";
    default:
      return "ER now";
  }
}

function departmentLabel(dept: DepartmentBucket) {
  return dept.replaceAll("_", " ");
}

export function BriefResult({ briefId }: { briefId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [payload, setPayload] = useState<BriefPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [sharePin, setSharePin] = useState("");
  const [shareExpiry, setShareExpiry] = useState("72");
  const [shareBusy, setShareBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [quickcheckOpen, setQuickcheckOpen] = useState(false);
  const [slots, setSlots] = useState<SlotsResponse["slots"]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingLanguage, setBookingLanguage] = useState<"english" | "hindi">("english");
  const [bookingConsent, setBookingConsent] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);

  async function loadBrief() {
    setLoading(true);
    const anonSessionId = getOrCreateAnonSessionId();

    const response = await fetch(`/api/briefs/${briefId}`, {
      headers: {
        "x-anon-session-id": anonSessionId,
      },
    });

    const body = (await response.json()) as BriefPayload;

    if (!response.ok) {
      setError(body.error ?? "Unable to load brief.");
      setLoading(false);
      return;
    }

    setPayload(body);
    setLoading(false);
  }

  useEffect(() => {
    void loadBrief();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefId]);

  useEffect(() => {
    const shouldClaim = searchParams.get("claim") === "1";
    if (!shouldClaim) {
      return;
    }

    async function claimAfterLogin() {
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        return;
      }

      setSaving(true);
      const anonSessionId = getOrCreateAnonSessionId();
      const response = await fetch(`/api/briefs/${briefId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anonSessionId }),
      });

      setSaving(false);

      if (response.ok) {
        setSaveStatus("Saved to your Health Vault.");
        router.replace(`/briefs/${briefId}`);
      }
    }

    void claimAfterLogin();
  }, [briefId, router, searchParams, supabase]);

  async function createShareLink() {
    setShareBusy(true);
    setError(null);

    const anonSessionId = getOrCreateAnonSessionId();

    const response = await fetch(`/api/briefs/${briefId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-anon-session-id": anonSessionId,
      },
      body: JSON.stringify({
        pin: sharePin.trim() || undefined,
        expiresInHours: Number(shareExpiry),
      }),
    });

    const body = (await response.json()) as ShareResponse;
    setShareBusy(false);

    if (!response.ok) {
      setError(body.error ?? "Unable to create share link.");
      return;
    }

    setShareLink(body.shareUrl);
  }

  async function revokeShareLink() {
    setShareBusy(true);
    const anonSessionId = getOrCreateAnonSessionId();

    const response = await fetch(`/api/briefs/${briefId}/share`, {
      method: "DELETE",
      headers: {
        "x-anon-session-id": anonSessionId,
      },
    });

    setShareBusy(false);

    if (!response.ok) {
      setError("Unable to revoke share link.");
      return;
    }

    setShareLink(null);
  }

  async function saveToVault() {
    setSaveStatus(null);

    if (!supabase) {
      setSaveStatus("Login is required to save to vault.");
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      const next = encodeURIComponent(`/briefs/${briefId}?claim=1`);
      router.push(`/login?redirect=${next}`);
      return;
    }

    setSaving(true);
    const anonSessionId = getOrCreateAnonSessionId();

    const response = await fetch(`/api/briefs/${briefId}/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ anonSessionId }),
    });

    setSaving(false);

    if (!response.ok) {
      setSaveStatus("Unable to save to vault.");
      return;
    }

    setSaveStatus("Saved to your Health Vault.");
  }

  async function openQuickcheck() {
    setQuickcheckOpen(true);
    setBookingStatus(null);

    const anonSessionId = getOrCreateAnonSessionId();
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventName: "quickcheck_clicked", briefId }),
    });

    const response = await fetch(`/api/quickcheck/slots?briefId=${briefId}`, {
      headers: {
        "x-anon-session-id": anonSessionId,
      },
    });

    const body = (await response.json()) as SlotsResponse;

    if (!response.ok) {
      setBookingStatus(body.error ?? "Unable to load quick-check slots.");
      return;
    }

    setSlots(body.slots);
    const firstAvailable = body.slots.find((item) => !item.isBooked)?.id ?? "";
    setSelectedSlot(firstAvailable);
  }

  async function bookQuickcheck() {
    if (!selectedSlot) {
      setBookingStatus("Please select a slot.");
      return;
    }

    setBookingBusy(true);
    setBookingStatus(null);

    const anonSessionId = getOrCreateAnonSessionId();

    const response = await fetch("/api/quickcheck/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-anon-session-id": anonSessionId,
      },
      body: JSON.stringify({
        briefId,
        slotId: selectedSlot,
        phone: bookingPhone,
        language: bookingLanguage,
        consentToCall: bookingConsent,
      }),
    });

    const body = (await response.json()) as { error?: string };
    setBookingBusy(false);

    if (!response.ok) {
      setBookingStatus(body.error ?? "Unable to confirm booking.");
      return;
    }

    setBookingStatus("Quick Check booked. Please keep your phone reachable during your slot.");
  }

  if (loading) {
    return <p className="text-sm text-[#6b7d8c]">Loading your brief...</p>;
  }

  if (error || !payload) {
    return (
      <div className="rounded-xl border border-[#F2CDCD] bg-[#FFF6F6] p-4 text-sm text-[#9f2f2f]">
        {error ?? "Unable to load brief"}
      </div>
    );
  }

  const isEmergency = payload.brief.careSetting === "er_now";

  return (
    <div className="grid gap-6">
      <section
        className={`rounded-2xl border p-5 ${
          isEmergency ? "border-[#FFB5B5] bg-[#FFF4F4]" : "border-[#D8E6E6] bg-white"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#637b92]">{new Date(payload.brief.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            <h2 className="font-serif text-3xl text-[#1D3557]">
              {payload.brief.title}
              <span className="ml-2 text-base text-[#67849f]">{payload.brief.title === "Doctor Brief" ? "Doctor Brief (डॉक्टर ब्रीफ)" : "Emergency Brief (इमरजेंसी ब्रीफ)"}</span>
            </h2>
          </div>
          <div className="rounded-full border border-[#D8E6E6] bg-[#F7FBFD] px-4 py-1.5 text-sm font-semibold text-[#2A5A7D]">
            {careSettingLabel(payload.brief.careSetting)}
          </div>
        </div>

        <p className="mt-3 text-sm text-[#46617a]">
          Department bucket: <strong>{departmentLabel(payload.brief.departmentBucket)}</strong>
        </p>

        <p className="mt-3 rounded-lg bg-[#F7FBFF] p-3 text-xs text-[#476682]">
          {payload.brief.disclaimers.notDiagnosis} {payload.brief.disclaimers.notDiagnosisHi} {payload.brief.disclaimers.emergency} {payload.brief.disclaimers.emergencyHi}
        </p>

        {isEmergency ? (
          <div className="mt-4 rounded-xl border border-[#F4A5A5] bg-[#FFEAEA] p-4">
            <p className="text-sm font-semibold text-[#A02A2A]">Primary action: Go to ER now</p>
            <p className="mt-1 text-sm text-[#9A3D3D]">
              Emergency services should be prioritized. Quick Check can be used only as backup if immediate care is not reachable.
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
        <h3 className="text-base font-semibold text-[#1D3557]">Next steps</h3>
        <ul className="mt-2 grid gap-2 text-sm text-[#36566F]">
          {payload.brief.summary.next_steps.map((step) => (
            <li key={step}>- {step}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
        <h3 className="text-base font-semibold text-[#1D3557]">Doctor summary</h3>
        <div className="mt-3 grid gap-3 text-sm text-[#3c5f79]">
          <p>
            <strong>HPI:</strong> {payload.brief.summary.doctor_summary_sections.hpi}
          </p>
          <p>
            <strong>History:</strong> {payload.brief.summary.doctor_summary_sections.relevantHistory}
          </p>
          <p>
            <strong>Meds/Allergies:</strong> {payload.brief.summary.doctor_summary_sections.medicationsAllergies}
          </p>
          {payload.brief.summary.red_flags_checked.length > 0 ? (
            <p>
              <strong>Red flags checked:</strong> {payload.brief.summary.red_flags_checked.join("; ")}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
        <h3 className="text-base font-semibold text-[#1D3557]">Attachments</h3>
        {payload.attachments.length === 0 ? (
          <p className="mt-2 text-sm text-[#71859a]">No attachments uploaded.</p>
        ) : (
          <ul className="mt-2 grid gap-2 text-sm text-[#35556f]">
            {payload.attachments.map((item) => (
              <li key={item.id}>
                {item.downloadUrl ? (
                  <a href={item.downloadUrl} target="_blank" rel="noreferrer" className="underline">
                    {item.fileName}
                  </a>
                ) : (
                  item.fileName
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#D8E6E6] bg-white p-5">
        <h3 className="text-base font-semibold text-[#1D3557]">Share and save</h3>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={createShareLink}
            disabled={shareBusy}
            className="rounded-xl border border-[#D8E6E6] px-4 py-2 text-sm font-semibold text-[#1D3557]"
          >
            Share (शेयर)
          </button>
          <button
            type="button"
            onClick={() => {
              getOrCreateAnonSessionId();
              window.open(`/api/briefs/${briefId}/pdf`, "_blank");
            }}
            className="rounded-xl border border-[#D8E6E6] px-4 py-2 text-sm font-semibold text-[#1D3557]"
          >
            Download/Share PDF
          </button>
          <button
            type="button"
            onClick={saveToVault}
            disabled={saving}
            className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-sm font-semibold text-white"
          >
            {saving ? "Saving..." : "Save to Vault (वॉल्ट में सेव करें)"}
          </button>
        </div>

        <div className="grid gap-2 rounded-xl bg-[#F8FCFF] p-3 text-sm">
          <label className="grid gap-1">
            Optional PIN (4 to 8 digits)
            <input
              value={sharePin}
              onChange={(event) => setSharePin(event.target.value)}
              placeholder="e.g. 1234"
              className="rounded-xl border border-[#D8E6E6] px-3 py-2"
            />
          </label>
          <label className="grid gap-1">
            Expiry (hours)
            <input
              type="number"
              min={1}
              max={720}
              value={shareExpiry}
              onChange={(event) => setShareExpiry(event.target.value)}
              className="rounded-xl border border-[#D8E6E6] px-3 py-2"
            />
          </label>
        </div>

        {shareLink ? (
          <div className="rounded-xl border border-[#D8E6E6] bg-[#F4FBF8] p-3 text-sm text-[#2b5f56]">
            <p>Share link:</p>
            <a href={shareLink} target="_blank" rel="noreferrer" className="underline break-all">
              {shareLink}
            </a>
            <button type="button" onClick={revokeShareLink} className="mt-2 rounded-lg border border-[#D8E6E6] px-3 py-1">
              Revoke link
            </button>
          </div>
        ) : null}

        {saveStatus ? <p className="text-sm text-[#2f6f62]">{saveStatus}</p> : null}
      </section>

      {payload.brief.quickcheck.show ? (
        <section className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
          <h3 className="text-base font-semibold text-[#1D3557]">Quick Check (10 min) | Quick Check (10 मिनट)</h3>
          <p className="mt-1 text-sm text-[#5f7890]">{payload.brief.quickcheck.label}</p>
          {!quickcheckOpen ? (
            <button
              type="button"
              onClick={openQuickcheck}
              className={`mt-3 rounded-xl px-4 py-2 text-sm font-semibold ${
                payload.brief.quickcheck.primary ? "bg-[#1D3557] text-white" : "border border-[#D8E6E6] text-[#1D3557]"
              }`}
            >
              Open Quick Check Slots
            </button>
          ) : (
            <div className="mt-3 grid gap-3">
              <div className="max-h-64 overflow-y-auto rounded-xl border border-[#D8E6E6] p-2">
                {slots.length === 0 ? <p className="text-sm text-[#6b7c8f]">No slots available currently.</p> : null}
                {slots.map((slot) => (
                  <label key={slot.id} className={`flex items-center gap-2 rounded-lg p-2 text-sm ${slot.isBooked ? "opacity-50" : ""}`}>
                    <input
                      type="radio"
                      name="quickcheck-slot"
                      disabled={slot.isBooked}
                      checked={selectedSlot === slot.id}
                      onChange={() => setSelectedSlot(slot.id)}
                    />
                    {slot.display}
                    {slot.isBooked ? " (booked)" : ""}
                  </label>
                ))}
              </div>

              <label className="grid gap-1 text-sm">
                Phone number for callback
                <input
                  value={bookingPhone}
                  onChange={(event) => setBookingPhone(event.target.value)}
                  placeholder="+91..."
                  className="rounded-xl border border-[#D8E6E6] px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Language
                <select
                  value={bookingLanguage}
                  onChange={(event) => setBookingLanguage(event.target.value as "english" | "hindi")}
                  className="rounded-xl border border-[#D8E6E6] px-3 py-2"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </label>

              <label className="flex items-start gap-2 text-xs text-[#62778f]">
                <input type="checkbox" checked={bookingConsent} onChange={(event) => setBookingConsent(event.target.checked)} />
                I consent to be called during the selected slot.
              </label>

              <button
                type="button"
                onClick={bookQuickcheck}
                disabled={bookingBusy}
                className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-sm font-semibold text-white"
              >
                {bookingBusy ? "Booking..." : "Confirm Quick Check"}
              </button>

              {bookingStatus ? <p className="text-sm text-[#2f6f62]">{bookingStatus}</p> : null}
            </div>
          )}
        </section>
      ) : null}

      <div className="rounded-xl border border-[#D8E6E6] bg-[#F7FAFF] p-3 text-xs text-[#4a6580]">
        Smart band sync is coming soon. Wearable trends will be auto-attached to your future briefs.
      </div>

      <p className="text-xs text-[#73869b]">
        Want all past briefs and documents in one place? Visit your <Link href="/vault" className="underline">Health Vault</Link>.
      </p>
    </div>
  );
}
