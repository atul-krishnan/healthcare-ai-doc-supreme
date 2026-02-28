import { AppPageLayout } from "@/components/app-page-layout";
import { ChatRoom } from "@/components/panels/chat-room";
import { requireUser } from "@/lib/server/require-user";

export default async function ChatPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Chat"
      description="Continue your care conversation, ask follow-ups, and keep a persistent timeline of guidance."
      email={user?.email ?? null}
    >
      <ChatRoom />
    </AppPageLayout>
  );
}
