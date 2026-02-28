"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type LayoutFrameProps = {
  children: React.ReactNode;
};

const appRoutes = [
  "/ai-doctor",
  "/consultations",
  "/dashboard",
  "/chat",
  "/profile",
  "/health-records",
  "/doctor",
  "/pay",
  "/integrations",
  "/monitoring",
  "/knowledge-base",
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
        <footer className="border-t border-[#f0e6db] bg-[#fffbf7] px-4 py-10 text-center text-xs text-[#9a968f]">
          <p className="font-serif text-xl text-[#1c1b18]">YourDoc</p>
          <p className="mt-2">Questions? Contact support@yourdoc.ai</p>
        </footer>
      ) : (
        <SiteFooter />
      )}
    </>
  );
}
