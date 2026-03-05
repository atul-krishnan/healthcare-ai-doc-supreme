"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getAppNav, type NavRole } from "@/lib/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function NavIcon({ label }: { label: string }) {
  const size = 18;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", strokeWidth: "1.8", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (label) {
    case "YourDoc Guide":
      return (
        <svg {...common}>
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "Vault":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
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
    case "Report Scan":
      return (
        <svg {...common}>
          <path d="M10 3h4" />
          <path d="M9 3h6v3l4 7c1 2-.5 4-2.5 4h-9c-2 0-3.5-2-2.5-4l4-7z" />
          <path d="M8 13h8" />
          <path d="M10.5 19h3" />
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
    case "Doctor":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20v-1a7 7 0 0114 0v1" />
          <path d="M12 3v2m-5 3h2m6 0h2" />
        </svg>
      );
    case "Doctor Admin":
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z" />
          <circle cx="12" cy="10" r="2" />
          <path d="M9 16c.7-1.2 1.8-2 3-2s2.3.8 3 2" />
        </svg>
      );
    case "Audit Logs":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
          <path d="M16 19l2 2 3-3" />
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
  const isMarketingLanding = pathname === "/";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profileInitial, setProfileInitial] = useState("U");
  const [userRole, setUserRole] = useState<NavRole>("patient");
  const navItems = useMemo(() => getAppNav({ role: userRole }), [userRole]);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }
    const supabaseClient = client;

    let active = true;
    const readRole = async (userId: string | undefined | null): Promise<NavRole> => {
      if (!userId) {
        return "patient";
      }

      const { data } = await client.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (data?.role === "doctor" || data?.role === "admin") {
        return data.role;
      }

      return "patient";
    };

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
      setUserRole(await readRole(user?.id));
    }

    void loadInitial();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        const user = session?.user;
        const fullName =
          typeof user?.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : typeof user?.user_metadata?.name === "string"
              ? user.user_metadata.name
              : null;
        setProfileInitial(getInitial(fullName, user?.email ?? null));
        setUserRole(await readRole(user?.id));
      })();
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (isMarketingLanding) {
    return (
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2 md:px-6">
          <Link href="/" className="flex items-center py-1">
            <Image
              src="/images/aayusmart-logo.png"
              alt="AayuSmart — Unified Health Ecosystem"
              width={320}
              height={90}
              className="h-14 md:h-20 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-[#334155] md:flex">
            <a href="#features" className="transition hover:text-[#1d4ed8]">
              Features
            </a>
            <a href="#waitlist" className="transition hover:text-[#1d4ed8]">
              Waitlist
            </a>
            <a href="#contact" className="transition hover:text-[#1d4ed8]">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#waitlist"
              className="inline-flex h-9 items-center rounded-lg bg-[#1e3a8a] px-4 text-sm font-bold !text-white transition hover:bg-[#1d4ed8]"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface)]/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-600)] text-white transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4m0 4a2 2 0 100 4 2 2 0 000-4z" />
              <path d="M12 12v2m-4 4h8a2 2 0 002-2v-1a4 4 0 00-4-4h-4a4 4 0 00-4 4v1a2 2 0 002 2z" />
              <path d="M9 4h6" />
            </svg>
          </span>
          <span className="hidden font-serif text-lg text-[var(--text)] sm:block">YourDoc</span>
        </Link>

        <nav className="hidden items-center rounded-full border border-[var(--line)] bg-white/90 p-1 shadow-[0_2px_8px_rgba(37,99,235,0.06)] md:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/intake") || pathname.startsWith("/briefs")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${active
                  ? "bg-[var(--brand-600)] text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
                  : "text-[var(--muted)] hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)]"
                  }`}
              >
                <NavIcon label={item.label} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-600)] md:hidden"
            aria-label="Open navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] text-sm font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-shadow hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
          >
            {profileInitial}
          </Link>
        </div>
      </div>
    </header>
  );
}
