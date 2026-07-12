/* ===== Suyash Kelvin Savant — motion system ===== */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Preloader ---------- */
  const pre = $("[data-preloader]");
  const countEl = $("[data-count]");
  const bar = $("[data-preloader-bar]");
  let pct = 0;
  const preTimer = setInterval(() => {
    pct = Math.min(100, pct + Math.random() * 14 + 4);
    if (countEl) countEl.textContent = String(Math.floor(pct)).padStart(2, "0");
    if (bar) bar.style.width = pct + "%";
    if (pct >= 100) clearInterval(preTimer);
  }, 110);

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (pre) pre.classList.add("is-done");
      reduce ? revealStatic() : boot();
    }, 650);
  });

  function revealStatic() {
    $$("[data-reveal]").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
  }

  /* ---------- Boot ---------- */
  let lenis;
  function boot() {
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.1 });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      lenis.on("scroll", () => ScrollTrigger && ScrollTrigger.update());
    }
    if (!window.gsap) { revealStatic(); return; }
    gsap.registerPlugin(ScrollTrigger);
    setupCursor();
    setupClock();
    setupNav();
    setupHero();
    setupMarquees();
    setupStatement();
    setupWork();
    setupReveals();
    setupTilt();
    setupMagnetic();
    setupProgress();
    setupNavActive();
    setupHeroParallax();
    setupFloatPreview();
    setupCountUp();
    // recalc positions after pin + fonts settle
    requestAnimationFrame(() => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 1200);
  }

  /* ---------- Custom cursor w/ contextual labels ---------- */
  function setupCursor() {
    if (!canHover) return;
    const c = $("[data-cursor]"), dot = $("[data-cursor-dot]"), label = $("[data-cursor-label]");
    if (!c || !dot) return;
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const bind = (el) => {
      const txt = el.getAttribute("data-cursor-text");
      el.addEventListener("mouseenter", () => {
        c.classList.add("is-hover");
        if (txt && label) { label.textContent = txt; c.classList.add("is-label"); }
      });
      el.addEventListener("mouseleave", () => { c.classList.remove("is-hover", "is-label"); });
    };
    $$("a,button,[data-magnetic],[data-tilt],[data-cursor-text]").forEach(bind);
  }

  /* ---------- Live clock (India) ---------- */
  function setupClock() {
    const nodes = $$("[data-clock]");
    if (!nodes.length) return;
    const tick = () => {
      const t = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });
      nodes.forEach((n) => (n.textContent = t));
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Nav scroll state + smooth anchors ---------- */
  function setupNav() {
    const nav = $("[data-nav]");
    if (nav) {
      const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 40);
      addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    $$("[data-link]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (href && href.startsWith("#")) {
          const t = $(href);
          if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -10 }) : t.scrollIntoView({ behavior: "smooth" }); }
        }
      });
    });
  }

  /* ---------- Hero word reveal ---------- */
  function setupHero() {
    const lines = $$(".hero__title .words");
    gsap.set(lines, { yPercent: 115 });
    gsap.to(lines, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.12, delay: 0.55 });
    gsap.from("[data-nav]", { y: -40, opacity: 0, duration: 1, delay: 0.3, ease: "power3.out" });
    $$("[data-float]").forEach((o, i) => {
      gsap.to(o, { y: i % 2 ? 70 : -70, x: i % 2 ? -50 : 50, duration: 7 + i * 1.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    gsap.to(".hero__inner", {
      yPercent: 18, opacity: 0.3, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* ---------- Infinite marquees ---------- */
  function setupMarquees() {
    $$("[data-marquee]").forEach((track) => {
      const w = track.scrollWidth / 2;
      gsap.to(track, { x: -w, duration: 28, ease: "none", repeat: -1 });
    });
  }

  /* ---------- Reverse statement marquee ---------- */
  function setupStatement() {
    const track = $("[data-marquee-rev]");
    if (!track || !window.gsap) return;
    const w = track.scrollWidth / 2;
    gsap.fromTo(track, { x: -w }, { x: 0, duration: 32, ease: "none", repeat: -1 });
  }

  /* ---------- Active section nav highlight + scramble ---------- */
  function setupNavActive() {
    const links = $$(".nav__links a[data-link]");
    const map = {};
    links.forEach((a) => { const id = a.getAttribute("href").slice(1); const sec = document.getElementById(id); if (sec) map[id] = a; });
    if (window.ScrollTrigger) {
      Object.keys(map).forEach((id) => {
        ScrollTrigger.create({
          trigger: "#" + id, start: "top 45%", end: "bottom 45%",
          onToggle: (s) => links.forEach((l) => l.classList.remove("is-active")) || (s.isActive && map[id].classList.add("is-active"))
        });
      });
    }
    // scramble-decode on hover
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/<>*";
    links.forEach((a) => {
      const orig = a.textContent;
      a.addEventListener("mouseenter", () => {
        let frame = 0;
        const iv = setInterval(() => {
          a.textContent = orig.split("").map((c, i) => (i < frame ? c : chars[Math.floor(Math.random() * chars.length)])).join("").toLowerCase();
          if (++frame > orig.length) { clearInterval(iv); a.textContent = orig; }
        }, 26);
      });
    });
  }

  /* ---------- Horizontal pinned work ---------- */
  function setupWork() {
    const pin = $("[data-pin]"), track = $("[data-track]");
    if (!pin || !track) return;
    if (innerWidth <= 760) return;
    const getScroll = () => track.scrollWidth - innerWidth;
    gsap.to(track, {
      x: () => -getScroll(),
      ease: "none",
      scrollTrigger: {
        trigger: ".work",
        start: "top top",
        end: () => "+=" + getScroll(),
        pin: pin,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
  }

  /* ---------- Section reveals ---------- */
  function setupReveals() {
    $$("[data-reveal]").forEach((el) => {
      gsap.set(el, { y: 44, opacity: 0 });
      ScrollTrigger.create({
        trigger: el, start: "top 88%",
        onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 1.05, ease: "power3.out" })
      });
    });
    $$(".cta__title .words").forEach((w, i) => {
      gsap.from(w, { yPercent: 100, opacity: 0, duration: 1, ease: "power4.out", delay: i * 0.08,
        scrollTrigger: { trigger: ".cta", start: "top 75%" } });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  function setupTilt() {
    if (!canHover || reduce) return;
    $$("[data-tilt]").forEach((card) => {
      const glow = card.querySelector(".pcard__glow");
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 7}deg)`;
        if (glow) { glow.style.left = px * 100 + "%"; glow.style.top = py * 100 + "%"; }
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Magnetic ---------- */
  function setupMagnetic() {
    if (!canHover || reduce) return;
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px,${y * 0.4}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Scroll progress ---------- */
  function setupProgress() {
    const p = $("[data-progress]");
    if (!p) return;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => (p.style.width = s.progress * 100 + "%") });
  }

  /* ---------- Hero mouse parallax (depth) ---------- */
  function setupHeroParallax() {
    if (!canHover || reduce) return;
    const hero = $(".hero"), inner = $(".hero__title"), blobs = $$("[data-float]");
    if (!hero) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; });
    (function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      if (inner) inner.style.transform = `translate(${cx * 22}px,${cy * 18}px)`;
      blobs.forEach((b, i) => { const d = (i + 1) * 26; b.style.marginLeft = cx * d + "px"; b.style.marginTop = cy * d + "px"; });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Floating cursor preview on work cards ---------- */
  function setupFloatPreview() {
    if (!canHover) return;
    const panel = $("[data-float-panel]"), label = $("[data-float-label]");
    if (!panel) return;
    const cards = $$(".pcard[data-tilt]");
    let mx = 0, my = 0, px = 0, py = 0, active = false;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      px += (mx - px) * 0.14; py += (my - py) * 0.14;
      panel.style.left = px + "px"; panel.style.top = (py - 110) + "px";
      requestAnimationFrame(loop);
    })();
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        const title = card.querySelector(".pcard__title");
        if (label && title) label.textContent = title.textContent;
        panel.classList.add("is-on"); active = true;
      });
      card.addEventListener("mouseleave", () => { panel.classList.remove("is-on"); active = false; });
    });
  }

  /* ---------- Count-up stats ---------- */
  function setupCountUp() {
    const els = $$("[data-countup]");
    if (!els.length) return;
    if (reduce) { els.forEach((el) => (el.textContent = el.dataset.to + (el.dataset.suffix || ""))); return; }
    els.forEach((el) => {
      const to = parseFloat(el.dataset.to) || 0;
      const suffix = el.dataset.suffix || "";
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: to, duration: 1.6, ease: "power2.out",
            onUpdate: () => (el.textContent = Math.round(obj.v) + suffix)
          });
        }
      });
    });
  }

  const yr = $("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();

