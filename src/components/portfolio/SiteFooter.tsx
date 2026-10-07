import { getAbout } from "@/lib/content";

const label =
  "text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground";

export function SiteFooter() {
  const { email, instagram } = getAbout();
  return (
    <footer className="mx-auto w-full max-w-[1600px] px-6 py-12 sm:px-12">
      <div className="flex flex-col justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
        <span className="font-display text-base">Christian Healy</span>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {email && (
            <a href={`mailto:${email}`} className={label}>
              {email}
            </a>
          )}
          {instagram && (
            <a href={instagram} target="_blank" rel="noreferrer" className={label}>
              Instagram
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
