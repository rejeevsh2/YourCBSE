import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Compass, HeartHandshake, Target } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";

const title = "About YourCBSE — Our Mission for CBSE Learners";
const description =
  "YourCBSE brings CBSE notes, videos, worksheets and interactive practice into one organised, teacher-reviewed platform for Classes 6 to 12.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Target,
    title: "Syllabus first",
    text: "Everything is mapped to the current CBSE syllabus, chapter by chapter.",
  },
  {
    icon: BookOpen,
    title: "Clarity over volume",
    text: "Fewer, better resources — written to be understood, not skimmed.",
  },
  {
    icon: HeartHandshake,
    title: "Teacher reviewed",
    text: "Practising CBSE teachers review material before it reaches students.",
  },
  {
    icon: Compass,
    title: "Guided journeys",
    text: "Clear paths through each chapter so no student studies in the dark.",
  },
];

function AboutPage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
          title="About YourCBSE"
          description="We are building the study companion we wish we had — one calm, organised place covering every CBSE grade, subject and chapter."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-heading text-xl font-semibold">Our mission</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                CBSE students juggle scattered PDFs, random videos and unverified notes. YourCBSE
                replaces that with a single structured library where every chapter has notes,
                lessons, practice and interactive activities in one place.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-heading text-xl font-semibold">Who it serves</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Students revising for exams, teachers publishing classroom material, and school
                administrators who need visibility across grades and subjects — each with a portal
                built for their day-to-day work.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-8">
          <SectionHeading eyebrow="Values" title="What guides our work" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="h-full">
                <CardContent className="space-y-3 p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <value.icon className="size-5" />
                  </span>
                  <h3 className="font-heading font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}
