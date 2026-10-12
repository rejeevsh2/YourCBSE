import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "destructive";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

/**
 * Illustration placeholder used across the auth status screens
 * (verification, success, locked). Purely decorative.
 */
export function AuthIllustration({
  icon: Icon,
  tone = "primary",
  pulse = false,
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative mx-auto flex size-24 items-center justify-center", className)}
    >
      {pulse ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-10" />
      ) : null}
      <span className="absolute inset-2 rounded-full border border-current opacity-15" />
      <span
        className={cn(
          "animate-in zoom-in-50 relative flex size-16 items-center justify-center rounded-2xl duration-500",
          toneClasses[tone],
        )}
      >
        <Icon className="size-8" />
      </span>
    </div>
  );
}

