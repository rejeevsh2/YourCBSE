import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  Send,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const columns = [
  {
    heading: "Quick links",
    links: [
      { label: "Browse grades", to: "/grades" },
      { label: "Browse subjects", to: "/subjects" },
      { label: "Practice tests", to: "/practice" },
      { label: "Resources", to: "/resources" },
      { label: "Search chapters", to: "/search" },
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

const socials = [
  { label: "YouTube", icon: Youtube },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "Facebook", icon: Facebook },
] as const;

/** Professional marketing footer — quick links, portals, newsletter and policies. */
export function HomeFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,0.8fr)]">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                Your<span className="text-primary">CBSE</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Everything You Need to Succeed in CBSE — chapter-wise notes, video lessons,
              worksheets and practice for Classes 6 to 12.
            </p>
            <ul className="flex items-center gap-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href="#"
                    aria-label={`YourCBSE on ${social.label}`}
                    className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                  >
                    <social.icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                {column.heading}
              </h3>
              <ul className="mt-2 space-y-0.5 sm:mt-4 sm:space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-flex min-h-11 items-center rounded text-sm text-muted-foreground transition-colors hover:text-primary sm:min-h-0"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 grid gap-6 rounded-2xl border border-border bg-background p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="space-y-1.5">
            <h3 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
              <Mail className="size-4 text-primary" aria-hidden="true" />
              Weekly study digest
            </h3>
            <p className="text-sm text-muted-foreground">
              New chapters, videos and mock tests — one short email every Sunday.
            </p>
          </div>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="footer-newsletter" className="sr-only">
              Email address
            </label>
            <Input
              id="footer-newsletter"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-xl"
            />
            <Button type="submit" className="h-11 rounded-xl">
              Subscribe
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} YourCBSE. All rights reserved.</p>
          <nav aria-label="Policies">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {policies.map((policy) => (
                <li key={policy.label}>
                  <Link to={policy.to} className="transition-colors hover:text-primary">
                    {policy.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p>Not affiliated with the Central Board of Secondary Education.</p>
        </div>
      </div>
    </footer>
  );
}
