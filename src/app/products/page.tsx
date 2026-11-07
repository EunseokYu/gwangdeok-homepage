import type { Metadata } from "next";
import { Suspense } from "react";
import { CallBanner } from "@/components/CallBanner";
import { CostGuide } from "@/components/CostGuide";
import { Notice } from "@/components/Notice";
import { PageIntro } from "@/components/PageIntro";
import { ProductBrowserFallback, ProductBrowserWithUrl } from "@/components/ProductBrowser";
import { Section } from "@/components/Section";
import { categories } from "@/data/categories";
import { getAllProducts, hasExampleProducts } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "제품 안내",
  description: "이동식주택, 농촌체류형 쉼터, 중고컨테이너의 사진과 기본 사양, 가격 안내를 확인하세요.",
  path: "/products",
});

export default function ProductsPage() {
  const products = getAllProducts();
  return (
    <>
      <PageIntro
        title="제품 안내"
        description="제품별 사진과 기본 사양, 가격 안내를 확인하세요. 분류 버튼을 누르면 해당 제품만 볼 수 있습니다."
        crumbs={[{ label: "홈", href: "/" }, { label: "제품 안내" }]}
      />

      <section aria-label="제품 목록" className="section-y">
        <div className="page-container">
          {hasExampleProducts(products) && (
            <Notice className="mb-8">
              지금 보이는 제품은 <strong>개발용 예시 데이터</strong>입니다. 사진은 ‘디자인 예시’이며, 면적·사양·가격은 회사
              확인 후 채워집니다.
            </Notice>
          )}
          <Suspense fallback={<ProductBrowserFallback products={products} />}>
            <ProductBrowserWithUrl products={products} />
          </Suspense>
        </div>
      </section>

      <Section id="categories" tone="sand" title="제품 분류 안내">
        <dl className="grid gap-4 md:grid-cols-3 md:gap-6">
          {categories.map((c) => (
            <div key={c.id} className="rounded-lg border border-line bg-white p-6">
              <dt className="text-[1.375rem] font-bold text-ink">{c.fullLabel}</dt>
              <dd className="mt-3 text-lg text-ink">{c.description}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="price-guide"
        title="제품 가격과 총비용은 다릅니다"
        description="설치까지 드는 총비용은 제품 가격에 현장 여건에 따른 비용이 더해집니다."
      >
        <CostGuide />
      </Section>

      <CallBanner />
    </>
  );
}
