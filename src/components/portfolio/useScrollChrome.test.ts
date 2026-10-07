import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useScrollChrome } from "./useScrollChrome";

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("useScrollChrome", () => {
  it("starts shown and unblurred at the top", () => {
    scrollTo(0);
    const { result } = renderHook(() => useScrollChrome());
    expect(result.current).toEqual({ hidden: false, scrolled: false });
  });

  it("hides when scrolling down past the header, shows again on scroll up", () => {
    scrollTo(0);
    const { result } = renderHook(() => useScrollChrome());
    scrollTo(400);
    expect(result.current).toEqual({ hidden: true, scrolled: true });
    scrollTo(380);
    expect(result.current).toEqual({ hidden: false, scrolled: true });
  });

  it("ignores tiny jitters and never hides near the top", () => {
    scrollTo(0);
    const { result } = renderHook(() => useScrollChrome());
    scrollTo(40);
    expect(result.current.hidden).toBe(false);
    scrollTo(400);
    scrollTo(397);
    expect(result.current.hidden).toBe(true);
  });
});
