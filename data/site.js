/**
 * 메뉴·제품 분류 — 머리글, 바닥글, 제품 목록이 이 파일을 함께 씁니다.
 * 주소(href)는 사이트 맨 위 폴더 기준입니다. 예: "products.html"
 */
window.GD = window.GD || {};

/**
 * 제품 분류 (4개)
 *   id         주소와 데이터에 쓰는 영문 이름 (바꾸면 products.js 의 category 값도 함께 바꿔야 합니다)
 *   label      메뉴·분류 버튼에 쓰는 짧은 이름
 *   fullLabel  제목에 쓰는 정식 이름
 *   size       규모 안내 (분류 이름 옆에 표시)
 *   headline   분류를 소개하는 한 줄
 *   description 분류 설명
 *   note       작은 글씨 참고 안내 (없으면 null)
 *
 * ⚠️ 농촌체류형 쉼터·농막은 농지법령 기준이 있습니다. 문구를 바꿀 때 농림축산식품부 안내를 다시 확인하세요.
 *    (2026년 11월 확인: 쉼터 연면적 33㎡ 이내, 농막 연면적 20㎡ 이하)
 */
GD.categories = [
  {
    id: "mobile-home",
    label: "이동식주택",
    fullLabel: "이동식주택",
    size: "10평 이상",
    headline: "넓은 생활 공간과 자유로운 맞춤 설계",
    description:
      "10평 이상의 넉넉한 공간을 활용해 주거 목적에 맞는 구조와 편의시설을 구성할 수 있습니다. 다양한 규모와 디자인으로 제작하며, 제작부터 현장 설치까지 제공합니다.",
    note: null,
  },
  {
    id: "shelter",
    label: "체류형 쉼터",
    fullLabel: "농촌체류형 쉼터",
    size: "10평 이하",
    headline: "간소한 행정절차로 마련하는 농촌 체류 공간",
    description:
      "일반 주택 건축과 달리 농지전용허가 없이 신고 절차를 통해 설치할 수 있는 임시숙소입니다. 농촌에서의 주말 체류와 영농활동을 위한 공간으로 활용할 수 있습니다.",
    // 기존 안내 문구를 참고용으로 남겨 두었습니다. 필요 없으면 null 로 바꾸세요.
    note: "농지법령에 따른 면적·입지·안전 기준이 있어, 설치 예정 토지에서 가능한지 상담할 때 함께 확인합니다.",
  },
  {
    id: "farm-hut",
    label: "농막",
    fullLabel: "농막",
    size: "6평 이하",
    headline: "경제적이고 실용적인 농업용 공간",
    description:
      "비교적 적은 비용으로 농기구 보관과 농작업 중 휴식에 필요한 공간을 마련할 수 있습니다. 필요한 기능에 집중한 실용적인 구성이 특징입니다.",
    note: null,
  },
  {
    id: "container",
    label: "컨테이너",
    fullLabel: "컨테이너",
    size: "다양한 규격",
    headline: "다양한 용도와 예산에 맞는 합리적인 선택",
    description:
      "사무실, 창고, 작업실 등 여러 목적으로 활용할 수 있습니다. 신품부터 중고 및 리모델링 제품까지 선택할 수 있어 용도와 예산에 맞는 공간을 마련할 수 있습니다.",
    note: null,
  },
];

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
