import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandDestination =
  | "/"
  | "/student"
  | "/teacher"
  | "/admin";

interface BrandProps {
  className?: string;
  subtitle?: string;
  to?: BrandDestination;
  nativeNavigation?: boolean;
}

export function Brand({
  className,
  subtitle,
  to = "/",
  nativeNavigation = false,
}: BrandProps) {
  const content = (
    <>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-lg font-semibold tracking-tight">
          Your<span className="text-primary">School</span>
        </span>
        {subtitle ? (
          <span className="block text-[11px] font-medium text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </>
  );

  const classes = cn(
    "flex items-center gap-2.5",
    className,
  );

  if (nativeNavigation) {
    return (
      <a href={to} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  );
}


