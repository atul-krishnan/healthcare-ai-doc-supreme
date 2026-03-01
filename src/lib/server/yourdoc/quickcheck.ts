import type { CareSetting } from "@/lib/yourdoc/types";

type QuickcheckOptions = {
  stillUnsure?: boolean;
  wantsDoctor?: boolean;
  confidenceNotes?: string | null;
};

export function isHighUncertainty(confidenceNotes: string | null | undefined) {
  if (!confidenceNotes) {
    return false;
  }

  const note = confidenceNotes.toLowerCase();
  return (
    note.includes("low confidence") ||
    note.includes("uncertain") ||
    note.includes("limited data") ||
    note.includes("insufficient") ||
    note.includes("heuristic-fallback") ||
    note.includes("rule-based")
  );
}

export function evaluateQuickcheckCta(careSetting: CareSetting, options: QuickcheckOptions = {}) {
  const stillUnsure = Boolean(options.stillUnsure);
  const wantsDoctor = Boolean(options.wantsDoctor);
  const uncertaintyHigh = isHighUncertainty(options.confidenceNotes);

  if (careSetting === "er_now") {
    return {
      show: true,
      primary: false,
      label:
        "If you cannot reach immediate care, Quick Check (10 min) can be used as backup. Do not delay ER for this.",
      reason: "er_backup",
      uncertaintyHigh,
      talkToDoctor: wantsDoctor || uncertaintyHigh,
      talkToDoctorLabel: "If you cannot reach immediate care, talk to a doctor as backup.",
    };
  }

  if (careSetting === "urgent_today" || careSetting === "opd_24_72h") {
    return {
      show: true,
      primary: true,
      label: "Talk to an online doctor in 10 minutes for quick navigation support.",
      reason: "urgency",
      uncertaintyHigh,
      talkToDoctor: true,
      talkToDoctorLabel: "Talk to a doctor (video/visit)",
    };
  }

  if (uncertaintyHigh) {
    return {
      show: true,
      primary: false,
      label: "Uncertainty is high for this intake. Consider a Quick Check (10 min).",
      reason: "uncertainty",
      uncertaintyHigh,
      talkToDoctor: true,
      talkToDoctorLabel: "Talk to a doctor (video/visit)",
    };
  }

  if (wantsDoctor) {
    return {
      show: true,
      primary: false,
      label: "You asked to talk to a doctor. Quick Check (10 min) is available.",
      reason: "user_request",
      uncertaintyHigh,
      talkToDoctor: true,
      talkToDoctorLabel: "Talk to a doctor (video/visit)",
    };
  }

  if (stillUnsure) {
    return {
      show: true,
      primary: false,
      label: "Still unsure or anxious? You can book a Quick Check (10 min).",
      reason: "still_unsure",
      uncertaintyHigh,
      talkToDoctor: false,
      talkToDoctorLabel: "Talk to a doctor (video/visit)",
    };
  }

  return {
    show: false,
    primary: false,
    label: "",
    reason: "none",
    uncertaintyHigh,
    talkToDoctor: false,
    talkToDoctorLabel: "Talk to a doctor (video/visit)",
  };
}
