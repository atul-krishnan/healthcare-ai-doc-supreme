import { IntakeForm } from "@/components/yourdoc/intake-form";

type SearchParams = Promise<{
  symptoms?: string;
}>;

export default async function IntakePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialSymptoms = params?.symptoms ?? "";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-6 max-w-3xl">
        <h1 className="font-serif text-[2.2rem] leading-tight text-[#1D3557] md:text-[3rem]">Care Guide Intake</h1>
        <p className="mt-2 text-sm text-[#62778e] md:text-base">
          Tell us what is happening. We suggest a care setting (self-care, OPD, urgent clinic, or ER) and generate a
          Doctor Brief you can share with any doctor.
        </p>
      </div>
      <IntakeForm initialChiefComplaint={initialSymptoms} />
    </section>
  );
}
