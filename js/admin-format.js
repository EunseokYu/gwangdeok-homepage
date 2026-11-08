/**
 * 관리자 페이지가 data 파일을 읽고 쓰는 형식
 *
 * data/products.js 와 data/categories.js 는 관리자 페이지가 통째로 다시 씁니다.
 * 파일 맨 위 설명은 아래 머리말이 매번 함께 들어갑니다.
 */
(function (root) {
  "use strict";

  var PRODUCTS_HEADER = [
    "/**",
    " * 제품 데이터 — 제품 목록, 제품 카드, 제품 상세, 가격·사양 안내가 모두 이 파일 하나를 씁니다.",
    " *",
    " * ★ 관리자 페이지(admin.html)에서 고치는 것을 권합니다. 저장하면 이 파일이 통째로 다시 만들어집니다.",
    " *   직접 고칠 때는 형식(큰따옴표 \"\", 쉼표, 괄호)을 지켜 주세요. 형식이 틀리면 제품이 화면에 나오지 않습니다.",
    " *",
    " * ■ 값을 모를 때는 null 로 둡니다. 화면에는 ‘상담 시 안내’ 또는 ‘회사 확인 필요’로 보입니다.",
    " *   모르는 항목을 ‘포함’이나 ‘별도’로 추측해 적지 마세요.",
    " * ■ 공개 전에 check.html 을 열면 비어 있거나 서로 맞지 않는 항목을 한눈에 볼 수 있습니다.",
    " *",
    " * ── 칸 설명 ───────────────────────────────────────────────",
    " * slug          주소에 쓰는 영문 이름. products/<slug>.html 파일 이름과 같아야 합니다.",
    " * category      \"mobile-home\"(이동식주택) / \"shelter\"(농촌체류형 쉼터) / \"farm-hut\"(농막) / \"container\"(컨테이너)",
    " * name          제품 이름. 정식 모델명이 없으면 구성으로 부릅니다. 예: \"방 1개와 거실형\"",
    " * availability  \"on-sale\"(판매 중) / \"discontinued\"(판매 종료) / null(확인 전)",
    " * summary       제품 카드의 한 줄 설명",
    " * tagline       상세 페이지 첫 화면의 ‘특징 한 문장’",
    " * layoutSummary 공간 구성 요약. 예: \"방 1 · 거실 · 주방 · 욕실\"",
    " * images[]      사진 { src, alt, width, height, space(공간 이름), caption(설명), optionsShown(사진에 들어간 옵션 이름), isDesignExample }",
    " * lifestyle     { fitsFor(쓰기 좋은 경우), layoutPoints[{layout, benefit}], otherPlanHint, intro(설명 문단) }",
    " * floorPlan     평면도 이미지 (없으면 null — 임의로 그린 도면을 넣지 마세요)",
    " * size          { exterior, interior, loft, deck } 각각 { value, basis(산정 기준) } 또는 null. 다락·데크는 실내 면적에 합치지 않습니다.",
    " * rooms[]       공간별 구성 { name, note }",
    " * keySpecs[]    제품 카드에 함께 보일 핵심 사양 { label, value }",
    " * specGroups[]  기본 사양 { group, items[{ label, value, hint(용어 풀이) }] }",
    " * options[]     선택 옵션 { name, range, vsBase, cost{ type: \"extra\"/\"quote\"/null, amount }, schedule: \"affects\"/\"none\"/null }",
    " * customization { base(기본 제공), custom(검토가 필요한 개별 변경) }",
    " * price         { kind: \"consult\"/\"fixed\"/\"from\", amount, vat: \"included\"/\"excluded\"/null, appliesTo }",
    " * costScope[]   가격 포함 범위 { item, status: \"included\"/\"excluded\"/null }",
    " * schedule      { productionNote, siteNote }  (‘빠르면 제작 2주’ 같은 문구는 조건과 함께, 회사 확인 후에만)",
    " * relatedCaseSlugs  관련 시공 사례의 slug 목록",
    " * isExample     개발용 예시 데이터이면 true (화면에 ‘개발용 예시’ 안내가 표시됩니다)",
    " */",
  ].join("\n");

  var CATEGORIES_HEADER = [
    "/**",
    " * 제품 분류 (메뉴·분류 버튼·제품 안내 머리말·분류 안내 카드가 함께 씁니다)",
    " *",
    " * ★ 관리자 페이지(admin.html)의 ‘제품군 설명’에서 고치는 것을 권합니다. 저장하면 이 파일이 통째로 다시 만들어집니다.",
    " *",
    " *   id          주소와 데이터에 쓰는 영문 이름 (바꾸지 마세요. 메뉴 주소와 제품의 category 값이 이 이름을 씁니다)",
    " *   label       메뉴·분류 버튼에 쓰는 짧은 이름",
    " *   fullLabel   제목에 쓰는 정식 이름",
    " *   size        규모 안내",
    " *   headline    분류를 소개하는 한 줄",
    " *   description 분류 설명",
    " *   note        작은 글씨 참고 안내 (없으면 null)",
    " *",
    " * ⚠️ 농촌체류형 쉼터·농막은 농지법령 기준이 있습니다. 문구를 바꿀 때 농림축산식품부 안내를 다시 확인하세요.",
    " *    (2026년 11월 확인: 쉼터 연면적 33㎡ 이내, 농막 연면적 20㎡ 이하)",
    " */",
  ].join("\n");

  function build(header, name, value) {
    return header + "\nwindow.GD = window.GD || {};\n\nGD." + name + " = " + JSON.stringify(value, null, 2) + ";\n";
  }

  /** 파일 내용에서 GD.<name> = ... ; 부분을 읽어 냅니다 */
  function parse(text, name) {
    var m = new RegExp("GD\\." + name + "\\s*=\\s*([\\s\\S]*?);\\s*$").exec(text);
    if (!m) throw new Error(name + " 데이터를 찾지 못했습니다.");
    return JSON.parse(m[1]);
  }

  /** 새 제품 페이지(products/<slug>.html) — 다른 제품 페이지와 같은 틀 */
  function productPage(product, categoryLabel, version) {
    function esc(s) {
      return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    var title = product.name.indexOf(categoryLabel) >= 0 ? product.name : categoryLabel + " · " + product.name;
    var t = esc(title) + " | 광덕건업";
    var d = esc(title + " — 사진, 평면과 크기, 기본 사양, 선택 옵션, 가격 포함 범위와 상담 안내.");
    var v = "?v=" + version;
    var js = ["data/company.js", "data/site.js", "data/categories.js", "data/products.js", "data/cases.js", "data/faq.js", "data/process.js",
      "js/core.js", "js/layout.js", "js/gallery.js", "js/product-detail.js", "js/pages.js"];
    return [
      "<!DOCTYPE html>",
      '<html lang="ko">',
      "  <head>",
      '    <meta charset="utf-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
      "    <!-- 보안: 이 사이트 안의 파일만 불러오도록 제한합니다 (외부 스크립트 차단) -->",
      "    <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'\">",
      '    <meta name="referrer" content="strict-origin-when-cross-origin">',
      "    <!-- 검색 제외: 예시 자료를 실제 자료로 바꾸고 정식 공개할 때 아래 한 줄을 지웁니다 -->",
      '    <meta name="robots" content="noindex, nofollow">',
      "    <title>" + t + "</title>",
      '    <meta name="description" content="' + d + '">',
      '    <meta name="theme-color" content="#ffffff">',
      '    <meta property="og:type" content="website">',
      '    <meta property="og:locale" content="ko_KR">',
      '    <meta property="og:site_name" content="(주)광덕건업">',
      '    <meta property="og:title" content="' + t + '">',
      '    <meta property="og:description" content="' + d + '">',
      '    <meta property="og:image" content="../brand/og-image.png">',
      '    <meta property="og:image:alt" content="(주)광덕건업 로고와 이동식주택·농촌체류형 쉼터 제작·설치, 대표전화 041-551-2836 안내">',
      '    <meta name="twitter:card" content="summary_large_image">',
      '    <link rel="icon" href="../favicon.ico" sizes="any">',
      '    <link rel="icon" href="../brand/icon.svg" type="image/svg+xml">',
      '    <link rel="apple-touch-icon" href="../brand/apple-icon.png">',
      '    <link rel="stylesheet" href="../css/style.css' + v + '">',
    ]
      .concat(js.map(function (s) {
        return '    <script src="../' + s + v + '" defer></script>';
      }))
      .concat([
        "  </head>",
        '  <body data-root="../" data-nav="products">',
        "    <noscript>",
        '      <div class="noscript">이 페이지는 자바스크립트를 켜야 모든 내용이 보입니다. 상담 전화 <a href="tel:0415512836">041-551-2836</a></div>',
        "    </noscript>",
        '    <main id="main" tabindex="-1" data-page="product-detail" data-slug="' + esc(product.slug) + '">',
        '      <p class="container section-y">제품 정보를 불러오는 중입니다.</p>',
        "    </main>",
        "  </body>",
        "</html>",
        "",
      ])
      .join("\n");
  }

  var api = {
    productsFile: function (products) {
      return build(PRODUCTS_HEADER, "products", products);
    },
    categoriesFile: function (categories) {
      return build(CATEGORIES_HEADER, "categories", categories);
    },
    parse: parse,
    productPage: productPage,
  };
  root.GDAdminFormat = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
