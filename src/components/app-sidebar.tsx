"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarNav } from "@/lib/navigation";

type AppSidebarProps = {
  email?: string | null;
};

function getInitial(email?: string | null): string {
  const normalizedEmail = email?.trim();
  if (!normalizedEmail) {
    return "U";
  }

  const firstChar = normalizedEmail.match(/[A-Za-z0-9]/)?.[0];
  return firstChar ? firstChar.toUpperCase() : "U";
}

export function AppSidebar({ email }: AppSidebarProps) {
  const pathname = usePathname();
  const profileInitial = getInitial(email);

  return (
    <aside className="sticky top-[62px] hidden h-[calc(100vh-78px)] w-[280px] shrink-0 border-r border-[#D8E6E6] bg-[#F4F9FB] md:flex md:flex-col">
      <div className="border-b border-[#D8E6E6] p-6">
        <p className="font-serif text-[2rem] leading-none text-[#1f1f1d]">YourDoc</p>
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(42,157,143,0.06)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#21867a] text-sm font-semibold text-white">
            {profileInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#2e2c29]">Patient Account</p>
            <p className="truncate text-xs text-[#8f8b84]">{email ?? "account@yourdoc.ai"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {sidebarNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3 py-2.5 transition-colors ${active
                  ? "bg-white text-[#2A9D8F] shadow-[0_1px_4px_rgba(42,157,143,0.08)] border border-[#D8E6E6]"
                  : "text-[#7b7770] hover:bg-white/80 hover:text-[#2A9D8F]"
                }`}
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-0.5 text-xs text-[#9c978f]">{item.description}</p>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[#D8E6E6] p-4">
        <Link
          href="/pay"
          className="block rounded-xl border border-[#D8E6E6] bg-[#E6F2F0] px-3 py-3 text-sm font-medium text-[#21867a] hover:bg-[#FFE8CC] transition-colors"
        >
          Upgrade to YourDoc Plus
        </Link>
        <Link href="/terms" className="block px-2 text-xs text-[#96928b] hover:text-[#2A9D8F]">
          Terms and privacy
        </Link>
      </div>
    </aside>
  );
}
