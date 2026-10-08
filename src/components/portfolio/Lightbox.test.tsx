import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStills } from "@/lib/content";
import { Lightbox } from "./Lightbox";

let reduced = false;
vi.mock("@/components/motion/useMotionPrefs", () => ({
  useMotionPrefs: () => ({ reduced, smoothScroll: false }),
}));

// Record animations instead of running them; each resolves immediately unless `hold` is set,
// in which case they finish only when `release()` is called.
const animations: { target: Element; keyframes: Record<string, unknown> }[] = [];
let hold = false;
const pending: (() => void)[] = [];
const release = () => pending.splice(0).forEach((resolve) => resolve());
vi.mock("motion", () => ({
  animate: (target: Element, keyframes: Record<string, unknown>) => {
    animations.push({ target, keyframes });
    const finished = hold
      ? new Promise<void>((resolve) => pending.push(resolve))
      : Promise.resolve();
    return { finished, stop: () => {} };
  },
}));

beforeEach(() => {
  reduced = false;
  hold = false;
  pending.length = 0;
  animations.length = 0;
});

// Fixture stills: dunes, portrait (caption "Lisbon, 2025"), square, harbour.
const stills = getStills();
const box = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;

/** A grid thumbnail standing at `rect`, as the stills page would hand to the lightbox. */
function thumbnail(rect: DOMRect) {
  const img = document.createElement("img");
  img.getBoundingClientRect = () => rect;
  document.body.append(img);
  return img;
}

function setup(index = 0, getThumbnail?: (slug: string) => HTMLElement | null) {
  const onIndexChange = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <Lightbox
      stills={stills}
      index={index}
      onIndexChange={onIndexChange}
      onClose={onClose}
      {...(getThumbnail ? { getThumbnail } : {})}
    />,
  );
  return { onIndexChange, onClose, ...view };
}

const image = () => document.querySelector("[data-lightbox-image]")!;

describe("Lightbox", () => {
  it("is a modal dialog showing the counter and the photo's caption", () => {
    setup(1);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("02 / 04")).toBeInTheDocument();
    expect(screen.getByText("Lisbon, 2025")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Lisbon, 2025" })).toBeInTheDocument();
  });

  it("steps with the arrow keys and wraps at either end", () => {
    const first = setup(0);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(first.onIndexChange.mock.calls).toEqual([[1], [3]]);
  });

  it("steps with the previous/next buttons", async () => {
    const { onIndexChange } = setup(3);
    await userEvent.click(screen.getByRole("button", { name: "Next photo" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(onIndexChange.mock.calls).toEqual([[0], [2]]);
  });

  it("closes on Escape, after its exit animation", async () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("closes on the close button, only once however often it is pressed", async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.keyDown(document, { key: "Escape" });
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("moves focus inside and traps Tab within the dialog", async () => {
    setup();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toContain(document.activeElement);
    for (let i = 0; i < buttons.length + 1; i++) {
      await userEvent.tab();
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("follows a horizontal swipe", () => {
    const { onIndexChange } = setup(1);
    const dialog = screen.getByRole("dialog");
    fireEvent.touchStart(dialog, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 120, clientY: 110 }] });
    fireEvent.touchStart(dialog, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 280, clientY: 100 }] });
    // A tap is not a swipe.
    fireEvent.touchStart(dialog, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 104, clientY: 100 }] });
    expect(onIndexChange.mock.calls).toEqual([[2], [0]]);
  });

  it("moves the photo with the finger while swiping", () => {
    setup(1);
    const dialog = screen.getByRole("dialog");
    fireEvent.touchStart(dialog, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchMove(dialog, { touches: [{ clientX: 260, clientY: 100 }] });
    expect((image() as HTMLElement).style.transform).toBe("translateX(-40px)");
  });

  it("preloads the neighbouring photos", () => {
    setup(0);
    const preloaded = document.querySelectorAll("[data-preload] img");
    expect([...preloaded].map((img) => img.getAttribute("src"))).toEqual([
      stills[1]!.image.src,
      stills[3]!.image.src,
    ]);
  });

  it("locks page scroll while open and opts out of smooth scrolling", () => {
    setup();
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog")).toHaveAttribute("data-lenis-prevent");
  });
});

describe("Lightbox motion", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      box(300, 200, 400, 200),
    );
  });

  it("zooms the photo out of its thumbnail on open", () => {
    const thumb = thumbnail(box(0, 0, 100, 50));
    const getThumbnail = vi.fn(() => thumb);
    setup(0, getThumbnail);
    expect(getThumbnail).toHaveBeenCalledWith("dunes");
    const zoom = animations.find((a) => a.target === image());
    expect(zoom?.keyframes).toMatchObject({ x: [-450, 0], y: [-275, 0], scale: [0.25, 1] });
  });

  it("zooms back into the thumbnail before closing", async () => {
    const thumb = thumbnail(box(0, 0, 100, 50));
    const { onClose } = setup(0, () => thumb);
    animations.length = 0;
    fireEvent.keyDown(document, { key: "Escape" });
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(animations.find((a) => a.target === image())?.keyframes).toMatchObject({
      x: -450,
      y: -275,
      scale: 0.25,
    });
  });

  it("fades instead of zooming when the thumbnail is off screen", () => {
    const thumb = thumbnail(box(0, 5000, 100, 50));
    setup(0, () => thumb);
    expect(animations.some((a) => "scale" in a.keyframes)).toBe(false);
    expect(animations.some((a) => "opacity" in a.keyframes)).toBe(true);
  });

  it("slides the next photo in from the direction of travel", () => {
    const { rerender, onIndexChange, onClose } = setup(0);
    animations.length = 0;
    rerender(
      <Lightbox stills={stills} index={1} onIndexChange={onIndexChange} onClose={onClose} />,
    );
    expect(animations.find((a) => a.target === image())?.keyframes).toMatchObject({
      x: [60, 0],
    });
  });

  it("uses only short fades under reduced motion", async () => {
    reduced = true;
    const thumb = thumbnail(box(0, 0, 100, 50));
    const { onClose, rerender, onIndexChange } = setup(0, () => thumb);
    rerender(
      <Lightbox stills={stills} index={1} onIndexChange={onIndexChange} onClose={onClose} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    for (const { keyframes } of animations) {
      expect(Object.keys(keyframes).filter((k) => k !== "opacity")).toEqual([]);
    }
  });
});

// The zoom lands exactly on the grid thumbnail; if the thumbnail were showing underneath, the
// photo would appear to land twice. It stays hidden from the open zoom until the close zoom
// has finished.
describe("Lightbox source thumbnail", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      box(300, 200, 400, 200),
    );
  });

  it("is hidden from the open zoom until the close zoom has finished", async () => {
    hold = true;
    const thumb = thumbnail(box(0, 0, 100, 50));
    const { onClose } = setup(0, () => thumb);
    expect(thumb.style.visibility).toBe("hidden");
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(thumb.style.visibility).toBe("hidden");

    let visibleAtClose: string | undefined;
    onClose.mockImplementation(() => (visibleAtClose = thumb.style.visibility));
    fireEvent.keyDown(document, { key: "Escape" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(thumb.style.visibility).toBe("hidden");
    expect(onClose).not.toHaveBeenCalled();
    release();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(visibleAtClose).toBe("");
  });

  it("swaps to the new photo's thumbnail when stepping, so close lands on the right one", async () => {
    const first = thumbnail(box(0, 0, 100, 50));
    const second = thumbnail(box(120, 0, 100, 50));
    const thumbs: Record<string, HTMLElement> = { dunes: first, portrait: second };
    const getThumbnail = (slug: string) => thumbs[slug] ?? null;
    const { rerender, onIndexChange, onClose } = setup(0, getThumbnail);
    rerender(
      <Lightbox
        stills={stills}
        index={1}
        onIndexChange={onIndexChange}
        onClose={onClose}
        getThumbnail={getThumbnail}
      />,
    );
    expect(first.style.visibility).toBe("");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(second.style.visibility).toBe("hidden");
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(second.style.visibility).toBe("");
  });

  it("is shown again if the lightbox unmounts mid-zoom (e.g. browser Back)", () => {
    hold = true;
    const thumb = thumbnail(box(0, 0, 100, 50));
    const { unmount } = setup(0, () => thumb);
    unmount();
    expect(thumb.style.visibility).toBe("");
  });

  it("stays visible when there is no zoom (off screen, or reduced motion)", async () => {
    const offscreen = thumbnail(box(0, 5000, 100, 50));
    const view = setup(0, () => offscreen);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(offscreen.style.visibility).toBe("");
    await vi.waitFor(() => expect(view.onClose).toHaveBeenCalled());
    view.unmount();

    reduced = true;
    const thumb = thumbnail(box(0, 0, 100, 50));
    setup(0, () => thumb);
    expect(thumb.style.visibility).toBe("");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(thumb.style.visibility).toBe("");
  });
});

describe("Lightbox closing race", () => {
  it("does not call onClose if it was unmounted (e.g. by browser Back) mid-exit", async () => {
    hold = true;
    const { onClose, unmount } = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    unmount();
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onClose).not.toHaveBeenCalled();
  });
});
