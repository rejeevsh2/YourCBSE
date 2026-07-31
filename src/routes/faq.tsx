import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/data/legal";

const title = "FAQ — Answers About YourCBSE";
const description =
  "Answers to common questions about YourCBSE accounts, study material, the AI assistant, downloads and supported devices.";

export const Route = createFileRoute("/faq")({
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
  component: FaqPage,
});

const categories = ["All", "Getting started", "Study material", "Accounts & billing", "Technical"];

function FaqPage() {
  const [category, setCategory] = useState("All");

  const visible = useMemo(
    () => (category === "All" ? faqItems : faqItems.filter((item) => item.category === category)),
    [category],
  );

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "FAQ" }]}
          title="Frequently asked questions"
          description="Quick answers about accounts, study material and how YourCBSE works day to day."
        />

        <div
          role="group"
          aria-label="Filter questions by category"
          className="scroll-rail flex flex-wrap gap-1.5 rounded-2xl bg-muted p-1.5"
        >
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
              className={`inline-flex min-h-9 items-center rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                category === option
                  ? "bg-background text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-2 sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {visible.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left text-sm font-medium sm:text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">Still need help?</h2>
              <p className="text-sm text-muted-foreground">
                Our support team answers within one working day.
              </p>
            </div>
            <Link
              to="/help"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Visit the Help Center
            </Link>
          </CardContent>
        </Card>
      </PublicPageShell>
    </PublicLayout>
  );
}
