import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ResourceManager } from "@/components/teacher/ResourceManager";

export const Route = createFileRoute("/teacher/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — Teacher Studio" },
      { name: "description", content: "Build and manage flashcard decks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Flashcards"
      description="Revision decks students can drill before assessments."
      showNotice={false}
    >
      <ResourceManager kinds={["Flashcards"]} uploadLabel="Flashcard decks" searchPlaceholder="Search decks…" />
    </PortalPage>
  );
}
