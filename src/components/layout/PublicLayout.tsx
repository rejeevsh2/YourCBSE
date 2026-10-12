import type { ReactNode } from "react";
import { SkipLink } from "@/components/common/SkipLink";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="aurora flex min-h-screen flex-col bg-background">
      <SkipLink />
      <PublicNavbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-12 lg:space-y-14 lg:px-8 lg:py-16">
      {children}
    </div>
  );
}

