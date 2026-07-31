import { cn } from "@/lib/utils";

/** "or continue with" rule used between the form and social sign-in. */
export function AuthDivider({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("relative text-center", className)} role="separator" aria-label={label}>
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <span className="relative bg-card px-3 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
