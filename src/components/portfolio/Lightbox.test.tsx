import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getStills } from "@/lib/content";
import { Lightbox } from "./Lightbox";

// Fixture stills: dunes, portrait (caption "Lisbon, 2025"), square, harbour.
const stills = getStills();

function setup(index = 0) {
  const onIndexChange = vi.fn();
  const onClose = vi.fn();
  render(
    <Lightbox stills={stills} index={index} onIndexChange={onIndexChange} onClose={onClose} />,
  );
  return { onIndexChange, onClose };
}

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

  it("closes on Escape and on the close button", async () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
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

  it("preloads the neighbouring photos", () => {
    setup(0);
    const preloaded = document.querySelectorAll("[data-preload] img");
    expect([...preloaded].map((img) => img.getAttribute("src"))).toEqual([
      stills[1]!.image.src,
      stills[3]!.image.src,
    ]);
  });

  it("locks page scroll while open", () => {
    setup();
    expect(document.body.style.overflow).toBe("hidden");
  });
});
