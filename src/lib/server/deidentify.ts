type RedactionRule = {
  pattern: RegExp;
  replacement: string;
};

const rules: RedactionRule[] = [
  {
    // Email addresses.
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: "[REDACTED_EMAIL]",
  },
  {
    // ABHA-like IDs (14 digits with optional separators).
    pattern: /\b\d{2}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
    replacement: "[REDACTED_ABHA_ID]",
  },
  {
    // Generic international phone numbers and Indian 10-digit forms.
    pattern: /(?<!\d)(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){9,12}(?!\d)/g,
    replacement: "[REDACTED_PHONE]",
  },
  {
    // Simple date of birth patterns.
    pattern: /\b(?:dob|date\s+of\s+birth)\s*[:=-]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,
    replacement: "DOB [REDACTED]",
  },
];

export function deidentifyClinicalText(input: string): string {
  return rules.reduce((current, rule) => current.replace(rule.pattern, rule.replacement), input).trim();
}
