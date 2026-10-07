import { Link } from "@tanstack/react-router";
import type { FilmEntry } from "@/lib/content";
import { filmImage, filmTitle, type VimeoMeta } from "@/lib/vimeo";
import { Parallax } from "@/components/motion/Parallax";
import { FilmMedia } from "./FilmMedia";

export function FilmTile({ film, meta }: { film: FilmEntry; meta: VimeoMeta | null }) {
  const title = filmTitle(film, meta);
  return (
    <Link to="/film/$slug" params={{ slug: film.slug }} className="film-tile group block">
      <Parallax>
        <FilmMedia
          image={filmImage(film, meta)}
          title={title}
          {...(film.loop ? { loop: film.loop } : {})}
        />
      </Parallax>
      <div className="film-tile-caption mt-4 flex items-baseline gap-3">
        {film.client && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {film.client}
          </span>
        )}
        <span className="font-display text-xl">{title}</span>
      </div>
    </Link>
  );
}
