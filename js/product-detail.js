/**
 * 제품 상세 페이지
 *
 * products/<slug>.html 의 <main data-slug="..."> 값으로 data/products.js 에서 제품을 찾아
 * 아래 순서로 화면을 만듭니다.
 *   A. 이름과 핵심 요약   B. 어떤 생활을 위한 집인가요   C. 사진으로 공간 살펴보기
 *   D. 평면과 크기        E. 기본 사양                  F. 내 생활에 맞춰 바꿀 수 있는 부분
 *   G. 가격과 포함 범위   H. 제작·설치 일정과 상담
 *
 * 값이 비어 있으면(null)
 *   - 개발용 예시 제품(isExample: true): ‘회사 확인 필요’ 표시
 *   - 실제 제품: ‘상담 시 안내’ 로 표시 (모르는 내용을 추측해 보여 주지 않습니다)
 */
(function () {
  "use strict";
  var GD = window.GD;
  var esc = GD.esc;
  var product;

  /** 비어 있는 값 표시 */
  function missing() {
    return product.isExample ? '<span class="tag-dev">회사 확인 필요</span>' : '<span class="text-soft">상담 시 안내</span>';
  }
  function val(v) {
    return v ? esc(v) : missing();
  }
  function has(list) {
    return list && list.length > 0;
  }

  var jumpLinks = [
    { id: "intro", label: "제품 소개" },
    { id: "photos", label: "사진" },
    { id: "plan", label: "평면" },
    { id: "specs", label: "기본 사양" },
    { id: "options", label: "선택 옵션" },
    { id: "price", label: "가격·상담" },
  ];

  function section(id, title, inner, lead) {
    return (
      '<section id="' + id + '" class="pd-section" aria-labelledby="' + id + '-title">' +
      '<h2 id="' + id + '-title" class="h-section">' + esc(title) + "</h2>" +
      (lead ? '<p class="pd-lead">' + lead + "</p>" : "") +
      '<div class="pd-body">' + inner + "</div></section>"
    );
  }

  /* ───── A. 이름과 핵심 요약 ───── */
  function heroHtml(cat) {
    var p = product;
    var first = p.images && p.images[0];
    var size = p.size || {};
    var photo = first
      ? '<button type="button" class="pd-hero__photo" data-lightbox="photos" data-index="0" aria-label="대표 사진 크게 보기: ' +
        esc(first.alt) + '">' + GD.imageFrame(first, { eager: true, aspect: "frame--16x10" }) + "</button>" +
        '<div class="pd-hero__photo-note">' +
        (first.space ? "<strong>" + esc(first.space) + "</strong> " : "") +
        GD.optionBadge(first) +
        (p.images.length > 1
          ? '<a class="link-plain" href="#photos">사진 ' + p.images.length + "장 모두 보기</a>"
          : "") +
        "</div>"
      : '<span class="frame frame--16x10 frame--rounded">' + GD.placeholder(p.name + " 사진 준비 중") + "</span>";

    var rows = [
      ["외형 크기", size.exterior ? esc(size.exterior.value) + (size.exterior.basis ? '<span class="pd-basis">' + esc(size.exterior.basis) + "</span>" : "") : missing()],
      ["실내 사용 면적", size.interior ? esc(size.interior.value) + (size.interior.basis ? '<span class="pd-basis">' + esc(size.interior.basis) + "</span>" : "") : missing()],
      ["공간 구성", val(p.layoutSummary)],
    ];
    var priceNote = [];
    if (p.price && p.price.appliesTo) priceNote.push(esc(p.price.appliesTo));
    if (p.price && p.price.vat) priceNote.push(esc(GD.vatLabel(p.price.vat)));

    return (
      '<div class="container pd-hero">' +
      '<div class="pd-hero__media">' + photo + "</div>" +
      '<div class="pd-hero__info">' +
      // 모델 이름만 단독으로 두지 않고, 제품 종류(이동식주택 등)를 제목에 함께 표시합니다
      '<h1 class="pd-title"><span class="pd-title__cat">' + esc(cat.fullLabel) + "</span>" + esc(p.name) + "</h1>" +
      (p.tagline ? '<p class="pd-tagline">' + esc(p.tagline) + "</p>" : p.summary ? '<p class="pd-tagline">' + esc(p.summary) + "</p>" : "") +
      (p.isExample
        ? GD.notice("이 제품 정보는 <strong>개발용 예시 데이터</strong>입니다. 사진은 디자인 예시이며, 수치·사양·가격은 회사 확인 후 채워집니다.", "mt-6")
        : "") +
      (p.availability === "discontinued"
        ? GD.notice("<strong>현재 판매하지 않는 제품입니다.</strong> 비슷한 구성은 전화로 문의해 주세요.", "mt-4")
        : "") +
      '<dl class="pd-facts">' +
      GD.join(rows, function (r) {
        return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>";
      }) +
      '<div class="pd-facts__price"><dt>제품 가격</dt><dd><span class="pd-price">' + esc(GD.formatPrice(p.price)) + "</span>" +
      (priceNote.length ? '<span class="pd-basis">' + priceNote.join(" · ") + "</span>" : "") +
      "</dd></div></dl>" +
      '<p class="mt-3 text-base text-soft">운송·설치·현장공사 비용은 제품 가격과 나누어 안내해 드립니다. <a class="link-strong" href="#price">가격 포함 범위 보기</a></p>' +
      '<div class="pd-hero__actions">' +
      GD.callButton("전화 상담 " + GD.company.phone.main, "btn--block") +
      '<a class="btn btn--outline btn--lg btn--block" href="' + GD.telHref(GD.company.phone.mobile) + '">휴대전화 ' + esc(GD.company.phone.mobile) + "</a>" +
      "</div>" +
      '<p class="mt-3 text-base text-soft">방문 전 전화로 문의해 주세요.</p>' +
      "</div></div>"
    );
  }

  /* ───── 페이지 안 바로가기 ───── */
  function jumpNavHtml() {
    return (
      '<nav class="jump" aria-label="제품 상세 내용 바로가기"><ul class="container jump__list">' +
      GD.join(jumpLinks, function (l) {
        return '<li><a class="jump__link" href="#' + l.id + '">' + esc(l.label) + "</a></li>";
      }) +
      "</ul></nav>"
    );
  }

  /* ───── B. 어떤 생활을 위한 집인가요 ───── */
  function introHtml() {
    var ls = product.lifestyle || {};
    var parts = "";
    if (has(ls.fitsFor)) {
      parts +=
        '<div class="pd-block"><h3 class="h-sub">이렇게 쓰시기 좋습니다</h3><ul class="check-list">' +
        GD.join(ls.fitsFor, function (f) {
          return "<li>" + GD.icon("check", "icon--md text-brand") + "<span>" + esc(f) + "</span></li>";
        }) +
        "</ul></div>";
    }
    if (has(ls.layoutPoints)) {
      parts +=
        '<div class="pd-block"><h3 class="h-sub">공간을 이렇게 나눴습니다</h3><dl class="layout-points">' +
        GD.join(ls.layoutPoints, function (lp) {
          return "<div><dt>" + esc(lp.layout) + "</dt><dd>" + esc(lp.benefit) + "</dd></div>";
        }) +
        "</dl></div>";
    }
    if (has(ls.intro)) {
      parts += '<div class="pd-text">' + GD.join(ls.intro, function (t) {
        return "<p>" + esc(t) + "</p>";
      }) + "</div>";
    }
    if (ls.otherPlanHint) {
      parts +=
        '<div class="pd-other"><h3 class="h-sub">다른 평면이 더 맞을 수 있는 경우</h3><p>' + esc(ls.otherPlanHint) + "</p>" +
        '<a class="link-strong" href="' + esc(GD.url("products.html?category=" + product.category)) + '">같은 분류의 다른 제품 보기</a></div>';
    }
    if (!parts) parts = '<p class="text-lg">어떤 용도에 맞는 제품인지 상담할 때 자세히 안내해 드립니다.</p>';
    return section("intro", "어떤 생활을 위한 집인가요", parts);
  }

  /* ───── C. 사진으로 공간 살펴보기 ───── */
  function photosHtml() {
    var imgs = product.images || [];
    if (!imgs.length) {
      return section("photos", "사진으로 공간 살펴보기", '<p class="text-lg">사진을 준비하고 있습니다. 필요하시면 전화로 요청해 주세요.</p>');
    }
    var list =
      '<ul class="photo-grid">' +
      GD.join(imgs, function (img, i) {
        return (
          '<li><figure class="photo">' +
          '<button type="button" class="photo__btn" data-lightbox="photos" data-index="' + i + '" aria-label="' +
          esc((img.space || "사진") + " 크게 보기: " + img.alt) + '">' +
          GD.imageFrame(img, { aspect: "frame--3x2", placeholderLabel: (img.space || "") + " 사진 준비 중" }) +
          '<span class="photo__zoom">' + GD.icon("expand", "icon--sm") + "크게 보기</span>" +
          "</button>" +
          '<figcaption class="photo__cap">' +
          (img.space ? '<strong class="photo__space">' + esc(img.space) + "</strong>" : "") +
          (img.caption ? "<span>" + esc(img.caption) + "</span>" : "") +
          GD.optionBadge(img) +
          "</figcaption></figure></li>"
        );
      }) +
      "</ul>";
    var anyOption = imgs.some(function (i) {
      return i.optionsShown && i.optionsShown.length;
    });
    return section(
      "photos",
      "사진으로 공간 살펴보기",
      list +
        (anyOption
          ? '<p class="mt-6 text-base text-soft">‘선택 옵션 적용’으로 표시된 사진에는 기본 가격에 포함되지 않는 항목이 들어 있습니다.</p>'
          : ""),
      "사진을 누르면 크게 볼 수 있습니다. 이전·다음 버튼이나 키보드 좌우 방향키로 넘겨 보세요."
    );
  }

  /* ───── D. 평면과 크기 ───── */
  function planHtml() {
    var p = product;
    var size = p.size || {};
    var plan = p.floorPlan
      ? '<button type="button" class="pd-plan__btn" data-lightbox="plan" data-index="0" aria-label="평면도 크게 보기">' +
        GD.imageFrame(p.floorPlan, { aspect: "frame--4x3", placeholderLabel: "평면도 준비 중" }) +
        '<span class="photo__zoom">' + GD.icon("expand", "icon--sm") + "평면도 크게 보기</span></button>"
      : '<div class="empty-box"><p class="empty-box__title">평면도 준비 중</p><p>평면도가 필요하시면 전화로 요청해 주세요.</p></div>';

    function sizeRow(label, item, optional) {
      if (!item && optional) return "";
      return (
        "<tr><th scope=\"row\">" + label + "</th><td>" +
        (item ? esc(item.value) + (item.basis ? '<span class="pd-basis">기준: ' + esc(item.basis) + "</span>" : "") : missing()) +
        "</td></tr>"
      );
    }
    var table =
      '<table class="kv-table"><caption class="sr-only">' + esc(p.name) + " 크기</caption><tbody>" +
      sizeRow("외형 크기", size.exterior) +
      sizeRow("실내 사용 면적", size.interior) +
      sizeRow("다락", size.loft, true) +
      sizeRow("데크", size.deck, true) +
      "</tbody></table>" +
      '<p class="mt-3 text-base text-soft">외형 크기, 실내 사용 면적, 다락·데크 면적은 서로 합치지 않고 따로 적었습니다.</p>';

    var rooms = has(p.rooms)
      ? '<h3 class="h-sub mt-8">공간별 구성</h3><dl class="rooms">' +
        GD.join(p.rooms, function (r) {
          return "<div><dt>" + esc(r.name) + "</dt><dd>" + (r.note ? esc(r.note) : "") + "</dd></div>";
        }) +
        "</dl>"
      : "";

    return section(
      "plan",
      "평면과 크기",
      '<div class="pd-plan"><div class="pd-plan__img">' + plan + '</div><div class="pd-plan__info"><h3 class="h-sub">크기</h3>' + table + rooms + "</div></div>"
    );
  }

  /* ───── E. 기본 사양 ───── */
  function specsHtml() {
    var groups = product.specGroups || [];
    if (!groups.length) return section("specs", "기본 사양", '<p class="text-lg">기본 사양은 상담할 때 안내해 드립니다.</p>');
    var html =
      '<div class="spec-groups">' +
      GD.join(groups, function (g) {
        return (
          '<div class="spec-group"><h3 class="spec-group__title">' + esc(g.group) + '</h3><dl class="spec-group__list">' +
          GD.join(g.items, function (it) {
            return (
              "<div><dt>" + esc(it.label) +
              (it.hint ? '<span class="spec-hint">' + esc(it.hint) + "</span>" : "") +
              "</dt><dd>" + val(it.value) + "</dd></div>"
            );
          }) +
          "</dl></div>"
        );
      }) +
      "</div>" +
      '<p class="mt-6 text-base text-soft">표에 적힌 것이 기본으로 제공되는 구성입니다. 재료 이름만으로 단열·내구성·결로 방지 성능을 보장하지 않으며, 실제 성능은 시공과 설치 장소 여건에 따라 달라질 수 있습니다.</p>';
    return section("specs", "기본 사양", html, "이 제품에 기본으로 들어가는 구성입니다. 처음 보는 용어에는 짧은 풀이를 달았습니다.");
  }

  /* ───── F. 내 생활에 맞춰 바꿀 수 있는 부분 ───── */
  function costText(cost) {
    if (!cost || !cost.type) return missing();
    if (cost.type === "extra") return cost.amount != null ? "추가금 " + esc(GD.formatWon(cost.amount)) : "추가금 있음 (금액 상담)";
    if (cost.type === "quote") return "별도 견적";
    return missing();
  }
  function scheduleText(s) {
    if (s === "affects") return "제작기간이 늘어날 수 있음";
    if (s === "none") return "제작기간 영향 없음";
    return missing();
  }

  function optionsHtml() {
    var p = product;
    var cz = p.customization || {};
    var base = has(cz.base) ? cz.base : ["평면도와 기본 사양에 적힌 구성"];

    var optionList = has(p.options)
      ? '<ul class="option-list">' +
        GD.join(p.options, function (o) {
          return (
            '<li class="option"><h4 class="option__name">' + esc(o.name) + '</h4><dl class="option__facts">' +
            "<div><dt>선택 범위</dt><dd>" + val(o.range) + "</dd></div>" +
            "<div><dt>기본과의 차이</dt><dd>" + val(o.vsBase) + "</dd></div>" +
            "<div><dt>비용</dt><dd>" + costText(o.cost) + "</dd></div>" +
            "<div><dt>제작기간</dt><dd>" + scheduleText(o.schedule) + "</dd></div>" +
            "</dl></li>"
          );
        }) +
        "</ul>"
      : '<p class="text-lg">선택 가능한 옵션은 상담할 때 안내해 드립니다.</p>';

    var custom = has(cz.custom)
      ? '<ul class="dot-list dot-list--lg">' + GD.join(cz.custom, function (c) {
          return "<li>" + esc(c) + "</li>";
        }) + "</ul>"
      : "";

    var html =
      '<ol class="tiers">' +
      '<li class="tier"><h3 class="tier__title"><span class="tier__num" aria-hidden="true">1</span>기본으로 제공하는 구성</h3>' +
      '<ul class="dot-list dot-list--lg">' + GD.join(base, function (b) {
        return "<li>" + esc(b) + "</li>";
      }) + "</ul>" +
      '<p class="mt-3 text-base text-soft"><a class="link-strong" href="#plan">평면</a>과 <a class="link-strong" href="#specs">기본 사양</a>에서 확인하실 수 있습니다.</p></li>' +
      '<li class="tier"><h3 class="tier__title"><span class="tier__num" aria-hidden="true">2</span>골라서 더할 수 있는 선택 옵션</h3>' +
      optionList + "</li>" +
      '<li class="tier"><h3 class="tier__title"><span class="tier__num" aria-hidden="true">3</span>비용·기간 검토가 필요한 개별 변경</h3>' +
      custom +
      '<p class="mt-3 text-lg">위 목록에 없는 변경은 비용과 제작기간을 먼저 검토한 뒤 가능 여부를 안내해 드립니다. 모든 구조·배치를 바꿀 수 있는 것은 아닙니다.</p></li>' +
      "</ol>";
    return section(
      "options",
      "내 생활에 맞춰 바꿀 수 있는 부분",
      html,
      "기본 구성을 바탕으로, 확인된 옵션과 상담이 필요한 변경을 나누어 안내합니다."
    );
  }

  /* ───── G. 가격과 포함 범위 + H. 일정과 상담 ───── */
  function statusBadge(s) {
    if (s === "included") return '<span class="status status--in">제품 가격에 포함</span>';
    if (s === "excluded") return '<span class="status status--out">별도</span>';
    return product.isExample ? '<span class="tag-dev">회사 확인 필요</span>' : '<span class="status">상담 시 안내</span>';
  }

  function priceHtml() {
    var p = product;
    var price = p.price || { kind: "consult" };
    var scope = p.costScope || [];
    var sch = p.schedule || {};

    var priceBox =
      '<div class="price-box">' +
      '<dl class="price-box__list">' +
      '<div><dt>제품 가격</dt><dd><span class="pd-price">' + esc(GD.formatPrice(price)) + "</span></dd></div>" +
      "<div><dt>적용 사양</dt><dd>" + (price.appliesTo ? esc(price.appliesTo) : missing()) + "</dd></div>" +
      "<div><dt>부가세</dt><dd>" + (price.vat ? esc(GD.vatLabel(price.vat)) : missing()) + "</dd></div>" +
      "</dl></div>";

    var scopeTable = scope.length
      ? '<table class="scope-table"><caption class="sr-only">제품 가격 포함 범위</caption><thead><tr><th scope="col">항목</th><th scope="col">제품 가격 포함 여부</th></tr></thead><tbody>' +
        GD.join(scope, function (s) {
          return (
            '<tr><th scope="row">' + esc(s.item) + "</th><td>" + statusBadge(s.status) +
            (s.note ? '<span class="pd-basis">' + esc(s.note) + "</span>" : "") + "</td></tr>"
          );
        }) +
        "</tbody></table>"
      : "";

    var checklist =
      '<ul class="prep-list">' +
      GD.join(GD.productConsultChecklist, function (c) {
        return "<li>" + GD.icon("check", "icon--md text-brand") + "<span><strong>" + esc(c.title) + "</strong>" +
          (c.note ? '<span class="prep-list__note">' + esc(c.note) + "</span>" : "") + "</span></li>";
      }) +
      "</ul>";

    var html =
      '<div class="pd-price-grid">' +
      "<div>" + '<h3 class="h-sub">제품 가격</h3>' + priceBox + "</div>" +
      "<div>" + '<h3 class="h-sub">가격에 포함되는 범위</h3>' + scopeTable +
      '<p class="mt-3 text-base text-soft">설치까지의 총비용은 제품 가격에 선택 옵션, 운송·설치, 기초·전기·급배수 같은 현장공사 비용이 더해질 수 있습니다. 현장 여건을 확인한 뒤 항목별로 나누어 안내해 드립니다. <a class="link-strong" href="' +
      GD.url("process.html#cost") + '">비용 구성 자세히 보기</a></p></div>' +
      "</div>" +
      '<div class="pd-schedule">' +
      '<h3 class="h-sub">제작·설치 일정</h3>' +
      '<div class="pd-text">' +
      (sch.productionNote ? "<p>" + esc(sch.productionNote) + "</p>" : "") +
      "<p>제작 기간은 사양과 자재 상황에 따라 달라집니다. 상담·설계·자재 준비·현장 준비·운송을 포함한 전체 일정은 상담할 때 함께 정합니다.</p>" +
      (sch.siteNote ? "<p>" + esc(sch.siteNote) + "</p>" : "") +
      "</div>" +
      '<p class="mt-3"><a class="link-strong" href="' + GD.url("process.html") + '">제작·설치 과정 보기</a></p>' +
      "</div>" +
      '<div class="consult-box">' +
      '<h3 class="h-sub">상담 전에 알려 주시면 좋아요</h3>' +
      '<p class="text-lg text-soft">모두 준비하지 않으셔도 상담할 수 있습니다.</p>' +
      checklist +
      '<div class="consult-box__actions">' +
      GD.callButton("전화 상담 " + GD.company.phone.main) +
      '<a class="btn btn--outline btn--lg" href="' + GD.telHref(GD.company.phone.mobile) + '">휴대전화 ' + esc(GD.company.phone.mobile) + "</a>" +
      "</div>" +
      (GD.company.hours ? '<p class="mt-3 text-base text-soft">상담 시간 ' + esc(GD.company.hours) + "</p>" : "") +
      "</div>";
    return section("price", "가격과 상담", html);
  }

  /* ───── 관련 시공 사례 ───── */
  function casesHtml() {
    var rel = GD.casesForProduct(product);
    var inner = rel.length
      ? GD.cardGrid(rel, function (c) {
          return GD.caseCard(c);
        })
      : '<p class="text-lg">이 제품의 시공 사례를 준비하고 있습니다. <a class="link-strong" href="' + GD.url("cases.html") + '">전체 시공 사례 보기</a></p>';
    return section("related-cases", "관련 시공 사례", inner);
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
    GD.registerImageSet("photos", product.images, product.name + " 사진");
    if (product.floorPlan) GD.registerImageSet("plan", [product.floorPlan], product.name + " 평면도");

    main.innerHTML =
      '<div class="container pt-crumb">' +
      GD.breadcrumb([
        { label: "홈", href: "index.html" },
        { label: "제품 안내", href: "products.html" },
        { label: cat.label, href: "products.html?category=" + cat.id },
        { label: product.name },
      ]) +
      "</div>" +
      heroHtml(cat) +
      jumpNavHtml() +
      '<div class="container">' +
      introHtml() +
      photosHtml() +
      planHtml() +
      specsHtml() +
      optionsHtml() +
      priceHtml() +
      casesHtml() +
      "</div>";
  };
})();
