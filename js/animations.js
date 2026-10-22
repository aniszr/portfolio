/* =============================================================================
   animations.js  —  Collaborator 1
   Vanilla JS, no libraries. Everything is idempotent and re-bindable so it
   works for nodes that render.js injects at runtime.

   Binds on:  DOMContentLoaded  AND  document 'portfolio:rendered'
   Honors:    prefers-reduced-motion
============================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false, addEventListener: function () {} };

  /* -------------------------------------------------- small helpers ------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function prefersReduced() { return reduceMotion.matches; }

  /* ======================================================================= */
  /*  (a) SCROLL REVEAL  —  [data-reveal], honors data-reveal-delay          */
  /* ======================================================================= */
  var revealObserver = null;

  function makeRevealObserver() {
    if (!("IntersectionObserver" in window)) return null;
    return new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute("data-reveal-delay"), 10) || 0;
        window.setTimeout(function () { el.classList.add("is-visible"); }, delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  }

  function initReveals() {
    var nodes = $all("[data-reveal]").filter(function (n) { return !n.dataset.revealBound; });
    if (!nodes.length) return;

    if (prefersReduced() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.dataset.revealBound = "1"; n.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) revealObserver = makeRevealObserver();
    nodes.forEach(function (n) {
      n.dataset.revealBound = "1";
      revealObserver.observe(n);
    });
  }

  /* ======================================================================= */
  /*  (b) COUNTERS  —  [data-count] (+ data-suffix)                          */
  /* ======================================================================= */
  var counterObserver = null;

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) { return; }
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (String(el.getAttribute("data-count")).split(".")[1] || "").length;

    if (prefersReduced()) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    var duration = 1400;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var nodes = $all("[data-count]").filter(function (n) { return !n.dataset.countBound; });
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.dataset.countBound = "1"; animateCount(n); });
      return;
    }
    if (!counterObserver) {
      counterObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
    }
    nodes.forEach(function (n) {
      n.dataset.countBound = "1";
      n.textContent = "0" + (n.getAttribute("data-suffix") || "");
      counterObserver.observe(n);
    });
  }

  /* ======================================================================= */
  /*  (c) SKILL BARS  —  [data-level] fill on reveal                         */
  /* ======================================================================= */
  var barObserver = null;

  function fillBar(el) {
    var level = parseFloat(el.getAttribute("data-level"));
    if (isNaN(level)) level = 0;
    level = Math.max(0, Math.min(100, level));
    // reduced motion: CSS transition already disabled, just set width
    requestAnimationFrame(function () { el.style.width = level + "%"; });
  }

  function initSkillBars() {
    var nodes = $all("[data-level]").filter(function (n) { return !n.dataset.levelBound; });
    if (!nodes.length) return;

    if (prefersReduced() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.dataset.levelBound = "1"; fillBar(n); });
      return;
    }
    if (!barObserver) {
      barObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          fillBar(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.4 });
    }
    nodes.forEach(function (n) {
      n.dataset.levelBound = "1";
      n.style.width = "0%";
      barObserver.observe(n);
    });
  }

  /* ======================================================================= */
  /*  (d) NAV  —  active-link highlight + scrolled state + hamburger         */
  /* ======================================================================= */
  var navBound = false;

  function initNav() {
    if (navBound) return;
    var nav = $("#nav");
    var links = $("#nav-links");
    var hamburger = $("#hamburger");
    if (!nav) return;
    navBound = true;

    // scrolled state + scroll progress
    var progressBar = $("#scroll-progress-bar");
    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
      if (progressBar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        progressBar.style.width = pct + "%";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // hamburger toggle (mobile)
    function closeMenu() {
      if (!links || !hamburger) return;
      links.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "Open menu");
    }
    if (hamburger && links) {
      hamburger.addEventListener("click", function () {
        var open = links.classList.toggle("is-open");
        hamburger.setAttribute("aria-expanded", open ? "true" : "false");
        hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      // close on link click / escape / resize
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
      window.addEventListener("resize", function () {
        if (window.innerWidth > 760) closeMenu();
      });
    }

    // active-link highlighting via IntersectionObserver on sections
    var navLinks = $all(".nav__link", nav);
    var map = {};
    navLinks.forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = a;
    });
    var sections = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var active = map[entry.target.id];
          if (active) active.classList.add("is-active");
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ======================================================================= */
  /*  (e) THEME TOGGLE  —  data-theme on <html>, persisted                   */
  /* ======================================================================= */
  var themeBound = false;

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  function saveTheme(v) {
    try { localStorage.setItem("theme", v); } catch (e) {}
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = $("#theme-toggle");
    if (btn) {
      var isDark = theme === "dark";
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  function initTheme() {
    if (themeBound) return;
    themeBound = true;
    // Resolve initial theme: stored > system
    var initial = storedTheme();
    if (initial !== "light" && initial !== "dark") {
      initial = systemPrefersDark() ? "dark" : "light";
    }
    applyTheme(initial);

    var btn = $("#theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        saveTheme(next);
      });
    }

    // follow system change only if user hasn't explicitly chosen
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var handler = function (e) {
        if (!storedTheme()) applyTheme(e.matches ? "dark" : "light");
      };
      if (mq.addEventListener) mq.addEventListener("change", handler);
      else if (mq.addListener) mq.addListener(handler);
    }
  }

  /* ======================================================================= */
  /*  (f) WOW  —  pointer-reactive aurora glow + hero card tilt + parallax   */
  /* ======================================================================= */
  var pointerBound = false;

  function initPointerFX() {
    if (pointerBound || prefersReduced()) return;
    pointerBound = true;

    var aurora = $(".bg-aurora");
    var card = $("[data-tilt]");
    var parallaxEls = $all("[data-parallax]");

    var raf = null;
    var lastX = 0, lastY = 0;

    function onMove(e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var w = window.innerWidth || 1;
        var h = window.innerHeight || 1;
        var nx = lastX / w - 0.5;   // -0.5 .. 0.5
        var ny = lastY / h - 0.5;

        // aurora follows pointer (subtle)
        if (aurora) {
          aurora.style.setProperty("--mx", (nx * 40).toFixed(1) + "px");
          aurora.style.setProperty("--my", (ny * 40).toFixed(1) + "px");
        }
        // hero card 3D tilt
        if (card) {
          card.style.setProperty("--rx", (nx * 10).toFixed(2) + "deg");
          card.style.setProperty("--ry", (-ny * 10).toFixed(2) + "deg");
        }
        // hero visual parallax drift
        parallaxEls.forEach(function (el) {
          el.style.transform = "translate3d(" + (nx * -14).toFixed(1) + "px," + (ny * -14).toFixed(1) + "px,0)";
        });
      });
    }

    // only enable on fine pointers (desktop); skip touch
    if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }
  }

  /* ======================================================================= */
  /*  (f2) WOW  —  rotating role text in the hero (reads injected role)      */
  /* ======================================================================= */
  var rotatorBound = false;

  function initRoleRotator() {
    if (rotatorBound) return;
    var el = $("#hero-role");
    if (!el || !el.textContent.trim()) return; // wait until render fills it
    rotatorBound = true;

    if (prefersReduced()) return; // keep static text

    var phrases = [
      el.textContent.trim(),
      "Automation with Robot Framework",
      "ISTQB® Certified Tester",
      "Functional • Regression • UAT"
    ].filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    if (phrases.length < 2) return;

    var idx = 0;
    el.style.transition = "opacity .4s ease";
    window.setInterval(function () {
      el.style.opacity = "0";
      window.setTimeout(function () {
        idx = (idx + 1) % phrases.length;
        el.textContent = phrases[idx];
        el.style.opacity = "1";
      }, 420);
    }, 3200);
  }

  /* ======================================================================= */
  /*  Orchestration                                                          */
  /* ======================================================================= */
  function initStatic() {
    // chrome that exists in the static HTML
    initNav();
    initTheme();
    initPointerFX();
  }

  function initDynamic() {
    // content-driven things — safe to call repeatedly (idempotent)
    initReveals();
    initCounters();
    initSkillBars();
    initRoleRotator();
  }

  function initAll() {
    initStatic();
    initDynamic();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  // Re-bind after render.js injects the data-driven nodes.
  document.addEventListener("portfolio:rendered", function () {
    initDynamic();
    // nav spy sections may now resolve / role text now present
    initRoleRotator();
  });

  // If the user flips the OS reduced-motion setting mid-session, re-evaluate
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", function () {
      // reveal anything still hidden so content is never lost
      if (prefersReduced()) {
        $all("[data-reveal]").forEach(function (n) { n.classList.add("is-visible"); });
      }
    });
  }
})();
