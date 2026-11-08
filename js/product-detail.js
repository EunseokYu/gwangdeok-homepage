/**
 * 제품 상세 페이지
 *
 * products/<slug>.html 의 <main data-slug="..."> 값으로 data/products.js 에서 제품을 찾아
 * 아래 순서로 화면을 만듭니다.
 *   1. 현재 위치 · 제품명 · 대표 사진(좌우 화살표로 넘기기, 누르면 크게 보기)
 *   2. 짧은 소개: 한 문장 + 2~3문장 본문 + 핵심 정보(면적·구성·가격) + 상담 버튼
 *   3. 사진 갤러리 (PC 3열 · 태블릿 2열 · 모바일 1열, 누르면 크게 보기)
 *   4. 눌러서 펼치는 세부사항: 기본 사양(#specs) · 선택 옵션(#options) · 평면과 크기(#plan) · 가격·제작·설치(#price)
 *   5. 상담 · 제품 목록으로
 *
 * 값이 비어 있는(null) 항목은 화면에 늘어놓지 않고, 필요한 곳에 ‘상담 시 안내’를 한 번만 적습니다.
 */
(function () {
  "use strict";
  var GD = window.GD;
  var esc = GD.esc;
  var product;

  var SPACE_ORDER = ["외관", "거실", "주방", "침실", "욕실"];

  function has(list) {
    return list && list.length > 0;
  }
  function filled(v) {
    return v != null && String(v).trim() !== "";
  }

  /** "약 33㎡" → "약 33㎡ (약 10평)" (평이 이미 적혀 있으면 그대로) */
  function withPyeong(text) {
    if (!filled(text) || /평/.test(text)) return text;
    var m = /([\d.]+)\s*(㎡|m²|m2|제곱미터)/.exec(text);
    if (!m) return text;
    var py = Math.round((parseFloat(m[1]) / 3.3058) * 10) / 10;
    return text + " (약 " + py + "평)";
  }

  /** 아코디언 한 칸 (브라우저 기본 details: 키보드로 열고 닫기, 여러 칸 동시에 열기 가능) */
  function accordion(id, title, inner) {
    return (
      '<details class="pd-acc" id="' + id + '">' +
      '<summary class="pd-acc__head"><h2 class="pd-acc__title">' + esc(title) + "</h2>" +
      '<span class="pd-acc__state"><span class="pd-acc__open">열기</span><span class="pd-acc__close">닫기</span>' +
      GD.icon("plus", "pd-acc__icon") + "</span></summary>" +
      '<div class="pd-acc__body">' + inner + "</div></details>"
    );
  }

  /* ───── 1. 제품명 + 대표 사진 ───── */

  var hero = { list: [], index: 0 };

  function heroSlideHtml() {
    var img = hero.list[hero.index];
    if (!img) return '<span class="pd-slide__empty">' + GD.placeholder(product.name + " 사진 준비 중") + "</span>";
    return (
      '<button type="button" class="pd-slide__photo" data-lightbox="hero" data-index="' + hero.index + '" aria-label="사진 크게 보기: ' + esc(img.alt) + '">' +
      '<img src="' + esc(GD.url(img.src)) + '" alt="' + esc(img.alt) + '" width="' + (img.width || "") + '" height="' + (img.height || "") + '" data-hero-src="' + esc(img.src) + '">' +
      (img.isDesignExample ? '<span class="design-label">디자인 예시</span>' : "") +
      "</button>"
    );
  }
  function heroMetaHtml() {
    var img = hero.list[hero.index];
    if (!img) return "";
    return (
      (hero.list.length > 1 ? '<span class="pd-slide__count">' + (hero.index + 1) + " / " + hero.list.length + "</span>" : "") +
      (img.space ? '<span class="pd-slide__space">' + esc(img.space) + "</span>" : "") +
      GD.optionBadge(img)
    );
  }
  function heroHtml() {
    var multi = hero.list.length > 1;
    return (
      '<div class="pd-slide" data-hero>' +
      '<div class="pd-slide__stage">' + heroSlideHtml() +
      (multi
        ? '<button type="button" class="pd-slide__arrow pd-slide__arrow--prev" data-hero-go="-1" aria-label="이전 사진">' + GD.icon("left", "icon--md") + "</button>" +
          '<button type="button" class="pd-slide__arrow pd-slide__arrow--next" data-hero-go="1" aria-label="다음 사진">' + GD.icon("right", "icon--md") + "</button>"
        : "") +
      "</div>" +
      '<div class="pd-slide__meta" aria-live="polite">' + heroMetaHtml() + "</div>" +
      "</div>"
    );
  }
  function updateHero() {
    var box = document.querySelector("[data-hero]");
    if (!box) return;
    box.outerHTML = heroHtml();
  }
  function goHero(delta, keepFocus) {
    var n = hero.list.length;
    if (n < 2) return;
    hero.index = (hero.index + delta + n) % n;
    updateHero();
    if (keepFocus) {
      var b = document.querySelector('[data-hero-go="' + delta + '"]');
      if (b) b.focus();
    }
  }

  /* ───── 2. 짧은 소개 + 핵심 정보 ───── */

  function introHtml(cat) {
    var p = product;
    var ls = p.lifestyle || {};
    var body = p.shortDescription || (has(ls.intro) ? ls.intro.join(" ") : null);
    var size = p.size || {};
    var price = p.price || { kind: "consult" };
    var hasPrice = price.kind !== "consult" && price.amount != null;

    var facts = [];
    if (size.interior && filled(size.interior.value)) {
      facts.push(["면적", esc(withPyeong(size.interior.value)) + (size.interior.basis ? '<span class="pd-fact__note">' + esc(size.interior.basis) + "</span>" : "")]);
    }
    if (filled(p.layoutSummary)) facts.push(["구성", esc(p.layoutSummary)]);
    var priceNote = [];
    if (hasPrice && price.vat) priceNote.push(GD.vatLabel(price.vat));
    if (hasPrice && price.appliesTo) priceNote.push(price.appliesTo);
    facts.push([
      "제품 가격",
      '<span class="pd-fact__price">' + esc(GD.formatPrice(price)) + "</span>" +
        (priceNote.length ? '<span class="pd-fact__note">' + esc(priceNote.join(" · ")) + "</span>" : ""),
    ]);

    return (
      '<section class="pd-intro" aria-label="제품 소개">' +
      (p.tagline ? '<p class="pd-hook">' + esc(p.tagline) + "</p>" : "") +
      (body ? '<p class="pd-lede">' + esc(body) + "</p>" : "") +
      '<dl class="pd-facts2">' +
      GD.join(facts, function (f) {
        return '<div class="pd-fact"><dt>' + f[0] + "</dt><dd>" + f[1] + "</dd></div>";
      }) +
      "</dl>" +
      '<p class="pd-costnote">운송·설치 및 현장공사 비용은 제품 가격과 별도로 확인이 필요합니다.</p>' +
      '<div class="pd-intro__actions">' +
      GD.callButton("전화 상담 " + GD.company.phone.main) +
      '<a class="btn btn--outline btn--lg" href="#price" data-open-acc>가격·설치 안내 펼쳐보기</a>' +
      "</div></section>"
    );
  }

  /* ───── 3. 갤러리 ───── */

  function galleryList() {
    var list = hero.list.slice();
    function rank(img) {
      var i = SPACE_ORDER.indexOf(img.space);
      return i < 0 ? SPACE_ORDER.length : i;
    }
    return list
      .map(function (img, i) {
        return { img: img, i: i };
      })
      .sort(function (a, b) {
        return rank(a.img) - rank(b.img) || a.i - b.i;
      })
      .map(function (x) {
        return x.img;
      });
  }
  var gallery = [];
  function galleryHtml() {
    gallery = galleryList();
    GD.registerImageSet("gallery", gallery, product.name + " 사진");
    if (!gallery.length) return '<section class="pd-gallery" id="photos" aria-labelledby="photos-title"><h2 id="photos-title" class="h-section">사진</h2><p class="mt-4 text-lg">사진을 준비하고 있습니다.</p></section>';
    return (
      '<section class="pd-gallery" id="photos" aria-labelledby="photos-title">' +
      '<h2 id="photos-title" class="h-section">사진</h2>' +
      '<ul class="pd-grid">' +
      GD.join(gallery, function (img, i) {
        return (
          '<li class="pd-grid__item" data-gallery-src="' + esc(img.src) + '"><figure>' +
          '<button type="button" class="pd-grid__btn" data-lightbox="gallery" data-index="' + i + '" aria-label="' + esc((img.space || "사진") + " 크게 보기") + '">' +
          GD.imageFrame(img, { aspect: "frame--4x3", srcKey: img.src, noLazy: true }) +
          "</button>" +
          '<figcaption class="pd-grid__cap">' + (img.space ? esc(img.space) : "") + GD.optionBadge(img) + "</figcaption>" +
          "</figure></li>"
        );
      }) +
      "</ul>" +
      '<p class="pd-gallery__note" hidden>일부 공간 사진은 준비 중입니다.</p>' +
      "</section>"
    );
  }

  /** 파일이 없는 사진은 대표 사진·갤러리·크게 보기에서 빼고, 안내를 한 번만 보여 줍니다 */
  function dropMissing(src) {
    var before = hero.list.length;
    var current = hero.list[hero.index];
    hero.list = hero.list.filter(function (img) {
      return img.src !== src;
    });
    if (hero.list.length === before) return;
    var ci = hero.list.indexOf(current);
    hero.index = ci >= 0 ? ci : Math.min(hero.index, Math.max(0, hero.list.length - 1));
    GD.registerImageSet("hero", hero.list, product.name + " 사진");
    gallery = gallery.filter(function (img) {
      return img.src !== src;
    });
    GD.registerImageSet("gallery", gallery, product.name + " 사진");
    var li = document.querySelector('[data-gallery-src="' + cssEscape(src) + '"]');
    if (li) li.remove();
    document.querySelectorAll(".pd-grid__btn").forEach(function (b, i) {
      b.setAttribute("data-index", String(i));
    });
    var note = document.querySelector(".pd-gallery__note");
    if (note) note.hidden = false;
    if (!gallery.length) {
      var grid = document.querySelector(".pd-grid");
      if (grid) grid.remove();
      if (note) note.textContent = "사진을 준비하고 있습니다.";
    }
    updateHero();
  }
  function cssEscape(s) {
    return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
  }

  /* ───── 4. 펼침형 세부사항 ───── */

  function specsHtml() {
    var groups = product.specGroups || [];
    var anyMissing = false;
    var html = "";
    groups.forEach(function (g) {
      var items = (g.items || []).filter(function (it) {
        if (!filled(it.value)) {
          anyMissing = true;
          return false;
        }
        return true;
      });
      if (!items.length) return;
      html +=
        '<div class="pd-spec"><h3 class="pd-spec__group">' + esc(g.group) + '</h3><dl class="pd-spec__list">' +
        GD.join(items, function (it) {
          return "<div><dt>" + esc(it.label) + (it.hint ? '<span class="pd-spec__hint">' + esc(it.hint) + "</span>" : "") + "</dt><dd>" + esc(it.value) + "</dd></div>";
        }) +
        "</dl></div>";
    });
    if (!html) return '<p class="text-lg">세부 사양은 상담 시 안내합니다.</p>';
    return '<div class="pd-specs">' + html + "</div>" + (anyMissing ? '<p class="pd-acc__foot">그 밖의 세부 사양은 상담 시 안내합니다.</p>' : "");
  }

  function optionsHtml() {
    var opts = (product.options || []).filter(function (o) {
      return filled(o.name);
    });
    var list = opts.length
      ? '<ul class="pd-opts">' +
        GD.join(opts, function (o) {
          var cost = "비용 상담";
          if (o.cost && o.cost.type === "extra") cost = o.cost.amount != null ? "추가 " + GD.formatWon(o.cost.amount) : "추가 비용 있음";
          if (o.cost && o.cost.type === "quote") cost = "별도 견적";
          return (
            '<li class="pd-opt"><p class="pd-opt__name">' + esc(o.name) + '</p><p class="pd-opt__cost">' + esc(cost) + "</p>" +
            (filled(o.range) ? '<p class="pd-opt__line">선택 범위: ' + esc(o.range) + "</p>" : "") +
            (o.schedule === "affects" ? '<p class="pd-opt__line">제작 기간이 늘어날 수 있습니다.</p>' : "") +
            "</li>"
          );
        }) +
        "</ul>"
      : '<p class="text-lg">선택 옵션은 상담 시 안내합니다.</p>';
    return list + '<p class="pd-acc__foot">목록에 없는 구조·배치 변경은 비용과 기간을 검토한 뒤 가능 여부를 안내합니다.</p>';
  }

  function planHtml() {
    var p = product;
    var size = p.size || {};
    var plan = p.floorPlan
      ? '<button type="button" class="pd-plan2__img" data-lightbox="plan" data-index="0" aria-label="평면도 크게 보기">' +
        GD.imageFrame(p.floorPlan, { aspect: "frame--4x3", placeholderLabel: "평면도 준비 중" }) +
        '<span class="photo__zoom">' + GD.icon("expand", "icon--sm") + "크게 보기</span></button>"
      : '<p class="pd-plan2__none">평면도는 준비 중입니다. 필요하시면 전화로 요청해 주세요.</p>';
    var rows = [
      ["외형 크기", size.exterior],
      ["실내 면적", size.interior],
      ["다락", size.loft],
      ["데크", size.deck],
    ].filter(function (r) {
      return r[1] && filled(r[1].value);
    });
    var table = rows.length
      ? '<dl class="pd-kv">' +
        GD.join(rows, function (r) {
          return (
            "<div><dt>" + r[0] + "</dt><dd>" + esc(r[0] === "실내 면적" ? withPyeong(r[1].value) : r[1].value) +
            (r[1].basis ? '<span class="pd-fact__note">기준: ' + esc(r[1].basis) + "</span>" : "") + "</dd></div>"
          );
        }) +
        "</dl>"
      : '<p class="text-lg">크기는 상담 시 안내합니다.</p>';
    var rooms = (p.rooms || []).filter(function (r) {
      return filled(r.name);
    });
    var roomLine = rooms.length
      ? '<p class="pd-acc__foot">공간: ' + esc(rooms.map(function (r) {
          return r.name;
        }).join(" · ")) + "</p>"
      : "";
    return '<div class="pd-plan2">' + (p.floorPlan ? "<div>" + plan + "</div>" : "") + "<div>" + (p.floorPlan ? "" : plan) + table + roomLine + "</div></div>";
  }

  function priceHtml() {
    var p = product;
    var price = p.price || { kind: "consult" };
    var hasPrice = price.kind !== "consult" && price.amount != null;
    var rows = [["제품 가격", esc(GD.formatPrice(price))]];
    if (hasPrice) {
      rows.push(["부가세", price.vat ? esc(GD.vatLabel(price.vat)) : "상담 시 안내"]);
      if (price.appliesTo) rows.push(["기준 사양", esc(price.appliesTo)]);
    }
    var scope = p.costScope || [];
    function items(status) {
      return scope
        .filter(function (s) {
          return filled(s.item) && s.status === status;
        })
        .map(function (s) {
          return s.item;
        });
    }
    var inc = items("included");
    var exc = items("excluded");
    var ask = items(null).concat(items(undefined));
    if (inc.length) rows.push(["제품 가격에 포함", esc(inc.join(", "))]);
    if (exc.length) rows.push(["별도 비용", esc(exc.join(", "))]);
    if (ask.length) rows.push(["현장 확인 후 안내", esc(ask.join(", "))]);
    var sch = p.schedule || {};
    if (filled(sch.productionNote)) rows.push(["제작 일정", esc(sch.productionNote)]);

    return (
      '<dl class="pd-kv">' +
      GD.join(rows, function (r) {
        return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>";
      }) +
      "</dl>" +
      '<p class="pd-acc__foot">운송·크레인 등 장비·기초·전기·급배수 연결 비용은 설치 장소에 따라 달라 현장 확인 후 안내합니다.' +
      (filled(sch.siteNote) ? " " + esc(sch.siteNote) : "") + "</p>" +
      '<h3 class="pd-spec__group mt-6">상담 전에 알려 주시면 좋아요</h3>' +
      '<p class="pd-prep">' + esc((GD.productConsultChecklist || []).map(function (c) {
        return c.title;
      }).join(" · ")) + "</p>" +
      '<p class="mt-4"><a class="link-strong" href="' + GD.url("process.html") + '">제작·설치 과정 자세히 보기</a></p>'
    );
  }

  /* ───── 5. 상담 · 목록 ───── */

  function footerHtml(cat) {
    var real = GD.casesForProduct(product).filter(function (c) {
      return !c.isExample;
    });
    return (
      (real.length
        ? '<section class="pd-cases" aria-labelledby="cases-title"><h2 id="cases-title" class="h-section">시공 사례</h2><div class="mt-6">' +
          GD.cardGrid(real, function (c) {
            return GD.caseCard(c);
          }) +
          "</div></section>"
        : "") +
      '<section class="pd-end" id="consult" aria-labelledby="consult-title">' +
      '<h2 id="consult-title" class="h-section">' + esc(product.name) + " 상담</h2>" +
      '<p class="mt-2 text-lead text-soft">설치 지역과 용도를 알려 주시면 가격과 설치 조건을 안내해 드립니다.</p>' +
      '<div class="pd-end__actions">' +
      GD.callButton("전화 상담 " + GD.company.phone.main) +
      '<a class="btn btn--outline btn--lg" href="' + esc(GD.url("products.html?category=" + cat.id)) + '">' + esc(cat.label) + " 목록으로</a>" +
      "</div></section>"
    );
  }

  /* ───── 해시(#specs 등)로 들어오면 해당 칸을 펼치고 이동 ───── */

  function openTarget(hash, smooth) {
    if (!hash || hash.length < 2) return false;
    var el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return false;
    var acc = el.tagName === "DETAILS" ? el : el.closest("details");
    if (acc) acc.open = true;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    var head = acc ? acc.querySelector("summary") : null;
    if (head) head.focus({ preventScroll: true });
    // 이동하는 동안 위쪽 사진이 바뀌어 위치가 어긋났으면 한 번 더 맞춥니다
    setTimeout(function () {
      var top = el.getBoundingClientRect().top;
      if (top < 0 || top > 200) el.scrollIntoView({ block: "start" });
    }, 900);
    return true;
  }

  var bound = false;
  function bindOnce() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", function (e) {
      var go = e.target.closest && e.target.closest("[data-hero-go]");
      if (go) {
        goHero(Number(go.getAttribute("data-hero-go")), true);
        return;
      }
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a && document.querySelector(".pd-acc")) {
        var h = a.getAttribute("href");
        var target = document.getElementById(h.slice(1));
        if (target && (target.tagName === "DETAILS" || target.closest("details"))) {
          e.preventDefault();
          try {
            history.replaceState(null, "", h);
          } catch (err) {
            /* 파일로 열었을 때 등 */
          }
          openTarget(h, true);
        }
      }
    });
    // 대표 사진: 좌우 방향키로도 넘기기 (사진에 포커스가 있을 때)
    document.addEventListener("keydown", function (e) {
      if (document.querySelector("dialog[open]")) return;
      if (!e.target.closest || !e.target.closest("[data-hero]")) return;
      if (e.key === "ArrowRight") goHero(1, true);
      if (e.key === "ArrowLeft") goHero(-1, true);
    });
    // 휴대폰: 대표 사진을 옆으로 밀어서 넘기기
    var startX = null;
    document.addEventListener("touchstart", function (e) {
      startX = e.target.closest && e.target.closest(".pd-slide__stage") ? e.touches[0].clientX : null;
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) goHero(dx < 0 ? 1 : -1, false);
    });
    window.addEventListener("hashchange", function () {
      openTarget(window.location.hash, true);
    });
    // 사진 파일이 없으면 목록에서 빼기
    document.addEventListener(
      "error",
      function (e) {
        var t = e.target;
        if (!t || t.tagName !== "IMG" || !product) return;
        var src = t.getAttribute("data-hero-src") || t.getAttribute("data-src-key");
        if (src) dropMissing(src);
      },
      true
    );
  }

  GD.renderProductDetail = function (main) {
    var slug = main.getAttribute("data-slug");
    product = GD.getProduct(slug);
    if (!product) {
      main.innerHTML =
        '<div class="container section-y"><h1 class="h-page">제품 정보를 찾을 수 없습니다</h1>' +
        '<p class="mt-4 text-lg text-soft">제품이 정리되었거나 주소가 바뀌었을 수 있습니다.</p>' +
        '<p class="mt-6"><a class="btn btn--primary" href="' + GD.url("products.html") + '">제품 안내로 가기</a></p></div>';
      return;
    }
    var cat = GD.getCategory(product.category);
    hero.list = (product.images || []).filter(function (img) {
      return img && img.src;
    });
    hero.index = 0;
    GD.registerImageSet("hero", hero.list, product.name + " 사진");
    if (product.floorPlan) GD.registerImageSet("plan", [product.floorPlan], product.name + " 평면도");

    main.innerHTML =
      '<div class="container pd2">' +
      '<div class="pt-crumb">' +
      GD.breadcrumb([
        { label: "홈", href: "index.html" },
        { label: "제품 안내", href: "products.html" },
        { label: cat.label, href: "products.html?category=" + cat.id },
        { label: product.name },
      ]) +
      "</div>" +
      // 제품 종류(이동식주택 등)를 이름과 함께 표시
      '<h1 class="pd2__title"><span class="pd-title__cat">' + esc(cat.fullLabel) + "</span>" + esc(product.name) + "</h1>" +
      (product.isExample
        ? GD.notice("<strong>개발용 예시 제품</strong>입니다. ‘디자인 예시’ 사진은 실제 제품 사진이 아니며, 수치와 가격은 회사 확인 후 채워집니다.", "mt-4")
        : "") +
      (product.availability === "discontinued" ? GD.notice("<strong>현재 판매하지 않는 제품입니다.</strong> 비슷한 구성은 전화로 문의해 주세요.", "mt-4") : "") +
      heroHtml() +
      introHtml(cat) +
      galleryHtml() +
      '<section class="pd-details" aria-labelledby="details-title">' +
      '<h2 id="details-title" class="h-section">제품 세부사항</h2>' +
      '<div class="pd-accs">' +
      accordion("specs", "기본 사양", specsHtml()) +
      accordion("options", "선택 옵션", optionsHtml()) +
      accordion("plan", "평면과 크기", planHtml()) +
      accordion("price", "가격·제작·설치 안내", priceHtml()) +
      "</div></section>" +
      footerHtml(cat) +
      "</div>";

    bindOnce();
    // 화면을 그리기 전에 이미 실패한 사진도 빼 줍니다
    setTimeout(function () {
      main.querySelectorAll("img[data-hero-src], img[data-src-key]").forEach(function (img) {
        if (img.complete && img.naturalWidth === 0) dropMissing(img.getAttribute("data-hero-src") || img.getAttribute("data-src-key"));
      });
    }, 0);
    if (window.location.hash) openTarget(window.location.hash, false);
  };
})();
