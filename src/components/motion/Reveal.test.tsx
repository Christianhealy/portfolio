import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./Reveal";

let reduced = false;
vi.mock("./useMotionPrefs", () => ({
  useMotionPrefs: () => ({ reduced, smoothScroll: false }),
}));

let callback: IntersectionObserverCallback | undefined;
let top = 0;

beforeEach(() => {
  reduced = false;
  top = 2000; // below the fold by default (jsdom viewport is 768px tall)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ top, bottom: top + 100 }) as DOMRect,
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const enter = () =>
  act(() => callback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as never));

describe("Reveal", () => {
  it("leaves content that is already on screen alone (no flash after hydration)", () => {
    top = 100;
    render(<Reveal>hello</Reveal>);
    expect(screen.getByText("hello")).not.toHaveAttribute("data-reveal");
  });

  it("hides below-the-fold content until it scrolls into view, then rises in", () => {
    render(<Reveal delay={0.12}>hello</Reveal>);
    const el = screen.getByText("hello");
    expect(el).toHaveAttribute("data-reveal", "pending");
    expect(el).toHaveAttribute("data-reveal-mode", "rise");
    enter();
    expect(el).toHaveAttribute("data-reveal", "shown");
    expect(el.style.transitionDelay).toBe("0.12s");
  });

  it("only fades (no rise, no delay) under reduced motion", () => {
    reduced = true;
    render(<Reveal delay={0.12}>hello</Reveal>);
    const el = screen.getByText("hello");
    expect(el).toHaveAttribute("data-reveal-mode", "fade");
    enter();
    expect(el.style.transitionDelay).toBe("");
  });

  it("supports a masked line reveal for headings", () => {
    render(
      <Reveal as="h2" variant="mask">
        Title
      </Reveal>,
    );
    const heading = screen.getByRole("heading", { name: "Title" });
    expect(heading).toHaveAttribute("data-reveal-mode", "mask");
  });
});
