import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Parallax } from "./Parallax";
import { parallaxShift } from "./parallaxShift";

let reduced = false;
vi.mock("./useMotionPrefs", () => ({
  useMotionPrefs: () => ({ reduced, smoothScroll: false }),
}));

describe("parallaxShift", () => {
  it("travels from +6% to -6% as the element crosses the viewport, and never further", () => {
    expect(parallaxShift(0)).toBe("6%");
    expect(parallaxShift(0.5)).toBe("0%");
    expect(parallaxShift(1)).toBe("-6%");
    expect(parallaxShift(-1)).toBe("6%");
    expect(parallaxShift(2)).toBe("-6%");
  });
});

describe("Parallax", () => {
  it("moves its content when motion is allowed", () => {
    reduced = false;
    render(<Parallax>content</Parallax>);
    expect(screen.getByText("content").closest("[data-parallax]")).not.toBeNull();
  });

  it("renders content static under reduced motion", () => {
    reduced = true;
    render(<Parallax>content</Parallax>);
    expect(screen.getByText("content").closest("[data-parallax]")).toBeNull();
  });
});
