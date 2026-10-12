import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { assistantTools, type AssistantTool } from "@/data/ai-assistant";
import { cn } from "@/lib/utils";

const toneClasses: Record<AssistantTool["tone"], string> = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-accent text-accent-foreground",
};

/** Grid of AI learning tools; each one seeds a prompt in the chat. */
export function ToolGrid({
  onSelect,
  tools = assistantTools,
  className,
}: {
  onSelect: (tool: AssistantTool) => void;
  tools?: AssistantTool[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <Reveal key={tool.id} delay={index * 40}>
            <button
              type="button"
              onClick={() => onSelect(tool)}
              className="tile group h-full w-full space-y-3 p-5 text-left transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl",
                  toneClasses[tool.tone],
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex items-center gap-1.5 font-heading text-sm font-bold">
                {tool.title}
                <ArrowUpRight
                  className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="block text-sm text-muted-foreground">{tool.description}</span>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}

