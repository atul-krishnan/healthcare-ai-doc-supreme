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
      description="Understand the differences, recognize your symptoms, and know when to act."
      primaryCta={{ label: "Check Symptoms", href: "/ai-doctor" }}
      secondaryCta={{ label: "Talk to Doctor", href: "/chat" }}
    />
  );
}
