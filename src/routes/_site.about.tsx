import { createFileRoute } from "@tanstack/react-router";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Picture } from "@/components/portfolio/Picture";
import { getAbout } from "@/lib/content";

const title = "About — Christian Healy";
const description = "About Christian Healy, photographer and filmmaker.";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

const label = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground";
const link = "border-b border-foreground/30 pb-0.5 transition-colors hover:border-foreground";

function AboutPage() {
  const about = getAbout();
  return (
    <main className="mx-auto grid max-w-[1600px] gap-12 px-6 py-12 sm:px-12 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-20">
      {about.portrait && (
        <Parallax>
          <Picture
            image={about.portrait}
            alt="Portrait of Christian Healy"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="block h-auto w-full"
          />
        </Parallax>
      )}
      <div className="lg:pt-8">
        <p className={label}>About</p>
        <h1 className="mt-6 font-display text-5xl leading-tight sm:text-7xl">Christian Healy</h1>
        {/* about.md is authored in this repo, so its rendered HTML is trusted. */}
        <div
          className="prose-about mt-10 max-w-xl space-y-5 text-sm leading-7 text-muted-foreground [&_a]:underline [&_strong]:font-medium [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: about.bioHtml }}
        />
        {(about.email || about.instagram || about.vimeo) && (
          <Reveal className="mt-12">
            <p className={label}>Contact</p>
            <ul className="mt-4 space-y-3 text-sm">
              {about.email && (
                <li>
                  <a href={`mailto:${about.email}`} className={link}>
                    {about.email}
                  </a>
                </li>
              )}
              {about.instagram && (
                <li>
                  <a href={about.instagram} target="_blank" rel="noreferrer" className={link}>
                    Instagram
                  </a>
                </li>
              )}
              {about.vimeo && (
                <li>
                  <a href={about.vimeo} target="_blank" rel="noreferrer" className={link}>
                    Vimeo
                  </a>
                </li>
              )}
            </ul>
          </Reveal>
        )}
      </div>
    </main>
  );
}
