import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { ContentManager } from "@/components/admin/ContentManager";
import { adminBlogPosts } from "@/data/admin";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({
    meta: [
      { title: "Blog — YourCBSE Admin" },
      { name: "description", content: "Manage blog articles, drafts and publication." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminBlogPage,
});

function AdminBlogPage() {
  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Blog"
      description="Editorial articles, study guides and platform news."
    >
      <ContentManager
        items={adminBlogPosts}
        caption="Blog posts"
        createLabel="New post"
        searchPlaceholder="Search posts…"
        filters={[
          { id: "status", label: "Status", options: ["All statuses", "Published", "Draft", "In review", "Archived"] },
          { id: "category", label: "Category", options: ["All categories", "Study strategy", "Exam news", "Product"] },
        ]}
      />
    </PortalPage>
  );
}
