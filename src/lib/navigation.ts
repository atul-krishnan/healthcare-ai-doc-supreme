export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const publicNav: NavItem[] = [
  { label: "AI Doctor", href: "/ai-doctor", description: "Symptom chat and triage" },
  { label: "Visits", href: "/consultations", description: "Doctor consultations" },
  { label: "Dashboard", href: "/dashboard", description: "Health and care overview" },
  { label: "Chat", href: "/chat", description: "Follow-up assistant thread" },
];

export const appNav: NavItem[] = [
  { label: "AI Doctor", href: "/ai-doctor" },
  { label: "Visits", href: "/consultations" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Chat", href: "/chat" },
];

export const sidebarNav: NavItem[] = [
  { label: "AI Doctor", href: "/ai-doctor", description: "Free symptom assessment" },
  { label: "Dashboard", href: "/dashboard", description: "Health trends and tasks" },
  { label: "Doctor Visits", href: "/consultations", description: "Consults and prescriptions" },
  { label: "Chat", href: "/chat", description: "Async care conversation" },
  { label: "Health Records", href: "/health-records", description: "Reports, scans, exports" },
  { label: "Integrations", href: "/integrations", description: "Wearables and EHR sync" },
  { label: "Monitoring", href: "/monitoring", description: "Clinical drift alerts" },
  { label: "Knowledge Base", href: "/knowledge-base", description: "Guideline retrieval and search" },
  { label: "Profile", href: "/profile", description: "Account and preferences" },
  { label: "Billing", href: "/pay", description: "Plan and checkout" },
];
