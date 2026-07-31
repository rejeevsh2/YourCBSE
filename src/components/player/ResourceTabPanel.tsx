import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { moduleIcons } from "@/components/chapter/moduleIcons";
import { InteractiveAppStage } from "@/components/player/InteractiveAppStage";
import type { PlayerTab } from "@/data/player";

/** Renders the body of a single resource tab. Placeholder content only. */
export function ResourceTabPanel({ tab }: { tab: PlayerTab }) {
  const Icon = moduleIcons[tab.icon] ?? ArrowUpRight;

  if (tab.id === "interactive") {
    return <InteractiveAppStage title={tab.headline} meta={tab.meta} />;
  }

  return (
    <div className="tile-lg space-y-5 p-5 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-bold text-foreground">{tab.headline}</h2>
          <p className="text-sm text-muted-foreground">{tab.description}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {tab.meta}
        </Badge>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {tab.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="tile tile-interactive group flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="block text-xs text-muted-foreground">{item.meta}</span>
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>

      <Button variant="outline" className="w-full rounded-xl sm:w-auto">
        Open {tab.label.toLowerCase()}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
