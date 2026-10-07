// Server function: oEmbed runs on the server (cached per instance), so browsers never call
// Vimeo's API directly. Test builds swap ./oembed-fetch for an offline fixture.
import { createServerFn } from "@tanstack/react-start";
import oembedFetch from "./oembed-fetch";
import { createOEmbedClient, type VimeoMeta } from "./vimeo";

const client = createOEmbedClient(oembedFetch);

export const getVimeoMeta = createServerFn({ method: "GET" })
  .validator((ids: string[]) => ids.filter((id) => /^\d+$/.test(id)).slice(0, 100))
  .handler(async ({ data: ids }) => {
    const entries = await Promise.all(ids.map(async (id) => [id, await client.get(id)] as const));
    return Object.fromEntries(entries) as Record<string, VimeoMeta | null>;
  });
