import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
} from "react";
import {
  Layers3,
  Repeat2,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { RevisionTimer } from "@/components/student/RevisionTimer";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  studentService,
  type RevisionHubResponse,
} from "@/lib/student";

export const Route =
  createFileRoute(
    "/student/revision",
  )({
    component:
      RevisionHubPage,
  });

function RevisionHubPage() {
  const navigate =
    useNavigate();

  const [revision, setRevision] =
    useState<RevisionHubResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let active = true;

    async function loadRevision() {
      setLoading(true);
      setError(null);

      const result =
        await studentService.getRevisionHub();

      if (!active) {
        return;
      }

      if (!result.ok) {
        setError(
          result.message,
        );
        setLoading(false);
        return;
      }

      setRevision(
        result.data,
      );

      setLoading(false);
    }

    void loadRevision();

    return () => {
      active = false;
    };
  }, []);

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Revision Hub"
      description="Review your real revision queue, memory strength and completed revision activity."
      showNotice={false}
    >
      <StatGrid
        items={[
          {
            label:
              "Cards due today",
            value: String(
              revision?.stats
                .cards_due_today ??
                0,
            ),
            hint:
              "Ready to review",
            tone: "warning",
          },
          {
            label:
              "Revision items",
            value: String(
              revision?.stats
                .revision_items ??
                0,
            ),
            tone: "primary",
          },
          {
            label:
              "Reviews completed",
            value: String(
              revision?.stats
                .reviews_completed ??
                0,
            ),
            tone: "success",
          },
          {
            label:
              "Recall accuracy",
            value: `${
              revision?.stats
                .recall_accuracy ??
              0
            }%`,
            tone: "success",
          },
        ]}
      />

      {error ? (
        <div
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudioPanel
            title="Due for review"
            icon={Repeat2}
          >
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading revision
                items...
              </p>
            ) : (
              (revision?.due_items
                .length ?? 0) ===
              0 ? (
                <div className="py-5 text-sm text-muted-foreground">
                  No revision items
                  are due right now.
                </div>
              ) : (
                <ul className="space-y-4">
                  {(
                    revision
                      ?.due_items ??
                    []
                  ).map(
                    (item) => (
                      <li
                        key={
                          item.id
                        }
                        className="space-y-2 rounded-xl border p-4"
                      >
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 font-medium">
                            {
                              item.title
                            }
                          </p>

                          <Badge
                            variant="secondary"
                            className="shrink-0"
                          >
                            Due
                          </Badge>
                        </div>

                        <Progress
                          value={
                            item.strength
                          }
                          aria-label={`${item.title} memory strength`}
                        />

                        <p className="text-xs text-muted-foreground">
                          Memory
                          strength{" "}
                          {
                            item.strength
                          }
                          %
                        </p>
                      </li>
                    ),
                  )}
                </ul>
              )
            )}
          </StudioPanel>
        </div>

        <div className="space-y-4">
          <StudioPanel
            title="Interactive revision"
            icon={Layers3}
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Review your
                scheduled cards and
                record how well you
                remember each item.
              </p>

              <Button
                onClick={() =>
                  navigate({
                    to: "/student/interactive-revision",
                  })
                }
              >
                Start revision
              </Button>
            </div>
          </StudioPanel>

          <RevisionTimer />
        </div>
      </div>
    </PortalPage>
  );
}