/**
 * Luxury storefront — restrained motion: Lenis, one hero settle pass,
 * scroll reveals, magnetic only on circular cart CTAs.
 */
(function () {
  "use strict";

  if (!document.body || !document.body.classList.contains("luxury-xp")) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var isDesktop = window.matchMedia("(min-width: 900px)").matches;

  var lenis = null;
  if (!reduceMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 2.05,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.58,
      touchMultiplier: 1.12,
      infinite: false,
    });
    function luxRaf(time) {
      lenis.raf(time);
      requestAnimationFrame(luxRaf);
    }
    requestAnimationFrame(luxRaf);
    document.documentElement.classList.add("lenis", "lenis-smooth");
  }

  var hero = document.querySelector(".lux-hero--monolith");
  if (hero) {
    window.requestAnimationFrame(function () {
      hero.classList.add("lux-hero--settled");
    });
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll("[data-lux-reveal]");
    if (revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          });
        },
        { root: null, rootMargin: "0px 0px -4% 0px", threshold: 0.04 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  } else {
    document.querySelectorAll("[data-lux-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (!reduceMotion && finePointer && isDesktop) {
    var magnets = document.querySelectorAll(
      "body.luxury-xp .soundwave-add-btn, body.luxury-xp .riff-add-btn, body.luxury-xp .harmony-add-btn, body.luxury-xp .melody-add-btn, body.luxury-xp .allegro-add-btn, body.luxury-xp .lux-editorial-extra__cta"
    );

    function bindMagnetic(btn) {
      var strength = 0.32;
      var max = 8;
      function onMove(e) {
        var r = btn.getBoundingClientRect();
        var dcx = r.left + r.width * 0.5;
        var dcy = r.top + r.height * 0.5;
        var dx = (e.clientX - dcx) * strength;
        var dy = (e.clientY - dcy) * strength;
        if (dx > max) dx = max;
        if (dx < -max) dx = -max;
        if (dy > max) dy = max;
        if (dy < -max) dy = -max;
        btn.style.setProperty("--lux-mx", dx.toFixed(1) + "px");
        btn.style.setProperty("--lux-my", dy.toFixed(1) + "px");
      }
      function reset() {
        btn.style.setProperty("--lux-mx", "0px");
        btn.style.setProperty("--lux-my", "0px");
      }
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", reset);
      btn.addEventListener("blur", reset);
    }

    magnets.forEach(bindMagnetic);
  }

  var lrHero = document.querySelector(".lux-lr-hero");
  if (lrHero) {
    window.requestAnimationFrame(function () {
      lrHero.classList.add("lux-lr-hero--settled");
    });
  }

  window.__licoriceLenis = lenis;
})();
