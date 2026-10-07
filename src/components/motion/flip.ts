// FLIP helpers for the lightbox's shared-layout zoom: animate the full-size image from the
// thumbnail's box to its own (and back). Both boxes share an aspect ratio (never cropped),
// so a uniform scale is exact.

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

/** Transform (around the centre) that places `target` exactly over `from`. */
export function flipFrom(from: Box, target: Box): { x: number; y: number; scale: number } {
  return {
    x: from.left + from.width / 2 - (target.left + target.width / 2),
    y: from.top + from.height / 2 - (target.top + target.height / 2),
    scale: target.width ? from.width / target.width : 1,
  };
}

export function isOnScreen(box: Box, viewportWidth: number, viewportHeight: number): boolean {
  return (
    box.width > 0 &&
    box.height > 0 &&
    box.bottom > 0 &&
    box.right > 0 &&
    box.top < viewportHeight &&
    box.left < viewportWidth
  );
}
