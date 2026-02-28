export type NavItem = {
  label: string;
  href: string;
};

export const publicNav: NavItem[] = [
  { label: "AI Doctor", href: "/ai-doctor" },
  { label: "Conditions", href: "/conditions" },
  { label: "Services", href: "/services/primary-care" },
  { label: "Compare", href: "/compare" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

export const appNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Consultations", href: "/consultations" },
  { label: "Health Records", href: "/health-records" },
  { label: "Chat", href: "/chat" },
  { label: "Doctor", href: "/doctor" },
  { label: "Profile", href: "/profile" },
  { label: "Billing", href: "/pay" },
];
