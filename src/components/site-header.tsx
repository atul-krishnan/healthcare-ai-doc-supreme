import Link from "next/link";
import { appNav, publicNav } from "@/lib/navigation";

type SiteHeaderProps = {
  showAppNav?: boolean;
};

export function SiteHeader({ showAppNav = true }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/40 bg-[#faf9f7]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#7DB8D4]/30 bg-[#E8F4F8] text-xs font-semibold text-[#5A9AB8]">
            YD
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-stone-900">YourDoc</p>
            <p className="text-xs text-stone-500">AI + Doctor Telemedicine</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-stone-600 md:flex">
          {publicNav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-[#5A9AB8]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-[#7DB8D4] hover:text-[#5A9AB8]"
          >
            Log in
          </Link>
          <Link
            href="/ai-doctor"
            className="rounded-full bg-[#7DB8D4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A9AB8]"
          >
            Talk to AI Doctor
          </Link>
        </div>
      </div>

      {showAppNav ? (
        <div className="mx-auto hidden w-full max-w-6xl items-center gap-5 border-t border-stone-200/60 px-6 py-2 text-xs text-stone-500 md:flex">
          {appNav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-[#5A9AB8]">
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
