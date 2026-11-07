/**
 * 홈페이지 콘텐츠 타입.
 * 제품·시공 사례·FAQ·회사 정보는 src/data 아래 파일에서만 관리합니다.
 */

export type ProductCategory = "mobile-home" | "shelter" | "container";

export interface ImageAsset {
  /** public 폴더 기준 경로. 예: "/images/products/model-a-1.jpg" */
  src: string;
  /** 화면을 볼 수 없는 분에게 읽어 주는 설명. 사진에 보이는 내용을 구체적으로 적습니다. */
  alt: string;
  /** 원본 사진의 가로·세로 픽셀. 화면 흔들림을 줄이는 데 사용합니다. */
  width: number;
  height: number;
  /** 실제 제품·현장 사진이 아닌 검토용 이미지이면 true. 사진 위에 ‘디자인 예시’가 표시됩니다. */
  isDesignExample?: boolean;
}

export type Price =
  /** 가격이 확인되지 않았거나 상담으로 안내하는 경우 */
  | { kind: "consult" }
  /** 확인된 제품 가격 (원 단위) */
  | { kind: "fixed"; amount: number; note?: string }
  /** 확인된 시작 가격 (원 단위) */
  | { kind: "from"; amount: number; note?: string };

export interface SpecItem {
  label: string;
  /** null 이면 ‘회사 확인 후 기재’로 표시됩니다. */
  value: string | null;
}

export interface Product {
  /** 주소에 쓰이는 영문 식별자. 예: /products/mobile-home-example */
  slug: string;
  category: ProductCategory;
  name: string;
  /** 카드에 쓰이는 한 줄 설명 */
  summary: string;
  /** 상세 페이지의 설명 문단 */
  description: string[];
  images: ImageAsset[];
  floorPlan: ImageAsset | null;
  /** 확인된 면적만 입력. 예: "약 33㎡(10평)" */
  area: string | null;
  /** 카드에 함께 표시할 핵심 사양 (확인된 값만) */
  keySpecs: SpecItem[];
  /** 상세 페이지 기본 사양 표 */
  specs: SpecItem[];
  /** 선택 가능한 옵션 (확인된 항목만) */
  options: string[];
  price: Price;
  /** 제품 가격에 포함되는 항목 (확인된 항목만) */
  priceIncludes: string[];
  /** 제품 가격과 별도인 항목 (확인된 항목만) */
  priceExcludes: string[];
  relatedCaseSlugs: string[];
  /** 개발용 예시 데이터이면 true. 화면에 ‘개발용 예시’ 안내가 표시됩니다. */
  isExample: boolean;
}

export interface CaseStudy {
  slug: string;
  title: string;
  /** 공개 가능한 범위의 지역만. 예: "충남 천안" (상세 주소 금지) */
  region: string | null;
  productSlug: string | null;
  /** 제품 데이터가 없을 때 표시할 제품 이름 */
  productLabel: string;
  summary: string;
  description: string[];
  /** 시공 내용 */
  work: string[];
  images: ImageAsset[];
  /** 완공 시기. 예: "2025년 5월" */
  completedAt: string | null;
  isExample: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string[];
  /** 회사 확인 전 초안이면 true */
  needsReview: boolean;
}

export interface ProcessStep {
  number: number;
  title: string;
  summary: string;
  details: string[];
}

export interface NavItem {
  label: string;
  href: string;
}
