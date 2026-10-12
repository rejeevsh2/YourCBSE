import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AccountStatus, ApprovalState } from "@/data/admin";

const accountStyles: Record<AccountStatus, string> = {
  Active: "border-success/30 bg-success/12 text-success",
  Pending: "border-warning/30 bg-warning/12 text-warning",
  Suspended: "border-destructive/30 bg-destructive/12 text-destructive",
  Invited: "border-primary/30 bg-primary/12 text-primary",
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", accountStyles[status])}
    >
      <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

const approvalStyles: Record<ApprovalState, string> = {
  Pending: "border-warning/30 bg-warning/12 text-warning",
  Approved: "border-success/30 bg-success/12 text-success",
  Rejected: "border-destructive/30 bg-destructive/12 text-destructive",
  "Needs revision": "border-primary/30 bg-primary/12 text-primary",
};

export function ApprovalBadge({ state }: { state: ApprovalState }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", approvalStyles[state])}
    >
      {state}
    </Badge>
  );
}

const toneStyles = {
  primary: "border-primary/30 bg-primary/12 text-primary",
  success: "border-success/30 bg-success/12 text-success",
  warning: "border-warning/30 bg-warning/12 text-warning",
  destructive: "border-destructive/30 bg-destructive/12 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
} as const;

export type ToneKey = keyof typeof toneStyles;

export function TonedBadge({
  label,
  tone = "muted",
  dot = false,
}: {
  label: string;
  tone?: ToneKey;
  dot?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", toneStyles[tone])}
    >
      {dot ? (
        <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      ) : null}
      {label}
    </Badge>
  );
}

