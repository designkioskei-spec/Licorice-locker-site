(function () {
  "use strict";

  if (typeof window.IntersectionObserver === "undefined") {
    return;
  }

  var mqMobile = window.matchMedia("(max-width: 639px)");
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function effectiveDelayMs(el) {
    var raw = parseInt(el.getAttribute("data-ll-reveal-delay"), 10);
    if (isNaN(raw) || raw < 0) {
      raw = 0;
    }
    if (mqMobile.matches) {
      raw = Math.round(raw * 0.58);
    }
    return raw;
  }

  function revealAll() {
    document.querySelectorAll("[data-ll-reveal]").forEach(function (el) {
      el.classList.add("ll-reveal-visible");
    });
  }

  function init() {
    if (mqReduce.matches) {
      revealAll();
      return;
    }

    var nodes = document.querySelectorAll("[data-ll-reveal]");
    if (!nodes.length) {
      return;
    }

    nodes.forEach(function (el) {
      el.style.setProperty("--ll-reveal-delay", effectiveDelayMs(el) + "ms");
    });

    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          var t = entry.target;
          t.classList.add("ll-reveal-visible");
          obs.unobserve(t);
        });
      },
      { root: null, rootMargin: "0px 0px -15% 0px", threshold: 0.11 }
    );

    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
