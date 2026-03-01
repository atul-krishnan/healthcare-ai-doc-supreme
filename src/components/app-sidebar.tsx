"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSidebarNav, type NavRole } from "@/lib/navigation";

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
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [role, setRole] = useState<NavRole>("patient");
  const navItems = useMemo(() => getSidebarNav({ role }), [role]);

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

    async function loadRole() {
      const { data } = await supabaseClient.auth.getUser();
      if (!active) {
        return;
      }
      setRole(await readRole(data.user?.id));
    }

    void loadRole();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        setRole(await readRole(session?.user?.id));
      })();
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <aside className="sticky top-[62px] hidden h-[calc(100vh-78px)] w-[280px] shrink-0 border-r border-[var(--line)] bg-[var(--surface-alt)] md:flex md:flex-col">
      <div className="border-b border-[var(--line)] p-6">
        <p className="font-serif text-[2rem] leading-none text-[var(--text)]">YourDoc</p>
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-[var(--line)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-600)] text-sm font-bold text-white shadow-md shadow-[var(--brand-500)]/20">
            {profileInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)]">Patient Account</p>
            <p className="truncate text-xs text-[var(--muted)]">{email ?? "account@yourdoc.ai"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/intake") || pathname.startsWith("/briefs")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3 py-2.5 transition-colors ${active
                ? "bg-white text-[var(--brand-600)] shadow-sm border border-[var(--line)]"
                : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--brand-600)]"
                }`}
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-0.5 text-xs opacity-70">{item.description}</p>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[var(--line)] p-4">
        <Link href="/terms" className="block px-2 text-xs text-[var(--muted)] hover:text-[var(--brand-600)] transition-colors">
          Terms and privacy
        </Link>
      </div>
    </aside>
  );
}
