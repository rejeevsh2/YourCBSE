import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Brand } from "@/components/common/Brand";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { publicNav } from "@/config/navigation";
import { getStoredUser } from "@/lib/auth";

function getPortalDetails(role?: string) {
  switch (role) {
    case "admin":
      return {
        to: "/admin" as const,
        label: "Admin Portal",
      };

    case "teacher":
      return {
        to: "/teacher" as const,
        label: "Teacher Portal",
      };

    case "student":
      return {
        to: "/student" as const,
        label: "Student Portal",
      };

    default:
      return {
        to: "/student" as const,
        label: "My Portal",
      };
  }
}

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  const user = getStoredUser();

  const portal = user
    ? getPortalDetails(user.role)
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-18 lg:px-8">
        <Brand />

        <nav
          aria-label="Primary"
          className="hidden lg:block"
        >
          <ul className="flex items-center gap-1 rounded-2xl border border-border/70 bg-card/50 p-1">
            {publicNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{
                    exact: item.to === "/",
                  }}
                  activeProps={{
                    className:
                      "bg-accent text-accent-foreground shadow-[var(--shadow-glow)]",
                  }}
                  className="block rounded-xl px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />

          {user && portal ? (
            <>
              <div className="hidden text-right xl:block">
                <p className="max-w-40 truncate text-sm font-medium">
                  {user.fullName}
                </p>

                <p className="text-xs capitalize text-muted-foreground">
                  {user.role}
                </p>
              </div>

              <Button asChild>
                <Link to={portal.to}>
                  {portal.label}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
              >
                <Link to="/login">
                  Login
                </Link>
              </Button>

              <Button asChild>
                <Link to="/register">
                  Get started
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet
          open={open}
          onOpenChange={setOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-72 border-border bg-card p-0"
          >
            <SheetTitle className="sr-only">
              Navigation
            </SheetTitle>

            <div className="border-b border-border p-4">
              <Brand subtitle="Everything you need to succeed" />
            </div>

            <nav
              aria-label="Mobile"
              className="flex flex-col gap-1 p-3"
            >
              {publicNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() =>
                    setOpen(false)
                  }
                  activeOptions={{
                    exact: item.to === "/",
                  }}
                  activeProps={{
                    className:
                      "bg-accent text-accent-foreground font-semibold",
                  }}
                  className="rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-3 grid gap-2 border-t border-border pt-3">
                {user && portal ? (
                  <>
                    <div className="rounded-2xl bg-muted/50 px-3 py-2">
                      <p className="truncate text-sm font-medium">
                        {user.fullName}
                      </p>

                      <p className="text-xs capitalize text-muted-foreground">
                        {user.role}
                      </p>
                    </div>

                    <Button
                      asChild
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      <Link to={portal.to}>
                        {portal.label}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      <Link to="/login">
                        Login
                      </Link>
                    </Button>

                    <Button
                      asChild
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      <Link to="/register">
                        Get started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
