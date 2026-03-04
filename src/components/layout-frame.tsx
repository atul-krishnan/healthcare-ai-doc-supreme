"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type LayoutFrameProps = {
  children: React.ReactNode;
};

const appRoutes = [
  "/intake",
  "/briefs",
  "/vault",
  "/ai-doctor",
  "/consultations",
  "/dashboard",
  "/chat",
  "/profile",
  "/health-records",
  "/doctor",
  "/doctor/apply",
  "/pay",
  "/integrations",
  "/monitoring",
  "/knowledge-base",
  "/admin",
  "/doctors",
];

function isAppRoute(pathname: string): boolean {
  return appRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function LayoutFrame({ children }: LayoutFrameProps) {
  const pathname = usePathname();
  const appRoute = isAppRoute(pathname);

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      {appRoute ? (
        <footer className="border-t border-[#D8E6E6] bg-[#F4F9FB] px-4 py-10 text-center text-xs text-[#94a3b8]">
          <p className="font-serif text-xl text-[#1c1b18]">YourDoc</p>
          <p className="mt-2">Questions? Contact support@yourdoc.ai</p>
        </footer>
      ) : (
        <SiteFooter />
      )}
    </>
  );
}
