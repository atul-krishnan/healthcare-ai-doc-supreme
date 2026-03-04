"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateAnonSessionId } from "@/lib/yourdoc/anon-session";
import {
  consumePendingHomeUploads,
  type PendingHomeUpload,
} from "@/lib/yourdoc/pending-home-uploads";

type UploadedItem = PendingHomeUpload;

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

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type Severity = "mild" | "moderate" | "severe" | "worst";
type SexAtBirth = "female" | "male" | "intersex" | "prefer_not_say";
type PregnancyStatus = "pregnant" | "not_pregnant" | "not_applicable" | "unsure";

type ChatStep = {
  id: string;
  question: string;
  helper?: string;
  placeholder?: string;
  options?: string[];
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
    base.push({ id: "headache_neuro_deficit", label: "Headache with weakness, speech, or vision change" });
  }

  if (text.includes("pregnan") || text.includes("period")) {
    base.push({ id: "pregnancy_bleeding", label: "Pregnancy-related bleeding or severe pain" });
  }

  if (text.includes("fever")) {
    base.push({ id: "fever_with_breathing_issue", label: "High fever with breathing issue or confusion" });
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

function normalizeInput(value: string) {
  return value.trim().toLowerCase();
}

function looksLikeSkip(value: string) {
  const normalized = normalizeInput(value);
  return ["skip", "na", "n/a", "none", "not sure", "unsure", "unknown", "prefer not to say"].includes(normalized);
}

function parseBooleanAnswer(value: string): boolean | null {
  const normalized = normalizeInput(value);
  if (["yes", "y", "yeah", "yep", "true", "1", "sure", "ok", "okay"].includes(normalized)) {
    return true;
  }
  if (["no", "n", "nope", "false", "0"].includes(normalized)) {
    return false;
  }
  return null;
}

function parseSeverityAnswer(value: string): Severity | null {
  const normalized = normalizeInput(value);
  if (normalized.includes("mild") || normalized === "low" || normalized === "1") {
    return "mild";
  }
  if (normalized.includes("moderate") || normalized === "medium" || normalized === "2") {
    return "moderate";
  }
  if (normalized.includes("worst") || normalized.includes("very severe") || normalized === "4") {
    return "worst";
  }
  if (normalized.includes("severe") || normalized === "high" || normalized === "3") {
    return "severe";
  }
  return null;
}

function parseSexAtBirthAnswer(value: string): SexAtBirth | null {
  const normalized = normalizeInput(value);
  if (looksLikeSkip(normalized) || normalized.includes("prefer")) {
    return "prefer_not_say";
  }
  if (normalized.includes("female") || normalized === "f") {
    return "female";
  }
  if (normalized.includes("male") || normalized === "m") {
    return "male";
  }
  if (normalized.includes("intersex")) {
    return "intersex";
  }
  return null;
}

function parsePregnancyStatusAnswer(value: string): PregnancyStatus | null {
  const normalized = normalizeInput(value);
  if (normalized.includes("not applicable") || normalized === "na" || normalized === "n/a") {
    return "not_applicable";
  }
  if (normalized.includes("not pregnant")) {
    return "not_pregnant";
  }
  if (normalized.includes("pregnant")) {
    return "pregnant";
  }
  if (normalized.includes("unsure") || normalized.includes("not sure")) {
    return "unsure";
  }
  return null;
}

function labelForSeverity(value: Severity) {
  if (value === "mild") return "Mild";
  if (value === "moderate") return "Moderate";
  if (value === "severe") return "Severe";
  return "Worst ever";
}

function labelForSexAtBirth(value: SexAtBirth) {
  if (value === "female") return "Female";
  if (value === "male") return "Male";
  if (value === "intersex") return "Intersex";
  return "Prefer not to say";
}

function labelForPregnancyStatus(value: PregnancyStatus) {
  if (value === "pregnant") return "Pregnant";
  if (value === "not_pregnant") return "Not pregnant";
  if (value === "unsure") return "Unsure";
  return "Not applicable";
}

function createChatMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function buildChatSteps(redFlags: RedFlagQuestion[]): ChatStep[] {
  return [
    {
      id: "chiefComplaint",
      question: "What is bothering you right now?",
      helper: "Describe the main issue in one or two lines.",
      placeholder: "Example: I have sore throat, fever, and dry cough for 2 days",
    },
    {
      id: "timeline",
      question: "When did this start and is it getting better or worse?",
      helper: "Include day/night pattern if relevant.",
      placeholder: "Example: Started 2 days ago and getting worse at night",
    },
    {
      id: "severity",
      question: "How severe is it right now?",
      options: ["Mild", "Moderate", "Severe", "Worst ever"],
    },
    {
      id: "age",
      question: "What is your age?",
      helper: "Type a number, or type Skip.",
      placeholder: "Example: 30 or Skip",
      options: ["Skip"],
    },
    {
      id: "sexAtBirth",
      question: "Sex assigned at birth?",
      options: ["Prefer not to say", "Female", "Male", "Intersex"],
    },
    {
      id: "pregnancyStatus",
      question: "Pregnancy status?",
      options: ["Not applicable", "Not pregnant", "Pregnant", "Unsure"],
    },
    {
      id: "conditions",
      question: "Any known medical conditions?",
      helper: "Comma-separated, or type Skip.",
      placeholder: "Example: diabetes, asthma",
      options: ["Skip"],
    },
    {
      id: "medications",
      question: "Any current medications?",
      helper: "Comma-separated, or type Skip.",
      placeholder: "Example: metformin 500 mg",
      options: ["Skip"],
    },
    {
      id: "allergies",
      question: "Any allergies?",
      helper: "Comma-separated, or type Skip.",
      placeholder: "Example: penicillin",
      options: ["Skip"],
    },
    ...redFlags.map((item) => ({
      id: `redFlag:${item.id}`,
      question: `Are you having this warning sign: ${item.label}?`,
      options: ["Yes", "No"],
    })),
    {
      id: "stillUnsure",
      question: "Are you still unsure or anxious and may want clinician support?",
      options: ["Yes", "No"],
    },
    {
      id: "wantsDoctor",
      question: "Would you like to talk to a doctor after the brief?",
      options: ["Yes", "No"],
    },
    {
      id: "consentAccepted",
      question: "Do you accept that this tool supports care navigation and is not a diagnosis?",
      options: ["Yes", "No"],
    },
  ];
}

function renderStepPrompt(step: ChatStep) {
  if (step.helper) {
    return `${step.question}\n${step.helper}`;
  }
  return step.question;
}

export function IntakeForm({ initialChiefComplaint = "" }: { initialChiefComplaint?: string }) {
  const router = useRouter();
  const initialFlags = useMemo(() => inferRedFlags(initialChiefComplaint), [initialChiefComplaint]);

  const [chiefComplaint, setChiefComplaint] = useState(initialChiefComplaint);
  const [timeline, setTimeline] = useState("");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [age, setAge] = useState("30");
  const [sexAtBirth, setSexAtBirth] = useState<SexAtBirth>("prefer_not_say");
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>("not_applicable");
  const [conditionsText, setConditionsText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [stillUnsure, setStillUnsure] = useState(false);
  const [wantsDoctor, setWantsDoctor] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [uploads, setUploads] = useState<UploadedItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatComplete, setChatComplete] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [chatSteps, setChatSteps] = useState<ChatStep[]>(() => buildChatSteps(initialFlags));
  const initializedChat = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [redFlagQuestions, setRedFlagQuestions] = useState<RedFlagQuestion[]>(initialFlags);
  const [redFlagAnswers, setRedFlagAnswers] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialFlags.map((item) => [item.id, false])),
  );

  useEffect(() => {
    setRedFlagAnswers((current) => {
      const next: Record<string, boolean> = {};
      for (const item of redFlagQuestions) {
        next[item.id] = current[item.id] ?? false;
      }
      return next;
    });
  }, [redFlagQuestions]);

  useEffect(() => {
    const anonSessionId = getOrCreateAnonSessionId();
    void fetch("/api/intake/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ anonSessionId }),
    });

    const pendingUploads = consumePendingHomeUploads();
    if (pendingUploads.length > 0) {
      setUploads((current) => {
        const ids = new Set(current.map((item) => item.id));
        const merged = [...current];
        for (const item of pendingUploads) {
          if (!ids.has(item.id)) {
            merged.push(item);
          }
        }
        return merged;
      });
    }
  }, []);

  useEffect(() => {
    if (initializedChat.current) {
      return;
    }
    initializedChat.current = true;

    const intro: ChatMessage[] = [
      createChatMessage(
        "assistant",
        "I will ask a few guided intake questions. At the end, I will generate a structured form from your answers.",
      ),
    ];

    const seededComplaint = initialChiefComplaint.trim();
    if (seededComplaint.length >= 10) {
      const seededFlags = inferRedFlags(seededComplaint);
      const seededSteps = buildChatSteps(seededFlags);

      setChiefComplaint(seededComplaint);
      setRedFlagQuestions(seededFlags);
      setRedFlagAnswers(Object.fromEntries(seededFlags.map((item) => [item.id, false])));
      setChatSteps(seededSteps);
      setCurrentStepIndex(1);

      intro.push(createChatMessage("assistant", renderStepPrompt(seededSteps[0])));
      intro.push(createChatMessage("user", seededComplaint));
      intro.push(createChatMessage("assistant", renderStepPrompt(seededSteps[1])));
    } else {
      intro.push(createChatMessage("assistant", renderStepPrompt(chatSteps[0])));
    }

    setChatMessages(intro);
  }, [chatSteps, initialChiefComplaint]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages]);

  const currentStep = chatSteps[currentStepIndex];
  const progress = chatComplete ? 100 : Math.round((currentStepIndex / Math.max(chatSteps.length, 1)) * 100);

  const reviewRows = useMemo(() => {
    return chatSteps.map((step) => {
      let answer = "";

      switch (step.id) {
        case "chiefComplaint":
          answer = chiefComplaint;
          break;
        case "timeline":
          answer = timeline;
          break;
        case "severity":
          answer = labelForSeverity(severity);
          break;
        case "age":
          answer = age ? `${age}` : "Not shared";
          break;
        case "sexAtBirth":
          answer = labelForSexAtBirth(sexAtBirth);
          break;
        case "pregnancyStatus":
          answer = labelForPregnancyStatus(pregnancyStatus);
          break;
        case "conditions":
          answer = conditionsText || "None reported";
          break;
        case "medications":
          answer = medicationsText || "None reported";
          break;
        case "allergies":
          answer = allergiesText || "None reported";
          break;
        case "stillUnsure":
          answer = stillUnsure ? "Yes" : "No";
          break;
        case "wantsDoctor":
          answer = wantsDoctor ? "Yes" : "No";
          break;
        case "consentAccepted":
          answer = consentAccepted ? "Yes" : "No";
          break;
        default:
          if (step.id.startsWith("redFlag:")) {
            const redFlagId = step.id.replace("redFlag:", "");
            answer = redFlagAnswers[redFlagId] ? "Yes" : "No";
          }
      }

      return {
        id: step.id,
        question: step.question,
        answer,
      };
    });
  }, [
    age,
    allergiesText,
    chatSteps,
    chiefComplaint,
    conditionsText,
    consentAccepted,
    medicationsText,
    pregnancyStatus,
    redFlagAnswers,
    severity,
    sexAtBirth,
    stillUnsure,
    timeline,
    wantsDoctor,
  ]);

  function appendMessages(items: Array<{ role: ChatRole; content: string }>) {
    setChatMessages((current) => [...current, ...items.map((item) => createChatMessage(item.role, item.content))]);
  }

  function processChatAnswer(step: ChatStep, rawAnswer: string) {
    const value = rawAnswer.trim();

    if (!value) {
      return {
        ok: false,
        error: "Please enter an answer so I can continue.",
      } as const;
    }

    if (step.id === "chiefComplaint") {
      if (value.length < 10) {
        return {
          ok: false,
          error: "Please add a little more detail (at least 10 characters) about your main symptom.",
        } as const;
      }

      setChiefComplaint(value);
      const nextRedFlags = inferRedFlags(value);
      const nextSteps = buildChatSteps(nextRedFlags);
      setRedFlagQuestions(nextRedFlags);
      setRedFlagAnswers((current) => {
        const next: Record<string, boolean> = {};
        for (const item of nextRedFlags) {
          next[item.id] = current[item.id] ?? false;
        }
        return next;
      });
      setChatSteps(nextSteps);

      return {
        ok: true,
        answerLabel: value,
        nextSteps,
      } as const;
    }

    if (step.id === "timeline") {
      if (value.length < 2) {
        return {
          ok: false,
          error: "Please share when this started and any change over time.",
        } as const;
      }

      setTimeline(value);
      return {
        ok: true,
        answerLabel: value,
      } as const;
    }

    if (step.id === "severity") {
      const parsed = parseSeverityAnswer(value);
      if (!parsed) {
        return {
          ok: false,
          error: "Please choose one: Mild, Moderate, Severe, or Worst ever.",
        } as const;
      }

      setSeverity(parsed);
      return {
        ok: true,
        answerLabel: labelForSeverity(parsed),
      } as const;
    }

    if (step.id === "age") {
      if (looksLikeSkip(value)) {
        setAge("");
        return {
          ok: true,
          answerLabel: "Not shared",
        } as const;
      }

      const parsedAge = Number(value);
      if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120) {
        return {
          ok: false,
          error: "Please enter a valid age between 0 and 120, or type Skip.",
        } as const;
      }

      setAge(String(parsedAge));
      return {
        ok: true,
        answerLabel: String(parsedAge),
      } as const;
    }

    if (step.id === "sexAtBirth") {
      const parsed = parseSexAtBirthAnswer(value);
      if (!parsed) {
        return {
          ok: false,
          error: "Please choose one: Prefer not to say, Female, Male, or Intersex.",
        } as const;
      }

      setSexAtBirth(parsed);
      const skipPregnancyQuestion = parsed === "male" || parsed === "prefer_not_say";
      if (skipPregnancyQuestion) {
        setPregnancyStatus("not_applicable");
      }
      return {
        ok: true,
        answerLabel: labelForSexAtBirth(parsed),
        skipNextStep: skipPregnancyQuestion,
      } as const;
    }

    if (step.id === "pregnancyStatus") {
      const parsed = parsePregnancyStatusAnswer(value);
      if (!parsed) {
        return {
          ok: false,
          error: "Please choose one: Not applicable, Not pregnant, Pregnant, or Unsure.",
        } as const;
      }

      setPregnancyStatus(parsed);
      return {
        ok: true,
        answerLabel: labelForPregnancyStatus(parsed),
      } as const;
    }

    if (step.id === "conditions") {
      if (looksLikeSkip(value)) {
        setConditionsText("");
        return {
          ok: true,
          answerLabel: "None reported",
        } as const;
      }
      setConditionsText(value);
      return {
        ok: true,
        answerLabel: value,
      } as const;
    }

    if (step.id === "medications") {
      if (looksLikeSkip(value)) {
        setMedicationsText("");
        return {
          ok: true,
          answerLabel: "None reported",
        } as const;
      }
      setMedicationsText(value);
      return {
        ok: true,
        answerLabel: value,
      } as const;
    }

    if (step.id === "allergies") {
      if (looksLikeSkip(value)) {
        setAllergiesText("");
        return {
          ok: true,
          answerLabel: "None reported",
        } as const;
      }
      setAllergiesText(value);
      return {
        ok: true,
        answerLabel: value,
      } as const;
    }

    if (step.id.startsWith("redFlag:")) {
      const parsed = parseBooleanAnswer(value);
      if (parsed === null) {
        return {
          ok: false,
          error: "Please answer Yes or No.",
        } as const;
      }

      const redFlagId = step.id.replace("redFlag:", "");
      setRedFlagAnswers((current) => ({
        ...current,
        [redFlagId]: parsed,
      }));

      return {
        ok: true,
        answerLabel: parsed ? "Yes" : "No",
      } as const;
    }

    if (step.id === "stillUnsure") {
      const parsed = parseBooleanAnswer(value);
      if (parsed === null) {
        return {
          ok: false,
          error: "Please answer Yes or No.",
        } as const;
      }

      setStillUnsure(parsed);
      return {
        ok: true,
        answerLabel: parsed ? "Yes" : "No",
      } as const;
    }

    if (step.id === "wantsDoctor") {
      const parsed = parseBooleanAnswer(value);
      if (parsed === null) {
        return {
          ok: false,
          error: "Please answer Yes or No.",
        } as const;
      }

      setWantsDoctor(parsed);
      return {
        ok: true,
        answerLabel: parsed ? "Yes" : "No",
      } as const;
    }

    if (step.id === "consentAccepted") {
      const parsed = parseBooleanAnswer(value);
      if (parsed === null) {
        return {
          ok: false,
          error: "Please answer Yes or No.",
        } as const;
      }

      setConsentAccepted(parsed);
      return {
        ok: true,
        answerLabel: parsed ? "Yes" : "No",
      } as const;
    }

    return {
      ok: true,
      answerLabel: value,
    } as const;
  }

  function submitChatAnswer(rawValue: string) {
    if (chatComplete || !currentStep) {
      return;
    }

    const parsed = processChatAnswer(currentStep, rawValue);
    if (!parsed.ok) {
      appendMessages([
        { role: "user", content: rawValue },
        { role: "assistant", content: parsed.error },
      ]);
      return;
    }

    const activeSteps = parsed.nextSteps ?? chatSteps;
    const shouldSkipPregnancy = "skipNextStep" in parsed && Boolean(parsed.skipNextStep);
    const nextIndex = currentStepIndex + (shouldSkipPregnancy ? 2 : 1);
    const nextMessages: Array<{ role: ChatRole; content: string }> = [
      { role: "user", content: parsed.answerLabel },
    ];

    if (shouldSkipPregnancy) {
      nextMessages.push({
        role: "assistant",
        content: "Noted. I will mark pregnancy status as Not applicable and continue.",
      });
    }

    if (nextIndex >= activeSteps.length) {
      setChatComplete(true);
      nextMessages.push({
        role: "assistant",
        content:
          "Done. I have created your intake form from this conversation below. Please review and generate your brief.",
      });
    } else {
      setCurrentStepIndex(nextIndex);
      nextMessages.push({
        role: "assistant",
        content: renderStepPrompt(activeSteps[nextIndex]),
      });
    }

    setChatDraft("");
    appendMessages(nextMessages);
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);
    setUploadStatus(null);

    try {
      const anonSessionId = getOrCreateAnonSessionId();
      const uploadedNames: string[] = [];

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

        setUploads((current) => {
          if (current.some((item) => item.id === payload.upload!.id)) {
            return current;
          }
          return [...current, payload.upload!];
        });
        uploadedNames.push(payload.upload.fileName);
      }

      if (uploadedNames.length === 1) {
        setUploadStatus(`${uploadedNames[0]} attached to this intake.`);
      } else if (uploadedNames.length > 1) {
        setUploadStatus(`${uploadedNames.length} files attached to this intake.`);
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
          wantsDoctor,
          uploadIds: uploads.map((item) => item.id),
          language: "english",
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
    <div className="mx-auto grid max-w-5xl gap-6">
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_12px_32px_rgba(37,99,235,0.12)]">
        <div className="border-b border-[var(--line)] bg-gradient-to-r from-white to-[var(--brand-50)] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-600)]">Guided Chat Intake</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Chat through adaptive questions first, then review the generated form before submission.
              </p>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
              {chatComplete ? "Intake complete" : `Step ${Math.max(1, currentStepIndex + 1)} • Adaptive flow`}
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-100)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--brand-500)] to-[var(--brand-700)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="max-h-[480px] min-h-[360px] space-y-4 overflow-y-auto bg-[var(--surface-alt)] p-5">
          {chatMessages.map((message) => (
            <div key={message.id} className={`anim-chat-pop flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[90%]">
                {message.role === "assistant" ? (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-600)]">YourDoc Guide</p>
                ) : null}
                <article
                  className={`px-4 py-3 text-sm leading-relaxed ${message.role === "user"
                      ? "chat-bubble-user bg-[var(--brand-600)] text-white"
                      : "chat-bubble-ai border border-[var(--line)] bg-white text-[var(--text)]"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </article>
                <p className={`mt-1 text-[10px] text-[var(--muted)]/70 ${message.role === "user" ? "text-right" : ""}`}>
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {!chatComplete && currentStep?.options?.length ? (
          <div className="border-y border-[var(--line)] bg-white px-5 py-3">
            <div className="flex flex-wrap gap-2">
              {currentStep.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => submitChatAnswer(option)}
                  className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--brand-500)] hover:text-[var(--brand-700)]"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="border-t border-[var(--line)] bg-white p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitChatAnswer(chatDraft);
            }}
            className="grid gap-3"
          >
            <textarea
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder={chatComplete ? "Chat complete. Review the generated form below." : currentStep?.placeholder ?? "Type your answer..."}
              rows={2}
              disabled={chatComplete}
              className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-70"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-alt)]">
                <input type="file" multiple accept=".pdf,image/*" onChange={uploadFiles} className="hidden" />
                {uploading ? "Uploading..." : "Attach records"}
              </label>
              <button
                type="submit"
                disabled={!chatDraft.trim() || chatComplete}
                className="rounded-xl bg-[var(--brand-600)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--brand-500)]/20 transition-colors hover:bg-[var(--brand-700)] disabled:opacity-60"
              >
                Send Answer
              </button>
            </div>
          </form>

          {uploadStatus ? <p className="mt-2 text-xs text-[var(--brand-700)]">{uploadStatus}</p> : null}
          {uploads.length > 0 ? <p className="mt-1 text-xs text-[var(--muted)]">{uploads.length} file(s) are linked and will be included.</p> : null}
        </div>
      </div>

      {chatComplete ? (
        <div className="anim-fade-in rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] md:p-6">
          <h2 className="font-serif text-3xl text-[var(--text)]">Generated Intake Form</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This form is created from your chat answers. Review or edit any field, then generate your brief.
          </p>

          <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3">
            <p className="mb-2 text-sm font-semibold text-[var(--text)]">Question and answer summary</p>
            <div className="grid gap-2">
              {reviewRows.map((item) => (
                <div key={item.id} className="rounded-lg border border-[var(--line)] bg-white px-3 py-2">
                  <p className="text-xs font-medium text-[var(--muted)]">{item.question}</p>
                  <p className="mt-1 text-sm text-[var(--text)]">{item.answer || "Not shared"}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submitIntake} className="mt-5 grid gap-4">
            <label className="grid gap-1 text-sm">
              Chief complaint
              <textarea
                value={chiefComplaint}
                onChange={(event) => setChiefComplaint(event.target.value)}
                required
                minLength={10}
                placeholder="Example: Sore throat for 2 days with fever and painful swallowing"
                className="min-h-24 rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand-500)]"
              />
            </label>

            <label className="grid gap-1 text-sm">
              Duration and timeline
              <input
                value={timeline}
                onChange={(event) => setTimeline(event.target.value)}
                required
                placeholder="When it started, getting better/worse, day/night pattern"
                className="rounded-xl border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand-500)]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Severity
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as Severity)}
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
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
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Sex at birth (optional)
                <select
                  value={sexAtBirth}
                  onChange={(event) => setSexAtBirth(event.target.value as SexAtBirth)}
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
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
                  onChange={(event) => setPregnancyStatus(event.target.value as PregnancyStatus)}
                  className="rounded-xl border border-[var(--line)] px-3 py-2"
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
                className="rounded-xl border border-[var(--line)] px-3 py-2"
              />
            </label>

            <label className="grid gap-1 text-sm">
              Medications (comma-separated)
              <input
                value={medicationsText}
                onChange={(event) => setMedicationsText(event.target.value)}
                placeholder="Example: metformin 500 mg"
                className="rounded-xl border border-[var(--line)] px-3 py-2"
              />
            </label>

            <label className="grid gap-1 text-sm">
              Allergies (comma-separated)
              <input
                value={allergiesText}
                onChange={(event) => setAllergiesText(event.target.value)}
                placeholder="Example: penicillin"
                className="rounded-xl border border-[var(--line)] px-3 py-2"
              />
            </label>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3">
              <p className="text-sm font-semibold text-[var(--text)]">Red flag checklist</p>
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

            <div className="rounded-xl border border-dashed border-[var(--line)] bg-white p-3">
              <p className="text-sm font-semibold text-[var(--text)]">Optional uploads (photos, prescriptions, lab PDFs)</p>
              <input
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={uploadFiles}
                className="mt-2 w-full rounded-lg border border-[var(--line)] p-2 text-sm"
              />
              {uploading ? <p className="mt-2 text-xs text-[var(--muted)]">Uploading files...</p> : null}
              {uploads.length > 0 ? (
                <ul className="mt-2 grid gap-1 text-xs text-[var(--muted)]">
                  {uploads.map((item) => (
                    <li key={item.id}>- {item.fileName}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="grid gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={stillUnsure} onChange={(event) => setStillUnsure(event.target.checked)} />
                I am still unsure or anxious and may want clinician support.
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={wantsDoctor} onChange={(event) => setWantsDoctor(event.target.checked)} />
                I want to talk to a doctor after this brief.
              </label>
            </div>

            <label className="flex items-start gap-2 rounded-lg border border-[var(--line)] bg-[#fffdf8] p-3 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(event) => setConsentAccepted(event.target.checked)}
                className="mt-0.5"
              />
              I understand this tool supports care navigation and documentation. It does not diagnose or replace emergency
              services.
            </label>

            {error ? <p className="rounded-lg bg-[#FFF1F1] p-2 text-sm text-[#9f2f2f]">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[var(--brand-600)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-700)] disabled:opacity-70"
            >
              {submitting ? "Generating your brief..." : "Generate Doctor or Emergency Brief"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
