# Carden Katz–inspired navigation

## Goal
Adapt the reference site's simple portfolio hierarchy—brand at left, `WORK`, `ABOUT`, and `CONTACT` at right—while preserving Atelier Noir’s dark editorial identity.

## Changes
- Add a shared navigation bar across the site with `ATELIER NOIR`, `WORK`, `ABOUT`, and `CONTACT`.
- Keep the gallery as the Work destination and make the logo return home.
- Add dedicated About and Contact pages so every menu item has a real, shareable destination.
- Use a compact mobile menu at smaller widths with clear open/close controls.
- Move shared footer/navigation presentation out of the gallery page so all pages stay consistent.
- Give each new page distinct page titles and social descriptions.

## Technical details
- Use TanStack Router links and separate `/work`, `/about`, and `/contact` routes.
- Preserve `/` as the portfolio’s opening page and avoid duplicating gallery data or behavior.
- Reuse the existing semantic colors, typography, and restrained transitions.
- Verify desktop and mobile navigation, active states, and every destination in the running preview.
