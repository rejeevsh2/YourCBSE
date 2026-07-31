import { Link } from "@tanstack/react-router";
import { Boxes, FileStack, FileText, Layers, ListChecks, PlayCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { label: "New chapter", icon: Layers, to: "/teacher/editor" },
  { label: "Interactive app", icon: Boxes, to: "/teacher/interactive-apps" },
  { label: "Video lesson", icon: PlayCircle, to: "/teacher/videos" },
  { label: "Notes", icon: FileText, to: "/teacher/notes" },
  { label: "Worksheet", icon: FileStack, to: "/teacher/worksheets" },
  { label: "Question set", icon: ListChecks, to: "/teacher/question-bank" },
] as const;

/** Header "Quick create" entry point for Teacher Studio. */
export function QuickCreate() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-2xl" size="sm">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="text-[11px] tracking-widest uppercase">
          Quick create
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.label} asChild>
            <Link to={item.to}>
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
