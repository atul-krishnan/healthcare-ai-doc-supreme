import { PageShell } from "@/components/page-shell";
import { ChatRoom } from "@/components/panels/chat-room";
import { requireUser } from "@/lib/server/require-user";

export default async function ChatPage() {
  await requireUser();

  return (
    <PageShell
      title="Doctor Chat"
      description="Secure thread-based messaging. Patient messages are persisted and assistant summaries provide structured continuity."
    >
      <ChatRoom />
    </PageShell>
  );
}
