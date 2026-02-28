import Link from "next/link";

type PageShellProps = {
  title: string;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
};

export function PageShell({
  title,
  description,
  primaryCta,
  secondaryCta,
  children,
}: PageShellProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16 md:px-6">
      <div className="rounded-[2rem] border border-[#f0e6db] bg-white p-6 shadow-[0_8px_24px_rgba(255,102,0,0.04)] md:p-8">
        <h1 className="font-serif text-[2.1rem] leading-[1.05] tracking-[-0.02em] text-stone-900 md:text-[3rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-500 md:text-base">{description}</p>

        {(primaryCta || secondaryCta) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {primaryCta ? (
              <Link
                href={primaryCta.href}
                className="rounded-full bg-[#FF6600] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#E55C00]"
              >
                {primaryCta.label}
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="rounded-full border border-[#f0e6db] px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-[#FF6600] hover:text-[#FF6600]"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        )}

        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
