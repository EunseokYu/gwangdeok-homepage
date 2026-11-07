import { cases } from "@/data/cases";
import { faqs } from "@/data/faq";
import { products } from "@/data/products";
import type { CaseStudy, Price, Product, ProductCategory } from "@/types/content";

export function getAllProducts(): Product[] {
  return products;
}

export function getProductsByCategory(category: ProductCategory | "all"): Product[] {
  return category === "all" ? products : products.filter((p) => p.category === category);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllCases(): CaseStudy[] {
  return cases;
}

export function getCase(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}

/** 제품에 연결된 시공 사례. 제품 쪽 목록과 사례 쪽 productSlug 를 모두 확인합니다. */
export function getCasesForProduct(product: Product): CaseStudy[] {
  return cases.filter(
    (c) => product.relatedCaseSlugs.includes(c.slug) || c.productSlug === product.slug,
  );
}

export function hasExampleProducts(list: Product[] = products): boolean {
  return list.some((p) => p.isExample);
}

export function hasExampleCases(list: CaseStudy[] = cases): boolean {
  return list.some((c) => c.isExample);
}

export function faqNeedsReview(): boolean {
  return faqs.some((f) => f.needsReview);
}

/** 가격 표시 문구 */
export function formatPrice(price: Price): string {
  switch (price.kind) {
    case "consult":
      return "가격 상담";
    case "fixed":
      return `${price.amount.toLocaleString("ko-KR")}원`;
    case "from":
      return `${price.amount.toLocaleString("ko-KR")}원부터`;
  }
}
