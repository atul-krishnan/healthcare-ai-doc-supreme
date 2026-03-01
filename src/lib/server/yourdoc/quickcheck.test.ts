import { describe, expect, it } from "vitest";
import { evaluateQuickcheckCta, isHighUncertainty } from "./quickcheck";

describe("isHighUncertainty", () => {
  it("detects uncertainty keywords", () => {
    expect(isHighUncertainty("Low confidence due to limited data")).toBe(true);
    expect(isHighUncertainty("rule-based output used")).toBe(true);
    expect(isHighUncertainty("Confidence is high")).toBe(false);
  });
});

describe("evaluateQuickcheckCta", () => {
  it("prioritizes ER backup messaging for er_now", () => {
    const result = evaluateQuickcheckCta("er_now", { wantsDoctor: false, stillUnsure: false });

    expect(result.show).toBe(true);
    expect(result.primary).toBe(false);
    expect(result.reason).toBe("er_backup");
  });

  it("shows primary quick check for urgent care settings", () => {
    const result = evaluateQuickcheckCta("urgent_today", {});

    expect(result.show).toBe(true);
    expect(result.primary).toBe(true);
    expect(result.talkToDoctor).toBe(true);
    expect(result.reason).toBe("urgency");
  });

  it("shows consult path when user explicitly requests doctor", () => {
    const result = evaluateQuickcheckCta("self_care", { wantsDoctor: true });

    expect(result.show).toBe(true);
    expect(result.talkToDoctor).toBe(true);
    expect(result.reason).toBe("user_request");
  });

  it("shows quick check for high uncertainty", () => {
    const result = evaluateQuickcheckCta("self_care", {
      confidenceNotes: "low confidence due to insufficient details",
    });

    expect(result.show).toBe(true);
    expect(result.talkToDoctor).toBe(true);
    expect(result.reason).toBe("uncertainty");
  });

  it("keeps self-care without CTA when no trigger exists", () => {
    const result = evaluateQuickcheckCta("self_care", {});

    expect(result.show).toBe(false);
    expect(result.talkToDoctor).toBe(false);
    expect(result.reason).toBe("none");
  });
});
