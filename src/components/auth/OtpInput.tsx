import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ValidationMessage } from "@/components/auth/AuthAlert";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
}

/** Six-box one-time-code entry with keyboard, paste and screen-reader support. */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  disabled,
  label = "One-time verification code",
  id = "otp",
}: OtpInputProps) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <span className="sr-only" id={labelId}>
        {label}
      </span>
      <InputOTP
        maxLength={length}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        containerClassName="justify-center gap-1.5 xs:gap-2 sm:gap-3"
      >
        <InputOTPGroup className="gap-1.5 xs:gap-2 sm:gap-3">
          {Array.from({ length }).map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                "size-11 rounded-xl border font-heading text-base font-semibold shadow-sm transition-all sm:size-14 sm:text-lg",
                error && "border-destructive text-destructive",
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center">
        <ValidationMessage id={errorId} message={error} />
      </div>
    </div>
  );
}

