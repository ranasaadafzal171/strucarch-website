document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  var current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === current) a.classList.add("active");
  });

  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll("[data-category]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-filter");
      cards.forEach(function (card) {
        var show = cat === "all" || card.getAttribute("data-category") === cat;
        card.style.display = show ? "" : "none";
      });
    });
  });

  var lightbox = document.querySelector(".lightbox");
  var lbImg = document.querySelector(".lightbox img");
  var lbClose = document.querySelector(".lb-close");
  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (lbImg) lbImg.src = el.getAttribute("href");
      if (lightbox) lightbox.classList.add("open");
    });
  });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target === lbClose) lightbox.classList.remove("open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
  }

  var year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = year; });
});
