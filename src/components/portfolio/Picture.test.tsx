import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Picture } from "./Picture";

const image = { src: "/a.jpg", width: 300, height: 200, sources: [] };

afterEach(() => vi.restoreAllMocks());

const completeIs = (value: boolean) =>
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(value);

describe("Picture fadeIn", () => {
  it("hides a still-loading image, then reveals it once loaded", () => {
    completeIs(false);
    const { container } = render(<Picture image={image} alt="" sizes="100vw" fadeIn />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("data-loading");
    fireEvent.load(img);
    expect(img).not.toHaveAttribute("data-loading");
  });

  it("never hides an image that already loaded before hydration", () => {
    completeIs(true);
    const { container } = render(<Picture image={image} alt="" sizes="100vw" fadeIn />);
    expect(container.querySelector("img")).not.toHaveAttribute("data-loading");
  });

  it("does nothing without fadeIn", () => {
    completeIs(false);
    const { container } = render(<Picture image={image} alt="" sizes="100vw" />);
    expect(container.querySelector("img")).not.toHaveAttribute("data-loading");
  });

  it("keeps intrinsic dimensions on the img", () => {
    const { container } = render(<Picture image={image} alt="" sizes="100vw" />);
    expect(container.querySelector("img")).toMatchObject({ width: 300, height: 200 });
  });
});
