import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { ComingSoon } from "@/components/common/ComingSoon";

const title = "Coming Soon — New YourCBSE Features";
const description =
  "This YourCBSE feature is in development. See what's planned and get notified the moment it goes live.";

export const Route = createFileRoute("/coming-soon")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ComingSoonPage,
});

function ComingSoonPage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <ComingSoon
          title="This feature is on the way"
          description="We're building it as part of the next YourCBSE release. Leave your email and we'll tell you the moment it's ready."
          highlights={[
            "Interactive practice with instant review",
            "AI study assistant for doubts",
            "Downloadable revision packs",
            "Parent progress summaries",
          ]}
          expected="Next release"
          icon={<Bot className="size-9" />}
        />
      </PublicPageShell>
    </PublicLayout>
  );
}
