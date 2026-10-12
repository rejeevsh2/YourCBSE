import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
  withButton?: boolean;
  buttonLabel?: string;
  "aria-label"?: string;
}

export function SearchBox({
  placeholder = "Search chapters, notes, videos…",
  className,
  size = "default",
  withButton = false,
  buttonLabel = "Search",
  ...rest
}: SearchBoxProps) {
  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          aria-label={rest["aria-label"] ?? "Search YourTeacher"}
          className={cn("bg-card/70 pl-11", size === "lg" && "h-12 text-base")}
        />
      </div>
      {withButton ? (
        <Button type="submit" size={size === "lg" ? "lg" : "default"} className="sm:w-auto">
          {buttonLabel}
        </Button>
      ) : null}
    </form>

  );
}

