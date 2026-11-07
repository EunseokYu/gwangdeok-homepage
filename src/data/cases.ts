import type { CaseStudy } from "@/types/content";

/**
 * 시공 사례 데이터
 *
 * ⚠️ 지금 들어 있는 3개 항목은 화면 구성을 확인하기 위한 ‘개발용 예시’입니다.
 *    실제 시공 실적이 아니며, 사진도 넣지 않았습니다. (사진 자리에는 ‘사진 준비 중’이 표시됩니다)
 *
 * 실제 사례를 넣을 때 지켜 주세요.
 *  - 지역은 공개 가능한 범위까지만 적습니다. (예: "충남 천안") 번지·마을 이름·고객 이름은 넣지 않습니다.
 *  - 사진에 고객 얼굴, 차량 번호판, 문패, 주소 표지가 보이면 가리거나 다른 사진을 씁니다.
 *  - 생성 이미지나 시안 이미지를 실제 사례 사진으로 쓰지 않습니다.
 */
export const cases: CaseStudy[] = [
  {
    slug: "example-case-1",
    title: "이동식주택 설치 사례 (예시 1)",
    region: "지역 (예시)",
    productSlug: "mobile-home-example",
    productLabel: "이동식주택",
    summary: "실제 사례가 들어갈 자리입니다. 완공 사진과 시공 내용을 넣어 주세요.",
    description: [
      "이 항목은 화면 구성을 확인하기 위한 개발용 예시입니다. 실제 시공 사례가 아닙니다.",
      "실제 사례에서는 고객이 처음 원했던 용도, 현장 여건, 제작·설치 과정에서 협의한 내용을 2~3문단으로 적습니다.",
    ],
    work: ["현장 확인", "제작", "운송·설치"],
    images: [],
    completedAt: null,
    isExample: true,
  },
  {
    slug: "example-case-2",
    title: "이동식주택 설치 사례 (예시 2)",
    region: "지역 (예시)",
    productSlug: "mobile-home-example",
    productLabel: "이동식주택",
    summary: "실제 사례가 들어갈 자리입니다. 완공 사진과 시공 내용을 넣어 주세요.",
    description: ["이 항목은 화면 구성을 확인하기 위한 개발용 예시입니다. 실제 시공 사례가 아닙니다."],
    work: ["상담", "제작", "운송·설치"],
    images: [],
    completedAt: null,
    isExample: true,
  },
  {
    slug: "example-case-3",
    title: "농촌체류형 쉼터 설치 사례 (예시 3)",
    region: "지역 (예시)",
    productSlug: "shelter-example",
    productLabel: "농촌체류형 쉼터",
    summary: "실제 사례가 들어갈 자리입니다. 완공 사진과 시공 내용을 넣어 주세요.",
    description: ["이 항목은 화면 구성을 확인하기 위한 개발용 예시입니다. 실제 시공 사례가 아닙니다."],
    work: ["현장 확인", "제작", "운송·설치"],
    images: [],
    completedAt: null,
    isExample: true,
  },
];
