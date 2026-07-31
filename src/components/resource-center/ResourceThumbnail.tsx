import { memo } from "react";
import type { ResourceCategory } from "@/data/resource-center";
import { categoryAccent, categoryIcon } from "./category-icons";
import { cn } from "@/lib/utils";

interface ResourceThumbnailProps {
  category: ResourceCategory;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-12 rounded-2xl",
  md: "h-28 w-full rounded-2xl",
  lg: "h-56 w-full rounded-3xl sm:h-72",
} as const;

const iconSize = { sm: "size-5", md: "size-8", lg: "size-12" } as const;

/** Gradient placeholder artwork — swapped for real thumbnails with the API. */
export const ResourceThumbnail = memo(function ResourceThumbnail({
  category,
  label,
  size = "md",
  className,
}: ResourceThumbnailProps) {
  const Icon = categoryIcon(category);
  return (
    <div
      role="img"
      aria-label={label ? `${label} — ${category} preview` : `${category} preview`}
      className={cn(
        "flex items-center justify-center bg-gradient-to-br ring-1 ring-border/60",
        categoryAccent(category),
        sizeClasses[size],
        className,
      )}
    >
      <Icon className={cn("text-foreground/70", iconSize[size])} aria-hidden="true" />
    </div>
  );
});
