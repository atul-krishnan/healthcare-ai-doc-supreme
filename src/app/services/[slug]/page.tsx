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
      description="Learn what to expect from this service and how our doctors can help."
      primaryCta={{ label: "Book Consultation", href: "/chat" }}
      secondaryCta={{ label: "Back to Pricing", href: "/pricing" }}
    />
  );
}
