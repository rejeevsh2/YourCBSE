import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import type { LegalDocument } from "@/data/legal";

interface LegalPageViewProps {
  document: LegalDocument;
}

/** Shared shell for every policy document — keeps legal pages visually identical. */
export function LegalPageView({ document }: LegalPageViewProps) {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: document.title }]}
          title={document.title}
          description={document.summary}
        />

        <p className="text-xs text-muted-foreground">Last updated {document.updatedAt}</p>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-5">
              <h2 className="font-heading text-xs font-bold tracking-widest text-foreground uppercase">
                On this page
              </h2>
              <nav aria-label={`${document.title} sections`} className="mt-3">
                <ul className="space-y-0.5">
                  {document.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="inline-flex min-h-11 items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-9"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-8 p-6 sm:p-8">
              {document.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              <p className="border-t border-border pt-5 text-sm text-muted-foreground">
                Questions about this document? Email{" "}
                <span className="font-medium text-foreground">legal@yourschool.co.in</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}

