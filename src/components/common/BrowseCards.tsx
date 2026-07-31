import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Atom,
  Beaker,
  BookOpen,
  Brain,
  Calculator,
  Cpu,
  Dna,
  Globe2,
  GraduationCap,
  HeartPulse,
  Languages,
  ListChecks,
  PlayCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Grade, Subject } from "@/types";

const subjectIcons: Record<string, typeof BookOpen> = {
  Mathematics: Calculator,
  Science: Atom,
  Physics: Atom,
  Chemistry: Beaker,
  Biology: Dna,
  English: BookOpen,
  Hindi: Languages,
  "Social Science": Globe2,
  "Computer Science": Cpu,
  "Artificial Intelligence": Brain,
  "Health & Physical Education": HeartPulse,
};

function MetaRow({
  items,
}: {
  items: { icon: typeof Layers; label: string }[];
}) {
  return (
    <dl className="grid grid-cols-3 gap-2 border-t border-border pt-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="sr-only">{item.label}</dt>
          <dd className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <item.icon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Reusable grade card used on the homepage and the grades page. */
export function GradeCard({ grade, className }: { grade: Grade; className?: string }) {
  return (
    <article
      className={cn(
        "panel panel-interactive group flex h-full flex-col gap-4 p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 font-heading text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {grade.name.replace("Class ", "")}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {grade.level}
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-heading text-lg font-semibold text-foreground">{grade.name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{grade.description}</p>
      </div>

      <MetaRow
        items={[
          { icon: Layers, label: `${grade.chapterCount} chapters` },
          { icon: PlayCircle, label: `${grade.videoCount} videos` },
          { icon: ListChecks, label: `${grade.questionCount.toLocaleString()} questions` },
        ]}
      />

      <Button asChild variant="outline" className="mt-auto w-full rounded-xl">
        <Link to="/subjects">
          Explore {grade.name}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}

/** Reusable subject card used on the homepage and the subjects page. */
export function SubjectCard({ subject, className }: { subject: Subject; className?: string }) {
  const Icon = subjectIcons[subject.name] ?? GraduationCap;

  return (
    <article
      className={cn(
        "panel panel-interactive group flex h-full flex-col gap-4 p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="font-heading text-base font-semibold text-foreground sm:text-lg">
          {subject.name}
        </h3>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{subject.description}</p>

      <MetaRow
        items={[
          { icon: Layers, label: `${subject.chapterCount} chapters` },
          { icon: PlayCircle, label: `${subject.videoCount} videos` },
          { icon: ListChecks, label: `${subject.questionCount.toLocaleString()} questions` },
        ]}
      />

      <Button asChild variant="ghost" className="mt-auto w-full justify-between rounded-xl">
        <Link to="/search">
          Start {subject.name}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
