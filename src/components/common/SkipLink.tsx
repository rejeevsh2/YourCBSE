import { cn } from "@/lib/utils";

/**
 * Keyboard-only shortcut that jumps past navigation.
 * Every layout renders exactly one, pointing at `#main-content`.
 */
export function SkipLink({ className }: { className?: string }) {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]",
        "focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-[80]",
        className,
      )}
    >
      Skip to main content
    </a>
  );
}

