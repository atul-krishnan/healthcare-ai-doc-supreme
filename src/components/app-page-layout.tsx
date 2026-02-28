import { AppSidebar } from "@/components/app-sidebar";

type AppPageLayoutProps = {
  title: string;
  subtitle?: string;
  description?: string;
  email?: string | null;
  actions?: React.ReactNode;
  showSidebar?: boolean;
  children: React.ReactNode;
};

export function AppPageLayout({
  title,
  subtitle,
  description,
  email,
  actions,
  showSidebar = true,
  children,
}: AppPageLayoutProps) {
  return (
    <section className="mx-auto w-full max-w-[1480px] md:flex md:items-start">
      {showSidebar ? <AppSidebar email={email} /> : null}

      <div className={`min-w-0 flex-1 px-4 py-8 md:py-10 ${showSidebar ? "md:px-10" : "mx-auto max-w-6xl md:px-8"}`}>
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <h1 className="font-serif text-[2.65rem] leading-[0.95] tracking-[-0.02em] text-[#22211f]">{title}</h1>
            {subtitle ? <p className="mt-2 text-[2rem] font-serif leading-none text-[#FF6600]">{subtitle}</p> : null}
            {description ? <p className="mt-4 text-base leading-relaxed text-[#7f7a73]">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>

        {children}
      </div>
    </section>
  );
}
