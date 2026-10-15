import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { QuickCreate } from "@/components/teacher/QuickCreate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { portalConfig, type PortalKey } from "@/config/navigation";
import { SkipLink } from "@/components/common/SkipLink";
import { cn } from "@/lib/utils";
import { authService, clearSession, getStoredUser } from "@/lib/auth";
import type { NavItem } from "@/types";

function NavList({
  items,
  collapsed,
  onNavigate,
  rootPath,
}: {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
  rootPath: string;
}) {
  const groups: { name?: string; items: NavItem[] }[] = [];

  for (const item of items) {
    const last = groups[groups.length - 1];

    if (last && last.name === item.group) {
      last.items.push(item);
    } else {
      groups.push({
        name: item.group,
        items: [item],
      });
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group, index) => (
        <div key={group.name ?? index} className="space-y-1.5">
          {group.name && !collapsed ? (
            <p className="px-3 pt-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              {group.name}
            </p>
          ) : null}

          {group.name && collapsed && index > 0 ? (
            <div
              aria-hidden="true"
              className="mx-3 border-t border-border/60"
            />
          ) : null}

          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    activeOptions={{
                      exact: item.to === rootPath,
                    }}
                    activeProps={{
                      className:
                        "bg-accent text-accent-foreground border-primary/25 font-semibold shadow-[var(--shadow-glow)]",
                    }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent/60 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    {Icon ? (
                      <Icon className="size-4 shrink-0" />
                    ) : null}

                    {!collapsed ? (
                      <>
                        <span className="truncate">
                          {item.label}
                        </span>

                        {item.badge ? (
                          <span className="ml-auto rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function UpgradeTile() {
  return (
    <div className="tile space-y-3 bg-accent/50 p-4">
      <p className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-accent-foreground uppercase">
        <Sparkles className="size-3.5" />
        Pro workspace
      </p>

      <p className="text-sm text-muted-foreground">
        Advanced analytics and unlimited practice sets arrive in a later phase.
      </p>
    </div>
  );
}

interface PortalLayoutProps {
  portal: PortalKey;
  children: ReactNode;
}

export function PortalLayout({
  portal,
  children,
}: PortalLayoutProps) {
  const config = portalConfig[portal];

  const title = config.title;
  const nav = config.nav;

  /*
 * Keep the first server render and first browser render identical.
 * Browser storage is read only after React has hydrated.
 */
const [loggedInUser, setLoggedInUser] =
  useState<ReturnType<typeof getStoredUser>>(null);

useEffect(() => {
  setLoggedInUser(getStoredUser());
}, []);

const user = loggedInUser?.fullName || config.user;

const role = loggedInUser?.role
  ? loggedInUser.role.charAt(0).toUpperCase() +
    loggedInUser.role.slice(1)
  : config.role;

const rootPath = `/${portal}`;

const portalHome = rootPath as
  | "/student"
  | "/teacher"
  | "/admin";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /*
   * Real logout:
   * 1. Call Laravel /api/logout
   * 2. Clear browser token/user
   * 3. Return to login page
   */
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await authService.logout();
    } catch {
      // Even if the API request fails,
      // clear the local session.
    } finally {
      clearSession();
      window.location.href = "/login";
    }
  }

  const initials = user
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="aurora flex min-h-screen w-full gap-4 bg-background p-3 sm:p-4 lg:p-6">
      <SkipLink />

      <aside
        className={cn(
          "tile sticky top-6 hidden h-[calc(100vh-3rem)] shrink-0 flex-col p-4 transition-[width] lg:flex",
          collapsed ? "w-[86px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "mb-6 px-1",
            collapsed && "flex justify-center px-0",
          )}
        >
          {collapsed ? (
            <Brand
              to={portalHome}
              nativeNavigation
              className="[&_span:last-child]:hidden"
            />
          ) : (
            <Brand
              to={portalHome}
              nativeNavigation
              subtitle={title}
            />
          )}
        </div>

        <nav
          aria-label={title}
          className="flex-1 overflow-y-auto pr-1"
        >
          <NavList
            items={nav}
            collapsed={collapsed}
            rootPath={rootPath}
          />
        </nav>

        <div className="mt-4 space-y-3">
          {!collapsed ? <UpgradeTile /> : null}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-2xl"
            onClick={() =>
              setCollapsed((value) => !value)
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <>
                <PanelLeftClose className="size-4" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="tile sticky top-3 z-30 flex h-16 items-center gap-3 px-3 sm:px-4">
          <Sheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-2xl lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-72 border-border bg-card p-0"
            >
              <SheetTitle className="sr-only">
                {title} navigation
              </SheetTitle>

              <div className="border-b border-border p-4">
                <Brand
                  to={portalHome}
                  nativeNavigation
                  subtitle={title}
                />
              </div>

              <nav
                aria-label={`${title} mobile`}
                className="p-3"
              >
                <NavList
                  items={nav}
                  rootPath={rootPath}
                  onNavigate={() =>
                    setMobileOpen(false)
                  }
                />
              </nav>
            </SheetContent>
          </Sheet>

          <p className="font-heading text-sm font-bold lg:hidden">
            {title}
          </p>

          <div className="hidden max-w-md flex-1 md:block">
            <SearchAutocomplete
              size="sm"
              placeholder="Search…"
              destination={
                portal === "student"
                  ? "/student/search"
                  : "/search"
              }
              aria-label={`Search in ${title}`}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {portal === "teacher" ? (
              <QuickCreate />
            ) : null}

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-2xl"
              aria-label="Notifications"
            >
              <Bell className="size-5" />

              <span
                aria-hidden="true"
                className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive"
              />
            </Button>

            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/60 py-1 pr-3 pl-1">
              <Avatar className="size-7">
                <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <span className="hidden text-xs leading-tight sm:block">
                <span className="block font-medium">
                  {user}
                </span>

                <span className="block text-muted-foreground">
                  {role}
                </span>
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-2xl"
              aria-label="Log out"
              title="Log out"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1"
        >
          <div className="mx-auto w-full max-w-6xl space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
