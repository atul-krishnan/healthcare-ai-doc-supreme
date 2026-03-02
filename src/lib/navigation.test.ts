import { describe, expect, it } from "vitest";
import { getAppNav, getSidebarNav } from "./navigation";

describe("navigation", () => {
  it("shows MVP items for patients", () => {
    const nav = getAppNav({ role: "patient", hideKnowledgeBase: true, hidePlatformSections: true });

    expect(nav.map((item) => item.label)).toEqual([
      "YourDoc Guide",
      "Vault",
      "Visits",
      "Report Scan",
      "Dashboard",
    ]);
  });

  it("shows Doctor item only for doctor roles", () => {
    const patient = getSidebarNav({ role: "patient", hideKnowledgeBase: true, hidePlatformSections: true });
    const doctor = getSidebarNav({ role: "doctor", hideKnowledgeBase: true, hidePlatformSections: true });

    expect(patient.map((item) => item.label)).not.toContain("Doctor Workspace");
    expect(doctor.map((item) => item.label)).toContain("Doctor Workspace");
  });

  it("can include hidden sections when feature flags are off", () => {
    const nav = getSidebarNav({ role: "patient", hideKnowledgeBase: false, hidePlatformSections: false });
    const labels = nav.map((item) => item.label);

    expect(labels).toContain("Integrations");
    expect(labels).toContain("Monitoring");
    expect(labels).toContain("Knowledge Base");
  });
});
