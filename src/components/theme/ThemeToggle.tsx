import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

/** Light / Dark / System switcher — preference persists in local storage. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Change theme (currently ${theme})`}
          className={cn("relative rounded-xl", className)}
        >
          <Sun
            className={cn(
              "size-5 transition-all duration-300",
              isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
            )}
            aria-hidden="true"
          />
          <Moon
            className={cn(
              "absolute size-5 transition-all duration-300",
              isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
            )}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2">
              <option.icon className="size-4" aria-hidden="true" />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

