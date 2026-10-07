/** Alt text for a still: its caption, or the slug in words ("black-sand" → "black sand"). */
export const stillAlt = (still: { caption?: string; slug: string }) =>
  still.caption ?? still.slug.replace(/-/g, " ");
