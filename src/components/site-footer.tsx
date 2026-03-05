import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e2e8f0] bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image
              src="/images/aayusmart-logo.png"
              alt="AayuSmart — Unified Health Ecosystem"
              width={180}
              height={48}
              className="h-10 w-auto object-contain"
            />
            <p className="mt-2 max-w-md text-sm text-[#64748b]">
              Unified family health ecosystem — care navigation, lab analysis, consult matching, and recovery support in one place.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0f172a]">Product</p>
            <div className="mt-3 grid gap-2 text-sm text-[#64748b]">
              <Link href="/" className="transition-colors hover:text-[#1d4ed8]">
                AI Navigator
              </Link>
              <Link href="/consultations" className="transition-colors hover:text-[#1d4ed8]">
                Virtual Consults
              </Link>
              <Link href="/vault" className="transition-colors hover:text-[#1d4ed8]">
                Health Vault
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0f172a]">Legal</p>
            <div className="mt-3 grid gap-2 text-sm text-[#64748b]">
              <Link href="/terms" className="transition-colors hover:text-[#1d4ed8]">
                Terms
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-[#1d4ed8]">
                Privacy
              </Link>
              <p>Emergency care: contact local emergency services immediately.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[#e2e8f0] pt-6 text-center">
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-[#94a3b8]">
            AayuSmart provides decision support and care navigation — it is not a diagnosis service.
            Always review recommendations with a physician. In an emergency, contact local emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
