// Route changes use the browser's View Transitions API (via TanStack Router's
// defaultViewTransition). The animations themselves live in styles.css, keyed by these types.

interface LocationChange {
  fromLocation?: { pathname: string };
  toLocation: { pathname: string };
  pathChanged: boolean;
}

export function pageTransitionTypes({ fromLocation, pathChanged }: LocationChange) {
  if (!fromLocation || !pathChanged) return false;
  return fromLocation.pathname === "/" ? ["from-splash"] : ["page"];
}
