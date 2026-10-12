import cueMark from "@/assets/cue-assistant.png";
import { cn } from "@/lib/utils";

/** Assistant identity mark — used in headers, avatars and empty states. */
export function AssistantMark({
  className,
  size = 40,
  label = "Cue, your AI study assistant",
}: {
  className?: string;
  size?: number;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        loading="lazy"
        decoding="async"
        src={cueMark}
        alt={label}
        width={512}
        height={512}
        className="size-full object-contain p-0.5"
      />
    </span>
  );
}

