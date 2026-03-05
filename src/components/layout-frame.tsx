"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
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
  const isMarketingLanding = pathname === "/";

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      {isMarketingLanding ? null : appRoute ? (
        <footer className="border-t border-[#e2e8f0] bg-white px-4 py-10 text-center text-xs text-[#94a3b8]">
          <Image
            src="/images/aayusmart-logo.png"
            alt="AayuSmart — Unified Health Ecosystem"
            width={160}
            height={44}
            className="mx-auto h-9 w-auto object-contain"
          />
          <p className="mt-2">Questions? Contact support@aayusmart.ai</p>
        </footer>
      ) : (
        <SiteFooter />
      )}
    </>
  );
}
