import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assistantRecommendations, type AssistantRecommendation } from "@/data/ai-assistant";
import { cn } from "@/lib/utils";
import { EmptyRecommendations } from "./AssistantStates";

export function RecommendationCard({ item }: { item: AssistantRecommendation }) {
  const Icon = item.icon;

  return (
    <article className="tile flex h-full flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-sm font-bold">{item.title}</h3>
          <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">
            {item.meta}
          </Badge>
        </div>
      </div>
      <p className="flex-1 text-sm text-muted-foreground">{item.description}</p>
      <Button asChild variant="outline" size="sm" className="w-full rounded-2xl">
        <Link to={item.to}>
          {item.cta} <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </article>
  );
}

export function RecommendationGrid({
  items = assistantRecommendations,
  className,
}: {
  items?: AssistantRecommendation[];
  className?: string;
}) {
  if (items.length === 0) return <EmptyRecommendations />;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, index) => (
        <Reveal key={item.id} delay={index * 40} className="h-full">
          <RecommendationCard item={item} />
        </Reveal>
      ))}
    </div>
  );
}

