import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#f0e6db] bg-[#FFFBF7]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-serif text-2xl text-stone-900">YourDoc</p>
            <p className="mt-2 max-w-md text-sm text-stone-500">
              AI-powered health guidance and real doctor care — in one place.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">Product</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-500">
              <Link href="/ai-doctor" className="hover:text-[#FF6600] transition-colors">
                AI Doctor
              </Link>
              <Link href="/consultations" className="hover:text-[#FF6600] transition-colors">
                Consultations
              </Link>
              <Link href="/pricing" className="hover:text-[#FF6600] transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">Legal</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-500">
              <Link href="/terms" className="hover:text-[#FF6600] transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[#FF6600] transition-colors">
                Privacy
              </Link>
              <p>Emergency care: contact local emergency services immediately.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[#f0e6db] pt-6 text-center">
          <p className="text-xs text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Always review YourDoc&apos;s insights with your physician. YourDoc is an AI-powered health assistant — not a licensed medical provider — and does not diagnose, treat, or deliver medical care. Our platform partners with board-certified physicians. In an emergency, contact local emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
