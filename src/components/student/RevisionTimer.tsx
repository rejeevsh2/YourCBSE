import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PRESETS = [
  { id: "focus", label: "Focus", minutes: 25 },
  { id: "deep", label: "Deep work", minutes: 50 },
  { id: "break", label: "Short break", minutes: 5 },
];

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Pomodoro-style revision timer. Pure client-side UI, no persistence. */
export function RevisionTimer({ className }: { className?: string }) {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [remaining, setRemaining] = useState(PRESETS[0].minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const total = preset.minutes * 60;
  const elapsed = Math.round(((total - remaining) / total) * 100);

  return (
    <section className={cn("tile space-y-5 p-5 sm:p-6", className)}>
      <div className="flex items-center gap-2">
        <Timer className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <h2 className="font-heading text-base font-bold sm:text-lg">Revision timer</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={item.id === preset.id ? "default" : "outline"}
            className="rounded-2xl"
            onClick={() => {
              setPreset(item);
              setRemaining(item.minutes * 60);
              setRunning(false);
            }}
          >
            {item.label} · {item.minutes}m
          </Button>
        ))}
      </div>

      <p
        className="font-heading text-center text-5xl font-bold tabular-nums sm:text-6xl"
        aria-live="polite"
      >
        {format(remaining)}
      </p>

      <Progress value={elapsed} aria-label="Session progress" />

      <div className="flex gap-2">
        <Button
          type="button"
          className="flex-1 rounded-2xl"
          onClick={() => setRunning((value) => !value)}
          disabled={remaining === 0}
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          aria-label="Reset timer"
          onClick={() => {
            setRemaining(preset.minutes * 60);
            setRunning(false);
          }}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Sessions today: 3 · Focus time 1h 42m
      </p>
    </section>
  );
}
