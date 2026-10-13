import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/common/Brand";

const learningLinks = [
  { label: "Browse Grades", to: "/grades" },
  { label: "Browse Subjects", to: "/subjects" },
  { label: "Resource Library", to: "/resources" },
  { label: "Search Resources", to: "/search" },
  { label: "Practice Center", to: "/practice" },
  { label: "Blog", to: "/blog" },
] as const;

const portalLinks = [
  { label: "Student Portal", to: "/student" },
  { label: "Teacher Portal", to: "/teacher" },
  { label: "Admin Portal", to: "/admin" },
  { label: "Create Account", to: "/register" },
] as const;

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Help Center", to: "/help" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Cookies", to: "/cookies" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:px-8 lg:py-16">
        <div className="space-y-4">
          <Brand />

          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            CBSE learning content organised by grade,
            subject, unit, chapter and lesson for students
            and teachers.
          </p>

          <p className="text-xs text-muted-foreground">
            yourschool.co.in
          </p>
        </div>

        <nav aria-label="Learning">
          <h2 className="font-heading text-xs font-bold tracking-widest uppercase text-foreground">
            Learning
          </h2>

          <ul className="mt-4 space-y-2.5">
            {learningLinks.map((link) => (
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

        <nav aria-label="Portals">
          <h2 className="font-heading text-xs font-bold tracking-widest uppercase text-foreground">
            Portals
          </h2>

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
          <h2 className="font-heading text-xs font-bold tracking-widest uppercase text-foreground">
            Company
          </h2>

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

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} HRNLMS Private Limited. All rights reserved.
          </p>

          <p>
            YourSchool is an independent educational platform and is not affiliated with or endorsed by the Central Board of Secondary Education (CBSE).
          </p>
        </div>
      </div>
    </footer>
  );
}