import { PageShell } from "@/components/page-shell";

type ComparePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CompareDetailPage({ params }: ComparePageProps) {
  const { slug } = await params;
  const title = slug.replaceAll("-", " ");

  return (
    <PageShell
      title={`Comparison: ${title}`}
      description="Template for side-by-side symptom and care recommendation pages, with escalation buttons into AI/doctor flow."
      primaryCta={{ label: "Check Symptoms", href: "/ai-doctor" }}
      secondaryCta={{ label: "Talk to Doctor", href: "/chat" }}
    />
  );
}
