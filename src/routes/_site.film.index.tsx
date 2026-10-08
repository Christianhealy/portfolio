import { createFileRoute } from "@tanstack/react-router";
import { FilmTile } from "@/components/portfolio/FilmTile";
import { getFilms } from "@/lib/content";
import { getVimeoMeta } from "@/lib/vimeo-meta";

const title = "Film — Christian Healy";
const description = "Films by Christian Healy.";

export const Route = createFileRoute("/_site/film/")({
  loader: () => getVimeoMeta(),
  staleTime: 10 * 60 * 1000,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FilmPage,
});

function FilmPage() {
  const meta = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-[1600px] px-6 pb-16 pt-8 sm:px-12 sm:pt-12">
      <h1 className="sr-only">Film</h1>
      <div className="film-grid grid gap-x-6 gap-y-14 md:grid-cols-2">
        {getFilms().map((film) => (
          <FilmTile key={film.slug} film={film} meta={meta[film.vimeoId] ?? null} />
        ))}
      </div>
    </main>
  );
}
