/* =============================================================================
   render.js  —  Collaborator 2  (dynamic data layer / renderer)
   -----------------------------------------------------------------------------
   Reads window.PORTFOLIO_DATA and injects every section into the render-hook
   IDs defined in TEAM_CONTRACT.md. Pure vanilla JS, no libraries, no fetch.

   Defensive by design (this is a QA's portfolio):
     - Every value is injected via textContent / createElement + setAttribute.
       NO raw HTML from data is ever written to innerHTML.
     - URLs are passed through a scheme allow-list (http/https/mailto/tel +
       relative) so a hostile string can never become javascript:.
     - Missing / empty sections are skipped gracefully: the owning <section>
       (or the individual node) is hidden instead of crashing or rendering
       half-built markup.

   Adds the shared animation data-attributes so animations.js can bind:
     - data-reveal / data-reveal-delay on cards & entries
     - data-count / data-suffix on stat numbers
     - data-level on skill-bar fills
   After injecting, dispatches `portfolio:rendered` so animations.js re-binds.
============================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------- helpers ---- */

  function byId(id) {
    return document.getElementById(id);
  }

  /** Create an element with optional class and text. */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== "") node.textContent = String(text);
    return node;
  }

  /** Set textContent of a hook by id; hide the node if value is empty. */
  function setText(id, value) {
    var node = byId(id);
    if (!node) return null;
    if (value == null || String(value).trim() === "") {
      node.hidden = true;
      return node;
    }
    node.hidden = false;
    node.textContent = String(value);
    return node;
  }

  /** Hide the nearest owning <section> (or the node itself) for an empty hook. */
  function hideSection(node) {
    if (!node) return;
    var section = node.closest ? node.closest("section") : null;
    (section || node).hidden = true;
  }

  /** Replace all children of a node. */
  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  /** Non-empty array guard. */
  function hasItems(arr) {
    return Array.isArray(arr) && arr.length > 0;
  }

  /**
   * Allow-list URL sanitiser. Permits http(s), mailto, tel and relative paths.
   * Returns null for anything else (e.g. javascript:, data:, vbscript:).
   */
  function safeUrl(url) {
    if (typeof url !== "string") return null;
    var u = url.trim();
    if (!u) return null;
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    // Any other explicit scheme ("name:") is rejected.
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return null;
    return u; // relative path / fragment
  }

  /** Staggered reveal delay (ms), capped so late items don't lag too long. */
  function stagger(i) {
    return Math.min(i * 80, 480);
  }

  /** Tag a node for the shared scroll-reveal animation. */
  function reveal(node, delay) {
    node.setAttribute("data-reveal", "");
    if (delay) node.setAttribute("data-reveal-delay", String(delay));
    return node;
  }

  /* --------------------------------------------------------------- HERO --- */

  function renderHero(profile) {
    profile = profile || {};

    setText("hero-availability", profile.availability);
    setText("hero-name", profile.name);
    setText("hero-role", profile.role);
    setText("hero-title", profile.title);
    setText("hero-tagline", profile.tagline);
    setText("hero-location", profile.location);
    setText("hero-initials", profile.initials);

    // Nav brand mark is also data-driven (keeps the contract's "no hardcoded
    // profile text" rule honest). Not a contract hook, so best-effort only.
    if (profile.initials) {
      var navMark = byId("nav-initials");
      if (navMark) navMark.textContent = profile.initials;
    }
    if (profile.name) {
      var navBrand = byId("nav-brand-text");
      if (navBrand) navBrand.textContent = profile.name;
    }

    // Document title + meta description are also data-driven (single source).
    if (profile.name) {
      var titleText = profile.name + (profile.role ? " — " + profile.role : "");
      if (document.title !== undefined) document.title = titleText;
    }
    if (typeof document.querySelector === "function") {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && (profile.tagline || profile.title)) {
        metaDesc.setAttribute("content", profile.tagline || profile.title);
      }
    }

    // Résumé link: set href from data, keep C1's label/icon children intact.
    var resume = byId("hero-resume");
    if (resume) {
      var href = safeUrl(profile.resumeUrl);
      if (href) {
        resume.setAttribute("href", href);
      } else {
        resume.hidden = true; // no valid résumé URL -> hide the button
      }
    }
  }

  /* -------------------------------------------------------------- STATS --- */

  function renderStats(stats) {
    var container = byId("stats-container");
    if (!container) return;
    clear(container);

    if (!hasItems(stats)) {
      hideSection(container);
      return;
    }

    stats.forEach(function (stat, i) {
      stat = stat || {};
      var card = reveal(el("div", "stat-card"), stagger(i));

      var suffix = stat.suffix != null ? String(stat.suffix) : "";
      var value = el("div", "stat-card__value");
      var numeric = Number(stat.value);
      // Counter hook for animations.js (data-count must be numeric).
      if (isFinite(numeric)) {
        value.setAttribute("data-count", String(numeric));
        if (suffix) value.setAttribute("data-suffix", suffix);
        value.textContent = "0" + suffix; // pre-animation placeholder
      } else {
        // Non-numeric value: show it verbatim, no counter.
        value.textContent = (stat.value != null ? String(stat.value) : "") + suffix;
      }
      card.appendChild(value);

      if (stat.label) card.appendChild(el("div", "stat-card__label", stat.label));

      container.appendChild(card);
    });
  }

  /* -------------------------------------------------------------- ABOUT --- */

  function renderAbout(about) {
    about = about || {};

    setText("about-headline", about.headline);

    var paras = byId("about-paragraphs");
    if (paras) {
      clear(paras);
      if (hasItems(about.paragraphs)) {
        about.paragraphs.forEach(function (text) {
          if (text != null && String(text).trim() !== "") {
            paras.appendChild(el("p", null, text));
          }
        });
      } else {
        paras.hidden = true;
      }
    }

    var highlights = byId("about-highlights");
    if (highlights) {
      clear(highlights);
      if (hasItems(about.highlights)) {
        about.highlights.forEach(function (text) {
          if (text != null && String(text).trim() !== "") {
            highlights.appendChild(el("li", null, text));
          }
        });
      } else {
        highlights.hidden = true;
      }
    }

    // Hide the whole About section only if there is genuinely nothing to show.
    if (
      !about.headline &&
      !hasItems(about.paragraphs) &&
      !hasItems(about.highlights)
    ) {
      hideSection(byId("about-headline") || paras || highlights);
    }
  }

  /* ------------------------------------------------------------- SKILLS --- */

  function renderSkills(skills) {
    var container = byId("skills-container");
    if (!container) return;
    clear(container);

    if (!hasItems(skills)) {
      hideSection(container);
      return;
    }

    skills.forEach(function (group, i) {
      group = group || {};
      var groupEl = reveal(el("div", "skill-group"), stagger(i));

      if (group.category) {
        groupEl.appendChild(el("h3", "skill-group__title", group.category));
      }

      if (hasItems(group.items)) {
        group.items.forEach(function (item) {
          item = item || {};
          var skill = el("div", "skill");

          var head = el("div", "skill__head");
          head.appendChild(el("span", "skill__name", item.name || ""));

          var lvl = Number(item.level);
          if (!isFinite(lvl)) lvl = 0;
          lvl = Math.max(0, Math.min(100, lvl));
          head.appendChild(el("span", "skill__pct", lvl + "%"));
          skill.appendChild(head);

          var track = el("div", "skill__track");
          var bar = el("div", "skill__bar");
          // Fill hook for animations.js (it animates width from 0 -> level%).
          bar.setAttribute("data-level", String(lvl));
          track.appendChild(bar);
          skill.appendChild(track);

          groupEl.appendChild(skill);
        });
      }

      container.appendChild(groupEl);
    });
  }

  /* --------------------------------------------------------- EXPERIENCE --- */

  function renderExperience(experience) {
    var container = byId("experience-timeline");
    if (!container) return;
    clear(container);

    if (!hasItems(experience)) {
      hideSection(container);
      return;
    }

    experience.forEach(function (job, i) {
      job = job || {};
      var item = el("div", "timeline-item" + (job.current ? " is-current" : ""));
      reveal(item, stagger(i));

      var card = el("div", "timeline-card");

      var top = el("div", "timeline-card__top");
      var roleWrap = el("div");
      if (job.role) roleWrap.appendChild(el("span", "timeline-card__role", job.role));
      if (job.current) roleWrap.appendChild(el("span", "chip-current", "Current"));
      top.appendChild(roleWrap);
      if (job.period) top.appendChild(el("span", "timeline-card__period", job.period));
      card.appendChild(top);

      // Company + location on one line (location as muted meta).
      if (job.company || job.location) {
        var company = el("div", "timeline-card__company", job.company || "");
        if (job.location) {
          company.appendChild(el("span", "timeline-card__meta", job.location));
        }
        card.appendChild(company);
      }

      if (job.description) {
        card.appendChild(el("p", "timeline-card__desc", job.description));
      }

      if (hasItems(job.tags)) {
        var row = el("div", "badge-row");
        job.tags.forEach(function (tag) {
          if (tag != null && String(tag).trim() !== "") {
            row.appendChild(el("span", "badge", tag));
          }
        });
        if (row.childNodes.length) card.appendChild(row);
      }

      item.appendChild(card);
      container.appendChild(item);
    });
  }

  /* ---------------------------------------------------------- EDUCATION --- */

  function renderEducation(education) {
    var container = byId("education-list");
    if (!container) return;
    clear(container);

    if (!hasItems(education)) {
      hideSection(container);
      return;
    }

    education.forEach(function (edu, i) {
      edu = edu || {};
      var item = reveal(el("div", "edu-item"), stagger(i));

      if (edu.period) item.appendChild(el("span", "edu-item__period", edu.period));
      if (edu.degree) item.appendChild(el("div", "edu-item__degree", edu.degree));
      if (edu.school) item.appendChild(el("div", "edu-item__school", edu.school));
      if (edu.field) item.appendChild(el("div", "edu-item__field", edu.field));

      container.appendChild(item);
    });
  }

  /* ----------------------------------------------------- CERTIFICATIONS --- */

  // Small inline-SVG badge icon (no external deps). Built via DOM, not innerHTML.
  function certIcon() {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    var c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", "12");
    c.setAttribute("cy", "8");
    c.setAttribute("r", "6");
    var p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", "M8.5 13.5 7 22l5-3 5 3-1.5-8.5");
    svg.appendChild(c);
    svg.appendChild(p);
    return svg;
  }

  function renderCertifications(certs) {
    var container = byId("certifications-container");
    if (!container) return;
    clear(container);

    if (!hasItems(certs)) {
      hideSection(container);
      return;
    }

    certs.forEach(function (cert, i) {
      cert = cert || {};
      var card = reveal(el("div", "cert-card"), stagger(i));

      var icon = el("div", "cert-card__icon");
      icon.appendChild(certIcon());
      card.appendChild(icon);

      if (cert.name) card.appendChild(el("div", "cert-card__name", cert.name));
      if (cert.issuer) card.appendChild(el("div", "cert-card__meta", cert.issuer));
      if (cert.year) card.appendChild(el("div", "cert-card__year", cert.year));

      container.appendChild(card);
    });
  }

  /* ------------------------------------------------------------ CONTACT --- */

  function renderContact(contact) {
    contact = contact || {};

    // Email -> mailto anchor (hook is an <a>).
    var emailEl = byId("contact-email");
    if (emailEl) {
      if (contact.email) {
        emailEl.textContent = contact.email;
        var mailHref = safeUrl("mailto:" + contact.email);
        if (mailHref) emailEl.setAttribute("href", mailHref);
        emailEl.hidden = false;
      } else {
        // hide the whole row (label + value) if present
        var row = emailEl.closest ? emailEl.closest(".contact__row") : null;
        (row || emailEl).hidden = true;
      }
    }

    setText("contact-location", contact.location);
    var locEl = byId("contact-location");
    if (locEl && locEl.hidden) {
      var locRow = locEl.closest ? locEl.closest(".contact__row") : null;
      if (locRow) locRow.hidden = true;
    }

    var socials = byId("contact-socials");
    if (socials) {
      clear(socials);
      if (hasItems(contact.socials)) {
        var added = 0;
        contact.socials.forEach(function (s) {
          s = s || {};
          var href = safeUrl(s.url);
          if (!href) return; // skip unsafe / missing URLs
          var link = el("a", "social-link", s.label || s.handle || href);
          link.setAttribute("href", href);
          // External http(s) links open safely in a new tab.
          if (/^https?:/i.test(href)) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
          }
          socials.appendChild(link);
          added++;
        });
        if (!added) {
          var sRow = socials.closest ? socials.closest(".contact__row") : null;
          if (sRow) sRow.hidden = true;
        }
      } else {
        var emptyRow = socials.closest ? socials.closest(".contact__row") : null;
        if (emptyRow) emptyRow.hidden = true;
      }
    }
  }

  /* ------------------------------------------------------------- FOOTER --- */

  function renderFooter(profile) {
    profile = profile || {};
    var yearEl = byId("footer-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    setText("footer-name", profile.name);
  }

  /* -------------------------------------------------------- orchestrate --- */

  function render() {
    var data = (typeof window !== "undefined" && window.PORTFOLIO_DATA) || null;
    if (!data) {
      // Nothing to render; stay quiet (no crash) but note it for QA.
      if (window.console) console.warn("[render] PORTFOLIO_DATA not found.");
      return;
    }

    // Each renderer is isolated so one bad section can't take down the rest.
    var steps = [
      function () { renderHero(data.profile); },
      function () { renderStats(data.stats); },
      function () { renderAbout(data.about); },
      function () { renderSkills(data.skills); },
      function () { renderExperience(data.experience); },
      function () { renderEducation(data.education); },
      function () { renderCertifications(data.certifications); },
      function () { renderContact(data.contact); },
      function () { renderFooter(data.profile); }
    ];
    steps.forEach(function (step) {
      try {
        step();
      } catch (err) {
        if (window.console) console.error("[render] section failed:", err);
      }
    });

    // Tell animations.js to (re)bind to the freshly injected nodes.
    try {
      document.dispatchEvent(new CustomEvent("portfolio:rendered"));
    } catch (e) {
      // Very old engines: fall back to the legacy Event constructor.
      var evt = document.createEvent("Event");
      evt.initEvent("portfolio:rendered", true, true);
      document.dispatchEvent(evt);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render(); // DOM already parsed (e.g. deferred/late injection)
  }
})();
