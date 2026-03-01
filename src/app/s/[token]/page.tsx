import { SharedBriefView } from "@/components/yourdoc/shared-brief-view";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SharedBriefPage({ params }: Params) {
  const { token } = await params;
  return <SharedBriefView token={token} />;
}
