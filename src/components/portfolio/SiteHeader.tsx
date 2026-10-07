import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useScrollChrome } from "./useScrollChrome";

const links = [
  { to: "/stills", label: "Stills" },
  { to: "/film", label: "Film" },
  { to: "/about", label: "About" },
] as const;

const label = "text-[11px] uppercase tracking-[0.22em]";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { hidden, scrolled } = useScrollChrome();

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <header
      data-hidden={hidden && !open ? "" : undefined}
      className="site-header fixed inset-x-0 top-0 z-40"
    >
      <div
        aria-hidden="true"
        className="site-header-blur absolute inset-0 bg-background/80 backdrop-blur-md"
        data-visible={scrolled ? "" : undefined}
      />
      <div className="relative z-10 mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 sm:h-20 sm:px-12">
        <Link
          to="/stills"
          onClick={() => setOpen(false)}
          className="font-display text-xl tracking-[0.02em] transition-opacity hover:opacity-60 sm:text-2xl"
        >
          Christian Healy
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className={`${label} transition-colors hover:text-foreground`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`${label} relative z-10 sm:hidden`}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Primary"
          data-lenis-prevent=""
          className="fixed inset-0 flex flex-col justify-center gap-6 bg-background px-6 sm:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="font-display text-6xl transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
