import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, MessageCircleQuestion } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { helpFaqs, helpTopics, supportChannels } from "@/data/student-library";

export const Route = createFileRoute("/student/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — YourCBSE" },
      { name: "description", content: "Guides, FAQs and support channels for YourCBSE students." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Help & support"
      description="Answers to the questions students ask us most — and a way to reach a human."
      actions={
        <Button className="rounded-2xl" asChild>
          <Link to="/student/assistant">
            <MessageCircleQuestion className="size-4" /> Ask the AI tutor
          </Link>
        </Button>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {helpTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <li key={topic.id} className="tile tile-interactive space-y-3 p-5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-sm font-bold">{topic.title}</h2>
              <p className="text-sm text-muted-foreground">{topic.description}</p>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-4 lg:grid-cols-3">
        <StudioPanel title="Frequently asked questions" icon={LifeBuoy} className="lg:col-span-2">
          <Accordion type="single" collapsible className="w-full">
            {helpFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-sm font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </StudioPanel>

        <StudioPanel title="Contact us" icon={MessageCircleQuestion}>
          <ul className="space-y-3">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <li
                  key={channel.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 p-3"
                >
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{channel.title}</p>
                    <p className="text-xs text-muted-foreground">{channel.meta}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button variant="outline" className="w-full rounded-2xl" asChild>
            <Link to="/contact">Visit the contact page</Link>
          </Button>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}
