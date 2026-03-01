import { Suspense } from "react";
import { BriefResult } from "@/components/yourdoc/brief-result";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BriefPage({ params }: Params) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <Suspense fallback={<p className="text-sm text-[#6e7e8e]">Loading brief...</p>}>
        <BriefResult briefId={id} />
      </Suspense>
    </section>
  );
}
