import type { CareSetting, DepartmentBucket, IntakeInput } from "@/lib/yourdoc/types";

export type RedFlagQuestion = {
  id: string;
  questionEn: string;
  questionHi: string;
  emergencyIfTrue: boolean;
};

const baseRedFlagQuestions: RedFlagQuestion[] = [
  {
    id: "difficulty_breathing",
    questionEn: "Are you having trouble breathing even at rest?",
    questionHi: "Kya aapko aaram ke dauran bhi saans lene mein dikkat ho rahi hai?",
    emergencyIfTrue: true,
  },
  {
    id: "severe_chest_pain",
    questionEn: "Do you have severe chest pain or pressure now?",
    questionHi: "Kya aapko abhi tez chest pain ya pressure ho raha hai?",
    emergencyIfTrue: true,
  },
  {
    id: "confusion_or_fainting",
    questionEn: "Have you fainted, become very confused, or are hard to wake?",
    questionHi: "Kya behoshi, bahut zyada confusion, ya jagane mein mushkil ho rahi hai?",
    emergencyIfTrue: true,
  },
  {
    id: "uncontrolled_bleeding",
    questionEn: "Do you have uncontrolled bleeding?",
    questionHi: "Kya bleeding control nahi ho rahi hai?",
    emergencyIfTrue: true,
  },
];

const categoryQuestions: Array<{ keywords: string[]; questions: RedFlagQuestion[] }> = [
  {
    keywords: ["headache", "migraine", "head pain"],
    questions: [
      {
        id: "headache_neuro_deficit",
        questionEn: "With headache, do you also have weakness, slurred speech, or vision loss?",
        questionHi: "Headache ke saath kamzori, bolne mein takleef, ya nazar kam hona hai?",
        emergencyIfTrue: true,
      },
      {
        id: "worst_headache",
        questionEn: "Is this the worst sudden headache of your life?",
        questionHi: "Kya ye zindagi ka sabse achanak aur tez headache hai?",
        emergencyIfTrue: true,
      },
    ],
  },
  {
    keywords: ["fever", "temperature", "infection"],
    questions: [
      {
        id: "fever_with_breathing_issue",
        questionEn: "Do you have high fever with breathing difficulty, confusion, or persistent vomiting?",
        questionHi: "Kya tez bukhar ke saath saans ki dikkat, confusion, ya lagataar ulti hai?",
        emergencyIfTrue: true,
      },
    ],
  },
  {
    keywords: ["stomach", "abdomen", "abdominal", "vomit", "diarrhea"],
    questions: [
      {
        id: "abdominal_severe_pain",
        questionEn: "Is there severe abdominal pain with repeated vomiting or blood in stool/vomit?",
        questionHi: "Kya pet mein bahut tez dard ke saath baar-baar ulti ya stool/ulti mein khoon hai?",
        emergencyIfTrue: true,
      },
    ],
  },
  {
    keywords: ["pregnan", "pregnancy"],
    questions: [
      {
        id: "pregnancy_bleeding",
        questionEn: "During pregnancy, do you have bleeding, severe pain, or reduced fetal movement?",
        questionHi: "Pregnancy mein bleeding, tez dard, ya baby movement kam hua hai?",
        emergencyIfTrue: true,
      },
    ],
  },
];

export function suggestRedFlagChecklist(chiefComplaint: string): RedFlagQuestion[] {
  const text = chiefComplaint.toLowerCase();
  const dynamic = categoryQuestions
    .filter((entry) => entry.keywords.some((keyword) => text.includes(keyword)))
    .flatMap((entry) => entry.questions);

  const combined = [...baseRedFlagQuestions, ...dynamic];
  const deduped = new Map<string, RedFlagQuestion>();

  for (const question of combined) {
    deduped.set(question.id, question);
  }

  return [...deduped.values()];
}

const departmentKeywordMap: Array<{ bucket: DepartmentBucket; keywords: string[] }> = [
  { bucket: "cardio", keywords: ["chest", "palpitation", "heart", "bp"] },
  { bucket: "neuro", keywords: ["headache", "dizziness", "seizure", "stroke", "numbness"] },
  { bucket: "ent", keywords: ["ear", "nose", "throat", "sinus", "tonsil"] },
  { bucket: "derm", keywords: ["rash", "skin", "itch", "allergy", "swelling"] },
  { bucket: "gastro", keywords: ["stomach", "abdomen", "vomit", "diarrhea", "acidity"] },
  { bucket: "ortho", keywords: ["joint", "knee", "back", "fracture", "sprain", "bone"] },
  { bucket: "gyn", keywords: ["period", "pregnan", "pelvic", "vaginal"] },
  { bucket: "pulmo", keywords: ["cough", "breath", "asthma", "wheeze"] },
  { bucket: "pediatrics", keywords: ["infant", "child", "baby", "newborn"] },
];

export function inferDepartmentBucket(chiefComplaint: string): DepartmentBucket {
  const text = chiefComplaint.toLowerCase();
  const hit = departmentKeywordMap.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
  return hit?.bucket ?? "general_medicine";
}

export function deriveRuleBasedSetting(input: IntakeInput, triggeredRedFlags: string[]): CareSetting {
  if (triggeredRedFlags.length > 0 || input.severity === "worst") {
    return "er_now";
  }

  const durationText = input.timeline.toLowerCase();
  const prolongedSignals = ["week", "weeks", "10 day", "2 week", "14 day", "month"];
  const prolonged = prolongedSignals.some((signal) => durationText.includes(signal));

  const hasRiskAmplifier =
    input.conditions.length > 0 ||
    (input.pregnancyStatus === "pregnant" && input.severity !== "mild") ||
    (input.vitals?.spo2 !== undefined && input.vitals.spo2 < 94) ||
    (input.vitals?.temperatureC !== undefined && input.vitals.temperatureC >= 39);

  if (input.severity === "severe" || hasRiskAmplifier) {
    return "urgent_today";
  }

  if (input.severity === "moderate" || prolonged) {
    return "opd_24_72h";
  }

  return "self_care";
}

export const mandatoryDisclaimers = {
  notDiagnosisEn: "This is not a diagnosis.",
  notDiagnosisHi: "Yeh diagnosis nahi hai.",
  erNowEn: "If you have severe symptoms, go to ER now.",
  erNowHi: "Agar symptoms severe hain, turant ER jaiye.",
  doctorBriefEn: "Doctor Brief",
  doctorBriefHi: "Doctor Brief (डॉक्टर ब्रीफ)",
  emergencyBriefEn: "Emergency Brief",
  emergencyBriefHi: "Emergency Brief (इमरजेंसी ब्रीफ)",
  quickCheckEn: "Quick Check (10 min)",
  quickCheckHi: "Quick Check (10 मिनट)",
  shareEn: "Share",
  shareHi: "Share (शेयर)",
  saveToVaultEn: "Save to Vault",
  saveToVaultHi: "Save to Vault (वॉल्ट में सेव करें)",
};

export const clinicalSafetySystemPrompt = `You are YourDoc, a conservative medical navigation assistant for India.

SAFETY RULES:
1) Never diagnose. Never claim certainty (e.g., avoid “you have X”).
2) If red-flag risk exists, set care_setting to er_now and use urgent emergency language.
3) Focus on navigation and documentation support: care setting, department bucket, next steps, and concise doctor summary.
4) Keep recommendations practical for Indian metro users (Bangalore context is acceptable), but do not recommend a specific hospital by brand.
5) Use cautious phrasing: “could be”, “may indicate”, “consider seeking”.
6) Include uncertainty in confidence_notes.
7) Output STRICT JSON with keys:
   care_setting, department_bucket, brief_title, next_steps, red_flags_checked, confidence_notes, doctor_summary_sections.
8) doctor_summary_sections must include keys:
   hpi, relevantHistory, medicationsAllergies, redFlags, attachments, suggestedDiscussionPoints.
9) If symptoms appear mild and no red flags: self_care or opd_24_72h only.
10) If uncertainty is high and symptoms moderate/severe: prefer urgent_today.
`;
