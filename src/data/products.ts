import type { Product, SpecItem } from "@/types/content";

/**
 * 제품 데이터
 *
 * ⚠️ 지금 들어 있는 3개 항목은 모두 ‘개발용 예시 데이터’입니다. (isExample: true)
 *    - 사진은 홈페이지 시안에서 잘라 낸 ‘디자인 예시’ 이미지이며 실제 제품 사진이 아닙니다.
 *    - 면적·사양·가격·옵션은 비어 있습니다. 회사에서 확인한 값만 채워 주세요.
 *
 * 실제 제품으로 바꾸는 방법은 README ‘제품 데이터 교체’를 참고하세요.
 */

/** 기본 사양 표의 항목 틀. 값이 null 이면 ‘회사 확인 후 기재’로 표시됩니다. */
const specTemplate = (): SpecItem[] => [
  { label: "외부 크기(가로×세로×높이)", value: null },
  { label: "면적", value: null },
  { label: "구조", value: null },
  { label: "외장재", value: null },
  { label: "단열재", value: null },
  { label: "창호", value: null },
  { label: "내부 구성", value: null },
];

export const products: Product[] = [
  {
    slug: "mobile-home-example",
    category: "mobile-home",
    name: "이동식주택",
    summary: "평면·기본 사양 안내",
    description: [
      "이동식주택은 공장에서 제작한 뒤 설치할 곳으로 운송해 자리를 잡는 주택입니다.",
      "사용 목적(주거, 세컨하우스, 사무실 등)과 예산, 설치할 땅의 여건을 듣고 크기와 사양을 협의합니다.",
    ],
    images: [
      {
        src: "/images/design-examples/product-mobile-home.jpg",
        alt: "짙은 회색 외벽에 창문 두 개와 출입문이 있는 단층 이동식주택 디자인 예시 이미지",
        width: 900,
        height: 459,
        isDesignExample: true,
      },
      {
        src: "/images/design-examples/hero-mobile-home.jpg",
        alt: "흰 벽과 짙은 회색 하부, 나무 기둥 현관과 데크가 있는 단층 이동식주택 디자인 예시 이미지",
        width: 1116,
        height: 494,
        isDesignExample: true,
      },
    ],
    floorPlan: null,
    area: null,
    keySpecs: [],
    specs: specTemplate(),
    options: [],
    price: { kind: "consult" },
    priceIncludes: [],
    priceExcludes: [],
    relatedCaseSlugs: ["example-case-1", "example-case-2"],
    isExample: true,
  },
  {
    slug: "shelter-example",
    category: "shelter",
    name: "농촌체류형 쉼터",
    summary: "평면·기본 사양 안내",
    description: [
      "농촌체류형 쉼터는 농지에서 영농을 하며 임시로 머무를 수 있도록 설치하는 시설입니다.",
      "농지법령에 따른 면적·입지·안전 기준과 신고 절차가 있습니다. 설치 예정 토지에서 가능한지 상담할 때 함께 확인해 주세요.",
    ],
    images: [
      {
        src: "/images/design-examples/product-shelter.jpg",
        alt: "흰 벽과 나무 마감 현관, 큰 창이 있는 단층 쉼터 디자인 예시 이미지",
        width: 900,
        height: 461,
        isDesignExample: true,
      },
    ],
    floorPlan: null,
    area: null,
    keySpecs: [],
    specs: specTemplate(),
    options: [],
    price: { kind: "consult" },
    priceIncludes: [],
    priceExcludes: [],
    relatedCaseSlugs: ["example-case-3"],
    isExample: true,
  },
  {
    slug: "used-container-example",
    category: "container",
    name: "중고컨테이너",
    summary: "매입·판매 상담",
    description: [
      "중고컨테이너 판매와 매입을 상담합니다.",
      "매입한 컨테이너는 상태에 따라 수리·개선한 뒤 다시 판매하기도 합니다. 크기와 상태, 가격은 보유 현황에 따라 달라지므로 전화로 문의해 주세요.",
    ],
    images: [
      {
        src: "/images/design-examples/product-container.jpg",
        alt: "방범창이 달린 창문과 출입문이 있는 회색 컨테이너 디자인 예시 이미지",
        width: 900,
        height: 462,
        isDesignExample: true,
      },
    ],
    floorPlan: null,
    area: null,
    keySpecs: [],
    specs: [
      { label: "규격", value: null },
      { label: "상태", value: null },
      { label: "수리·개선 내용", value: null },
    ],
    options: [],
    price: { kind: "consult" },
    priceIncludes: [],
    priceExcludes: [],
    relatedCaseSlugs: [],
    isExample: true,
  },
];
