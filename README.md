# Mazen Hassan — Four-Facet Portfolio

A single-page portfolio built around one idea: one person, four wavelengths.
Pick a facet — **Engineer**, **Analyst**, **Leader**, **Communicator** — and the whole
page retunes: accent colour, prism beams, which work rises to the top, and which
toolkit column is lit.

Ported from the Claude Design source (`Mazen Portfolio v2.dc.html`) to a plain
static site — no framework, no build step, no dependencies.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup and content structure |
| `styles.css` | All styling, design tokens under `:root` |
| `app.js` | Facet data + state, prism, reveals, cursor glow, terminal |

## Run locally

Any static server works:

```bash
npx --yes serve -l 4321 .
```

Then open http://localhost:4321.

## Deploy

The site is static — just publish the repo root.

**GitHub Pages** — push to GitHub, then Settings → Pages → Source: *GitHub Actions*.
The included workflow (`.github/workflows/deploy.yml`) publishes on every push to `main`.

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

**Netlify / Vercel / Cloudflare Pages** — connect the repo, leave the build command
empty and set the publish directory to `.`.

## Easter egg

The footer has a working terminal:

```
mazen --help
mazen --facet analyst
mazen --contact
```

## Editing content

Everything lives in `app.js`:

- `FACETS` — the four facets: label, colour, tagline, prism swing angle
- `WORK` — work cards; `facets` decides which facet each card rises for
- `JUGGLING` — the "currently juggling" strip
- `TOOLKIT` — skills per facet

Stats, education and contact details are plain markup in `index.html`.

## Accessibility

Tabs are real buttons with `role="tab"` / `aria-selected` and arrow-key navigation,
there is a skip link, and every animation is disabled under
`prefers-reduced-motion: reduce`. The page reads fine with JavaScript disabled
except for the facet-driven sections.
