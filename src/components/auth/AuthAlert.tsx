import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthAlertProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Success feedback banner for auth flows. */
export function SuccessAlert({ title = "Success", children, className }: AuthAlertProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-in fade-in-0 slide-in-from-top-1 flex gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm",
        className,
      )}
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

/** Error feedback banner for auth flows. */
export function ErrorAlert({ title = "Something went wrong", children, className }: AuthAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "animate-in fade-in-0 slide-in-from-top-1 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

/** Neutral informational banner. */
export function InfoAlert({ title = "Heads up", children, className }: AuthAlertProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-sm",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

/** Inline field-level validation message, wired to the input via aria-describedby. */
export function ValidationMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="animate-in fade-in-0 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

