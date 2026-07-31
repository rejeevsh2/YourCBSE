import {
  BookOpen,
  Briefcase,
  ClipboardList,
  Database,
  FileText,
  GitCompare,
  History,
  Layers,
  Network,
  PenSquare,
  PlayCircle,
  Sigma,
  Sparkles,
  Star,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { categoryMeta, type ResourceCategory } from "@/data/resource-center";

const icons: Record<string, LucideIcon> = {
  Sparkles,
  PlayCircle,
  FileText,
  PenSquare,
  Database,
  Layers,
  Network,
  Star,
  Sigma,
  BookOpen,
  Briefcase,
  GitCompare,
  History,
  ClipboardList,
  Timer,
};

const metaByCategory = new Map(categoryMeta.map((item) => [item.category, item]));

export function categoryIcon(category: ResourceCategory): LucideIcon {
  return icons[metaByCategory.get(category)?.icon ?? "FileText"] ?? FileText;
}

export function categoryAccent(category: ResourceCategory): string {
  return metaByCategory.get(category)?.accent ?? "from-primary/25 to-primary/5";
}

export function categoryBlurb(category: ResourceCategory): string {
  return metaByCategory.get(category)?.blurb ?? "";
}

/** URL-safe slug used by the category route. */
export function categorySlug(category: ResourceCategory): string {
  return category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function categoryFromSlug(slug: string): ResourceCategory | undefined {
  return categoryMeta.find((item) => categorySlug(item.category) === slug)?.category;
}
