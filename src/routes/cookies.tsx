import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/common/LegalPageView";
import { legalDocuments } from "@/data/legal";

const title = "Cookie Policy — YourTeacher";
const description =
  "The cookies and local storage YourTeacher uses for sign-in, theme preferences and anonymised analytics.";

export const Route = createFileRoute("/cookies")({
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
  component: () => <LegalPageView document={legalDocuments.cookies} />,
});

