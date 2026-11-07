import type { ProductCategory } from "@/types/content";

export interface CategoryInfo {
  id: ProductCategory;
  /** 메뉴·필터에 쓰는 짧은 이름 */
  label: string;
  /** 제목에 쓰는 정식 이름 */
  fullLabel: string;
  description: string;
}

export const categories: CategoryInfo[] = [
  {
    id: "mobile-home",
    label: "이동식주택",
    fullLabel: "이동식주택",
    description: "공장에서 제작해 현장으로 운송·설치하는 주택입니다.",
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

export function getCategory(id: ProductCategory): CategoryInfo {
  const found = categories.find((c) => c.id === id);
  if (!found) throw new Error(`알 수 없는 제품 분류: ${id}`);
  return found;
}

export function isProductCategory(value: string | null | undefined): value is ProductCategory {
  return categories.some((c) => c.id === value);
}
