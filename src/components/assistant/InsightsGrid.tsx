import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { Progress } from "@/components/ui/progress";
import { studyInsights, strongTopics, weakTopics, type StudyInsight } from "@/data/ai-assistant";
import { cn } from "@/lib/utils";

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus } as const;
const trendTone = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
} as const;

export function InsightCard({ insight }: { insight: StudyInsight }) {
  const Icon = insight.icon;
  const TrendIcon = insight.trend ? trendIcon[insight.trend] : null;

  return (
    <article className="tile space-y-3 p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          {insight.label}
        </p>
      </div>

      <div className="flex items-end gap-2">
        <p className="font-heading text-2xl font-bold tabular-nums">{insight.value}</p>
        {TrendIcon && insight.delta ? (
          <span className={cn("flex items-center gap-0.5 pb-1 text-xs font-semibold", trendTone[insight.trend!])}>
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {insight.delta}
          </span>
        ) : null}
      </div>

      {typeof insight.progress === "number" ? (
        <Progress value={insight.progress} aria-label={`${insight.label} progress`} className="h-1.5" />
      ) : null}

      <p className="text-xs text-muted-foreground">{insight.hint}</p>
    </article>
  );
}

export function InsightsGrid({ insights = studyInsights }: { insights?: StudyInsight[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, index) => (
        <Reveal key={insight.id} delay={index * 40}>
          <InsightCard insight={insight} />
        </Reveal>
      ))}
    </div>
  );
}

/** Weak vs. strong topic split — pairs with the insight grid. */
export function TopicBalance() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TopicList title="Weak topics" tone="warning" topics={weakTopics} />
      <TopicList title="Strong topics" tone="success" topics={strongTopics} />
    </div>
  );
}

function TopicList({
  title,
  topics,
  tone,
}: {
  title: string;
  topics: string[];
  tone: "warning" | "success";
}) {
  return (
    <section className="tile space-y-3 p-5">
      <h3 className="font-heading text-sm font-bold">{title}</h3>
      <ul className="space-y-2">
        {topics.map((topic) => (
          <li key={topic} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                tone === "warning" ? "bg-warning" : "bg-success",
              )}
            />
            {topic}
          </li>
        ))}
      </ul>
    </section>
  );
}

