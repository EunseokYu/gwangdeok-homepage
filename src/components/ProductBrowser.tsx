"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { categories, isProductCategory } from "@/data/categories";
import { company, telHref } from "@/data/company";
import type { Product, ProductCategory } from "@/types/content";
import { CheckIcon } from "./icons";
import { ProductCard } from "./ProductCard";

type Filter = ProductCategory | "all";

const filterOptions: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  ...categories.map((c) => ({ id: c.id as Filter, label: c.label })),
];

interface ProductGridProps {
  products: Product[];
  active: Filter;
  onChange: (f: Filter) => void;
  headingLevel?: "h2" | "h3";
}

/** 분류 버튼 + 제품 카드 목록 (화면 표시 전용) */
function ProductGrid({ products, active, onChange, headingLevel }: ProductGridProps) {
  const visible = active === "all" ? products : products.filter((p) => p.category === active);
  const activeLabel = filterOptions.find((f) => f.id === active)?.label ?? "전체";

  return (
    <div>
      <div role="group" aria-label="제품 분류 선택" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {filterOptions.map((f) => {
          const selected = f.id === active;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(f.id)}
              className={`inline-flex min-h-[3.25rem] items-center justify-center gap-1.5 rounded-md border-2 px-2 text-lg font-bold transition-colors ${
                selected ? "border-brand bg-brand text-white" : "border-line-strong bg-white text-ink hover:border-ink"
              }`}
            >
              {selected && <CheckIcon className="h-5 w-5 shrink-0" />}
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-lg text-ink-soft" aria-live="polite">
        <strong className="font-bold text-ink">{activeLabel}</strong> 제품 {visible.length}개
      </p>

      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {visible.map((p) => (
            <li key={p.slug} className="min-w-0">
              <ProductCard product={p} headingLevel={headingLevel} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-lg border border-line bg-sand px-6 py-10 text-center">
          <p className="text-lg">이 분류에 등록된 제품이 아직 없습니다.</p>
          <p className="mt-2 text-lg">
            전화로 문의해 주시면 안내해 드립니다.{" "}
            <a href={telHref(company.phone.main)} className="font-bold text-brand underline underline-offset-4">
              {company.phone.main}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

/** 홈 화면용: 주소를 바꾸지 않고 화면 안에서만 분류를 바꿉니다 */
export function ProductBrowser({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Filter>("all");
  return <ProductGrid products={products} active={active} onChange={setActive} />;
}

/**
 * 제품 안내 페이지용: ?category= 주소와 분류가 연결됩니다.
 * (상단 메뉴의 ‘이동식주택’ 등을 누르면 해당 분류가 선택된 상태로 열립니다)
 * 사용하는 쪽에서 <Suspense> 로 감싸야 합니다.
 */
export function ProductBrowserWithUrl({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const param = searchParams?.get("category");
  const active: Filter = isProductCategory(param) ? param : "all";

  const onChange = (f: Filter) => {
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", f);
    // Next.js 는 history.replaceState 를 감지해 useSearchParams 를 갱신합니다
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  return <ProductGrid products={products} active={active} onChange={onChange} headingLevel="h2" />;
}

/** 주소 정보를 읽기 전(서버 렌더링) 잠깐 보여 줄 전체 목록 */
export function ProductBrowserFallback({ products }: { products: Product[] }) {
  return <ProductGrid products={products} active="all" onChange={() => {}} headingLevel="h2" />;
}
