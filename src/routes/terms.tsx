import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/common/LegalPageView";
import { legalDocuments } from "@/data/legal";

const title = "Terms & Conditions — YourCBSE";
const description =
  "The terms that govern accounts, acceptable use and content ownership on the YourCBSE learning platform.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LegalPageView document={legalDocuments.terms} />,
});
