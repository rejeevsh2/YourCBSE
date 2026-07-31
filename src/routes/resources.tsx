import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, PlayCircle } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { Reveal } from "@/components/common/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { latestResources, latestVideos } from "@/data/placeholder";

const title = "CBSE Resources — Notes, Worksheets & NCERT Solutions | YourCBSE";
const description =
  "Download CBSE notes, worksheets, sample papers and NCERT solutions, plus watch the latest video lessons for Classes 6 to 12.";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Resources" }]}
          title="Resources"
          description="Notes, worksheets, sample papers, NCERT solutions and video lessons in one library."
        />

        <SearchAutocomplete className="max-w-lg" placeholder="Search notes, worksheets, papers…" />

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="worksheets">Worksheets</TabsTrigger>
            <TabsTrigger value="ncert">NCERT solutions</TabsTrigger>
          </TabsList>
        </Tabs>

        <section aria-labelledby="downloads-heading" className="space-y-4">
          <h2 id="downloads-heading" className="font-heading text-lg font-bold text-foreground">
            Downloadable material
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestResources.map((resource, index) => (
              <Reveal as="li" key={resource.id} delay={index * 50}>
                <article className="tile tile-interactive flex h-full flex-col gap-3 p-5">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  <Badge variant="secondary">{resource.type}</Badge>
                  <h3 className="font-heading text-sm font-semibold text-foreground">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {resource.grade} · {resource.subject}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">{resource.sizeLabel}</span>
                    <Button asChild size="sm" variant="ghost" className="rounded-xl">
                      <Link to="/coming-soon">
                        <Download className="size-3.5" aria-hidden="true" />
                        Download
                      </Link>
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </section>

        <section aria-labelledby="videos-heading" className="space-y-4">
          <h2 id="videos-heading" className="font-heading text-lg font-bold text-foreground">
            Video lessons
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestVideos.map((video, index) => (
              <Reveal as="li" key={video.id} delay={index * 50}>
                <Link
                  to="/coming-soon"
                  className="tile tile-interactive group flex h-full flex-col overflow-hidden"
                >
                  <span className="relative flex aspect-video items-center justify-center bg-secondary">
                    <PlayCircle
                      className="size-10 text-primary transition-transform duration-200 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <span className="absolute right-2 bottom-2 rounded-md bg-foreground/85 px-1.5 py-0.5 text-[11px] font-medium text-background">
                      {video.durationMinutes} min
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col gap-2 p-4">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      {video.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {video.grade} · {video.subject}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}
