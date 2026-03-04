export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavRole = "patient" | "doctor" | "admin";

type NavOptions = {
  role?: NavRole;
  hideKnowledgeBase?: boolean;
  hidePlatformSections?: boolean;
};

const publicNav: NavItem[] = [
  { label: "YourDoc Guide", href: "/", description: "Create a Doctor Brief" },
  { label: "Vault", href: "/vault", description: "Saved briefs and records" },
  { label: "Visits", href: "/consultations", description: "Doctor visits and follow-up" },
  { label: "Report Scan", href: "/health-records", description: "Scan reports and labs" },
  { label: "Dashboard", href: "/dashboard", description: "Health overview" },
];

const doctorNav: NavItem = {
  label: "Doctor",
  href: "/doctor",
  description: "Doctor workspace",
};

const adminNav: NavItem = {
  label: "Doctor Admin",
  href: "/admin/doctor-applications",
  description: "Onboarding approvals",
};

const adminAuditNav: NavItem = {
  label: "Audit Logs",
  href: "/admin/audit",
  description: "Doctor access trail",
};

const platformNav: NavItem[] = [
  { label: "Integrations", href: "/integrations", description: "Wearables and EHR sync" },
  { label: "Monitoring", href: "/monitoring", description: "Clinical drift alerts" },
];

const knowledgeBaseNav: NavItem = {
  label: "Knowledge Base",
  href: "/knowledge-base",
  description: "Guideline retrieval and search",
};

function parseFlag(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function readNavDefaults() {
  return {
    hideKnowledgeBase: parseFlag(process.env.NEXT_PUBLIC_HIDE_KNOWLEDGE_BASE, true),
    hidePlatformSections: parseFlag(process.env.NEXT_PUBLIC_HIDE_PLATFORM_SECTIONS, true),
  };
}

function includeDoctor(role: NavRole | undefined) {
  return role === "doctor" || role === "admin";
}

export function getPublicNav(options: NavOptions = {}): NavItem[] {
  const defaults = readNavDefaults();
  const hideKnowledgeBase = options.hideKnowledgeBase ?? defaults.hideKnowledgeBase;
  const hidePlatformSections = options.hidePlatformSections ?? defaults.hidePlatformSections;
  const role = options.role;

  const nav = [...publicNav];

  if (!hidePlatformSections) {
    nav.push(...platformNav);
  }

  if (!hideKnowledgeBase) {
    nav.push(knowledgeBaseNav);
  }

  if (includeDoctor(role)) {
    nav.push(doctorNav);
  }

  if (role === "admin") {
    nav.push(adminNav);
    nav.push(adminAuditNav);
  }

  return nav;
}

export function getAppNav(options: NavOptions = {}): NavItem[] {
  return getPublicNav(options).map((item) => ({ label: item.label, href: item.href }));
}

export function getSidebarNav(options: NavOptions = {}): NavItem[] {
  const defaults = readNavDefaults();
  const hideKnowledgeBase = options.hideKnowledgeBase ?? defaults.hideKnowledgeBase;
  const hidePlatformSections = options.hidePlatformSections ?? defaults.hidePlatformSections;
  const role = options.role;

  const nav: NavItem[] = [
    { label: "YourDoc Guide", href: "/", description: "Start guided intake and create a brief" },
    { label: "Health Vault", href: "/vault", description: "Saved briefs and uploaded records" },
    { label: "Doctor Visits", href: "/consultations", description: "Consults and prescriptions" },
    { label: "Report Scan", href: "/health-records", description: "Scan reports and lab text" },
    { label: "Dashboard", href: "/dashboard", description: "Health trends and tasks" },
  ];

  if (includeDoctor(role)) {
    nav.push({
      label: "Doctor Workspace",
      href: "/doctor",
      description: "Quick Check and consultation queue",
    });
  }

  if (role === "admin") {
    nav.push({
      label: "Doctor Admin",
      href: "/admin/doctor-applications",
      description: "Review onboarding applications",
    });
    nav.push({
      label: "Audit Logs",
      href: "/admin/audit",
      description: "Doctor access and outcomes trail",
    });
  }

  if (!hidePlatformSections) {
    nav.push(...platformNav);
  }

  if (!hideKnowledgeBase) {
    nav.push(knowledgeBaseNav);
  }

  return nav;
}
