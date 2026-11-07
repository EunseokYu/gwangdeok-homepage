import type { NavItem } from "@/types/content";

/** PC 상단 메뉴 */
export const mainNav: NavItem[] = [
  { label: "이동식주택", href: "/products?category=mobile-home" },
  { label: "체류형 쉼터", href: "/products?category=shelter" },
  { label: "중고컨테이너", href: "/products?category=container" },
  { label: "시공 사례", href: "/cases" },
  { label: "회사 안내", href: "/about" },
];

/** 모바일 전체 메뉴 (큰 항목) */
export const mobileNav: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "제품 전체 보기", href: "/products" },
  { label: "이동식주택", href: "/products?category=mobile-home" },
  { label: "체류형 쉼터", href: "/products?category=shelter" },
  { label: "중고컨테이너", href: "/products?category=container" },
  { label: "시공 사례", href: "/cases" },
  { label: "제작·설치 과정", href: "/process" },
  { label: "회사 안내·오시는 길", href: "/about" },
];

/** 모바일 헤더 아래 제품 분류 바로가기 */
export const categoryShortcuts: NavItem[] = [
  { label: "이동식주택", href: "/products?category=mobile-home" },
  { label: "체류형 쉼터", href: "/products?category=shelter" },
  { label: "중고컨테이너", href: "/products?category=container" },
];

/** 푸터 링크 */
export const footerNav: NavItem[] = [
  { label: "제품 안내", href: "/products" },
  { label: "시공 사례", href: "/cases" },
  { label: "제작·설치 과정", href: "/process" },
  { label: "회사 안내", href: "/about" },
  { label: "오시는 길", href: "/about#location" },
];
