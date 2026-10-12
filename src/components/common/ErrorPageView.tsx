import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CloudOff,
  Lock,
  RefreshCw,
  ServerCrash,
  ShieldAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorCode = "400" | "401" | "403" | "500" | "offline";

interface ErrorPreset {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tone: "warning" | "destructive";
  primary?: { label: string; to: string };
}

/** One source of truth for every non-404 error screen in the product. */
export const errorPresets: Record<ErrorCode, ErrorPreset> = {
  "400": {
    icon: TriangleAlert,
    label: "Error 400",
    title: "That request didn't look right",
    description:
      "Something in the link or the form was malformed. Head back and try again — the rest of YourSchool is working fine.",
    tone: "warning",
  },
  "401": {
    icon: Lock,
    label: "Error 401",
    title: "Please sign in to continue",
    description:
      "This page is part of your personal study space. Sign in with your YourSchool account to pick up where you left off.",
    tone: "warning",
    primary: { label: "Sign in", to: "/login" },
  },
  "403": {
    icon: ShieldAlert,
    label: "Error 403",
    title: "You don't have access to this",
    description:
      "Your role doesn't include this area. If you think that's a mistake, ask your teacher or school admin to update your access.",
    tone: "destructive",
    primary: { label: "Back to home", to: "/" },
  },
  "500": {
    icon: ServerCrash,
    label: "Error 500",
    title: "Something broke on our side",
    description:
      "Our team has been notified. Retry in a moment — your progress and downloads are safe.",
    tone: "destructive",
  },
  offline: {
    icon: CloudOff,
    label: "Connection lost",
    title: "You're offline",
    description:
      "We can't reach YourSchool right now. Anything you downloaded stays available while you wait for the connection.",
    tone: "warning",
  },
};

const toneClasses = {
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const;

interface ErrorPageViewProps {
  code: ErrorCode;
  onRetry?: () => void;
  className?: string;
}

/** Full-page error screen that mirrors the 404 layout and spacing. */
export function ErrorPageView({ code, onRetry, className }: ErrorPageViewProps) {
  const preset = errorPresets[code];
  const Icon = preset.icon;

  return (
    <main
      className={cn(
        "flex min-h-dvh items-center justify-center bg-background px-4 py-16",
        className,
      )}
    >
      <div className="w-full max-w-xl text-center">
        <span
          className={cn(
            "mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl",
            toneClasses[preset.tone],
          )}
          aria-hidden="true"
        >
          <Icon className="size-7" />
        </span>

        <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {preset.label}
        </span>

        <h1 className="text-title mt-4 font-extrabold text-foreground">{preset.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {preset.description}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {preset.primary ? (
            <Button asChild className="rounded-2xl">
              <Link to={preset.primary.to}>{preset.primary.label}</Link>
            </Button>
          ) : null}
          <Button
            variant={preset.primary ? "outline" : "default"}
            className="rounded-2xl"
            onClick={() => (onRetry ? onRetry() : window.location.reload())}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="ghost" className="rounded-2xl">
            <Link to="/">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

