import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[var(--brand-600)] p-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M11 5V11H5V13H11V19H13V13H19V11H13V5H11Z" fill="white" />
                </svg>
              </div>
              <p className="font-serif text-2xl text-[var(--text)]">YourDoc</p>
            </div>
            <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
              Care navigation, shareable doctor briefs, and real doctor visits in one place.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Product</p>
            <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
              <Link href="/" className="transition-colors hover:text-[var(--brand-600)]">
                Care Guide
              </Link>
              <Link href="/consultations" className="transition-colors hover:text-[var(--brand-600)]">
                Visits
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Legal</p>
            <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
              <Link href="/terms" className="transition-colors hover:text-[var(--brand-600)]">
                Terms
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-[var(--brand-600)]">
                Privacy
              </Link>
              <p>Emergency care: contact local emergency services immediately.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--line)] pt-6 text-center">
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-[var(--muted)]/70">
            Always review YourDoc&apos;s output with a physician. YourDoc supports care navigation and documentation and is
            not a diagnosis service. In an emergency, contact local emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
