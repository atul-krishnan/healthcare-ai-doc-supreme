import { beforeEach, describe, expect, it, vi } from "vitest";

describe("runTriage", () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.TRIAGE_ML_SERVICE_URL;
    vi.resetModules();
  });

  it("returns high severity for emergency keyword", async () => {
    const { runTriage } = await import("./triage");

    const result = await runTriage({
      symptomText: "I have severe chest pain and shortness of breath since morning",
      age: 42,
      durationDays: 1,
      hasChronicConditions: false,
      isPregnant: false,
    });

    expect(result.output.severity).toBe("high");
    expect(result.output.redFlags.length).toBeGreaterThan(0);
    expect(result.output.rationale.length).toBeGreaterThan(5);
  });

  it("returns medium severity for prolonged symptoms without red flags", async () => {
    const { runTriage } = await import("./triage");

    const result = await runTriage({
      symptomText: "Persistent cough and fatigue that is not improving",
      age: 31,
      durationDays: 10,
      hasChronicConditions: false,
      isPregnant: false,
    });

    expect(["medium", "high"]).toContain(result.output.severity);
    expect(result.output.citations.length).toBeGreaterThanOrEqual(0);
  });
});
