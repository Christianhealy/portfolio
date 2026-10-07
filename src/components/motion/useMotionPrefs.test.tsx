import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMotionPrefs } from "./useMotionPrefs";

type Listener = () => void;

// Minimal controllable matchMedia: `media` maps a query to whether it matches.
function mockMatchMedia(media: Record<string, boolean>) {
  const listeners = new Set<Listener>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return media[query] ?? false;
    },
    media: query,
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  }));
  return {
    set(query: string, value: boolean) {
      media[query] = value;
      act(() => listeners.forEach((listener) => listener()));
    },
  };
}

const REDUCE = "(prefers-reduced-motion: reduce)";
const FINE = "(hover: hover) and (pointer: fine)";

afterEach(() => vi.unstubAllGlobals());

describe("useMotionPrefs", () => {
  it("enables full motion and smooth scroll on a desktop with no preference", () => {
    mockMatchMedia({ [REDUCE]: false, [FINE]: true });
    const { result } = renderHook(() => useMotionPrefs());
    expect(result.current).toEqual({ reduced: false, smoothScroll: true });
  });

  it("never smooth-scrolls on touch devices", () => {
    mockMatchMedia({ [REDUCE]: false, [FINE]: false });
    expect(renderHook(() => useMotionPrefs()).result.current.smoothScroll).toBe(false);
  });

  it("turns everything off when reduced motion is requested, and follows changes", () => {
    const media = mockMatchMedia({ [REDUCE]: true, [FINE]: true });
    const { result } = renderHook(() => useMotionPrefs());
    expect(result.current).toEqual({ reduced: true, smoothScroll: false });
    media.set(REDUCE, false);
    expect(result.current).toEqual({ reduced: false, smoothScroll: true });
  });
});
