"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNav } from "@/lib/navigation";

const iconByLabel: Record<string, string> = {
  "AI Doctor": "⤳",
  Visits: "◻",
  Dashboard: "◫",
  Chat: "◌",
};

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#ececeb] bg-[#f6f5f3]/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3e2df] text-sm text-[#7c7a75]"
          aria-label="Open navigation"
        >
          ≡
        </button>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-[#e4e3e1] bg-white/90 p-1 shadow-[0_2px_6px_rgba(16,24,40,0.05)] md:flex">
          {appNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-[#f1f8fc] text-[#5f9fbd]"
                    : "text-[#8d8a84] hover:bg-[#f8f8f7] hover:text-[#5f9fbd]"
                }`}
              >
                <span className="text-xs leading-none">{iconByLabel[item.label] ?? "•"}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#101d33] text-sm font-semibold text-white"
        >
          K
        </Link>
      </div>
    </header>
  );
}
