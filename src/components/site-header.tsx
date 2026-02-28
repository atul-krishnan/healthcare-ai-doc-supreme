"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNav } from "@/lib/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function NavIcon({ label }: { label: string }) {
  const size = 18;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", strokeWidth: "1.8", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (label) {
    case "AI Doctor":
      return (
        <svg {...common}>
          <path d="M12 8V4m0 4a2 2 0 100 4 2 2 0 000-4z" />
          <path d="M12 12v2m-4 4h8a2 2 0 002-2v-1a4 4 0 00-4-4h-4a4 4 0 00-4 4v1a2 2 0 002 2z" />
          <path d="M9 4h6" />
        </svg>
      );
    case "Visits":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "Dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "Chat":
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m17.07-7.07l-1.42 1.42M7.35 16.65l-1.42 1.42m12.14 0l-1.42-1.42M7.35 7.35L5.93 5.93" />
        </svg>
      );
  }
}

function getInitial(fullName?: string | null, email?: string | null): string {
  const normalizedName = fullName?.trim();
  if (normalizedName) {
    const firstChar = normalizedName.match(/[A-Za-z0-9]/)?.[0];
    if (firstChar) {
      return firstChar.toUpperCase();
    }
  }

  const normalizedEmail = email?.trim();
  if (normalizedEmail) {
    const firstChar = normalizedEmail.match(/[A-Za-z0-9]/)?.[0];
    if (firstChar) {
      return firstChar.toUpperCase();
    }
  }

  return "U";
}

export function SiteHeader() {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profileInitial, setProfileInitial] = useState("U");

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }
    const supabaseClient = client;

    let active = true;

    async function loadInitial() {
      if (!client) return;

      const { data } = await client.auth.getUser();
      if (!active) return;

      const user = data.user;
      const fullName =
        typeof user?.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user?.user_metadata?.name === "string"
            ? user.user_metadata.name
            : null;
      setProfileInitial(getInitial(fullName, user?.email ?? null));
    }

    void loadInitial();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      const fullName =
        typeof user?.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user?.user_metadata?.name === "string"
            ? user.user_metadata.name
            : null;
      setProfileInitial(getInitial(fullName, user?.email ?? null));
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#D8E6E6] bg-[#F4F9FB]/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A9D8F] text-white transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4m0 4a2 2 0 100 4 2 2 0 000-4z" />
              <path d="M12 12v2m-4 4h8a2 2 0 002-2v-1a4 4 0 00-4-4h-4a4 4 0 00-4 4v1a2 2 0 002 2z" />
              <path d="M9 4h6" />
            </svg>
          </span>
          <span className="hidden sm:block font-serif text-lg text-[#1e1d1a]">YourDoc</span>
        </Link>

        {/* Desktop Navigation - pill style */}
        <nav className="hidden items-center rounded-full border border-[#D8E6E6] bg-white/90 p-1 shadow-[0_2px_8px_rgba(42,157,143,0.06)] md:flex">
          {appNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${active
                  ? "bg-[#2A9D8F] text-white shadow-[0_2px_8px_rgba(42,157,143,0.3)]"
                  : "text-[#475569] hover:bg-[#E6F2F0] hover:text-[#2A9D8F]"
                  }`}
              >
                <NavIcon label={item.label} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger + Profile */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8E6E6] text-[#475569] hover:border-[#2A9D8F] hover:text-[#2A9D8F] transition-colors md:hidden"
            aria-label="Open navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Profile button */}
          <Link
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#21867a] text-sm font-semibold text-white shadow-[0_2px_8px_rgba(42,157,143,0.25)] hover:shadow-[0_4px_12px_rgba(42,157,143,0.35)] transition-shadow"
          >
            {profileInitial}
          </Link>
        </div>
      </div>
    </header>
  );
}
