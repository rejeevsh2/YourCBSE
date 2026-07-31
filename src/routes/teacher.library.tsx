import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ResourceManager } from "@/components/teacher/ResourceManager";

export const Route = createFileRoute("/teacher/library")({
  head: () => ({
    meta: [
      { title: "Resource Library — Teacher Studio" },
      { name: "description", content: "Every file across videos, notes, images, audio and documents." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Resource library"
      description="One place for every asset — upload, preview, replace or delete."
      showNotice={false}
    >
      <ResourceManager
        kinds={[
          "Video",
          "PDF Notes",
          "Worksheet",
          "Flashcards",
          "Mind Map",
          "Image",
          "Audio",
          "Document",
        ]}
        uploadLabel="Files"
        searchPlaceholder="Search the library…"
      />
    </PortalPage>
  );
}
