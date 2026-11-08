/**
 * 모든 페이지 공통 틀: 본문 바로가기 · 머리글(메뉴) · 바닥글 · 모바일 하단 고정 메뉴
 *
 * 메뉴 항목은 data/site.js, 회사 정보는 data/company.js 에서 고칩니다.
 * 이 파일 하나만 고치면 모든 페이지의 머리글·바닥글이 함께 바뀝니다.
 *
 * 각 HTML 파일의 <body> 에 아래 값을 적어 둡니다.
 *   data-root  사이트 맨 위 폴더까지의 경로 (맨 위 폴더의 파일은 "", products·cases 폴더 안은 "../")
 *   data-nav   현재 메뉴 표시용 (home / products / cases / process / about)
 */
(function () {
  "use strict";
  var GD = window.GD;

  function isActive(item, current) {
    return !!item.key && item.key === current;
  }

  function headerHtml(current) {
    var c = GD.company;
    var main = GD.join(GD.nav.main, function (item) {
      var active = isActive(item, current);
      return (
        '<li><a class="header__link' + (active ? " is-active" : "") + '" href="' + GD.esc(GD.url(item.href)) + '"' +
        (active ? ' aria-current="page"' : "") + ">" + GD.esc(item.label) + "</a></li>"
      );
    });
    var mobile = GD.join(GD.nav.mobile, function (item) {
      var active = isActive(item, current);
      return (
        '<li><a class="mobile-menu__link' + (active ? " is-active" : "") + '" href="' + GD.esc(GD.url(item.href)) + '"' +
        (active ? ' aria-current="page"' : "") + ">" + GD.esc(item.label) +
        (active ? '<span class="mobile-menu__here">(현재 페이지)</span>' : "") + "</a></li>"
      );
    });
    var shortcuts = GD.join(GD.nav.categoryShortcuts, function (item) {
      return '<li><a href="' + GD.esc(GD.url(item.href)) + '">' + GD.esc(item.label) + "</a></li>";
    });

    return (
      '<header class="header">' +
      '<div class="container header__inner">' +
      '<a class="header__home" href="' + GD.url("index.html") + '" aria-label="' + GD.esc(c.shortName) + ' 홈으로">' +
      GD.logoLockup() + "</a>" +
      '<nav class="header__nav" aria-label="주요 메뉴"><ul>' + main + "</ul></nav>" +
      '<a class="header__phone" href="' + GD.telHref(c.phone.main) + '">' + GD.icon("phone", "icon--md") +
      '<span class="header__phone-text"><span class="header__phone-label">대표전화</span><span class="header__phone-num">' +
      GD.esc(c.phone.main) + "</span></span></a>" +
      '<button type="button" class="header__menu-btn" aria-expanded="false" aria-controls="mobile-menu">' +
      '<span data-menu-label>메뉴</span><span data-menu-icon>' + GD.icon("menu", "icon--sm") + "</span></button>" +
      "</div>" +
      '<div class="mobile-menu__backdrop" hidden></div>' +
      '<div class="mobile-menu" id="mobile-menu" hidden>' +
      '<nav class="container mobile-menu__inner" aria-label="전체 메뉴"><ul class="mobile-menu__list">' + mobile + "</ul>" +
      GD.callButton("전화 상담 " + c.phone.main, "btn--block mt-4") +
      "</nav></div>" +
      "</header>" +
      '<nav class="cat-shortcuts" aria-label="제품 분류 바로가기"><ul class="container">' + shortcuts + "</ul></nav>"
    );
  }

  function footerHtml() {
    var c = GD.company;
    var links = GD.join(GD.nav.footer, function (item) {
      return '<li><a href="' + GD.esc(GD.url(item.href)) + '">' + GD.esc(item.label) + "</a></li>";
    });
    var bizLine = "상호 " + GD.esc(c.name);
    if (c.representative) bizLine += " · 대표 " + GD.esc(c.representative);
    if (c.businessRegistrationNumber) bizLine += " · 사업자등록번호 " + GD.esc(c.businessRegistrationNumber);
    return (
      '<footer class="footer on-dark"><div class="container footer__inner">' +
      '<div class="footer__grid">' +
      "<div>" + GD.logoLockup(true) + '<p class="footer__tagline">' + GD.esc(c.tagline) + " 제작·설치</p></div>" +
      '<div><h2 class="footer__title">연락처</h2><dl class="footer__contact">' +
      '<div><dt>대표전화</dt><dd><a class="footer__strong" href="' + GD.telHref(c.phone.main) + '">' + GD.esc(c.phone.main) + "</a></dd></div>" +
      '<div><dt>휴대전화</dt><dd><a href="' + GD.telHref(c.phone.mobile) + '">' + GD.esc(c.phone.mobile) + "</a></dd></div>" +
      "<div><dt>주소</dt><dd>" + GD.esc(c.address) + "</dd></div>" +
      "</dl></div>" +
      '<nav aria-label="하단 메뉴"><h2 class="footer__title">바로가기</h2><ul class="footer__links">' + links + "</ul></nav>" +
      "</div>" +
      '<div class="footer__legal">' +
      "<p>" + bizLine + "</p>" +
      "<p>‘디자인 예시’로 표시된 사진은 실제 제품·시공 사진이 아닙니다.</p>" +
      "<p>제품 사양과 가격은 상담 시점과 현장 여건에 따라 달라질 수 있습니다.</p>" +
      '<p class="pt-2">© ' + new Date().getFullYear() + " " + GD.esc(c.name) + "</p>" +
      "</div></div></footer>"
    );
  }

  function actionBarHtml() {
    return (
      '<nav class="action-bar" aria-label="빠른 메뉴"><ul>' +
      '<li><a class="action-bar__btn" href="' + GD.url("products.html") + '">제품 보기</a></li>' +
      '<li><a class="action-bar__btn" href="' + GD.url("about.html#location") + '">오시는 길</a></li>' +
      '<li><a class="action-bar__btn action-bar__btn--call" href="' + GD.telHref(GD.company.phone.main) + '">' +
      GD.icon("phone", "icon--sm") + "전화 상담</a></li>" +
      "</ul></nav>"
    );
  }

  function bindMobileMenu() {
    var btn = document.querySelector(".header__menu-btn");
    var panel = document.getElementById("mobile-menu");
    var backdrop = document.querySelector(".mobile-menu__backdrop");
    if (!btn || !panel) return;
    var label = btn.querySelector("[data-menu-label]");
    var iconWrap = btn.querySelector("[data-menu-icon]");
    var open = false;

    function set(next, returnFocus) {
      open = next;
      btn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      backdrop.hidden = !open;
      label.textContent = open ? "닫기" : "메뉴";
      iconWrap.innerHTML = GD.icon(open ? "close" : "menu", "icon--sm");
      document.body.classList.toggle("no-scroll", open);
      if (open) {
        var first = panel.querySelector("a");
        if (first) first.focus();
      } else if (returnFocus) {
        btn.focus();
      }
    }

    btn.addEventListener("click", function () {
      set(!open, false);
    });
    backdrop.addEventListener("click", function () {
      set(false, false);
    });
    document.addEventListener("keydown", function (e) {
      if (open && e.key === "Escape") set(false, true);
    });
    // 화면이 넓어져 PC 메뉴가 보이면 모바일 메뉴를 닫습니다
    var mq = window.matchMedia("(min-width: 64rem)");
    var onChange = function () {
      if (mq.matches && open) set(false, false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
  }

  GD.renderLayout = function () {
    var body = document.body;
    var current = body.getAttribute("data-nav") || "";
    var main = document.getElementById("main");

    var skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main";
    skip.textContent = "본문 바로가기";

    // 머리글은 body 바로 아래에 넣어야 화면 위에 고정(sticky)됩니다
    var header = document.createElement("div");
    header.innerHTML = headerHtml(current);

    var footer = document.createElement("div");
    footer.innerHTML = footerHtml() + actionBarHtml();

    body.insertBefore(skip, body.firstChild);
    while (header.firstChild) body.insertBefore(header.firstChild, main);
    while (footer.firstChild) body.appendChild(footer.firstChild);

    bindMobileMenu();
  };
})();
