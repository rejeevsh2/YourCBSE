import { memo } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  Download,
  ListChecks,
  PlayCircle,
  Repeat2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  to: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "destructive";
}

const tones = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/12 text-destructive",
} as const;

export const quickActions: QuickAction[] = [
  { label: "Continue Learning", to: "/student/continue-learning", icon: PlayCircle, tone: "primary" },
  { label: "Take a Quiz", to: "/student/practice", icon: ListChecks, tone: "success" },
  { label: "Open Revision", to: "/student/revision", icon: Repeat2, tone: "warning" },
  { label: "AI Tutor", to: "/student/assistant", icon: Sparkles, tone: "primary" },
  { label: "Downloads", to: "/student/downloads", icon: Download, tone: "success" },
  { label: "Bookmarks", to: "/student/bookmarks", icon: BookMarked, tone: "warning" },
];

/** Six shortcut tiles reused on the dashboard and the search screen. */
export const QuickActions = memo(function QuickActions({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", className)}>
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <li key={action.label}>
            <Link
              to={action.to}
              className="tile tile-interactive flex h-full flex-col items-center gap-2 p-4 text-center text-xs font-semibold transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl",
                  tones[action.tone],
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              {action.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
});

