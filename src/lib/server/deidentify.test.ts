import { describe, expect, it } from "vitest";
import { deidentifyClinicalText } from "./deidentify";

describe("deidentifyClinicalText", () => {
  it("redacts common PHI patterns", () => {
    const input =
      "Patient email john.doe@example.com phone +91 98765 43210 ABHA 12-3456-7890-1234 DOB 12/03/1991";

    const output = deidentifyClinicalText(input);

    expect(output).not.toContain("john.doe@example.com");
    expect(output).not.toContain("98765");
    expect(output).not.toContain("12-3456-7890-1234");
    expect(output).toContain("[REDACTED_EMAIL]");
    expect(output).toContain("[REDACTED_PHONE]");
    expect(output).toContain("[REDACTED_ABHA_ID]");
  });
});
