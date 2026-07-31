import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminFlashcards } from "@/data/admin";

export const Route = createFileRoute("/admin/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — YourCBSE Admin" },
      { name: "description", content: "Manage flashcard decks across the curriculum." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminFlashcardsPage,
});

function AdminFlashcardsPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Flashcards"
      description="Spaced-repetition decks attached to chapters."
    >
      <ContentManager
        items={adminFlashcards}
        caption="Flashcard decks"
        createLabel="New deck"
        searchPlaceholder="Search decks…"
      />
    </PortalPage>
  );
}
