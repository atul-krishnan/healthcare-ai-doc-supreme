import { getLlmConfig } from "@/lib/server/llm-client";
import {
  clinicalSafetySystemPrompt,
  deriveRuleBasedSetting,
  inferDepartmentBucket,
  suggestRedFlagChecklist,
} from "@/lib/server/yourdoc/safety";
import { deidentifyClinicalText } from "@/lib/server/deidentify";
import {
  briefOutputSchema,
  careSettingValues,
  type BriefOutput,
  type CareSetting,
  type IntakeInput,
} from "@/lib/yourdoc/types";

type UploadDigest = {
  id: string;
  fileName: string;
  summary: string | null;
};

const carePriority: Record<CareSetting, number> = {
  self_care: 1,
  opd_24_72h: 2,
  urgent_today: 3,
  er_now: 4,
};

function maxCareSetting(a: CareSetting, b: CareSetting): CareSetting {
  return carePriority[a] >= carePriority[b] ? a : b;
}

function fallbackNextSteps(careSetting: CareSetting): string[] {
  if (careSetting === "er_now") {
    return [
      "Go to the nearest emergency room now. Do not delay for online advice.",
      "Carry this Emergency Brief, current medicines, allergy details, and recent reports.",
      "If symptoms worsen while traveling, call local emergency services immediately.",
    ];
  }

  if (careSetting === "urgent_today") {
    return [
      "Seek in-person urgent clinic review today.",
      "Take this brief and a list of your medicines/allergies.",
      "If severe breathing issues, chest pain, fainting, or heavy bleeding start, go to ER now.",
    ];
  }

  if (careSetting === "opd_24_72h") {
    return [
      "Book an OPD appointment in the next 24 to 72 hours.",
      "Track symptoms (timing, severity, triggers) until your visit.",
      "Escalate to urgent care if severe symptoms appear.",
    ];
  }

  return [
    "Continue self-care: rest, hydration, and symptom monitoring.",
    "Avoid self-medicating with prescription drugs unless advised by a clinician.",
    "If symptoms persist or worsen, move to OPD review in 24 to 72 hours.",
  ];
}

function normalizeBriefTitle(careSetting: CareSetting): "Doctor Brief" | "Emergency Brief" {
  return careSetting === "er_now" ? "Emergency Brief" : "Doctor Brief";
}

function buildFallbackOutput(input: IntakeInput, uploadDigest: UploadDigest[]): BriefOutput {
  const checklist = suggestRedFlagChecklist(input.chiefComplaint);
  const triggered = checklist
    .filter((question) => question.emergencyIfTrue && input.redFlagAnswers[question.id])
    .map((question) => question.questionEn);

  const ruleBased = deriveRuleBasedSetting(input, triggered);
  const department = inferDepartmentBucket(input.chiefComplaint);

  return {
    care_setting: ruleBased,
    department_bucket: department,
    brief_title: normalizeBriefTitle(ruleBased),
    next_steps: fallbackNextSteps(ruleBased),
    red_flags_checked: triggered,
    confidence_notes:
      "Rule-based output. Confidence is moderate; this is decision support only and not a diagnosis.",
    doctor_summary_sections: {
      hpi: `Chief complaint: ${input.chiefComplaint}. Timeline: ${input.timeline}. Reported severity: ${input.severity}.`,
      relevantHistory:
        input.conditions.length > 0
          ? `Known conditions: ${input.conditions.join(", ")}. Pregnancy status: ${input.pregnancyStatus ?? "not shared"}.`
          : `No chronic conditions listed. Pregnancy status: ${input.pregnancyStatus ?? "not shared"}.`,
      medicationsAllergies: `Medications: ${input.medications.join(", ") || "none shared"}. Allergies: ${input.allergies.join(", ") || "none shared"}.`,
      redFlags: triggered,
      attachments: uploadDigest.map((item) => item.fileName),
      suggestedDiscussionPoints: [
        "Symptom progression and current severity",
        "Risk factors and medicine history",
        "Need for tests, immediate treatment, and follow-up timing",
      ],
    },
  };
}

function sanitizeLlmOutput(output: BriefOutput, fallback: BriefOutput): BriefOutput {
  const normalizedCareSetting = careSettingValues.includes(output.care_setting) ? output.care_setting : fallback.care_setting;
  const safetyCareSetting = maxCareSetting(normalizedCareSetting, fallback.care_setting);

  const steps = output.next_steps.length >= 3 ? output.next_steps : fallback.next_steps;

  return {
    ...output,
    care_setting: safetyCareSetting,
    brief_title: normalizeBriefTitle(safetyCareSetting),
    next_steps: steps,
    red_flags_checked: [...new Set([...fallback.red_flags_checked, ...output.red_flags_checked])],
  };
}

export async function generateClinicalBrief(input: IntakeInput, uploads: UploadDigest[]) {
  const fallback = buildFallbackOutput(input, uploads);
  const llm = getLlmConfig();

  if (!llm) {
    return {
      output: fallback,
      model: "heuristic-fallback",
    };
  }

  const safeComplaint = deidentifyClinicalText(input.chiefComplaint);
  const safeTimeline = deidentifyClinicalText(input.timeline);

  try {
    const completion = await llm.client.chat.completions.create({
      model: llm.model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: clinicalSafetySystemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify({
            intake: {
              chiefComplaint: safeComplaint,
              timeline: safeTimeline,
              severity: input.severity,
              age: input.age,
              sexAtBirth: input.sexAtBirth,
              pregnancyStatus: input.pregnancyStatus,
              conditions: input.conditions,
              medications: input.medications,
              allergies: input.allergies,
              redFlagAnswers: input.redFlagAnswers,
              vitals: input.vitals,
              stillUnsure: input.stillUnsure,
            },
            uploads: uploads.map((item) => ({
              fileName: item.fileName,
              summary: item.summary,
            })),
            directive:
              "Be conservative. If any emergency possibility exists, output er_now. Do not diagnose. Keep the response actionable.",
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error("Missing completion payload");
    }

    const parsed = briefOutputSchema.parse(JSON.parse(content));
    const safeOutput = sanitizeLlmOutput(parsed, fallback);

    return {
      output: safeOutput,
      model: completion.model ?? `${llm.provider}:${llm.model}`,
    };
  } catch {
    return {
      output: fallback,
      model: "heuristic-fallback",
    };
  }
}
