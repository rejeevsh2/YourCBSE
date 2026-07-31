import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { ContextPanel } from "@/components/assistant/ContextPanel";
import { ConversationList } from "@/components/assistant/ConversationList";
import { InsightsGrid, TopicBalance } from "@/components/assistant/InsightsGrid";
import { QuickActionBar } from "@/components/assistant/QuickActionBar";
import { RecommendationGrid } from "@/components/assistant/RecommendationGrid";
import { ToolGrid } from "@/components/assistant/ToolGrid";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useAiChat } from "@/hooks/use-ai-chat";

export const Route = createFileRoute("/student/ai")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — YourCBSE" },
      {
        name: "description",
        content:
          "Chat with Cue, generate quizzes and flashcards, review recommendations and track smart study insights.",
      },
      { property: "og:title", content: "AI Study Assistant — YourCBSE" },
      {
        property: "og:description",
        content: "Your CBSE study buddy: doubts, quizzes, revision plans and personalised insights.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AiWorkspacePage,
});

function AiWorkspacePage() {
  const chat = useAiChat();
  const [tab, setTab] = useState("chat");
  const chatRef = useRef<HTMLDivElement | null>(null);

  const runPrompt = (prompt: string) => {
    setTab("chat");
    void chat.send(prompt);
    window.requestAnimationFrame(() =>
      chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="AI Study Assistant"
      description="Cue knows your syllabus, your pace and your weak topics — ask anything or pick a tool."
      actions={
        <Badge variant="secondary" className="rounded-full">
          <Sparkles className="mr-1 size-3" /> Preview build
        </Badge>
      }
    >
      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList className="rounded-2xl">
          <TabsTrigger value="chat" className="rounded-xl">
            Chat
          </TabsTrigger>
          <TabsTrigger value="tools" className="rounded-xl">
            Learning tools
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-xl">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-5">
          <div ref={chatRef} className="grid gap-4 lg:grid-cols-3">
            <AssistantChat
              chat={chat}
              showHistoryToggle={false}
              className="h-[38rem] lg:col-span-2"
            />

            <div className="flex min-h-0 flex-col gap-4">
              <ContextPanel />
              <ConversationList
                conversations={chat.conversations}
                activeId={chat.activeId}
                onSelect={chat.setActiveId}
                onDelete={(id) => void chat.deleteConversation(id)}
                onNewChat={() => void chat.startNewChat()}
                className="tile max-h-80 p-4"
              />
            </div>
          </div>

          <section className="space-y-3">
            <SectionHeading title="Quick actions" description="One tap, ready-made prompts." />
            <QuickActionBar layout="grid" onSelect={(action) => runPrompt(action.prompt)} />
          </section>
        </TabsContent>

        <TabsContent value="tools" className="space-y-5">
          <SectionHeading
            title="AI learning tools"
            description="Each tool opens a guided conversation with the right prompt."
          />
          <ToolGrid onSelect={(tool) => runPrompt(tool.prompt)} />

          <SectionHeading
            title="Recommended for you"
            description="Based on your progress, accuracy and revision schedule."
          />
          <RecommendationGrid />
        </TabsContent>

        <TabsContent value="insights" className="space-y-5">
          <SectionHeading
            title="Smart study insights"
            description="How you are actually studying this week."
          />
          <InsightsGrid />
          <TopicBalance />
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
