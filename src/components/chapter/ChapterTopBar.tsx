import { Link } from "@tanstack/react-router";
import { Bell, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chapter } from "@/data/chapter";

interface ChapterTopBarProps {
  readingProgress: number;
  onOpenSidebar: () => void;
}

/** Sticky learning header: breadcrumb, search, theme, notifications, profile. */
export function ChapterTopBar({ readingProgress, onOpenSidebar }: ChapterTopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          aria-label="Open chapter menu"
          onClick={onOpenSidebar}
        >
          <PanelLeft className="size-5" aria-hidden="true" />
        </Button>

        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden sm:block">
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/grades">{chapter.grade}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden lg:block">
              <BreadcrumbLink asChild>
                <Link to="/subjects">{chapter.subject}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden lg:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">{chapter.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto hidden w-full max-w-xs md:block">
          <SearchAutocomplete
            size="sm"
            placeholder="Search this chapter…"
            aria-label="Search chapters, topics and videos"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-5" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background"
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Your profile">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    AS
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Ananya Sharma</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/student">Student dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/student/progress">My progress</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/student/profile">Profile settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-0.5 w-full bg-transparent"
      >
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
    </header>
  );
}
