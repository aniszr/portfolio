# Portfolio — Team Contract

**Project:** Modern, animated, interactive portfolio for **Anis Zouari** (QA Engineer).
**Lead:** orchestration + data layer + contract (this file).
**Goal:** Impress visitors with modern animation & interactivity. Content is 100% data-driven.

## Hard rules (do not break the contract)

1. **Single source of content** is [js/data.js](js/data.js) — a `PORTFOLIO_DATA` object
   exposed on `window`. Nobody hardcodes profile text into HTML. Editing `data.js` is the
   only step needed to add/update/remove content later.
2. **No build step, no frameworks, no network fetch.** Pure HTML/CSS/vanilla JS. The site
   must work by double-clicking `index.html` from `file://` (so NO `fetch()` of JSON — data
   is already a JS object, which is why it lives in `js/data.js`).
3. **External libs:** none required. If you want icons, use inline SVG. No CDN dependency
   that would break offline.
4. **Load order in `index.html`** (bottom of `<body>`):
   `js/data.js` → `js/render.js` → `js/animations.js`.

## File ownership

| File | Owner | Purpose |
|------|-------|---------|
| `js/data.js` | Lead | Content data object (DONE). |
| `index.html` | Collaborator 1 | Semantic structure + render hooks (IDs below). |
| `css/styles.css` | Collaborator 1 | Design system, layout, responsive, animations. |
| `js/animations.js` | Collaborator 1 | Scroll reveals, counters, cursor/parallax, nav, theme. |
| `js/render.js` | Collaborator 2 | Reads `PORTFOLIO_DATA`, injects into render hooks. |
| `QA_REPORT.md` | Collaborator 3 | Test report + any fixes applied. |

## Render-hook convention (Collaborator 1 creates, Collaborator 2 fills)

`index.html` must contain these empty containers with EXACT ids. `render.js` populates them.

- Hero: `#hero-name`, `#hero-role`, `#hero-title`, `#hero-tagline`, `#hero-location`,
  `#hero-availability`, `#hero-initials`, `#hero-resume` (an `<a>` whose `href` is set to resume).
- Stats: `#stats-container` (renderer appends one stat card per `stats[]`, each with a
  counter element carrying `data-count="<value>"` so `animations.js` can animate it).
- About: `#about-headline`, `#about-paragraphs`, `#about-highlights`.
- Skills: `#skills-container` (one group per `skills[]`; each item should expose a bar element
  with `data-level="<n>"` so `animations.js` animates width on reveal).
- Experience: `#experience-timeline` (one entry per `experience[]`).
- Education: `#education-list`.
- Certifications: `#certifications-container`.
- Contact: `#contact-email` (`<a>` mailto), `#contact-location`, `#contact-socials`.
- Footer year: `#footer-year`, name echo `#footer-name`.

### Animation data-attributes convention (shared by C1 & C2)

- Scroll reveal: any element with `data-reveal` (optionally `data-reveal-delay="120"`).
- Counter: element with `data-count="<number>"` (+ optional `data-suffix`).
- Skill bar fill element: `data-level="<0-100>"`.

Renderer MUST add these attributes to the nodes it creates so animations pick them up.
`render.js` dispatches `document.dispatchEvent(new CustomEvent('portfolio:rendered'))`
after injecting everything, so `animations.js` can (re)bind to dynamic nodes.

## Done =
- Opens from `file://`, no console errors.
- All sections populated from data, zero hardcoded profile text in HTML.
- Smooth modern animations, responsive 360px → desktop, accessible (keyboard + reduced-motion).
