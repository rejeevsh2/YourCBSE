import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { TablePagination } from "@/components/common/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts } from "@/data/placeholder";

const title = "YourCBSE Blog — Study Tips & Exam Strategy";
const description =
  "Practical CBSE study guides, revision plans and classroom ideas for students and teachers.";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Blog" }]}
          title="Blog"
          description="Study strategy, revision techniques and teaching ideas from the YourCBSE team."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="h-full overflow-hidden pt-0">
              <div className="h-32 bg-primary-soft" />
              <CardContent className="space-y-3 px-6">
                <Badge variant="secondary">{post.category}</Badge>
                <h2 className="font-heading text-lg font-semibold">{post.title}</h2>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {post.readMinutes} min read
                  </span>
                  <span>{post.publishedAt}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <TablePagination totalPages={3} />
      </PublicPageShell>
    </PublicLayout>
  );
}
