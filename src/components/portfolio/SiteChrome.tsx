import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/work" as const, label: "Work" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export function SiteChrome({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-40 mx-auto max-w-[1600px] px-6 pt-7 sm:px-12 sm:pt-10">
        <div className="flex min-h-14 items-center justify-between border-b border-border/60 pb-5">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="font-display text-xl uppercase tracking-[0.16em] transition-opacity hover:opacity-70 sm:text-2xl"
          >
            Christian Healy
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-8 sm:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="text-[11px] uppercase tracking-[0.22em] transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="sm:hidden"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>

        {open && (
          <nav
            aria-label="Mobile navigation"
            className="absolute inset-x-6 top-full border-b border-border bg-background py-8 sm:hidden"
          >
            <div className="flex flex-col gap-6">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "text-foreground" }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  className="font-display text-4xl uppercase transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {children}

      <footer className="mx-auto max-w-[1600px] border-t border-border/60 px-6 py-12 sm:px-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link to="/" className="font-display text-base uppercase tracking-[0.16em]">
            Christian Healy
          </Link>
          <a
            href="mailto:hello@ateliernoir.studio"
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            hello@ateliernoir.studio
          </a>
        </div>
      </footer>
    </div>
  );
}