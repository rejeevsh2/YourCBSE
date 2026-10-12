import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "@/components/auth/AuthAlert";
import { getPasswordStrength } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";

export interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

/** Labelled text input with inline validation wiring. */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive/40", className)}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <ValidationMessage id={errorId} message={error} />
    </div>
  );
});

export interface PasswordInputProps extends AuthFieldProps {
  /** Render the strength meter and requirement checklist. */
  showStrength?: boolean;
}

/** Password field with show/hide toggle and optional strength meter. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, hint, id, showStrength, value, ...props }, ref) {
    const generated = useId();
    const inputId = id ?? generated;
    const errorId = `${inputId}-error`;
    const [visible, setVisible] = useState(false);
    const strength = getPasswordStrength(String(value ?? ""));

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="relative">
          <Input
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn("pr-11", error && "border-destructive focus-visible:ring-destructive/40")}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((open) => !open)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {showStrength && String(value ?? "").length > 0 ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      "flex-1 rounded-full transition-colors",
                      index < strength.score ? strength.toneClass : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground" aria-live="polite">
                {strength.label}
              </span>
            </div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {strength.hints.map((item) => (
                <li
                  key={item.label}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px]",
                    item.met ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full",
                      item.met ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        <ValidationMessage id={errorId} message={error} />
      </div>
    );
  },
);

