/**
 * Premium scroll + interaction choreography (shop, Listening Room, affiliate).
 * Layout-neutral: pointer drift, Lenis, typographic splits, reduced-motion safe.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;

  function initLenis() {
    if (reduce || typeof window.Lenis === "undefined") {
      return;
    }
    var isMobile = window.matchMedia("(max-width: 639px)").matches;
    new window.Lenis({
      lerp: isMobile ? 0.11 : 0.085,
      wheelMultiplier: isMobile ? 0.92 : 0.78,
      touchMultiplier: isMobile ? 1.05 : 0.95,
      syncTouch: true,
      autoRaf: true,
    });
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
        el.appendChild(document.createTextNode(part));
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
    document.querySelectorAll(".aff-banner .tagline").forEach(splitWords);
    document.querySelectorAll(".shop-intro-text").forEach(splitSentences);
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
    var maxPx = 3;
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
    initHeroChoreography();
    initMagneticPrimaryButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
