import { z } from "zod";

export const careSettingValues = ["self_care", "opd_24_72h", "urgent_today", "er_now"] as const;
export type CareSetting = (typeof careSettingValues)[number];

export const departmentBucketValues = [
  "general_medicine",
  "ent",
  "ortho",
  "derm",
  "gyn",
  "gastro",
  "neuro",
  "cardio",
  "pulmo",
  "pediatrics",
  "other",
] as const;
export type DepartmentBucket = (typeof departmentBucketValues)[number];

export const quickcheckLanguageValues = ["english", "hindi"] as const;
export type QuickcheckLanguage = (typeof quickcheckLanguageValues)[number];

export const quickcheckBookingStatusValues = ["booked", "completed", "no_show", "rescheduled", "cancelled"] as const;
export type QuickcheckBookingStatus = (typeof quickcheckBookingStatusValues)[number];

export const intakeSchema = z.object({
  chiefComplaint: z.string().min(10).max(1500),
  timeline: z.string().min(2).max(500),
  severity: z.enum(["mild", "moderate", "severe", "worst"]),
  age: z.number().int().min(0).max(120).optional(),
  sexAtBirth: z.enum(["female", "male", "intersex", "prefer_not_say"]).optional(),
  pregnancyStatus: z.enum(["pregnant", "not_pregnant", "not_applicable", "unsure"]).optional(),
  conditions: z.array(z.string().min(1).max(120)).max(30).default([]),
  medications: z.array(z.string().min(1).max(160)).max(50).default([]),
  allergies: z.array(z.string().min(1).max(120)).max(30).default([]),
  vitals: z
    .object({
      temperatureC: z.number().min(30).max(45).optional(),
      heartRate: z.number().int().min(20).max(240).optional(),
      spo2: z.number().int().min(40).max(100).optional(),
      systolicBp: z.number().int().min(60).max(250).optional(),
      diastolicBp: z.number().int().min(30).max(180).optional(),
    })
    .optional(),
  redFlagAnswers: z.record(z.string(), z.boolean()).default({}),
  stillUnsure: z.boolean().default(false),
  uploadIds: z.array(z.string().uuid()).max(20).default([]),
  language: z.enum(["english", "hindi"]).default("english"),
  consentAccepted: z.boolean().default(false),
  anonSessionId: z.string().min(8).max(120),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

export const doctorSummarySectionsSchema = z.object({
  hpi: z.string().min(20),
  relevantHistory: z.string().min(10),
  medicationsAllergies: z.string().min(10),
  redFlags: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  suggestedDiscussionPoints: z.array(z.string()).min(1),
});

export type DoctorSummarySections = z.infer<typeof doctorSummarySectionsSchema>;

export const briefOutputSchema = z.object({
  care_setting: z.enum(careSettingValues),
  department_bucket: z.enum(departmentBucketValues),
  brief_title: z.enum(["Doctor Brief", "Emergency Brief"]),
  next_steps: z.array(z.string().min(4)).min(3).max(10),
  red_flags_checked: z.array(z.string()).default([]),
  confidence_notes: z.string().min(8).max(500),
  doctor_summary_sections: doctorSummarySectionsSchema,
});

export type BriefOutput = z.infer<typeof briefOutputSchema>;

export type ShareBriefResponse = {
  brief: {
    id: string;
    title: "Doctor Brief" | "Emergency Brief";
    careSetting: CareSetting;
    departmentBucket: DepartmentBucket;
    summary: BriefOutput;
    createdAt: string;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    downloadUrl: string | null;
  }>;
  disclaimer: string;
  disclaimerHi: string;
};
