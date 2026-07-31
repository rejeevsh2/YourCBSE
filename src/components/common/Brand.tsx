import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  subtitle?: string;
}

export function Brand({ className, subtitle }: BrandProps) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-lg font-semibold tracking-tight">
          Your<span className="text-primary">CBSE</span>
        </span>
        {subtitle ? (
          <span className="block text-[11px] font-medium text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
