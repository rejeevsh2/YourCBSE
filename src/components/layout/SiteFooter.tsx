import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/common/Brand";
import { grades, subjects } from "@/data/placeholder";

const portalLinks = [
  { label: "Student Portal", to: "/student" },
  { label: "Teacher Portal", to: "/teacher" },
  { label: "Admin Portal", to: "/admin" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Help Center", to: "/help" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:gap-12 lg:py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Brand />
          <p className="max-w-xs text-sm text-muted-foreground">
            Everything You Need to Succeed in CBSE — notes, videos, resources and interactive
            practice, organised chapter by chapter.
          </p>
          <p className="text-xs text-muted-foreground">yourcbse.com</p>
        </div>

        <nav aria-label="Grades">
          <h2 className="font-heading text-xs font-bold tracking-widest uppercase text-foreground">Grades</h2>
          <ul className="mt-4 space-y-2.5">
            {grades.slice(0, 5).map((grade) => (
              <li key={grade.id}>
                <Link
                  to="/grades"
                  className="inline-flex min-h-11 items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-0"
                >
                  {grade.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Subjects">
          <h2 className="font-heading text-xs font-bold tracking-widest uppercase text-foreground">Subjects</h2>
          <ul className="mt-4 space-y-2.5">
            {subjects.slice(0, 5).map((subject) => (
              <li key={subject.id}>
                <Link
                  to="/subjects"
                  className="inline-flex min-h-11 items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-0"
                >
                  {subject.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
          <nav aria-label="Portals">
            <h2 className="font-heading text-xs font-bold tracking-widest uppercase text-foreground">Portals</h2>
            <ul className="mt-4 space-y-2.5">
              {portalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-11 items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-0"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company">
            <h2 className="font-heading text-xs font-bold tracking-widest uppercase text-foreground">Company</h2>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-11 items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-0"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} YourCBSE. All rights reserved.</p>
          <p>Not affiliated with the Central Board of Secondary Education.</p>
        </div>
      </div>
    </footer>
  );
}
