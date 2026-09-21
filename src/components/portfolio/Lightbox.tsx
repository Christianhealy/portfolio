import { useEffect } from "react";
import { X } from "lucide-react";
import { embedUrl, type PortfolioItem } from "./media";

export function Lightbox({
  item,
  onClose,
}: {
  item: PortfolioItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="lightbox-backdrop fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-14 sm:px-10"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 rounded-full border border-border/60 p-2.5 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="lightbox-panel flex max-h-full w-full max-w-6xl flex-col items-center gap-5"
      >
        {item.type === "image" ? (
          <img
            src={item.mediaUrl}
            alt={item.title}
            className="max-h-[78vh] w-auto max-w-full object-contain"
          />
        ) : (
          <div className="aspect-video w-full bg-card">
            <iframe
              src={embedUrl(item.mediaUrl)}
              title={item.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="size-full border-0"
            />
          </div>
        )}
        <div className="text-center">
          <h2 className="font-display text-xl tracking-wide text-foreground">{item.title}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {item.category}
          </p>
        </div>
      </div>
    </div>
  );
}
