import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-4",
  default: "size-6",
  lg: "size-9",
} as const;

/** Inline loading spinner. */
export function Spinner({
  size = "default",
  className,
  label = "Loading",
}: {
  size?: keyof typeof sizes;
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizes[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Centered block loader for a section that is still resolving. */
export function SectionLoader({ label = "Loading content…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Spinner size="lg" label={label} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/** Full-page loading animation used while a route resolves. */
export function PageLoader({ label = "Preparing your page…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="relative flex size-20 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-primary/15"
        />
        <span className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Spinner size="lg" label={label} />
        </span>
      </div>
      <div className="space-y-1 text-center">
        <p className="font-heading text-base font-semibold text-foreground">YourTeacher</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <span className="block h-full w-1/3 animate-[yc-progress_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
    </div>
  );
}

