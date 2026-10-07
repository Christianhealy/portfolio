import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SmoothScroll } from "./SmoothScroll";

let prefs = { reduced: false, smoothScroll: true };
vi.mock("./useMotionPrefs", () => ({ useMotionPrefs: () => prefs }));

const instances: { options: Record<string, unknown>; destroy: ReturnType<typeof vi.fn> }[] = [];
vi.mock("lenis", () => ({
  default: class {
    destroy = vi.fn();
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
      instances.push(this);
    }
  },
}));

beforeEach(() => {
  instances.length = 0;
});

describe("SmoothScroll", () => {
  it("starts Lenis (auto-raf, shared easing) on desktop fine pointers", () => {
    prefs = { reduced: false, smoothScroll: true };
    render(<SmoothScroll />);
    expect(instances).toHaveLength(1);
    expect(instances[0]!.options).toMatchObject({ autoRaf: true });
    expect(typeof instances[0]!.options["easing"]).toBe("function");
  });

  it("does nothing on touch devices or with reduced motion", () => {
    prefs = { reduced: false, smoothScroll: false };
    render(<SmoothScroll />);
    prefs = { reduced: true, smoothScroll: false };
    render(<SmoothScroll />);
    expect(instances).toHaveLength(0);
  });

  it("tears Lenis down when preferences change or on unmount", () => {
    prefs = { reduced: false, smoothScroll: true };
    const { rerender, unmount } = render(<SmoothScroll />);
    prefs = { reduced: true, smoothScroll: false };
    rerender(<SmoothScroll />);
    expect(instances[0]!.destroy).toHaveBeenCalledTimes(1);
    unmount();
    expect(instances).toHaveLength(1);
  });
});
