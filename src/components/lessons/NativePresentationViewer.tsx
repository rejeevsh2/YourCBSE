import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Minus, Plus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { fitSlide, PresentationGestures, type Point } from "@/lib/native/presentation-gestures";
import { setPresentationImmersive } from "@/lib/native/presentation-mode";

type Props = {
  title: string;
  slides: { number: number; url: string }[];
  index: number;
  refreshing: boolean;
  onIndexChange(index: number): void;
  onClose(): void;
  onRefresh(): void;
};

const iconButton =
  "flex size-11 shrink-0 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-white";

export function NativePresentationViewer({
  title,
  slides,
  index,
  refreshing,
  onIndexChange,
  onClose,
  onRefresh,
}: Props) {
  const [gestures] = useState(() => new PresentationGestures());
  const [transform, setTransform] = useState(gestures.value);
  const [fit, setFit] = useState({ width: 1, height: 1 });
  const [imageSize, setImageSize] = useState({ width: 16, height: 9 });
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsTick, setControlsTick] = useState(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastTap = useRef<{ point: Point; time: number } | null>(null);
  const downPoint = useRef<Point>({ x: 0, y: 0 });
  const bindStage = useCallback((node: HTMLDivElement | null) => {
    stageRef.current = node;
    setStage(node);
  }, []);

  useEffect(() => {
    let mounted = true;
    void setPresentationImmersive(true).catch(() => {
      if (mounted) toast.error("Could not hide the phone bars. Close and reopen fullscreen.");
    });
    return () => {
      mounted = false;
      void setPresentationImmersive(false).catch(() =>
        toast.error("Please reopen the app to restore the phone bars."),
      );
    };
  }, []);

  useEffect(() => {
    gestures.reset();
    setTransform({ ...gestures.value });
    setControlsVisible(true);
    lastTap.current = null;
    clearTimeout(tapTimer.current);
  }, [index, gestures]);

  useEffect(() => {
    if (!stage) return;
    const measure = () => {
      const rect = stage.getBoundingClientRect();
      gestures.cancel();
      gestures.setBounds({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
      });
      setFit(fitSlide(gestures.bounds));
      setTransform({ ...gestures.value });
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stage, imageSize, gestures]);

  useEffect(() => {
    if (!controlsVisible) return;
    const timer = setTimeout(() => {
      // Do not remove a control while someone is using a keyboard or assistive input.
      if (!document.activeElement?.closest("[data-slide-controls]")) setControlsVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [controlsVisible, controlsTick, index]);

  useEffect(() => () => clearTimeout(tapTimer.current), []);

  const publish = () => setTransform({ ...gestures.value });
  const keepControls = () => {
    setControlsVisible(true);
    setControlsTick((value) => value + 1);
  };
  const changeSlide = (next: number) => {
    onIndexChange(Math.max(0, Math.min(slides.length - 1, next)));
    keepControls();
  };
  const pointFor = (event: PointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const zoom = (scale: number) => {
    gestures.zoom(scale);
    publish();
    keepControls();
  };

  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const point = pointFor(event);
    const action = gestures.up(event.pointerId, point, event.timeStamp);
    publish();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (action === "next") changeSlide(index + 1);
    else if (action === "previous") changeSlide(index - 1);
    else if (action === "tap") {
      const previous = lastTap.current;
      if (
        previous &&
        event.timeStamp - previous.time < 300 &&
        Math.hypot(point.x - previous.point.x, point.y - previous.point.y) < 32
      ) {
        clearTimeout(tapTimer.current);
        lastTap.current = null;
        gestures.zoom(gestures.value.scale > 1 ? 1 : 2.5, point);
        publish();
        setControlsVisible(false);
      } else {
        lastTap.current = { point, time: event.timeStamp };
        tapTimer.current = setTimeout(() => {
          lastTap.current = null;
          setControlsVisible((visible) => !visible);
          setControlsTick((value) => value + 1);
        }, 300);
      }
    }
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black" />
        <Dialog.Content
          className="fixed inset-0 z-[201] h-[100dvh] w-screen overflow-hidden bg-black text-white outline-none"
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            stageRef.current?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Tab") keepControls();
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              changeSlide(index - 1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              changeSlide(index + 1);
            }
            if (event.key === "+" || event.key === "=") zoom(transform.scale + 0.5);
            if (event.key === "-") zoom(transform.scale - 0.5);
            if (event.key === "0") zoom(1);
          }}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div
            ref={bindStage}
            data-slide-stage
            role="group"
            aria-label="Slide image. Swipe to change slides. Pinch to zoom. Drag to move a zoomed slide. Tap for controls."
            tabIndex={0}
            className="absolute inset-0 touch-none select-none overflow-hidden outline-none"
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;
              event.preventDefault();
              clearTimeout(tapTimer.current);
              downPoint.current = pointFor(event);
              gestures.down(event.pointerId, downPoint.current, event.timeStamp);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!gestures.pointerCount) return;
              const point = pointFor(event);
              event.preventDefault();
              gestures.move(event.pointerId, point);
              publish();
              if (Math.hypot(point.x - downPoint.current.x, point.y - downPoint.current.y) > 10) {
                clearTimeout(tapTimer.current);
                lastTap.current = null;
                setControlsVisible(false);
              }
            }}
            onPointerUp={pointerUp}
            onPointerCancel={() => {
              gestures.cancel();
              lastTap.current = null;
              clearTimeout(tapTimer.current);
            }}
            onLostPointerCapture={(event) => {
              if (gestures.hasPointer(event.pointerId)) gestures.cancel();
            }}
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                src={slides[index].url}
                alt={`Slide ${index + 1} of ${slides.length} — ${title}`}
                draggable={false}
                referrerPolicy="no-referrer"
                className="max-w-none shrink-0 select-none object-contain will-change-transform"
                style={{
                  width: fit.width,
                  height: fit.height,
                  transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                }}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  if (image.naturalWidth && image.naturalHeight)
                    setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
                }}
              />
            </div>
          </div>
          <span className="sr-only" aria-live="polite">
            Slide {index + 1} of {slides.length}
          </span>
          {controlsVisible ? (
            <>
              <div
                data-slide-controls
                onPointerUp={() => stageRef.current?.focus({ preventScroll: true })}
                className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-3 bg-gradient-to-b from-black/75 to-transparent p-3 pb-8"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
                <span className="shrink-0 text-sm tabular-nums">
                  {index + 1} / {slides.length}
                </span>
                <button
                  className={`${iconButton} pointer-events-auto`}
                  type="button"
                  aria-label="Exit fullscreen"
                  onClick={onClose}
                >
                  <X className="size-5" />
                </button>
              </div>
              <div
                data-slide-controls
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8"
                onPointerDown={keepControls}
                onPointerUp={() => stageRef.current?.focus({ preventScroll: true })}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    className={iconButton}
                    type="button"
                    aria-label="Previous slide"
                    disabled={index === 0}
                    onClick={() => changeSlide(index - 1)}
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      className={iconButton}
                      type="button"
                      aria-label="Zoom out"
                      disabled={transform.scale === 1}
                      onClick={() => zoom(transform.scale - 0.5)}
                    >
                      <Minus className="size-4" />
                    </button>
                    <button
                      className="min-h-11 min-w-14 rounded-full px-2 text-xs tabular-nums"
                      type="button"
                      aria-label="Reset zoom"
                      onClick={() => zoom(1)}
                    >
                      {Math.round(transform.scale * 100)}%
                    </button>
                    <button
                      className={iconButton}
                      type="button"
                      aria-label="Zoom in"
                      disabled={transform.scale === 5}
                      onClick={() => zoom(transform.scale + 0.5)}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    className={iconButton}
                    type="button"
                    aria-label="Refresh slide access"
                    disabled={refreshing}
                    onClick={onRefresh}
                  >
                    <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    className={iconButton}
                    type="button"
                    aria-label="Next slide"
                    disabled={index === slides.length - 1}
                    onClick={() => changeSlide(index + 1)}
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </div>
                <p className="mt-2 text-center text-xs text-white/70">
                  Swipe slides · Pinch to zoom · Tap for controls
                </p>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
