# QA Report — Anis Zouari Portfolio

**Author:** Collaborator 3 (QA Engineer)
**Date:** 2026-10-22
**Build under test:** `index.html`, `css/styles.css`, `js/data.js`, `js/render.js`, `js/animations.js` (commit `114d033` + QA fixes)
**Oracle:** `TEAM_CONTRACT.md`

---

## 1. Test environment

| Item | Value |
|------|-------|
| Runtime target | `file://` double-click, no server, no build step |
| Static analysis | `node --check` (Node v22.19.0) on all three JS files |
| Functional harness | C2's headless DOM smoke test (`scratchpad/smoke.js`), run via Node `vm` against the real `data.js` + `render.js` |
| Methods | Static syntax check, contract-conformance diff, data-integrity cross-check, DOM-shim smoke run, and manual code-reading trace of animations/a11y/edge cases |
| Not covered | True pixel rendering, real `IntersectionObserver` timing, and visual contrast were reasoned from code, not measured in a live browser |

## 2. Scope

1. Static/syntax validation of JS.
2. Contract conformance — render-hook IDs, script load order, no hardcoded profile text in hook containers.
3. Data integrity — every `PORTFOLIO_DATA` item has a render path; facts match the source profile.
4. Functional review — counters, skill bars, scroll reveals, theme persistence, hamburger, reduced-motion.
5. Accessibility & responsiveness — landmarks, aria, keyboard, contrast, focus, 360px layout, `prefers-reduced-motion`, link `rel`/`target`, `mailto`.
6. Edge cases — empty/missing sections, dead nav anchors, XSS safety.

---

## 3. Results summary

| ID | Area | Severity | Status | Notes |
|----|------|----------|--------|-------|
| T-01 | Static: `node --check` data.js | — | **PASS** | No syntax errors. |
| T-02 | Static: `node --check` render.js | — | **PASS** | No syntax errors. |
| T-03 | Static: `node --check` animations.js | — | **PASS** | No syntax errors. |
| T-04 | Contract: 21 render-hook IDs exist in HTML | — | **PASS** | All 21 present; no duplicate IDs. |
| T-05 | Contract: every hook populated by render.js | — | **PASS** | Each hook reached via `byId`/`setText`; smoke test confirms population. |
| T-06 | Contract: script load order data → render → animations | — | **PASS** | Correct order at end of `<body>`. |
| T-07 | Contract: no hardcoded profile text in hook containers | — | **PASS** | Hook containers ship empty; filled only from data. |
| T-08 | Contract: `portfolio:rendered` dispatched | — | **PASS** | Dispatched after inject (with legacy `createEvent` fallback). |
| T-09 | Data integrity: name/role/ISTQB/LinkedIn/email facts | — | **PASS** | All match source (LinkedIn `anis-zr`, email `zouarii.anis@gmail.com`). |
| T-10 | Data integrity: every data item has a render path | Minor | **FAIL** | `contact.phone` has no render path and no contract hook (see B-04). |
| T-11 | Functional: counters animate to final value | — | **PASS** | easeOutCubic → `target.toFixed(decimals)+suffix`; smoke confirms `data-count`/`data-suffix`. |
| T-12 | Functional: skill bars fill to `data-level` | — | **PASS** | `fillBar` clamps 0–100 and sets width; smoke confirms level=95. |
| T-13 | Functional: scroll reveals fire | — | **PASS** | IO threshold 0.12 + staggered delay; binds on load and on `portfolio:rendered`. |
| T-14 | Functional: theme toggle persists | — | **PASS** | `localStorage("theme")`, stored > system; try/catch guarded. |
| T-15 | Functional: mobile hamburger | — | **PASS** | Toggles `is-open`, updates `aria-expanded`/label, closes on link/Escape/resize. |
| T-16 | Functional: reduced-motion honored | — | **PASS** | CSS kills transitions/animations; JS jumps counters/bars/reveals and skips pointer-FX + rotator. |
| T-17 | A11y: semantic landmarks + skip link | — | **PASS** | `header/nav/main/footer/section`, skip link, `lang="en"`. |
| T-18 | A11y: aria on toggle & hamburger | — | **PASS** | `aria-pressed`, `aria-expanded`, `aria-controls`, dynamic `aria-label`. |
| T-19 | A11y: external links `rel`/`target` | — | **PASS** | Socials get `target=_blank rel="noopener noreferrer"`; résumé `rel="noopener"`. |
| T-20 | A11y: `mailto` works | — | **PASS** | `contact-email` href set to `mailto:…` via allow-list. |
| T-21 | A11y: mobile nav focus when menu closed | Minor | **FAIL** | Closed menu uses opacity/transform only → links stay in tab order (see B-03). |
| T-22 | A11y: color contrast (`--text-faint` light mode) | Minor | **WARN** | `#6c769c` on `#f5f7fe` is borderline for small text; verify ≥4.5:1 (see B-05). |
| T-23 | Responsive: 360px → desktop | — | **PASS** | Breakpoints 920/760/560/380; single-column stacks; side gutters via clamp. |
| T-24 | Edge: empty/missing section handling | — | **PASS** | Sections hidden, not crashed; smoke confirms empty stats/skills hide. |
| T-25 | Edge: dead nav anchor if section hides | Minor | **WARN** | Static nav links not pruned when a data-driven section is hidden (see B-06). |
| T-26 | Security: XSS safety of injected data | — | **PASS** | `textContent`/`setAttribute` only; URL scheme allow-list; smoke confirms `javascript:` rejected. |
| T-27 | Contract: single-source — nav brand/title/meta | Minor | **FAIL** | Name hardcoded in nav brand + `<title>`/`<meta>` (see B-01, B-02). |
| T-28 | Cosmetic: theme-toggle icon positioning | Cosmetic | **FIXED** | Icons lacked a positioned containing block (see F-01). |
| T-29 | Cosmetic: dead `preconnect` to Google Fonts | Minor | **FIXED** | Removed; site is offline/no-CDN (see F-02). |
| T-30 | Cosmetic: theme FOUC on load | Cosmetic | **WARN** | HTML hardcodes `data-theme="dark"`; stored light theme applied only after JS (see B-07). |

**Totals:** 24 PASS · 3 FAIL (all Minor) · 4 WARN · 2 FIXED.

---

## 4. Bugs found

### Minor

- **B-01 — Name hardcoded in nav brand (single-source deviation).**
  `index.html` nav brand ships `<span class="nav__brand-text">Anis&nbsp;Zouari</span>` as static text. It is not a contract hook and `render.js` does not overwrite it, so editing `data.js` would **not** update the nav brand — a deviation from Hard Rule #1 ("Nobody hardcodes profile text into HTML"). *Not auto-fixed:* it crosses `render.js` ownership and is a (small) behavior change, not a one-attribute fix.
  **Recommended fix:** give the span `id="nav-brand-text"` and set it from `profile.name` in `renderHero` (mirror the existing best-effort `nav-initials` handling).

- **B-02 — Profile text hardcoded in `<title>`/`<meta description>`.** "Anis Zouari — QA Engineer" is hardcoded in `<head>`. Acceptable for SEO/first paint and hard to data-drive without head JS, but worth noting as another non-single-source copy to keep in sync with `data.js`.

- **B-03 — Mobile nav links remain keyboard-focusable while the menu is closed.** At ≤760px the closed `.nav__links` is hidden via `opacity:0` + `translateY(-120%)` + `pointer-events:none`, but is **not** `display:none`/`visibility:hidden`, so `Tab` still lands on off-screen links. *Not auto-fixed:* a naive `visibility:hidden` interacts with the slide-out transition; needs a transition-delayed `visibility` to preserve the close animation.
  **Recommended fix:** closed state `visibility:hidden; transition: transform .35s, opacity .3s, visibility 0s linear .35s;` and `.is-open { visibility:visible; transition-delay:0s; }`.

- **B-04 — `contact.phone` has no render path.** `data.js` carries `contact.phone: "21170120"` but no contract hook and no renderer consume it, so it is dead data (and the raw value, if ever surfaced, is not formatted as an international number). Decide: render it (new hook) or remove it from data.

- **B-05 — Light-mode faint-text contrast risk.** `--text-faint` `#6c769c` on light `--bg` `#f5f7fe` is used for small meta text (periods, labels, years). This is borderline against WCAG AA 4.5:1 for small text and should be measured in a browser; darken the token slightly if it fails.

- **B-06 — Static nav links are not pruned when a section is hidden.** If a data section is emptied, `render.js` hides the owning `<section>`, but the corresponding `.nav__link` stays in the header and would scroll to a `display:none` target (dead anchor). Not active today (all sections have data); flagged for the data-driven future the contract promises.

### Cosmetic

- **B-07 — Possible theme flash (FOUC).** `<html data-theme="dark">` is hardcoded; the real theme (which may be `light` from `localStorage`/system) is applied by `animations.js`, which loads at the end of `<body>`. A user whose stored/preferred theme is light can see a brief dark flash. *Recommended fix:* a tiny inline `<head>` script that reads `localStorage.theme` and sets `data-theme` before paint.

### Critical / Major

None found.

---

## 5. Fixes applied

| ID | File | Change | Rationale |
|----|------|--------|-----------|
| **F-01** | `css/styles.css` | Added `position: relative;` to `.theme-toggle`. | The two `.theme-toggle__icon` SVGs are `position:absolute`; with no positioned ancestor on the button their containing block resolved to the sticky `.nav`, so grid `place-items:center` could not center them. One-line, intent-preserving fix. |
| **F-02** | `index.html` | Removed dead `<link rel="preconnect" href="https://fonts.googleapis.com">`. | No Google Fonts stylesheet is ever loaded ("Inter" correctly falls back to the system stack per the offline/no-CDN rule), so the hint connected to nothing and was the only stray external reference. |

Both fixes were re-validated: `node --check` on all three JS files still passes and the full smoke suite (counters, bars, `is-current`, empty-section hide, URL allow-list) still passes.

---

## 6. Strengths worth recording

- **Security:** renderer writes only via `textContent`/`setAttribute`, never `innerHTML`; a scheme allow-list blocks `javascript:`/`data:`/`vbscript:` URLs — verified by smoke test. Excellent for a QA's own site.
- **Resilience:** each section renders in an isolated `try/catch`; missing/empty data hides sections instead of crashing.
- **Accessibility baseline:** skip link, semantic landmarks, dynamic aria on interactive controls, focus-visible rings, and a thorough `prefers-reduced-motion` story in both CSS and JS.
- **Re-bindable animations:** idempotent init guards + `portfolio:rendered` event mean dynamically injected nodes are picked up without double-binding.

---

## 7. Verdict

### PASS WITH NOTES

The build meets every "Done =" criterion in the contract: it runs from `file://` with no console errors, all sections are data-driven with zero hardcoded profile text in the render-hook containers, animations are smooth and reduced-motion-safe, the layout is responsive to 360px, and injected data is XSS-safe. **No Critical or Major defects.** The 3 Minor FAILs (single-source leakage in nav/head, mobile focus order, unused `phone`) and 4 WARNs are quality/maintainability items the team should schedule, but none block release. Two low-risk fixes were applied directly.

**Issue count:** Critical 0 · Major 0 · Minor 6 · Cosmetic 2 · (2 fixes applied).
