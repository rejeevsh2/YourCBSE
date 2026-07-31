import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { studioMessages } from "@/data/teacher";

export const Route = createFileRoute("/teacher/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Teacher Studio" },
      { name: "description", content: "Conversations with students, parents and co-teachers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Messages"
      description="Conversations with students, parents and co-teachers."
      showNotice={false}
    >
      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <StudioPanel title="Inbox">
          <ul className="space-y-2">
            {studioMessages.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-transparent p-3 text-left transition-colors hover:border-primary/25 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-accent text-[11px] text-accent-foreground">
                        {message.from.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{message.from}</span>
                      <span className="block truncate text-xs text-muted-foreground">{message.role}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{message.at}</span>
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {message.preview}
                    </span>
                    {message.unread ? (
                      <Badge className="rounded-full px-1.5 text-[10px]">New</Badge>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </StudioPanel>

        <div className="space-y-4">
          <EmptyState
            title="Select a conversation"
            description="Pick a thread on the left to read the full history. Messaging goes live with the backend."
          />
          <StudioPanel title="Quick reply" icon={Send}>
            <Textarea
              rows={4}
              placeholder="Type a reply…"
              aria-label="Quick reply"
              className="rounded-2xl"
            />
            <Button className="rounded-2xl" disabled>
              <Send className="size-4" /> Send
            </Button>
          </StudioPanel>
        </div>
      </div>
    </PortalPage>
  );
}
