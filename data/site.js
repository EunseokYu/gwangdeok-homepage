/**
 * 메뉴·제품 분류 — 머리글, 바닥글, 제품 목록이 이 파일을 함께 씁니다.
 * 주소(href)는 사이트 맨 위 폴더 기준입니다. 예: "products.html"
 */
window.GD = window.GD || {};

GD.categories = [
  {
    id: "mobile-home",
    /** 메뉴·필터에 쓰는 짧은 이름 */
    label: "이동식주택",
    /** 제목에 쓰는 정식 이름 */
    fullLabel: "이동식주택",
    description: "광덕건업이 직접 제작해 설치할 곳으로 운송·설치하는 주택입니다.",
  },
  {
    id: "shelter",
    label: "체류형 쉼터",
    fullLabel: "농촌체류형 쉼터",
    // 법령 내용은 바뀔 수 있습니다. 문구를 바꿀 때 농림축산식품부 안내를 다시 확인하세요.
    description:
      "농지에서 영농을 하며 임시로 머무를 수 있도록 설치하는 시설입니다. 농지법령에 따른 면적·입지·안전 기준과 신고 절차가 있어, 설치 예정 토지에서 가능한지 상담할 때 함께 확인합니다.",
  },
  {
    id: "container",
    label: "중고컨테이너",
    fullLabel: "중고컨테이너",
    description: "중고컨테이너 판매와 매입, 수리 후 재판매를 상담합니다.",
  },
];

GD.nav = {
  /** PC 상단 메뉴 (key 는 현재 페이지 표시용) */
  main: [
    { label: "이동식주택", href: "products.html?category=mobile-home" },
    { label: "체류형 쉼터", href: "products.html?category=shelter" },
    { label: "중고컨테이너", href: "products.html?category=container" },
    { label: "시공 사례", href: "cases.html", key: "cases" },
    { label: "회사 안내", href: "about.html", key: "about" },
  ],
  /** 모바일 전체 메뉴 */
  mobile: [
    { label: "홈", href: "index.html", key: "home" },
    { label: "제품 전체 보기", href: "products.html", key: "products" },
    { label: "이동식주택", href: "products.html?category=mobile-home" },
    { label: "체류형 쉼터", href: "products.html?category=shelter" },
    { label: "중고컨테이너", href: "products.html?category=container" },
    { label: "시공 사례", href: "cases.html", key: "cases" },
    { label: "제작·설치 과정", href: "process.html", key: "process" },
    { label: "회사 안내·오시는 길", href: "about.html", key: "about" },
  ],
  /** 모바일 머리글 아래 제품 분류 바로가기 */
  categoryShortcuts: [
    { label: "이동식주택", href: "products.html?category=mobile-home" },
    { label: "체류형 쉼터", href: "products.html?category=shelter" },
    { label: "중고컨테이너", href: "products.html?category=container" },
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
