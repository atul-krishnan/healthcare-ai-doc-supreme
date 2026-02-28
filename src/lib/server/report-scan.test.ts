import { describe, expect, it } from "vitest";
import { scanMedicalReport } from "./report-scan";

describe("scanMedicalReport", () => {
  it("extracts key markers in fallback mode", async () => {
    delete process.env.OPENAI_API_KEY;

    const result = await scanMedicalReport(
      "HbA1c 6.8%, fasting glucose 132 mg/dL, hemoglobin 11.2 g/dL and WBC 12.4",
    );

    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.summary.length).toBeGreaterThan(10);
  });
});
