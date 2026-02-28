import { randomUUID } from "node:crypto";
import type {
  FhirCodeableConcept,
  FhirCondition,
  FhirDiagnosticReport,
  FhirMedicationRequest,
  FhirObservation,
  FhirResource,
} from "@/lib/server/fhir/types";

type WearableMetric = "resting_heart_rate" | "heart_rate" | "spo2" | "sleep_duration_hours" | "heart_rate_variability";

export type WearableReading = {
  id: string;
  metric: WearableMetric;
  value: number;
  unit: string;
  recordedAt: string;
  provider: string;
  note?: string;
};

export type EhrRecord = {
  id: string;
  kind: "condition" | "medication" | "lab";
  title: string;
  code?: string;
  system?: string;
  status?: string;
  recordedAt?: string;
  onsetDate?: string;
  value?: number;
  unit?: string;
  notes?: string;
  provider: string;
};

type MetricDefinition = {
  code: string;
  system: string;
  display: string;
  unitSystem?: string;
};

const metricDefinitions: Record<WearableMetric, MetricDefinition> = {
  resting_heart_rate: {
    code: "resting_heart_rate",
    system: "https://yourdoc.health/metrics",
    display: "Resting heart rate",
    unitSystem: "http://unitsofmeasure.org",
  },
  heart_rate: {
    code: "8867-4",
    system: "http://loinc.org",
    display: "Heart rate",
    unitSystem: "http://unitsofmeasure.org",
  },
  spo2: {
    code: "59408-5",
    system: "http://loinc.org",
    display: "Oxygen saturation in Arterial blood by Pulse oximetry",
    unitSystem: "http://unitsofmeasure.org",
  },
  sleep_duration_hours: {
    code: "sleep_duration_hours",
    system: "https://yourdoc.health/metrics",
    display: "Sleep duration",
    unitSystem: "http://unitsofmeasure.org",
  },
  heart_rate_variability: {
    code: "heart_rate_variability",
    system: "https://yourdoc.health/metrics",
    display: "Heart rate variability",
    unitSystem: "http://unitsofmeasure.org",
  },
};

function ensureIsoDate(value?: string): string {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function codeableConcept(text: string, coding?: { system?: string; code?: string; display?: string }): FhirCodeableConcept {
  if (!coding) {
    return { text };
  }

  return {
    text,
    coding: [coding],
  };
}

export function mapWearableReadingToObservation(userId: string, reading: WearableReading): FhirObservation {
  const metric = metricDefinitions[reading.metric];

  return {
    resourceType: "Observation",
    id: reading.id || randomUUID(),
    status: "final",
    category: [
      codeableConcept("Vital Signs", {
        system: "http://terminology.hl7.org/CodeSystem/observation-category",
        code: "vital-signs",
        display: "Vital Signs",
      }),
    ],
    code: codeableConcept(metric.display, {
      system: metric.system,
      code: metric.code,
      display: metric.display,
    }),
    subject: {
      reference: `Patient/${userId}`,
    },
    effectiveDateTime: ensureIsoDate(reading.recordedAt),
    valueQuantity: {
      value: reading.value,
      unit: reading.unit,
      system: metric.unitSystem,
      code: reading.unit,
    },
    note: reading.note ? [{ text: reading.note }] : undefined,
    meta: {
      source: reading.provider,
      profile: ["http://hl7.org/fhir/StructureDefinition/Observation"],
    },
  };
}

export function mapEhrRecordToResource(userId: string, record: EhrRecord): FhirResource {
  const concept = codeableConcept(record.title, {
    system: record.system,
    code: record.code,
    display: record.title,
  });

  if (record.kind === "condition") {
    const condition: FhirCondition = {
      resourceType: "Condition",
      id: record.id || randomUUID(),
      clinicalStatus: codeableConcept(record.status ?? "active"),
      code: concept,
      subject: {
        reference: `Patient/${userId}`,
      },
      onsetDateTime: ensureIsoDate(record.onsetDate ?? record.recordedAt),
      recordedDate: ensureIsoDate(record.recordedAt),
      note: record.notes ? [{ text: record.notes }] : undefined,
      meta: {
        source: record.provider,
        profile: ["http://hl7.org/fhir/StructureDefinition/Condition"],
      },
    };

    return condition;
  }

  if (record.kind === "medication") {
    const medication: FhirMedicationRequest = {
      resourceType: "MedicationRequest",
      id: record.id || randomUUID(),
      status: record.status === "stopped" ? "stopped" : "active",
      intent: "order",
      medicationCodeableConcept: concept,
      subject: {
        reference: `Patient/${userId}`,
      },
      authoredOn: ensureIsoDate(record.recordedAt),
      dosageInstruction: record.unit && typeof record.value === "number" ? [{ text: `${record.value} ${record.unit}` }] : undefined,
      note: record.notes ? [{ text: record.notes }] : undefined,
      meta: {
        source: record.provider,
        profile: ["http://hl7.org/fhir/StructureDefinition/MedicationRequest"],
      },
    };

    return medication;
  }

  const report: FhirDiagnosticReport = {
    resourceType: "DiagnosticReport",
    id: record.id || randomUUID(),
    status: "final",
    code: concept,
    subject: {
      reference: `Patient/${userId}`,
    },
    effectiveDateTime: ensureIsoDate(record.recordedAt),
    conclusion:
      typeof record.value === "number"
        ? `${record.title}: ${record.value}${record.unit ? ` ${record.unit}` : ""}`
        : record.notes,
    meta: {
      source: record.provider,
      profile: ["http://hl7.org/fhir/StructureDefinition/DiagnosticReport"],
    },
  };

  return report;
}

export function resourceToHealthRecordTitle(resource: FhirResource): string {
  if (resource.resourceType === "Observation") {
    return resource.code.text ?? "Observation";
  }

  if (resource.resourceType === "Condition") {
    return resource.code.text ?? "Condition";
  }

  if (resource.resourceType === "MedicationRequest") {
    return resource.medicationCodeableConcept.text ?? "Medication";
  }

  return resource.code.text ?? "Diagnostic report";
}

export function resourceToObservedAt(resource: FhirResource): string | null {
  if (resource.resourceType === "Observation") {
    return resource.effectiveDateTime;
  }

  if (resource.resourceType === "Condition") {
    return resource.recordedDate ?? resource.onsetDateTime ?? null;
  }

  if (resource.resourceType === "MedicationRequest") {
    return resource.authoredOn ?? null;
  }

  return resource.effectiveDateTime ?? null;
}

export function resourceToRecordType(resource: FhirResource): string {
  return `fhir_${resource.resourceType.toLowerCase()}`;
}
