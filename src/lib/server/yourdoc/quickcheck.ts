import type { CareSetting } from "@/lib/yourdoc/types";

export function evaluateQuickcheckCta(careSetting: CareSetting, stillUnsure: boolean) {
  if (careSetting === "er_now") {
    return {
      show: true,
      primary: false,
      label:
        "If you cannot reach immediate care, Quick Check (10 min) can be used as backup. Do not delay ER for this.",
    };
  }

  if (careSetting === "urgent_today" || careSetting === "opd_24_72h") {
    return {
      show: true,
      primary: true,
      label: "Talk to an online doctor in 10 minutes for quick navigation support.",
    };
  }

  if (stillUnsure) {
    return {
      show: true,
      primary: false,
      label: "Still unsure or anxious? You can book a Quick Check (10 min).",
    };
  }

  return {
    show: false,
    primary: false,
    label: "",
  };
}
