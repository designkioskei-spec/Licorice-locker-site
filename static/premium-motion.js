/**
 * Premium scroll + interaction choreography (shop, Listening Room, affiliate).
 * Layout-neutral: pointer drift, Lenis, typographic splits, reduced-motion safe.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var mobileMq = window.matchMedia("(max-width: 639px)");

  function clamp(min, value, max) {
    return Math.max(min, Math.min(max, value));
  }

  function initLenis() {
    if (reduce || typeof window.Lenis === "undefined") {
      return;
    }
    var isMobile = mobileMq.matches;
    new window.Lenis({
      lerp: isMobile ? 0.088 : 0.062,
      wheelMultiplier: isMobile ? 0.9 : 0.74,
      touchMultiplier: isMobile ? 1.08 : 0.92,
      syncTouch: true,
      autoRaf: true,
    });
  }

  function depthAmount(el) {
    var isMobile = mobileMq.matches;
    if (
      el.classList.contains("shop-hero-banner") ||
      el.classList.contains("top-banner") ||
      el.classList.contains("aff-banner")
    ) {
      return isMobile ? 20 : 38;
    }
    if (
      el.classList.contains("magazine-product-row") ||
      el.classList.contains("link-series-promo")
    ) {
      return isMobile ? 16 : 28;
    }
    if (
      el.classList.contains("shop-intro") ||
      el.classList.contains("listening-room-intro") ||
      el.classList.contains("panel") ||
      el.classList.contains("hero")
    ) {
      return isMobile ? 11 : 20;
    }
    if (el.classList.contains("product-card")) {
      return isMobile ? 8 : 14;
    }
    return isMobile ? 10 : 18;
  }

  function initScrollDepth() {
    if (reduce) {
      return;
    }

    var nodes = Array.prototype.slice.call(
      document.querySelectorAll("[data-ll-reveal]")
    );
    if (!nodes.length) {
      return;
    }

    var rafId = 0;
    var outPad = 180;

    function step() {
      rafId = 0;
      var vh = window.innerHeight || 1;
      var viewMid = vh * 0.5;

      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el.classList.contains("ll-reveal-visible")) {
          el.style.setProperty("--ll-depth-y", "0px");
          continue;
        }

        var rect = el.getBoundingClientRect();
        var out = rect.bottom < -outPad || rect.top > vh + outPad;
        if (out || rect.height < 2) {
          el.style.setProperty("--ll-depth-y", "0px");
          continue;
        }

        var mid = rect.top + rect.height * 0.5;
        var n = clamp(-1, (mid - viewMid) / (vh * 0.5), 1);
        var drift = -n * depthAmount(el);

        if (Math.abs(drift) < 0.35) {
          drift = 0;
        }

        el.style.setProperty("--ll-depth-y", drift.toFixed(2) + "px");
      }
    }

    function kick() {
      if (!rafId) {
        rafId = window.requestAnimationFrame(step);
      }
    }

    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
  }

  function bindHeroPointer(root) {
    if (reduce || coarse || !root) {
      return;
    }
    function onMove(e) {
      var r = root.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) {
        return;
      }
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      nx = Math.max(-0.5, Math.min(0.5, nx));
      ny = Math.max(-0.5, Math.min(0.5, ny));
      root.style.setProperty("--ll-px", nx.toFixed(4));
      root.style.setProperty("--ll-py", ny.toFixed(4));
    }
    function onLeave() {
      root.style.setProperty("--ll-px", "0");
      root.style.setProperty("--ll-py", "0");
    }
    root.addEventListener("mousemove", onMove, { passive: true });
    root.addEventListener("mouseleave", onLeave);
  }

  function splitWords(el) {
    if (!el || el.dataset.llSplit === "1") {
      return;
    }
    var text = el.textContent;
    if (!text || !text.trim()) {
      return;
    }
    el.dataset.llSplit = "1";
    var parts = text.split(/(\s+)/);
    el.textContent = "";
    var wi = 0;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (/^\s+$/.test(part)) {
        var space = document.createElement("span");
        space.className = "ll-split-space";
        space.textContent = part;
        el.appendChild(space);
      } else if (part) {
        var span = document.createElement("span");
        span.className = "ll-split-word";
        span.style.setProperty("--ll-wi", String(wi++));
        span.textContent = part;
        el.appendChild(span);
      }
    }
  }

  function splitSentences(el) {
    if (!el || el.dataset.llSplit === "1") {
      return;
    }
    var text = el.textContent.trim();
    if (!text) {
      return;
    }
    var raw = text.split(/(?<=[.!?])\s+/);
    var sentences = [];
    for (var s = 0; s < raw.length; s++) {
      if (raw[s]) {
        sentences.push(raw[s]);
      }
    }
    if (sentences.length < 2) {
      splitWords(el);
      return;
    }
    el.dataset.llSplit = "1";
    el.textContent = "";
    for (var j = 0; j < sentences.length; j++) {
      var span = document.createElement("span");
      span.className = "ll-split-line";
      span.style.setProperty("--ll-wi", String(j));
      span.textContent = sentences[j] + (j < sentences.length - 1 ? " " : "");
      el.appendChild(span);
    }
  }

  function initTypography() {
    if (reduce) {
      return;
    }
    document.querySelectorAll(".shop-hero-banner-tagline").forEach(splitWords);
    document.querySelectorAll(".top-banner-tagline").forEach(splitWords);
    document.querySelectorAll(".link-series-promo-title").forEach(splitWords);
    document.querySelectorAll(".aff-banner h1").forEach(splitWords);
    document.querySelectorAll(".shop-intro-text").forEach(function (el) {
      // Listening Room intro sits under the banner without [data-ll-reveal]; split lines stay opacity:0 forever.
      if (el.closest(".listening-room-intro")) return;
      splitSentences(el);
    });
  }

  function initHeroChoreography() {
    if (reduce || coarse) {
      return;
    }
    document.querySelectorAll(".shop-hero-banner").forEach(function (el) {
      bindHeroPointer(el);
    });
    document.querySelectorAll(".top-banner").forEach(function (el) {
      bindHeroPointer(el);
    });
    document.querySelectorAll(".aff-banner").forEach(function (el) {
      bindHeroPointer(el);
    });
  }

  function initMagneticPrimaryButtons() {
    if (reduce || coarse) {
      return;
    }
    var maxPx = mobileMq.matches ? 0 : 4.5;
    document.querySelectorAll(".btn.primary").forEach(function (btn) {
      if (btn.closest(".admin") || btn.dataset.llMagnetic === "0") {
        return;
      }
      btn.dataset.llMagnetic = "1";
      btn.addEventListener(
        "mousemove",
        function (e) {
          var r = btn.getBoundingClientRect();
          var mx = (e.clientX - r.left) / r.width - 0.5;
          var my = (e.clientY - r.top) / r.height - 0.5;
          btn.style.setProperty("--ll-mx", (mx * maxPx).toFixed(2) + "px");
          btn.style.setProperty("--ll-my", (my * maxPx).toFixed(2) + "px");
        },
        { passive: true }
      );
      btn.addEventListener("mouseleave", function () {
        btn.style.setProperty("--ll-mx", "0px");
        btn.style.setProperty("--ll-my", "0px");
      });
    });
  }

  function init() {
    initTypography();
    initLenis();
    initScrollDepth();
    initHeroChoreography();
    initMagneticPrimaryButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
