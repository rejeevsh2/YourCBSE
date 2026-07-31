import { Link } from "@tanstack/react-router";
import { categoryMeta, libraryResources } from "@/data/resource-center";
import { Reveal } from "@/components/common/Reveal";
import { categoryAccent, categoryIcon, categorySlug } from "./category-icons";
import { cn } from "@/lib/utils";

const counts = libraryResources.reduce<Record<string, number>>((total, resource) => {
  total[resource.category] = (total[resource.category] ?? 0) + 1;
  return total;
}, {});

/** The 15 library categories as navigable tiles. */
export function CategoryGrid({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Resource categories"
      className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {categoryMeta.map((meta, index) => {
        const Icon = categoryIcon(meta.category);
        return (
          <Reveal as="li" key={meta.category} delay={Math.min(index, 9) * 30}>
            <Link
              to="/library/category/$categorySlug"
              params={{ categorySlug: categorySlug(meta.category) }}
              className="tile tile-interactive flex h-full items-start gap-3 p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
                  categoryAccent(meta.category),
                )}
                aria-hidden="true"
              >
                <Icon className="size-5 text-foreground/70" />
              </span>
              <span className="space-y-1">
                <span className="block font-heading text-sm font-bold text-foreground">
                  {meta.category}
                </span>
                <span className="block text-xs text-muted-foreground">{meta.blurb}</span>
                <span className="block text-xs font-medium text-primary">
                  {counts[meta.category] ?? 0} resources
                </span>
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}
