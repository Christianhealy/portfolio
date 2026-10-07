import { describe, expect, it } from "vitest";
import { pageTransitionTypes } from "./pageTransition";

const at = (pathname: string) => ({ pathname });

describe("pageTransitionTypes", () => {
  it("crossfades between pages", () => {
    expect(
      pageTransitionTypes({
        fromLocation: at("/stills"),
        toLocation: at("/film"),
        pathChanged: true,
      }),
    ).toEqual(["page"]);
  });

  it("uses the zoom exit when leaving the splash", () => {
    expect(
      pageTransitionTypes({ fromLocation: at("/"), toLocation: at("/stills"), pathChanged: true }),
    ).toEqual(["from-splash"]);
  });

  it("does not animate search-only changes such as opening a photo", () => {
    expect(
      pageTransitionTypes({
        fromLocation: at("/stills"),
        toLocation: at("/stills"),
        pathChanged: false,
      }),
    ).toBe(false);
  });

  it("does not animate the very first render", () => {
    expect(pageTransitionTypes({ toLocation: at("/stills"), pathChanged: true })).toBe(false);
  });
});
