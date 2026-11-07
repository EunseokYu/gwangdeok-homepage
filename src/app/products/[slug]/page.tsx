import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallBanner } from "@/components/CallBanner";
import { CaseCard } from "@/components/CaseCard";
import { CostGuide } from "@/components/CostGuide";
import { ImageFrame } from "@/components/ImageFrame";
import { Notice } from "@/components/Notice";
import { Breadcrumb } from "@/components/PageIntro";
import { ProductGallery } from "@/components/ProductGallery";
import { PhoneIcon } from "@/components/icons";
import { getCategory } from "@/data/categories";
import { company, telHref } from "@/data/company";
import { formatPrice, getAllProducts, getCasesForProduct, getProduct } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.name,
    description: `${product.name} 제품 사진, 평면도, 기본 사양, 선택 옵션과 가격 안내. ${product.summary}`,
    path: `/products/${product.slug}`,
  });
}

const subNav = [
  { id: "description", label: "제품 설명" },
  { id: "floor-plan", label: "평면도" },
  { id: "specs", label: "기본 사양" },
  { id: "options", label: "선택 옵션" },
  { id: "price", label: "가격 안내" },
  { id: "related-cases", label: "시공 사례" },
];

const sectionTitle = "text-[1.625rem] font-bold text-ink md:text-[2rem]";
const sectionWrap = "border-t border-line py-12 md:py-16";

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const relatedCases = getCasesForProduct(product);
  const shownKeySpecs = product.keySpecs.filter((s) => s.value);

  return (
    <>
      <div className="page-container pt-6 md:pt-8">
        <Breadcrumb
          crumbs={[
            { label: "홈", href: "/" },
            { label: "제품 안내", href: "/products" },
            { label: category.label, href: `/products?category=${category.id}` },
            { label: product.name },
          ]}
        />
      </div>

      {/* 사진 + 요약 */}
      <div className="page-container grid gap-10 pb-12 pt-6 md:pb-16 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <ProductGallery images={product.images} title={product.name} />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold text-brand">{category.fullLabel}</p>
          <h1 className="mt-1 text-[2rem] font-extrabold text-ink md:text-[2.75rem]">{product.name}</h1>
          <p className="mt-3 text-xl text-ink-soft">{product.summary}</p>

          {product.isExample && (
            <Notice className="mt-6">
              이 제품 정보는 <strong>개발용 예시 데이터</strong>입니다. 사진은 디자인 예시이며 실제 사양·가격은 회사 확인
              후 채워집니다.
            </Notice>
          )}

          <dl className="mt-6 divide-y divide-line border-y border-line">
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-4">
              <dt className="text-lg text-ink-soft">제품 가격</dt>
              <dd className="text-[1.625rem] font-bold text-ink">{formatPrice(product.price)}</dd>
            </div>
            {product.area && (
              <div className="flex flex-wrap justify-between gap-2 py-4">
                <dt className="text-lg text-ink-soft">면적</dt>
                <dd className="text-lg font-semibold">{product.area}</dd>
              </div>
            )}
            {shownKeySpecs.map((s) => (
              <div key={s.label} className="flex flex-wrap justify-between gap-2 py-4">
                <dt className="text-lg text-ink-soft">{s.label}</dt>
                <dd className="text-lg font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-base text-ink-soft">
            운송·기초·현장 설치 비용은 제품 가격과 나누어 안내해 드립니다.{" "}
            <a href="#price" className="font-semibold text-ink underline underline-offset-4">
              가격 안내 보기
            </a>
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={telHref(company.phone.main)}
              className="flex min-h-14 items-center justify-center gap-2 rounded-md bg-brand px-6 text-xl font-bold text-white transition-colors hover:bg-brand-hover"
            >
              <PhoneIcon className="h-6 w-6" />
              전화 상담 {company.phone.main}
            </a>
            <a
              href={telHref(company.phone.mobile)}
              className="flex min-h-14 items-center justify-center gap-2 rounded-md border-2 border-ink px-6 text-lg font-bold text-ink transition-colors hover:bg-sand"
            >
              휴대전화 {company.phone.mobile}
            </a>
          </div>
          <p className="mt-3 text-base text-ink-soft">방문 전 전화로 문의해 주세요.</p>
        </div>
      </div>

      {/* 페이지 안 바로가기 */}
      <nav aria-label="제품 상세 내용 바로가기" className="border-y border-line bg-sand">
        <ul className="page-container flex flex-wrap gap-x-1 gap-y-1 py-2">
          {subNav.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex min-h-12 items-center rounded px-3 text-lg font-semibold text-ink underline-offset-4 hover:underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="page-container">
        <section id="description" aria-labelledby="description-title" className={`${sectionWrap} border-t-0`}>
          <h2 id="description-title" className={sectionTitle}>
            제품 설명
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-lg">
            {product.description.map((d) => (
              <p key={d}>{d}</p>
            ))}
          </div>
        </section>

        <section id="floor-plan" aria-labelledby="floor-plan-title" className={sectionWrap}>
          <h2 id="floor-plan-title" className={sectionTitle}>
            평면도
          </h2>
          <div className="mt-6 max-w-3xl">
            {product.floorPlan ? (
              <ImageFrame image={product.floorPlan} aspect="aspect-[4/3]" sizes="(min-width: 768px) 768px, 100vw" />
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed border-line-strong bg-sand px-6 py-10 text-center">
                <p className="text-xl font-semibold text-ink">평면도 준비 중</p>
                <p className="mt-2 text-lg text-ink-soft">평면도가 필요하시면 전화로 요청해 주세요.</p>
              </div>
            )}
          </div>
        </section>

        <section id="specs" aria-labelledby="specs-title" className={sectionWrap}>
          <h2 id="specs-title" className={sectionTitle}>
            기본 사양
          </h2>
          {product.specs.length > 0 ? (
            <div className="mt-6 max-w-3xl overflow-hidden rounded-lg border border-line">
              {/* 좁은 화면에서는 항목명과 값을 위아래로 쌓아 표가 화면 밖으로 넘치지 않게 합니다 */}
              <table className="block w-full border-collapse text-left text-lg sm:table sm:table-fixed">
                <caption className="sr-only">{product.name} 기본 사양</caption>
                <tbody className="block sm:table-row-group">
                  {product.specs.map((s) => (
                    <tr key={s.label} className="block border-b border-line last:border-b-0 sm:table-row">
                      <th
                        scope="row"
                        className="block bg-sand px-4 py-3 align-top font-semibold sm:table-cell sm:w-1/3 sm:py-4 md:px-6"
                      >
                        {s.label}
                      </th>
                      <td className="block px-4 py-3 align-top sm:table-cell sm:py-4 md:px-6">
                        {s.value ?? <span className="text-ink-soft">회사 확인 후 기재</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-lg">기본 사양은 상담할 때 안내해 드립니다.</p>
          )}
          <p className="mt-4 text-base text-ink-soft">사양은 협의 내용에 따라 달라질 수 있습니다.</p>
        </section>

        <section id="options" aria-labelledby="options-title" className={sectionWrap}>
          <h2 id="options-title" className={sectionTitle}>
            선택 가능한 옵션
          </h2>
          {product.options.length > 0 ? (
            <ul className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
              {product.options.map((o) => (
                <li key={o} className="rounded-md border border-line px-4 py-3 text-lg">
                  {o}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 max-w-3xl text-lg">선택 가능한 옵션은 상담할 때 안내해 드립니다.</p>
          )}
        </section>

        <section id="price" aria-labelledby="price-title" className={sectionWrap}>
          <h2 id="price-title" className={sectionTitle}>
            가격 안내
          </h2>
          <p className="mt-4 max-w-3xl text-lg">
            제품 가격: <strong className="text-xl">{formatPrice(product.price)}</strong>
            {"note" in product.price && product.price.note && (
              <span className="text-ink-soft"> ({product.price.note})</span>
            )}
          </p>

          <div className="mt-6 grid max-w-4xl gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-line p-6">
              <h3 className="text-xl font-bold">제품 가격에 포함</h3>
              {product.priceIncludes.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-lg">
                  {product.priceIncludes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-lg text-ink-soft">회사 확인 후 기재 예정입니다. 상담할 때 안내해 드립니다.</p>
              )}
            </div>
            <div className="rounded-lg border border-line p-6">
              <h3 className="text-xl font-bold">제품 가격과 별도</h3>
              {product.priceExcludes.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-lg">
                  {product.priceExcludes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-lg text-ink-soft">회사 확인 후 기재 예정입니다. 상담할 때 안내해 드립니다.</p>
              )}
            </div>
          </div>

          <h3 className="mt-10 text-[1.5rem] font-bold">총비용은 이렇게 구성됩니다</h3>
          <div className="mt-4">
            <CostGuide headingLevel="h4" />
          </div>
        </section>

        <section id="related-cases" aria-labelledby="related-cases-title" className={sectionWrap}>
          <h2 id="related-cases-title" className={sectionTitle}>
            관련 시공 사례
          </h2>
          {relatedCases.length > 0 ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {relatedCases.map((c) => (
                <li key={c.slug} className="min-w-0">
                  <CaseCard item={c} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-lg">
              이 제품의 시공 사례를 준비하고 있습니다.{" "}
              <Link href="/cases" className="font-semibold text-brand underline underline-offset-4">
                전체 시공 사례 보기
              </Link>
            </p>
          )}
        </section>
      </div>

      <CallBanner title={`${product.name} 상담이 필요하신가요?`} />
    </>
  );
}
