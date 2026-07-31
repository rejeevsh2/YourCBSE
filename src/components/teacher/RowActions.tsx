import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  separatorBefore?: boolean;
}

interface RowActionsProps {
  label: string;
  actions: RowAction[];
}

/** Placeholder row action menu — every action reports back through a toast. */
export function RowActions({ label, actions }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl"
          aria-label={`Actions for ${label}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-2xl">
        {actions.map((action) => (
          <div key={action.label}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              className={action.destructive ? "text-destructive focus:text-destructive" : undefined}
              onSelect={() =>
                toast(`${action.label}: ${label}`, {
                  description: "Connects to the Laravel backend in a later phase.",
                })
              }
            >
              {action.icon ? <action.icon className="size-4" /> : null}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
