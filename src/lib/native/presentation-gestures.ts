export type Point = { x: number; y: number };
export type SlideTransform = Point & { scale: number };
export type SlideBounds = {
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
};
export type GestureAction = "next" | "previous" | "tap" | undefined;

export function fitSlide(bounds: SlideBounds) {
  const factor = Math.min(bounds.width / bounds.imageWidth, bounds.height / bounds.imageHeight);
  return { width: bounds.imageWidth * factor, height: bounds.imageHeight * factor };
}

export function clampSlide(value: SlideTransform, bounds: SlideBounds): SlideTransform {
  const scale = Math.max(1, Math.min(5, value.scale));
  const fit = fitSlide(bounds);
  const maxX = Math.max(0, (fit.width * scale - bounds.width) / 2);
  const maxY = Math.max(0, (fit.height * scale - bounds.height) / 2);
  return {
    scale,
    x: Math.max(-maxX, Math.min(maxX, value.x)),
    y: Math.max(-maxY, Math.min(maxY, value.y)),
  };
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class PresentationGestures {
  value: SlideTransform = { scale: 1, x: 0, y: 0 };
  bounds: SlideBounds = { width: 1, height: 1, imageWidth: 16, imageHeight: 9 };
  private pointers = new Map<number, Point>();
  private start: Point = { x: 0, y: 0 };
  private startValue = this.value;
  private startedAt = 0;
  private multiTouch = false;
  private moved = false;
  private pinchDistance = 1;
  private pinchCenter: Point = this.start;

  get pointerCount() {
    return this.pointers.size;
  }

  hasPointer(id: number) {
    return this.pointers.has(id);
  }

  setBounds(bounds: SlideBounds) {
    this.bounds = bounds;
    this.value = clampSlide(this.value, bounds);
  }

  reset() {
    this.pointers.clear();
    this.value = { scale: 1, x: 0, y: 0 };
  }

  zoom(scale: number, point: Point = { x: this.bounds.width / 2, y: this.bounds.height / 2 }) {
    const nextScale = Math.max(1, Math.min(5, scale));
    const ratio = nextScale / this.value.scale;
    const x = point.x - this.bounds.width / 2;
    const y = point.y - this.bounds.height / 2;
    this.value = clampSlide(
      { scale: nextScale, x: x - (x - this.value.x) * ratio, y: y - (y - this.value.y) * ratio },
      this.bounds,
    );
  }

  down(id: number, point: Point, time: number) {
    if (this.pointers.size >= 2) return;
    this.pointers.set(id, point);
    this.startValue = { ...this.value };
    if (this.pointers.size === 1) {
      this.start = point;
      this.startedAt = time;
      this.multiTouch = false;
      this.moved = false;
    } else {
      this.multiTouch = true;
      const [a, b] = [...this.pointers.values()];
      this.pinchCenter = midpoint(a, b);
      this.pinchDistance = Math.max(1, distance(a, b));
    }
  }

  move(id: number, point: Point) {
    if (!this.pointers.has(id)) return;
    this.pointers.set(id, point);
    if (distance(point, this.start) > 10) this.moved = true;
    if (this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const center = midpoint(a, b);
      const scale = Math.max(
        1,
        Math.min(5, (this.startValue.scale * distance(a, b)) / this.pinchDistance),
      );
      const ratio = scale / this.startValue.scale;
      this.value = clampSlide(
        {
          scale,
          x:
            center.x -
            this.bounds.width / 2 -
            (this.pinchCenter.x - this.bounds.width / 2 - this.startValue.x) * ratio,
          y:
            center.y -
            this.bounds.height / 2 -
            (this.pinchCenter.y - this.bounds.height / 2 - this.startValue.y) * ratio,
        },
        this.bounds,
      );
    } else if (this.value.scale > 1) {
      this.value = clampSlide(
        {
          scale: this.value.scale,
          x: this.startValue.x + point.x - this.start.x,
          y: this.startValue.y + point.y - this.start.y,
        },
        this.bounds,
      );
    }
  }

  up(id: number, point: Point, time: number): GestureAction {
    if (!this.pointers.has(id)) return;
    this.move(id, point);
    this.pointers.delete(id);
    if (this.pointers.size) {
      this.start = [...this.pointers.values()][0];
      this.startValue = { ...this.value };
      return;
    }
    if (this.multiTouch) return;
    const dx = point.x - this.start.x;
    const dy = point.y - this.start.y;
    const duration = time - this.startedAt;
    const threshold = Math.max(45, Math.min(100, this.bounds.width * 0.12));
    if (
      this.value.scale === 1 &&
      Math.abs(dx) >= threshold &&
      Math.abs(dx) > Math.abs(dy) * 1.4 &&
      duration < 800
    ) {
      return dx < 0 ? "next" : "previous";
    }
    if (!this.moved && duration < 300) return "tap";
  }

  cancel() {
    this.pointers.clear();
  }
}
