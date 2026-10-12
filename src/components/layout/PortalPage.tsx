import type { ReactNode } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PhaseNotice } from "@/components/common/PhaseNotice";
import type { Crumb } from "@/types";

interface PortalPageProps {
  portalLabel: string;
  portalPath: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  showNotice?: boolean;
}

/** Shared scaffold for every portal screen: breadcrumbs, heading, notice, content. */
export function PortalPage({
  portalLabel,
  portalPath,
  title,
  description,
  actions,
  children,
  showNotice = true,
}: PortalPageProps) {
  const crumbs: Crumb[] = [
    { label: portalLabel, to: portalPath },
    { label: title },
  ];

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={crumbs}
        actions={actions}
      />
      {showNotice ? <PhaseNotice /> : null}
      {children}
    </>
  );
}

