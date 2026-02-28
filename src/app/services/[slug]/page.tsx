import { PageShell } from "@/components/page-shell";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const serviceName = slug.replaceAll("-", " ");

  return (
    <PageShell
      title={`Service: ${serviceName}`}
      description="Service detail template for consult category pages. Add doctor availability, workflow, and expected turnaround here."
      primaryCta={{ label: "Book Consultation", href: "/chat" }}
      secondaryCta={{ label: "Back to Pricing", href: "/pricing" }}
    />
  );
}
