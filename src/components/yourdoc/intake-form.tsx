"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateAnonSessionId } from "@/lib/yourdoc/anon-session";

type UploadedItem = {
  id: string;
  mimeType: string;
  fileName: string;
  summary: string | null;
};

type IntakeResponse = {
  brief: {
    id: string;
  };
  error?: string;
};

type UploadResponse = {
  upload?: UploadedItem;
  error?: string;
};

type RedFlagQuestion = {
  id: string;
  label: string;
};

function inferRedFlags(chiefComplaint: string): RedFlagQuestion[] {
  const base: RedFlagQuestion[] = [
    { id: "difficulty_breathing", label: "Trouble breathing at rest" },
    { id: "severe_chest_pain", label: "Severe chest pain or chest pressure" },
    { id: "confusion_or_fainting", label: "Fainting, confusion, or hard to wake" },
    { id: "uncontrolled_bleeding", label: "Uncontrolled bleeding" },
  ];

  const text = chiefComplaint.toLowerCase();

  if (text.includes("head") || text.includes("migraine")) {
    base.push({ id: "headache_neuro_deficit", label: "Headache with weakness/speech or vision change" });
  }

  if (text.includes("pregnan") || text.includes("period")) {
    base.push({ id: "pregnancy_bleeding", label: "Pregnancy-related bleeding or severe pain" });
  }

  if (text.includes("fever")) {
    base.push({ id: "fever_with_breathing_issue", label: "High fever with breathing issue/confusion" });
  }

  return base;
}

function parseCommaInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50);
}

export function IntakeForm({ initialChiefComplaint = "" }: { initialChiefComplaint?: string }) {
  const router = useRouter();
  const [chiefComplaint, setChiefComplaint] = useState(initialChiefComplaint);
  const [timeline, setTimeline] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe" | "worst">("moderate");
  const [age, setAge] = useState("30");
  const [sexAtBirth, setSexAtBirth] = useState<"female" | "male" | "intersex" | "prefer_not_say">("prefer_not_say");
  const [pregnancyStatus, setPregnancyStatus] = useState<"pregnant" | "not_pregnant" | "not_applicable" | "unsure">(
    "not_applicable",
  );
  const [conditionsText, setConditionsText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [stillUnsure, setStillUnsure] = useState(false);
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [uploads, setUploads] = useState<UploadedItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redFlagQuestions = useMemo(() => inferRedFlags(chiefComplaint), [chiefComplaint]);
  const [redFlagAnswers, setRedFlagAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of redFlagQuestions) {
      next[item.id] = redFlagAnswers[item.id] ?? false;
    }
    setRedFlagAnswers(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redFlagQuestions.length]);

  useEffect(() => {
    const anonSessionId = getOrCreateAnonSessionId();
    void fetch("/api/intake/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ anonSessionId }),
    });
  }, []);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const anonSessionId = getOrCreateAnonSessionId();

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
          throw new Error(payload.error ?? `Upload failed for ${file.name}`);
        }

        setUploads((current) => [...current, payload.upload!]);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function submitIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!consentAccepted) {
      setError("Please accept consent before generating your brief.");
      return;
    }

    setSubmitting(true);

    try {
      const anonSessionId = getOrCreateAnonSessionId();
      const response = await fetch("/api/intake/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chiefComplaint,
          timeline,
          severity,
          age: age ? Number(age) : undefined,
          sexAtBirth,
          pregnancyStatus,
          conditions: parseCommaInput(conditionsText),
          medications: parseCommaInput(medicationsText),
          allergies: parseCommaInput(allergiesText),
          redFlagAnswers,
          stillUnsure,
          uploadIds: uploads.map((item) => item.id),
          language,
          consentAccepted,
          anonSessionId,
        }),
      });

      const payload = (await response.json()) as IntakeResponse;

      if (!response.ok || !payload.brief?.id) {
        throw new Error(payload.error ?? "Unable to generate brief.");
      }

      router.push(`/briefs/${payload.brief.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate brief");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-[#D8E6E6] bg-white p-5 shadow-[0_10px_26px_rgba(42,157,143,0.08)] md:p-6">
      <h1 className="font-serif text-3xl text-[#1D3557]">Guided Intake</h1>
      <p className="mt-2 text-sm text-[#5e728a]">
        This is not a diagnosis. Yeh diagnosis nahi hai. If symptoms are severe, go to ER now. Agar symptoms severe
        hain, turant ER jaiye.
      </p>

      <form onSubmit={submitIntake} className="mt-5 grid gap-4">
        <label className="grid gap-1 text-sm">
          Chief complaint
          <textarea
            value={chiefComplaint}
            onChange={(event) => setChiefComplaint(event.target.value)}
            required
            minLength={10}
            placeholder="Example: Sore throat for 2 days with fever and painful swallowing"
            className="min-h-24 rounded-xl border border-[#D8E6E6] px-3 py-2 outline-none focus:border-[#2A9D8F]"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Duration and timeline
          <input
            value={timeline}
            onChange={(event) => setTimeline(event.target.value)}
            required
            placeholder="When it started, getting better/worse, day/night pattern"
            className="rounded-xl border border-[#D8E6E6] px-3 py-2 outline-none focus:border-[#2A9D8F]"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Severity
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as typeof severity)}
              className="rounded-xl border border-[#D8E6E6] px-3 py-2"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="worst">Worst ever</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Age (optional)
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="rounded-xl border border-[#D8E6E6] px-3 py-2"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Sex at birth (optional)
            <select
              value={sexAtBirth}
              onChange={(event) => setSexAtBirth(event.target.value as typeof sexAtBirth)}
              className="rounded-xl border border-[#D8E6E6] px-3 py-2"
            >
              <option value="prefer_not_say">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="intersex">Intersex</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Pregnancy status
            <select
              value={pregnancyStatus}
              onChange={(event) => setPregnancyStatus(event.target.value as typeof pregnancyStatus)}
              className="rounded-xl border border-[#D8E6E6] px-3 py-2"
            >
              <option value="not_applicable">Not applicable</option>
              <option value="not_pregnant">Not pregnant</option>
              <option value="pregnant">Pregnant</option>
              <option value="unsure">Unsure</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          Conditions (comma-separated)
          <input
            value={conditionsText}
            onChange={(event) => setConditionsText(event.target.value)}
            placeholder="Example: diabetes, asthma"
            className="rounded-xl border border-[#D8E6E6] px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Medications (comma-separated)
          <input
            value={medicationsText}
            onChange={(event) => setMedicationsText(event.target.value)}
            placeholder="Example: metformin 500 mg"
            className="rounded-xl border border-[#D8E6E6] px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Allergies (comma-separated)
          <input
            value={allergiesText}
            onChange={(event) => setAllergiesText(event.target.value)}
            placeholder="Example: penicillin"
            className="rounded-xl border border-[#D8E6E6] px-3 py-2"
          />
        </label>

        <div className="rounded-xl border border-[#D8E6E6] bg-[#F8FCFD] p-3">
          <p className="text-sm font-semibold text-[#1D3557]">Red flag checklist</p>
          <div className="mt-2 grid gap-2">
            {redFlagQuestions.map((question) => (
              <label key={question.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(redFlagAnswers[question.id])}
                  onChange={(event) =>
                    setRedFlagAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.checked,
                    }))
                  }
                />
                {question.label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[#D8E6E6] bg-[#FCFEFF] p-3">
          <p className="text-sm font-semibold text-[#1D3557]">Optional uploads (photos, prescriptions, lab PDFs)</p>
          <input
            type="file"
            multiple
            onChange={uploadFiles}
            className="mt-2 w-full rounded-lg border border-[#D8E6E6] p-2 text-sm"
          />
          {uploading ? <p className="mt-2 text-xs text-[#6b7f97]">Uploading files...</p> : null}
          {uploads.length > 0 ? (
            <ul className="mt-2 grid gap-1 text-xs text-[#34556f]">
              {uploads.map((item) => (
                <li key={item.id}>- {item.fileName}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid gap-2 rounded-xl border border-[#D8E6E6] bg-[#F8FCFD] p-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={stillUnsure} onChange={(event) => setStillUnsure(event.target.checked)} />
            I am still unsure/anxious and may want a doctor callback.
          </label>

          <label className="grid gap-1">
            Preferred language for doctor call
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as "english" | "hindi")}
              className="rounded-xl border border-[#D8E6E6] px-3 py-2"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </label>
        </div>

        <label className="flex items-start gap-2 rounded-lg border border-[#D8E6E6] bg-[#fffdf8] p-3 text-xs text-[#5d676f]">
          <input
            type="checkbox"
            checked={consentAccepted}
            onChange={(event) => setConsentAccepted(event.target.checked)}
            className="mt-0.5"
          />
          I understand this tool supports care navigation and documentation. It does not diagnose or replace emergency
          services.
        </label>

        <div className="rounded-xl border border-[#E8F0FF] bg-[#F7FAFF] p-3 text-xs text-[#4d6683]">
          Smart band data integration is coming soon. You will soon be able to attach wearable trends automatically.
        </div>

        {error ? <p className="rounded-lg bg-[#FFF1F1] p-2 text-sm text-[#9f2f2f]">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#2A9D8F] px-4 py-3 text-sm font-semibold text-white hover:bg-[#21867a] disabled:opacity-70"
        >
          {submitting ? "Generating your brief..." : "Generate Doctor/Emergency Brief"}
        </button>
      </form>
    </div>
  );
}
