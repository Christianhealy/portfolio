import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getFilm, getFilms } from "@/lib/content";
import { getVimeoMeta } from "@/lib/vimeo-meta";
import { filmRefs, filmTitle, vimeoPlayerUrl } from "@/lib/vimeo";

const label = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

export const Route = createFileRoute("/_site/film/$slug")({
  loader: async ({ params }) => {
    if (!getFilm(params.slug)) throw notFound();
    // Neighbours' titles may come from Vimeo too; lookups are cached server-side.
    return getVimeoMeta({ data: filmRefs(getFilms()) });
  },
  staleTime: 10 * 60 * 1000,
  head: ({ params, loaderData }) => {
    const film = getFilm(params.slug);
    if (!film) return {};
    const title = `${filmTitle(film, loaderData?.[film.vimeoId] ?? null)} — Christian Healy`;
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        ...(film.description ? [{ name: "description", content: film.description }] : []),
      ],
    };
  },
  component: FilmDetail,
});

function FilmDetail() {
  const { slug } = Route.useParams();
  const meta = Route.useLoaderData();
  const films = getFilms();
  const index = films.findIndex((f) => f.slug === slug);
  const film = films[index]!;
  const titleOf = (f: typeof film) => filmTitle(f, meta[f.vimeoId] ?? null);
  const title = titleOf(film);
  const prev = films.length > 1 ? films[(index - 1 + films.length) % films.length] : undefined;
  const next = films.length > 1 ? films[(index + 1) % films.length] : undefined;

  return (
    <main className="mx-auto max-w-[1600px] px-6 pb-16 pt-8 sm:px-12 sm:pt-12">
      <div className="aspect-video w-full bg-foreground">
        <iframe
          src={vimeoPlayerUrl({
            id: film.vimeoId,
            ...(film.vimeoHash ? { hash: film.vimeoHash } : {}),
          })}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
        />
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-[2fr_1fr]">
        <section>
          <p className={label}>{[film.client, film.year].filter(Boolean).join(" · ") || "Film"}</p>
          <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{title}</h1>
          {film.description && (
            <div className="mt-8 max-w-2xl space-y-4 text-sm leading-7 text-muted-foreground">
              {film.description.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
        </section>
        {film.credits.length > 0 && (
          <section>
            <h2 className={label}>Credits</h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {film.credits.map((credit, i) => (
                <div key={i} className="contents">
                  <dt className="text-muted-foreground">{credit.role}</dt>
                  <dd>{credit.name}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      {prev && next && (
        <nav
          aria-label="More films"
          className="mt-20 flex justify-between gap-6 border-t border-border/60 pt-6"
        >
          <Link to="/film/$slug" params={{ slug: prev.slug }} className="group">
            <span className={label}>Previous</span>
            <span className="mt-1 block font-display text-xl group-hover:opacity-60">
              {titleOf(prev)}
            </span>
          </Link>
          <Link to="/film/$slug" params={{ slug: next.slug }} className="group text-right">
            <span className={label}>Next</span>
            <span className="mt-1 block font-display text-xl group-hover:opacity-60">
              {titleOf(next)}
            </span>
          </Link>
        </nav>
      )}
    </main>
  );
}
