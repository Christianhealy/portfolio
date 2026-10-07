// Server function: oEmbed runs on the server (cached per instance), so browsers never call
// Vimeo's API directly. Test builds swap ./oembed-fetch for an offline fixture.
import { createServerFn } from "@tanstack/react-start";
import oembedFetch from "./oembed-fetch";
import { createOEmbedClient, type VimeoMeta, type VimeoRef } from "./vimeo";

const client = createOEmbedClient(oembedFetch);

const isRef = (value: unknown): value is VimeoRef => {
  const ref = value as VimeoRef;
  return (
    typeof ref?.id === "string" &&
    /^\d+$/.test(ref.id) &&
    (ref.hash === undefined || /^[0-9a-z]+$/i.test(ref.hash))
  );
};

/** Keyed by Vimeo id; null when Vimeo couldn't be reached or doesn't know the video. */
export const getVimeoMeta = createServerFn({ method: "GET" })
  .validator((refs: VimeoRef[]) => refs.filter(isRef).slice(0, 100))
  .handler(async ({ data: refs }) => {
    const entries = await Promise.all(
      refs.map(async ({ id, hash }) => [id, await client.get(id, hash)] as const),
    );
    return Object.fromEntries(entries) as Record<string, VimeoMeta | null>;
  });
