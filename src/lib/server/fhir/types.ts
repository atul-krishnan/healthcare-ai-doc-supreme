export type FhirCoding = {
  system?: string;
  code?: string;
  display?: string;
};

export type FhirCodeableConcept = {
  text?: string;
  coding?: FhirCoding[];
};

export type FhirQuantity = {
  value: number;
  unit?: string;
  system?: string;
  code?: string;
};

export type FhirReference = {
  reference: string;
  display?: string;
};

export type FhirMeta = {
  source?: string;
  profile?: string[];
};

export type FhirObservation = {
  resourceType: "Observation";
  id: string;
  status: "final";
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime: string;
  valueQuantity?: FhirQuantity;
  interpretation?: FhirCodeableConcept[];
  note?: Array<{ text: string }>;
  meta?: FhirMeta;
};

export type FhirCondition = {
  resourceType: "Condition";
  id: string;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  onsetDateTime?: string;
  recordedDate?: string;
  note?: Array<{ text: string }>;
  meta?: FhirMeta;
};

export type FhirMedicationRequest = {
  resourceType: "MedicationRequest";
  id: string;
  status: "active" | "completed" | "stopped" | "draft";
  intent: "order";
  medicationCodeableConcept: FhirCodeableConcept;
  subject: FhirReference;
  authoredOn?: string;
  dosageInstruction?: Array<{ text: string }>;
  note?: Array<{ text: string }>;
  meta?: FhirMeta;
};

export type FhirDiagnosticReport = {
  resourceType: "DiagnosticReport";
  id: string;
  status: "final" | "preliminary";
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime?: string;
  conclusion?: string;
  presentedForm?: Array<{ contentType?: string; data?: string; title?: string }>;
  meta?: FhirMeta;
};

export type FhirResource = FhirObservation | FhirCondition | FhirMedicationRequest | FhirDiagnosticReport;
