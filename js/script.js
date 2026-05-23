/* ============================================================
   script.js — DevShikhi
   ১. Hamburger menu (mobile nav)
   ২. Sidebar slide drawer (mobile)
   ৩. Active sidebar highlight (scroll-based)
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ================================================================
     ১. HAMBURGER — Mobile Nav Toggle
  ================================================================ */
  var hamburger  = document.querySelector(".hamburger");
  var navDrawer  = document.querySelector(".nav-drawer");

  if (hamburger && navDrawer) {
    hamburger.addEventListener("click", function () {
      var isOpen = navDrawer.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    /* Drawer link'e tıklayınca kapat */
    navDrawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navDrawer.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ================================================================
     ২. SIDEBAR DRAWER — Mobile Slide-in
  ================================================================ */
  var aside          = document.querySelector("aside");
  var sidebarToggle  = document.querySelector(".sidebar-toggle");
  var sidebarOverlay = document.querySelector(".sidebar-overlay");

  function openSidebar() {
    if (!aside) return;
    aside.classList.add("sidebar-open");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    if (!aside) return;
    aside.classList.remove("sidebar-open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      if (aside && aside.classList.contains("sidebar-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  /* ESC key ile kapat */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeSidebar();
      if (navDrawer) {
        navDrawer.classList.remove("open");
        if (hamburger) hamburger.classList.remove("open");
      }
    }
  });

  /* ================================================================
     ৩. ACTIVE SIDEBAR — Scroll-based Section Detection
  ================================================================ */
  var sections    = Array.from(document.querySelectorAll("main section[id]"));
  var sidebarLinks = Array.from(document.querySelectorAll("aside ul li a[href^='#']"));

  if (!sections.length || !sidebarLinks.length) return;

  /* id → link map */
  var linkMap = {};
  sidebarLinks.forEach(function (link) {
    var id = link.getAttribute("href").substring(1);
    linkMap[id] = link;
  });

  var currentActive = "";

  /* Active class set */
  function setActive(id) {
    if (!id || id === currentActive) return;
    currentActive = id;

    sidebarLinks.forEach(function (l) { l.classList.remove("active"); });

    var activeLink = linkMap[id];
    if (!activeLink) return;
    activeLink.classList.add("active");

    /* Sidebar scroll — active link görünür yap */
    if (!aside) return;

    var isMobileDrawer = window.innerWidth <= 768;

    if (!isMobileDrawer) {
      /* Desktop: vertical scroll */
      var linkTop    = activeLink.offsetTop;
      var linkBottom = linkTop + activeLink.offsetHeight;
      var asideTop   = aside.scrollTop;
      var asideBot   = asideTop + aside.clientHeight;

      if (linkTop < asideTop) {
        aside.scrollTop = linkTop - 12;
      } else if (linkBottom > asideBot) {
        aside.scrollTop = linkBottom - aside.clientHeight + 12;
      }
    }
  }

  /* Hangi section görünüyor */
  function findActiveSection() {
    var HEADER = 105;
    var scrollY = window.scrollY || window.pageYOffset;
    var winH    = window.innerHeight;
    var pageH   = document.documentElement.scrollHeight;

    /* Sayfa sonu */
    if (scrollY + winH >= pageH - 40) {
      return sections[sections.length - 1].id;
    }
    /* Sayfa başı */
    if (scrollY < 40) {
      return sections[0].id;
    }

    var bestId   = sections[0].id;
    var bestDist = Infinity;

    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();

      /* Viewport'un altında henüz görünmeyenler skip */
      if (rect.top > winH * 0.65) return;

      /* Header'ın hemen altında ya da üstünde olanı bul */
      if (rect.top <= HEADER) {
        var dist = HEADER - rect.top;
        if (dist < bestDist) {
          bestDist = dist;
          bestId   = sec.id;
        }
      } else if (rect.top > HEADER && rect.top < HEADER + 220) {
        bestId   = sec.id;
        bestDist = 0;
      }
    });

    return bestId;
  }

  /* Scroll listener — requestAnimationFrame throttle */
  var rafPending = false;
  window.addEventListener("scroll", function () {
    if (!rafPending) {
      rafPending = true;
      window.requestAnimationFrame(function () {
        setActive(findActiveSection());
        rafPending = false;
      });
    }
  }, { passive: true });

  /* Sidebar link click → smooth scroll + sidebar kapat (mobile) */
  sidebarLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (!href || href[0] !== "#") return;

      e.preventDefault();
      var targetId = href.substring(1);
      var target   = document.getElementById(targetId);
      if (!target) return;

      var top = target.getBoundingClientRect().top + window.scrollY - 95;
      window.scrollTo({ top: top, behavior: "smooth" });

      setActive(targetId);

      /* Mobile sidebar'ı kapat */
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  /* İlk yüklemede active set et */
  setActive(findActiveSection());
  setTimeout(function () { setActive(findActiveSection()); }, 150);

});
