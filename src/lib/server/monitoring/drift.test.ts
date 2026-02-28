import { describe, expect, it } from "vitest";
import { computeClinicalDriftAlerts } from "./drift";

describe("computeClinicalDriftAlerts", () => {
  it("flags alerts when recent trends are worse than baseline", () => {
    const records = [] as Array<{ id: string; observed_at: string | null; payload: unknown }>;
    const now = Date.now();

    for (let index = 0; index < 14; index += 1) {
      const recent = index < 7;
      const value = recent ? 78 + index * 0.3 : 64 + index * 0.1;

      records.push({
        id: `obs-${index}`,
        observed_at: new Date(now - index * 24 * 60 * 60 * 1000).toISOString(),
        payload: {
          code: {
            coding: [{ code: "resting_heart_rate" }],
          },
          valueQuantity: {
            value,
          },
        },
      });
    }

    const alerts = computeClinicalDriftAlerts(records as never);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]?.metric).toBe("resting_heart_rate");
  });
});
