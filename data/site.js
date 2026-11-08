/**
 * 메뉴 — 머리글, 바닥글이 이 파일을 함께 씁니다.
 * 주소(href)는 사이트 맨 위 폴더 기준입니다. 예: "products.html"
 */
window.GD = window.GD || {};

/* 제품 분류(이름·규모·설명)는 data/categories.js 에 있습니다. */

GD.nav = {
  /** PC 상단 메뉴 (key 는 현재 페이지 표시용) */
  main: [
    { label: "이동식주택", href: "products.html?category=mobile-home" },
    { label: "체류형 쉼터", href: "products.html?category=shelter" },
    { label: "농막", href: "products.html?category=farm-hut" },
    { label: "컨테이너", href: "products.html?category=container" },
    { label: "시공 사례", href: "cases.html", key: "cases" },
    { label: "회사 안내", href: "about.html", key: "about" },
  ],
  /** 모바일 전체 메뉴 */
  mobile: [
    { label: "홈", href: "index.html", key: "home" },
    { label: "제품 전체 보기", href: "products.html", key: "products" },
    { label: "이동식주택", href: "products.html?category=mobile-home" },
    { label: "체류형 쉼터", href: "products.html?category=shelter" },
    { label: "농막", href: "products.html?category=farm-hut" },
    { label: "컨테이너", href: "products.html?category=container" },
    { label: "시공 사례", href: "cases.html", key: "cases" },
    { label: "제작·설치 과정", href: "process.html", key: "process" },
    { label: "회사 안내·오시는 길", href: "about.html", key: "about" },
  ],
  /** 모바일 머리글 아래 제품 분류 바로가기 */
  categoryShortcuts: [
    { label: "이동식주택", href: "products.html?category=mobile-home" },
    { label: "체류형 쉼터", href: "products.html?category=shelter" },
    { label: "농막", href: "products.html?category=farm-hut" },
    { label: "컨테이너", href: "products.html?category=container" },
  ],
  /** 바닥글 링크 */
  footer: [
    { label: "제품 안내", href: "products.html" },
    { label: "시공 사례", href: "cases.html" },
    { label: "제작·설치 과정", href: "process.html" },
    { label: "회사 안내", href: "about.html" },
    { label: "오시는 길", href: "about.html#location" },
  ],
};
