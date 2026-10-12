import { Link } from "@tanstack/react-router";
import {
  GraduationCap,
} from "lucide-react";

const columns = [
  {
    heading: "Quick links",
    links: [
      { label: "Browse grades", to: "/grades" },
      { label: "Browse subjects", to: "/subjects" },
      { label: "Practice Center", to: "/practice" },
      { label: "Resources", to: "/resources" },
      { label: "Search resources", to: "/search" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    heading: "Portals",
    links: [
      { label: "Student portal", to: "/student" },
      { label: "Teacher portal", to: "/teacher" },
      { label: "Admin portal", to: "/admin" },
      { label: "Create an account", to: "/register" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Help Center", to: "/help" },
      { label: "FAQ", to: "/faq" },
      { label: "Login", to: "/login" },
    ],
  },
] as const;

const policies = [
  { label: "Privacy policy", to: "/privacy" },
  { label: "Terms of use", to: "/terms" },
  { label: "Cookie policy", to: "/cookies" },
  { label: "Help Center", to: "/help" },
] as const;

export function HomeFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,0.8fr)]">
          <div className="space-y-5">
            <Link
              to="/"
              className="flex w-fit items-center gap-2.5"
              aria-label="YourTeacher home"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                Your
                <span className="text-primary">
                  Teacher
                </span>
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              CBSE learning content organised by grade,
              subject, unit, chapter and lesson for students
              and teachers.
            </p>
          </div>

          {columns.map((column) => (
            <nav
              key={column.heading}
              aria-label={column.heading}
            >
              <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                {column.heading}
              </h3>

              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} YourTeacher.
            All rights reserved.
          </p>

          <nav aria-label="Policies">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {policies.map((policy) => (
                <li key={policy.label}>
                  <Link
                    to={policy.to}
                    className="transition-colors hover:text-primary"
                  >
                    {policy.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p>
            Not affiliated with the Central Board of
            Secondary Education.
          </p>
        </div>
      </div>
    </footer>
  );
}