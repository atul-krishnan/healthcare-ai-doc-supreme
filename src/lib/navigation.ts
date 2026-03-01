export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const publicNav: NavItem[] = [
  { label: "Intake", href: "/intake", description: "Guided symptom intake" },
  { label: "Vault", href: "/vault", description: "Saved briefs and documents" },
  { label: "Doctor", href: "/doctor", description: "Doctor quick-check workspace" },
  { label: "Dashboard", href: "/dashboard", description: "Health and care overview" },
];

export const appNav: NavItem[] = [
  { label: "Intake", href: "/intake" },
  { label: "Vault", href: "/vault" },
  { label: "Visits", href: "/consultations" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctor", href: "/doctor" },
];

export const sidebarNav: NavItem[] = [
  { label: "Guided Intake", href: "/intake", description: "Anonymous symptom intake" },
  { label: "Health Vault", href: "/vault", description: "Saved briefs + uploaded records" },
  { label: "Dashboard", href: "/dashboard", description: "Health trends and tasks" },
  { label: "Doctor Visits", href: "/consultations", description: "Consults and prescriptions" },
  { label: "Doctor Workspace", href: "/doctor", description: "Quick Check + consultation queue" },
  { label: "Health Records", href: "/health-records", description: "Reports, scans, exports" },
  { label: "Integrations", href: "/integrations", description: "Wearables and EHR sync" },
  { label: "Monitoring", href: "/monitoring", description: "Clinical drift alerts" },
  { label: "Knowledge Base", href: "/knowledge-base", description: "Guideline retrieval and search" },
  { label: "Profile", href: "/profile", description: "Account and preferences" },
  { label: "Billing", href: "/pay", description: "Plan and checkout" },
];
