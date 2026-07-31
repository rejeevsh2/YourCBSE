import { Info } from "lucide-react";

interface PhaseNoticeProps {
  title?: string;
  message?: string;
}

/** Phase 1 is UI-only: this banner marks screens awaiting backend integration. */
export function PhaseNotice({
  title = "Interface preview",
  message = "This screen is part of the Phase 1 frontend foundation. Data and actions connect once the backend is integrated.",
}: PhaseNoticeProps) {
  return (
    <div className="tile flex items-start gap-3 border-primary/25 bg-accent/40 p-5">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="space-y-1">
        <p className="font-heading text-sm font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
