import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  Bell,
  BookOpenCheck,
  CircleHelp,
  KeyRound,
  LifeBuoy,
  MessageCircleQuestion,
  Repeat2,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route =
  createFileRoute(
    "/student/help",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Help & Support — YourSchool",
        },
        {
          name: "description",
          content:
            "Help with learning, revision, resources, notifications and account settings.",
        },
        {
          name: "robots",
          content: "noindex",
        },
      ],
    }),
    component: HelpPage,
  });

const helpTopics = [
  {
    id: "learning",
    title: "Learning",
    description:
      "Open your courses, chapters and published lessons.",
    icon: BookOpenCheck,
  },
  {
    id: "revision",
    title: "Revision",
    description:
      "Review due revision items and track recall strength.",
    icon: Repeat2,
  },
  {
    id: "notifications",
    title: "Notifications",
    description:
      "View learning updates, reminders and achievements.",
    icon: Bell,
  },
  {
    id: "account",
    title: "Account & password",
    description:
      "Update your profile details and change your password.",
    icon: KeyRound,
  },
];

const faqs = [
  {
    id: "resources",
    question:
      "Where can I find study resources?",
    answer:
      "Open Search or the Resource Library to browse published notes, videos, PDFs, worksheets, images, audio and activities.",
  },
  {
    id: "save",
    question:
      "How do I save a resource?",
    answer:
      "Open a resource in the library and use Save. Saved resources are linked to your account.",
  },
  {
    id: "downloads",
    question:
      "How do downloads work?",
    answer:
      "When a published resource includes a file or link, use File / link to open it. Your browser controls where downloaded files are stored. Your download history records resources you opened.",
  },
  {
    id: "revision",
    question:
      "How do I start revision?",
    answer:
      "Open Revision from the Student Portal. It shows your due revision items, memory strength, completed reviews and recall accuracy.",
  },
  {
    id: "practice",
    question:
      "Where can I take practice tests?",
    answer:
      "Open Practice to see available published practice sets. Your completed attempts and results appear in your practice history.",
  },
  {
    id: "notifications",
    question:
      "How do I manage notifications?",
    answer:
      "Open Notification Center to read or remove notifications, then open its Settings page to manage available notification preferences.",
  },
  {
    id: "profile",
    question:
      "How do I update my profile?",
    answer:
      "Open Profile to update your personal details. Use Account Settings when you need to change your password.",
  },
];

function HelpPage() {
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Help & support"
      description="Help with the features currently available in your Student Portal."
      showNotice={false}
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {helpTopics.map(
          (topic) => {
            const Icon =
              topic.icon;

            return (
              <li
                key={topic.id}
                className="tile space-y-3 p-5"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <h2 className="font-heading text-sm font-bold">
                  {topic.title}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {
                    topic.description
                  }
                </p>
              </li>
            );
          },
        )}
      </ul>

      <div className="grid gap-4 lg:grid-cols-3">
        <StudioPanel
          title="Frequently asked questions"
          icon={LifeBuoy}
          className="lg:col-span-2"
        >
          <Accordion
            type="single"
            collapsible
            className="w-full"
          >
            {faqs.map(
              (faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                >
                  <AccordionTrigger className="text-left text-sm font-semibold">
                    {
                      faq.question
                    }
                  </AccordionTrigger>

                  <AccordionContent className="text-sm text-muted-foreground">
                    {
                      faq.answer
                    }
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        </StudioPanel>

        <StudioPanel
          title="Need more help?"
          icon={
            MessageCircleQuestion
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If these answers do
              not solve your
              problem, use the
              contact page to
              reach support.
            </p>

            <Button
              className="w-full rounded-2xl"
              asChild
            >
              <Link to="/contact">
                <CircleHelp className="size-4" />
                Contact support
              </Link>
            </Button>
          </div>
        </StudioPanel>
      </div>
    </PortalPage>
  );
}