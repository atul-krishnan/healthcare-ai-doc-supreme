import { AppPageLayout } from "@/components/app-page-layout";
import { ChatRoom } from "@/components/panels/chat-room";
import { requireUser } from "@/lib/server/require-user";

export default async function ChatPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Chat"
      description="Pick up where you left off. Your health conversation is always here."
      email={user?.email ?? null}
    >
      <ChatRoom />
    </AppPageLayout>
  );
}
