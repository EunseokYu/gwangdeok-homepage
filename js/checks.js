/**
 * 공개 전 확인 목록 (check.html 에서만 사용)
 *
 * data 폴더의 내용을 읽어 비어 있는 항목, 서로 맞지 않는 항목, 예시로 남아 있는 항목을 보여 줍니다.
 * 이 페이지는 메뉴에 연결되어 있지 않고 검색에도 나오지 않게 해 두었습니다.
 */
(function () {
  "use strict";
  var GD = window.GD;
  var esc = GD.esc;

  function productIssues(p) {
    var out = []; // [단계, 내용]  단계: "필수"(공개 전 꼭) / "확인"(가능하면)
    function add(level, msg) {
      out.push([level, msg]);
    }
    var optionNames = (p.options || []).map(function (o) {
      return o.name;
    });

    if (p.isExample) add("필수", "개발용 예시 데이터입니다 (isExample: true). 실제 내용으로 바꾼 뒤 false 로 바꾸세요.");
    if (!p.name || /예시/.test(p.name)) add("필수", "제품 이름이 비었거나 ‘예시’가 들어 있습니다.");
    if (!GD.isCategory(p.category)) add("필수", "제품 분류(category) 값이 올바르지 않습니다: " + p.category);
    if (p.availability == null) add("필수", "현재 판매 여부(availability)가 확인되지 않았습니다.");
    if (!p.tagline) add("확인", "한 문장 소개(tagline)가 비어 있습니다.");
    if (!p.shortDescription) add("확인", "짧은 소개(shortDescription)가 비어 있습니다.");
    else if (p.shortDescription.length > 160) add("확인", "짧은 소개가 " + p.shortDescription.length + "자입니다. 140자 안팎으로 줄여 주세요.");
    if (!p.layoutSummary) add("확인", "공간 구성 요약(layoutSummary)이 비어 있습니다.");

    // 사진
    var imgs = p.images || [];
    if (!imgs.length) add("필수", "사진이 없습니다.");
    imgs.forEach(function (img, i) {
      var n = i + 1 + "번째 사진";
      if (img.isDesignExample) add("필수", n + "이 ‘디자인 예시’ 이미지입니다.");
      if (!img.alt || /예시|자리/.test(img.alt)) add("확인", n + "의 설명(alt)이 비었거나 예시 문구입니다.");
      if (!img.space) add("확인", n + "의 공간 이름(space)이 비어 있습니다.");
      if (img.caption && /예시/.test(img.caption)) add("확인", n + "의 사진 설명이 예시 문구입니다.");
      (img.optionsShown || []).forEach(function (o) {
        if (optionNames.indexOf(o) < 0) add("필수", n + "에 표시된 옵션 ‘" + o + "’이 선택 옵션 목록에 없습니다. 이름을 맞추거나 옵션을 추가하세요.");
      });
    });
    if (imgs.length) {
      ["외관", "거실", "주방", "침실", "욕실"].forEach(function (space) {
        if (p.category === "container") return;
        if (!imgs.some(function (i) { return i.space === space; })) add("확인", "‘" + space + "’ 사진이 없습니다. (해당 공간이 없으면 무시)");
      });
    }

    // 크기
    var size = p.size || {};
    ["exterior", "interior"].forEach(function (k) {
      var label = k === "exterior" ? "외형 크기" : "실내 사용 면적";
      if (!size[k]) add("필수", label + "가 비어 있습니다.");
      else {
        if (/○|예시/.test(size[k].value || "")) add("필수", label + "에 예시 값(○)이 남아 있습니다.");
        if (!size[k].basis) add("필수", label + "의 산정 기준(basis)이 비어 있습니다.");
      }
    });
    ["loft", "deck"].forEach(function (k) {
      if (size[k] && /○|예시/.test(size[k].value || "")) add("필수", (k === "loft" ? "다락" : "데크") + " 면적에 예시 값(○)이 남아 있습니다.");
    });
    (p.keySpecs || []).forEach(function (s) {
      if (/면적/.test(s.label)) add("확인", "카드용 핵심 사양에 면적이 따로 있습니다. 면적은 size.interior 하나로만 관리하세요.");
    });
    if (!p.floorPlan && p.category !== "container") add("확인", "평면도가 없습니다.");

    // 사양
    var emptySpecs = [];
    (p.specGroups || []).forEach(function (g) {
      g.items.forEach(function (it) {
        if (!it.value || /예시/.test(it.value)) emptySpecs.push(g.group + " › " + it.label);
      });
    });
    if (emptySpecs.length) add("필수", "비었거나 예시인 기본 사양 " + emptySpecs.length + "개: " + emptySpecs.join(", "));

    // 옵션
    (p.options || []).forEach(function (o) {
      if (!o.cost || !o.cost.type) add("확인", "옵션 ‘" + o.name + "’의 비용(추가금/별도 견적)이 확인되지 않았습니다.");
      if (o.schedule == null) add("확인", "옵션 ‘" + o.name + "’의 제작기간 영향이 확인되지 않았습니다.");
      if (/예시/.test((o.range || "") + (o.vsBase || ""))) add("필수", "옵션 ‘" + o.name + "’에 예시 문구가 남아 있습니다.");
    });

    // 가격
    var price = p.price || {};
    if (price.kind !== "consult" && price.amount == null) add("필수", "가격 종류가 정가/시작가인데 금액이 비어 있습니다.");
    if (price.kind !== "consult" && !price.vat) add("필수", "가격이 있는데 부가세 포함 여부가 비어 있습니다.");
    if (price.kind !== "consult" && !price.appliesTo) add("필수", "가격이 어떤 사양 기준인지(appliesTo) 비어 있습니다.");
    if (price.appliesTo && /예시/.test(price.appliesTo)) add("필수", "가격 적용 사양에 예시 문구가 남아 있습니다.");
    var unknownScope = (p.costScope || []).filter(function (s) {
      return s.status == null;
    });
    if (unknownScope.length)
      add("확인", "포함 여부가 확인되지 않은 비용 " + unknownScope.length + "개: " + unknownScope.map(function (s) { return s.item; }).join(", ") + " (화면에는 ‘상담 시 안내’)");

    // 생활 설명
    var ls = p.lifestyle || {};
    var lsText = JSON.stringify(ls);
    if (/예시/.test(lsText)) add("필수", "‘어떤 생활을 위한 집인가요’에 예시 문구가 남아 있습니다.");
    if (/예시/.test(p.tagline || "") || /예시/.test(p.summary || "") || /예시/.test(p.shortDescription || "")) add("필수", "한 줄 설명이나 특징 문장에 예시 문구가 남아 있습니다.");
    if (/2주/.test((p.schedule && p.schedule.productionNote) || "")) add("확인", "제작 기간 문구에 ‘2주’가 있습니다. 일부 사례라는 조건과 회사 확인 여부를 확인하세요.");

    // 사례 연결
    (p.relatedCaseSlugs || []).forEach(function (s) {
      if (!GD.getCase(s)) add("필수", "관련 시공 사례 ‘" + s + "’를 찾을 수 없습니다.");
    });
    return out;
  }

  function otherIssues() {
    var out = [];
    var c = GD.company;
    out.push(["확인", "회사명·대표전화·휴대전화·주소는 기존 ok114 사이트 기준입니다. 회사에 최종 확인하세요."]);
    if (!c.hours) out.push(["확인", "상담 시간(hours)이 비어 있어 표시되지 않습니다."]);
    if (!c.representative) out.push(["확인", "대표자 이름이 비어 있어 표시되지 않습니다."]);
    if (!c.businessRegistrationNumber) out.push(["확인", "사업자등록번호가 비어 있어 표시되지 않습니다."]);
    GD.cases.forEach(function (cs) {
      if (cs.isExample) out.push(["필수", "시공 사례 ‘" + cs.title + "’은 개발용 예시입니다."]);
      if (cs.productSlug && !GD.getProduct(cs.productSlug)) out.push(["필수", "시공 사례 ‘" + cs.title + "’의 제품 ‘" + cs.productSlug + "’을 찾을 수 없습니다."]);
    });
    var draft = GD.faqs.filter(function (f) {
      return f.needsReview;
    }).length;
    if (draft) out.push(["필수", "자주 묻는 질문 " + draft + "개가 회사 확인 전 초안입니다."]);
    out.push(["필수", "정식 공개할 때 모든 HTML 파일의 검색 제외 줄(noindex)을 지우세요. (README ‘정식 공개’ 참고)"]);
    return out;
  }

  function list(items) {
    if (!items.length) return '<p class="check-ok">' + GD.icon("check", "icon--md") + "확인할 항목이 없습니다.</p>";
    return (
      '<ul class="check-issues">' +
      GD.join(items, function (it) {
        return '<li><span class="check-level check-level--' + (it[0] === "필수" ? "must" : "should") + '">' + it[0] + "</span><span>" + esc(it[1]) + "</span></li>";
      }) +
      "</ul>"
    );
  }

  GD.renderChecks = function (main) {
    var html =
      '<div class="container section-y">' +
      '<h1 class="h-page">공개 전 확인 목록</h1>' +
      '<p class="mt-4 text-lg text-soft">data 폴더의 내용을 읽어 비어 있거나 서로 맞지 않는 항목을 보여 줍니다. ' +
      "<strong>필수</strong>는 정식 공개 전에 꼭 정리할 항목, <strong>확인</strong>은 가능하면 채울 항목입니다. 이 페이지는 메뉴에 연결되어 있지 않습니다.</p>";
    GD.products.forEach(function (p) {
      html +=
        '<section class="check-block"><h2 class="h-section-sm">제품: ' + esc(GD.getCategory(p.category).fullLabel + " · " + p.name) + "</h2>" +
        '<p class="text-base text-soft">파일: data/products.js · 페이지: products/' + esc(p.slug) + '.html · <a class="link-strong" href="' +
        GD.productUrl(p.slug) + '">상세 페이지 열기</a></p>' +
        list(productIssues(p)) +
        "</section>";
    });
    html += '<section class="check-block"><h2 class="h-section-sm">회사 정보·시공 사례·자주 묻는 질문</h2>' + list(otherIssues()) + "</section></div>";
    main.innerHTML = html;
  };
})();
