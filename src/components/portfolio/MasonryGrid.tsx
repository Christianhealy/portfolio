import type { Still } from "@/lib/content";
import { distribute } from "./masonry";
import { stillAlt } from "./alt";
import { Picture } from "./Picture";

// One layout per breakpoint, computed from intrinsic sizes so server and browser agree and
// nothing shifts. Hidden layouts are display:none, so their lazy images never load and they
// stay out of the accessibility tree.
const LAYOUTS = [
  { columns: 1, className: "flex sm:hidden" },
  { columns: 2, className: "hidden sm:flex lg:hidden" },
  { columns: 3, className: "hidden lg:flex" },
];
const SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

interface Props {
  stills: Still[];
  onOpen: (index: number) => void;
}

export function MasonryGrid({ stills, onOpen }: Props) {
  const heights = stills.map((s) => s.image.height / s.image.width);
  return (
    <>
      {LAYOUTS.map(({ columns, className }) => (
        <div key={columns} className={`${className} items-start gap-4 sm:gap-6`}>
          {distribute(heights, columns).map((column, c) => (
            <div key={c} className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
              {column.map((index) => {
                const still = stills[index]!;
                return (
                  <button
                    key={still.slug}
                    type="button"
                    data-slug={still.slug}
                    aria-label={`Open ${stillAlt(still)}`}
                    onClick={() => onOpen(index)}
                    className="block w-full cursor-zoom-in bg-card"
                  >
                    <Picture
                      image={still.image}
                      alt={stillAlt(still)}
                      sizes={SIZES}
                      loading={index < columns ? "eager" : "lazy"}
                      className="block h-auto w-full"
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
