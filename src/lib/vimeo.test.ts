import { describe, expect, it } from "vitest";
import { parseVimeoId } from "./vimeo";

describe("parseVimeoId", () => {
  it.each([
    ["123456789", "123456789"],
    ["https://vimeo.com/123456789", "123456789"],
    ["vimeo.com/123456789/abcdef1234", "123456789"],
    ["https://player.vimeo.com/video/76979871?h=abc", "76979871"],
    ["https://vimeo.com/channels/staffpicks/123456", "123456"],
  ])("parses %s", (input, id) => {
    expect(parseVimeoId(input)).toBe(id);
  });

  it.each(["", "https://youtube.com/watch?v=1", "vimeo.com/about"])("rejects %s", (input) => {
    expect(parseVimeoId(input)).toBeNull();
  });
});
