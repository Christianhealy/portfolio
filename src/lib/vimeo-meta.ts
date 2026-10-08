// Server function: oEmbed runs on the server (cached per instance), so browsers never call
// Vimeo's API directly. Test builds swap ./oembed-fetch for an offline fixture.
// It takes no input: the films come from the site's own content, so callers can't make the
// server fetch (or cache) arbitrary videos.
import { createServerFn } from "@tanstack/react-start";
import { getFilms } from "./content";
import oembedFetch from "./oembed-fetch";
import { createOEmbedClient, lookupFilmMeta } from "./vimeo";

const client = createOEmbedClient(oembedFetch);

/** Keyed by Vimeo id; null when Vimeo couldn't be reached or doesn't know the video. */
export const getVimeoMeta = createServerFn({ method: "GET" }).handler(() =>
  lookupFilmMeta(client, getFilms()),
);
