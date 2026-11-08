/**
 * 공통 도구와 화면 부품 (제품 카드, 사례 카드, 안내 상자, 전화 배너 등)
 *
 * 내용(문구·전화번호·제품)은 이 파일이 아니라 data 폴더에서 고칩니다.
 * 이 파일은 그 내용을 화면 모양으로 바꾸는 역할만 합니다.
 */
(function () {
  "use strict";
  var GD = (window.GD = window.GD || {});

  /* ───── 기본 도구 ───── */

  /** 페이지 위치에 따라 사이트 맨 위 폴더까지의 경로 ("" 또는 "../") */
  GD.root = function () {
    return document.body.getAttribute("data-root") || "";
  };

  /** 사이트 안 주소 만들기. 예: GD.url("products.html") */
  GD.url = function (path) {
    if (!path) return "";
    if (/^(https?:|tel:|mailto:|#)/.test(path)) return path;
    return GD.root() + path;
  };

  GD.productUrl = function (slug) {
    return GD.url("products/" + slug + ".html");
  };
  GD.caseUrl = function (slug) {
    return GD.url("cases/" + slug + ".html");
  };

  /** 글자를 안전하게 화면에 넣기 위한 변환 (데이터의 < > 등을 그대로 글자로 표시) */
  GD.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  GD.telHref = function (phone) {
    return "tel:" + String(phone).replace(/[^0-9+]/g, "");
  };

  GD.formatWon = function (amount) {
    return Number(amount).toLocaleString("ko-KR") + "원";
  };

  GD.formatPrice = function (price) {
    if (!price || price.kind === "consult" || price.amount == null) return "가격 상담";
    if (price.kind === "from") return GD.formatWon(price.amount) + "부터";
    return GD.formatWon(price.amount);
  };

  GD.vatLabel = function (vat) {
    if (vat === "included") return "부가세 포함";
    if (vat === "excluded") return "부가세 별도";
    return "상담 시 안내";
  };

  GD.getCategory = function (id) {
    for (var i = 0; i < GD.categories.length; i++) if (GD.categories[i].id === id) return GD.categories[i];
    return { id: id, label: id, fullLabel: id, description: "" };
  };
  GD.isCategory = function (id) {
    return GD.categories.some(function (c) {
      return c.id === id;
    });
  };
  GD.getProduct = function (slug) {
    return (GD.products || []).filter(function (p) {
      return p.slug === slug;
    })[0];
  };
  GD.getCase = function (slug) {
    return (GD.cases || []).filter(function (c) {
      return c.slug === slug;
    })[0];
  };
  GD.casesForProduct = function (product) {
    return (GD.cases || []).filter(function (c) {
      return (product.relatedCaseSlugs || []).indexOf(c.slug) >= 0 || c.productSlug === product.slug;
    });
  };
  /** 제품 카드·상세에 쓰는 면적: size.interior 하나만 원본으로 씁니다 */
  GD.productArea = function (p) {
    return p.size && p.size.interior && p.size.interior.value ? p.size.interior.value : null;
  };

  /** 여러 조각의 HTML 문자열을 이어 붙이기 */
  GD.join = function (list, fn) {
    return (list || []).map(fn).join("");
  };

  /* ───── 아이콘 (외부 라이브러리 없이 직접 그린 선 아이콘. 항상 글자와 함께 씁니다) ───── */

  var paths = {
    phone: '<path d="M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 6.9 6.9l1.3-2 4 1.6V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.8V20h13V9.8"/><path d="M10 20v-5.5h4V20"/>',
    image:
      '<rect x="3" y="4.5" width="18" height="15" rx="1.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 18 5.5-5.5 4 4 2.5-2.5 4 4"/>',
    tools:
      '<path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6l1.4 1.4-8 8a2 2 0 0 1-2.8-2.8l8-8"/><path d="m4 4 6.5 6.5"/><path d="M3 6.5 6.5 3l2 2L5 8.5Z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    right: '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    left: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    copy:
      '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="1.5"/><path d="M15.5 8.5V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
  };

  GD.icon = function (name, cls) {
    return (
      '<svg class="icon ' +
      (cls || "") +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      paths[name] +
      "</svg>"
    );
  };

  /** B안 ‘간결한 GD · 딥그린’ 심벌 (brand/gd-symbol.svg 와 같은 도형) */
  GD.logoSymbol = function (cls) {
    return (
      '<svg class="' +
      (cls || "") +
      '" viewBox="0 0 240 240" fill="currentColor" aria-hidden="true" focusable="false">' +
      '<path d="M0 72L120 0L240 72V94L120 22L0 94Z"/>' +
      '<path d="M18 101.2L113 44.2V68.2L42 110.8V216H89V174H66V150H113V240H38A20 20 0 0 1 18 220Z"/>' +
      '<path fill-rule="evenodd" d="M129 45.4L224 102.4V200A40 40 0 0 1 184 240H129ZM153 83.8L200 112V200A16 16 0 0 1 184 216H153Z"/>' +
      "</svg>"
    );
  };

  GD.logoLockup = function (inverse) {
    return (
      '<span class="logo' +
      (inverse ? " logo--inverse" : "") +
      '">' +
      GD.logoSymbol("logo__symbol") +
      '<span class="logo__text">' +
      GD.esc(GD.company.shortName) +
      "</span></span>"
    );
  };

  /* ───── 사진 ───── */

  GD.placeholder = function (label) {
    return '<span class="placeholder">' + GD.icon("image", "icon--lg") + "<span>" + GD.esc(label || "사진 준비 중") + "</span></span>";
  };

  /**
   * 비율이 고정된 사진 틀 + ‘디자인 예시’ 표시.
   * 사진 파일이 없거나 열리지 않으면 ‘사진 준비 중’으로 바뀝니다 (아래 오류 처리 참고).
   */
  GD.imageFrame = function (image, opts) {
    opts = opts || {};
    var cls = "frame " + (opts.aspect || "frame--16x10") + (opts.square ? " frame--square" : "");
    if (!image || !image.src) {
      return '<span class="' + cls + '">' + GD.placeholder(opts.placeholderLabel) + "</span>";
    }
    return (
      '<span class="' +
      cls +
      '">' +
      '<img src="' +
      GD.esc(GD.url(image.src)) +
      '" alt="' +
      GD.esc(image.alt) +
      '" width="' +
      (image.width || "") +
      '" height="' +
      (image.height || "") +
      '"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') +
      ' decoding="async" data-placeholder="' +
      GD.esc(opts.placeholderLabel || "사진 준비 중") +
      '">' +
      (image.isDesignExample ? '<span class="design-label">디자인 예시</span>' : "") +
      "</span>"
    );
  };

  /** 사진을 불러오지 못하면 같은 자리에 ‘사진 준비 중’ 표시 */
  function replaceBroken(img) {
    if (!img || img.getAttribute("data-broken")) return;
    img.setAttribute("data-broken", "1");
    var label = img.getAttribute("data-placeholder") || "사진 준비 중";
    var holder = document.createElement("span");
    holder.innerHTML = GD.placeholder(label);
    img.replaceWith(holder.firstChild);
  }
  document.addEventListener(
    "error",
    function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG" && t.hasAttribute("data-placeholder")) replaceBroken(t);
    },
    true
  );
  /** 화면을 그리기 전에 이미 실패한 사진도 바꿉니다 */
  GD.checkBrokenImages = function (scope) {
    (scope || document).querySelectorAll("img[data-placeholder]").forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) replaceBroken(img);
    });
  };

  /* ───── 안내 상자·버튼 ───── */

  GD.notice = function (html, extra) {
    return '<div class="notice ' + (extra || "") + '">' + GD.icon("info", "notice__icon") + "<div>" + html + "</div></div>";
  };

  GD.callButton = function (label, extra) {
    return (
      '<a class="btn btn--primary btn--lg ' +
      (extra || "") +
      '" href="' +
      GD.telHref(GD.company.phone.main) +
      '">' +
      GD.icon("phone", "icon--md") +
      "<span>" +
      GD.esc(label) +
      "</span></a>"
    );
  };

  /* ───── 제품 카드 ───── */

  GD.productCard = function (p, headingTag) {
    var h = headingTag || "h3";
    var cat = GD.getCategory(p.category);
    var area = GD.productArea(p);
    var specs = (p.keySpecs || []).filter(function (s) {
      return s.value;
    });
    var dl = "";
    if (area || specs.length) {
      dl =
        '<dl class="card__facts">' +
        (area ? '<div><dt>면적</dt><dd>' + GD.esc(area) + "</dd></div>" : "") +
        GD.join(specs, function (s) {
          return "<div><dt>" + GD.esc(s.label) + "</dt><dd>" + GD.esc(s.value) + "</dd></div>";
        }) +
        "</dl>";
    }
    return (
      '<article class="card">' +
      GD.imageFrame(p.images && p.images[0]) +
      '<div class="card__body">' +
      '<p class="card__kicker">' +
      GD.esc(cat.label) +
      (p.isExample ? '<span class="card__kicker-note"> · 개발용 예시 데이터</span>' : "") +
      "</p>" +
      "<" + h + ' class="card__title">' +
      GD.esc(p.name) +
      "</" + h + ">" +
      (p.summary ? '<p class="card__summary">' + GD.esc(p.summary) + "</p>" : "") +
      dl +
      '<p class="card__price"><span class="sr-only">가격: </span>' +
      GD.esc(GD.formatPrice(p.price)) +
      "</p>" +
      '<div class="card__action"><a class="btn btn--outline btn--block" href="' +
      GD.esc(GD.productUrl(p.slug)) +
      '">자세히 보기<span class="sr-only">: ' +
      GD.esc(p.name) +
      "</span>" +
      GD.icon("right") +
      "</a></div>" +
      "</div></article>"
    );
  };

  /* ───── 시공 사례 카드 ───── */

  GD.caseCard = function (c, headingTag) {
    var h = headingTag || "h3";
    return (
      '<article class="card">' +
      GD.imageFrame(c.images && c.images[0], { placeholderLabel: c.isExample ? "예시 · 완공 사진 자리" : "사진 준비 중" }) +
      '<div class="card__body">' +
      (c.isExample ? '<p class="card__kicker card__kicker--muted">개발용 예시 · 실제 사례 아님</p>' : "") +
      "<" + h + ' class="card__title card__title--sm">' +
      GD.esc(c.title) +
      "</" + h + ">" +
      '<dl class="card__facts">' +
      (c.region ? "<div><dt>지역</dt><dd>" + GD.esc(c.region) + "</dd></div>" : "") +
      "<div><dt>제품</dt><dd>" + GD.esc(c.productLabel) + "</dd></div>" +
      (c.work && c.work.length ? "<div><dt>시공 내용</dt><dd>" + GD.esc(c.work.join(" · ")) + "</dd></div>" : "") +
      "</dl>" +
      '<div class="card__action"><a class="btn btn--outline btn--block" href="' +
      GD.esc(GD.caseUrl(c.slug)) +
      '">사례 상세 보기<span class="sr-only">: ' +
      GD.esc(c.title) +
      "</span>" +
      GD.icon("right") +
      "</a></div>" +
      "</div></article>"
    );
  };

  GD.cardGrid = function (items, renderFn) {
    return (
      '<ul class="grid-cards">' +
      GD.join(items, function (it) {
        return "<li>" + renderFn(it) + "</li>";
      }) +
      "</ul>"
    );
  };

  /* ───── 자주 묻는 질문 (브라우저 기본 <details>: 자바스크립트 없이도 키보드로 열고 닫힘) ───── */

  GD.faqList = function (items) {
    if (!items || !items.length) {
      return '<p class="text-lg">자주 묻는 질문을 준비하고 있습니다. 궁금한 점은 전화로 문의해 주세요.</p>';
    }
    return (
      '<div class="faq">' +
      GD.join(items, function (f) {
        return (
          '<details class="faq__item" id="faq-' +
          GD.esc(f.id) +
          '"><summary class="faq__q"><span><span class="faq__mark" aria-hidden="true">Q.</span>' +
          GD.esc(f.question) +
          '</span><span class="faq__toggle"><span class="faq__open">열기</span><span class="faq__close">닫기</span>' +
          GD.icon("plus", "faq__plus") +
          '</span></summary><div class="faq__a">' +
          GD.join(f.answer, function (a) {
            return "<p>" + GD.esc(a) + "</p>";
          }) +
          "</div></details>"
        );
      }) +
      "</div>"
    );
  };

  /* ───── 제작·설치 단계 ───── */

  GD.renderSteps = function (detailed) {
    return (
      '<ol class="steps">' +
      GD.join(GD.processSteps, function (s) {
        return (
          '<li class="steps__item"><div class="steps__head"><span class="steps__num" aria-hidden="true">' +
          String(s.number).padStart(2, "0") +
          '</span><h3 class="steps__title"><span class="sr-only">' +
          s.number +
          "단계: </span>" +
          GD.esc(s.title) +
          '</h3></div><p class="steps__summary">' +
          GD.esc(s.summary) +
          "</p>" +
          (detailed
            ? '<ul class="dot-list">' +
              GD.join(s.details, function (d) {
                return "<li>" + GD.esc(d) + "</li>";
              }) +
              "</ul>"
            : "") +
          "</li>"
        );
      }) +
      "</ol>"
    );
  };

  /* ───── 비용 구성 안내 ───── */

  GD.costGuide = function (headingTag) {
    var h = headingTag || "h3";
    var cb = GD.costBreakdown;
    return (
      '<div class="cost">' +
      '<div class="panel"><' + h + ' class="panel__title">① ' + GD.esc(cb.product.title) + "</" + h + ">" +
      '<p class="mt-3 text-lg">' + GD.esc(cb.product.description) + "</p></div>" +
      '<div class="panel"><' + h + ' class="panel__title">② ' + GD.esc(cb.site.title) + "</" + h + ">" +
      '<p class="mt-3 text-lg">' + GD.esc(cb.site.description) + "</p>" +
      '<ul class="chips">' +
      GD.join(cb.site.items, function (i) {
        return "<li>" + GD.esc(i) + "</li>";
      }) +
      "</ul></div>" +
      '<p class="cost__sum">총비용 = ① 제품 가격 + ② 현장 여건에 따른 비용. 두 금액을 나누어 안내해 드립니다.</p>' +
      "</div>"
    );
  };

  /* ───── 연락처·주소 ───── */

  GD.contactPanel = function () {
    var c = GD.company;
    return (
      '<div class="contact">' +
      '<div class="panel"><h3 class="panel__title">전화 상담</h3>' +
      '<p class="mt-2 text-lg text-soft">번호를 누르면 대표전화로 연결됩니다.</p>' +
      '<a class="contact__phone" href="' + GD.telHref(c.phone.main) + '">' + GD.icon("phone", "icon--xl") +
      GD.esc(c.phone.main) + '<span class="sr-only">(대표전화로 전화 걸기)</span></a>' +
      '<p class="mt-3 text-lg">휴대전화 <a class="link-strong" href="' + GD.telHref(c.phone.mobile) + '">' +
      GD.esc(c.phone.mobile) + "</a></p>" +
      (c.hours ? '<p class="mt-2 text-lg text-soft">상담 시간 ' + GD.esc(c.hours) + "</p>" : "") +
      GD.callButton("대표전화로 상담하기", "mt-6 btn--auto") +
      "</div>" +
      '<div class="panel"><h3 class="panel__title">주소</h3>' +
      '<p class="contact__address">' + GD.icon("pin", "icon--md text-brand") + "<span>" + GD.esc(c.address) + "</span></p>" +
      '<div class="mt-5"><button type="button" class="btn btn--outline" data-copy-address>' +
      '<span data-copy-icon>' + GD.icon("copy", "icon--sm") + "</span>주소 복사</button>" +
      '<p class="copy-status" role="status" aria-live="polite"></p></div>' +
      '<ul class="map-links">' +
      GD.join(GD.mapLinks, function (m) {
        return (
          '<li><a class="btn btn--line" href="' + GD.esc(m.href) + '" target="_blank" rel="noopener noreferrer">' +
          GD.esc(m.label) + GD.icon("external", "icon--sm") + '<span class="sr-only">(새 창에서 열림)</span></a></li>'
        );
      }) +
      "</ul>" +
      '<p class="mt-4 text-base text-soft">지도 서비스에서 주소로 검색한 결과가 새 창으로 열립니다.</p>' +
      "</div></div>"
    );
  };

  /** 주소 복사 버튼 동작 */
  GD.bindCopyButtons = function (scope) {
    (scope || document).querySelectorAll("[data-copy-address]").forEach(function (btn) {
      if (btn.getAttribute("data-bound")) return;
      btn.setAttribute("data-bound", "1");
      var status = btn.parentNode.querySelector(".copy-status");
      var iconWrap = btn.querySelector("[data-copy-icon]");
      var timer;
      function show(ok) {
        iconWrap.innerHTML = GD.icon(ok ? "check" : "copy", "icon--sm");
        status.innerHTML = ok
          ? '<span class="text-brand">주소를 복사했습니다. 지도 앱에 붙여 넣어 검색하세요.</span>'
          : "복사하지 못했습니다. 주소를 길게 눌러 직접 복사해 주세요.";
        clearTimeout(timer);
        timer = setTimeout(function () {
          status.innerHTML = "";
          iconWrap.innerHTML = GD.icon("copy", "icon--sm");
        }, 5000);
      }
      function fallback(text) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.className = "offscreen";
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (e) {
          ok = false;
        }
        document.body.removeChild(ta);
        return ok;
      }
      btn.addEventListener("click", function () {
        var text = GD.company.address;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () {
              show(true);
            },
            function () {
              show(fallback(text));
            }
          );
        } else {
          show(fallback(text));
        }
      });
    });
  };

  /* ───── 페이지 마지막의 상담 안내 띠 ───── */

  GD.callBanner = function (title) {
    return (
      '<section class="call-banner section-y" aria-labelledby="call-banner-title"><div class="container call-banner__inner">' +
      '<div><h2 id="call-banner-title" class="h-section">' +
      GD.esc(title || "궁금한 점은 전화로 편하게 물어보세요") +
      '</h2><p class="mt-2 text-lead text-soft">원하시는 용도와 예산에 맞춰 상담해 드립니다.</p></div>' +
      '<div class="call-banner__actions">' +
      GD.callButton("전화 상담 " + GD.company.phone.main) +
      '<a class="btn btn--outline btn--lg" href="' + GD.url("about.html#location") + '">오시는 길</a>' +
      "</div></div></section>"
    );
  };

  /* ───── 현재 위치 (브레드크럼) ───── */

  GD.breadcrumb = function (crumbs) {
    return (
      '<nav aria-label="현재 위치"><ol class="crumbs">' +
      GD.join(crumbs, function (c, i) {
        var last = i === crumbs.length - 1;
        var inner =
          c.href && !last
            ? '<a href="' + GD.esc(GD.url(c.href)) + '">' + GD.esc(c.label) + "</a>"
            : '<span aria-current="' + (last ? "page" : "false") + '">' + GD.esc(c.label) + "</span>";
        return "<li>" + inner + (last ? "" : GD.icon("right", "icon--xs")) + "</li>";
      }) +
      "</ol></nav>"
    );
  };
})();
