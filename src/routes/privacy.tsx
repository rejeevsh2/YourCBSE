import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/common/LegalPageView";
import { legalDocuments } from "@/data/legal";

const title = "Privacy Policy — YourCBSE";
const description =
  "How YourCBSE collects, uses, stores and protects student, teacher and school data across the platform.";

export const Route = createFileRoute("/privacy")({
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
  component: () => <LegalPageView document={legalDocuments.privacy} />,
});
