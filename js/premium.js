// =========================================
// سبيشيال بارتس – حركات التصميم الجديد (من غير أي مكتبات)
// =========================================
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----- الهيدر بيغمق شوية لما تنزل في الصفحة -----
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("pm-scrolled", window.scrollY > 20); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ----- ظهور ناعم للسكاشن أول ما تبان -----
  var items = document.querySelectorAll(".pm-reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("pm-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("pm-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  // ----- الأرقام بتعدّ لحد رقمها مرة واحدة -----
  var nums = document.querySelectorAll("[data-pm-count]");
  var count = function (el) {
    var target = parseInt(el.getAttribute("data-pm-count"), 10) || 0;
    var prefix = el.getAttribute("data-pm-prefix") || "";
    if (reduce) { el.textContent = prefix + target; return; }
    var start = null;
    var step = function (t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 1200, 1);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io2.observe(el); });
  }

  // ----- فيديو الهيرو: يقف لو الجهاز طالب حركة أقل -----
  var vid = document.querySelector(".pm-hero-frame video");
  if (vid && reduce) { vid.removeAttribute("autoplay"); vid.pause(); }
})();
