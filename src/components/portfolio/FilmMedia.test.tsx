import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FilmImage } from "@/lib/vimeo";
import { FilmMedia } from "./FilmMedia";

let reduced = false;
vi.mock("@/components/motion/useMotionPrefs", () => ({
  useMotionPrefs: () => ({ reduced, smoothScroll: false }),
}));

let observer: { callback: IntersectionObserverCallback; target?: Element } | undefined;
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeEach(() => {
  reduced = false;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        observer = { callback };
      }
      observe(target: Element) {
        observer!.target = target;
      }
      disconnect() {}
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  play.mockClear();
  pause.mockClear();
});

const poster: FilmImage = {
  kind: "poster",
  image: { src: "/poster.jpg", width: 1600, height: 900, sources: [] },
};
const thumbnail: FilmImage = { kind: "thumbnail", src: "/thumb.jpg", width: 1280, height: 720 };

const intersect = (isIntersecting: boolean) =>
  act(() =>
    observer!.callback(
      [{ isIntersecting, target: observer!.target! } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );

describe("FilmMedia", () => {
  it("shows the local poster", () => {
    const { container } = render(<FilmMedia image={poster} title="Spring" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/poster.jpg");
  });

  it("shows the Vimeo thumbnail when there is no poster", () => {
    const { container } = render(<FilmMedia image={thumbnail} title="Spring" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/thumb.jpg");
  });

  it("falls back to a typographic card", () => {
    const { container } = render(<FilmMedia image={{ kind: "card" }} title="Spring" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Spring")).toBeInTheDocument();
  });

  it("upgrades to a silent loop that only plays while on screen", () => {
    const { container } = render(<FilmMedia image={poster} title="Spring" loop="/loop.mp4" />);
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("src", "/loop.mp4");
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("poster", "/poster.jpg");
    intersect(true);
    expect(play).toHaveBeenCalledTimes(1);
    intersect(false);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("shows only the poster under reduced motion", () => {
    reduced = true;
    const { container } = render(<FilmMedia image={poster} title="Spring" loop="/loop.mp4" />);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", "/poster.jpg");
  });
});
