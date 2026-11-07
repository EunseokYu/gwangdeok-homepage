import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallBanner } from "@/components/CallBanner";
import { ChevronRightIcon } from "@/components/icons";
import { Notice } from "@/components/Notice";
import { Breadcrumb } from "@/components/PageIntro";
import { ProductGallery } from "@/components/ProductGallery";
import { getAllCases, getCase, getProduct } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllCases().map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) return {};
  return pageMetadata({
    title: item.title,
    description: `${item.productLabel} 시공 사례. ${item.summary}`,
    path: `/cases/${item.slug}`,
  });
}

export default async function CaseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) notFound();
  const product = item.productSlug ? getProduct(item.productSlug) : undefined;

  return (
    <>
      <div className="page-container pt-6 md:pt-8">
        <Breadcrumb crumbs={[{ label: "홈", href: "/" }, { label: "시공 사례", href: "/cases" }, { label: item.title }]} />
      </div>

      <article className="page-container pb-16 pt-6 md:pb-20">
        <h1 className="text-[2rem] font-extrabold text-ink md:text-[2.75rem]">{item.title}</h1>
        {item.isExample && (
          <Notice className="mt-6 max-w-3xl">
            이 사례는 화면 구성을 확인하기 위한 <strong>개발용 예시</strong>입니다. 실제 시공 사례가 아닙니다.
          </Notice>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <ProductGallery images={item.images} title={item.title} />
          </div>

          <div className="min-w-0">
            <h2 className="text-[1.5rem] font-bold">사례 정보</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line text-lg">
              {item.region && (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-4">
                  <dt className="text-ink-soft">지역</dt>
                  <dd>{item.region}</dd>
                </div>
              )}
              <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-4">
                <dt className="text-ink-soft">제품</dt>
                <dd>
                  {product ? (
                    <Link href={`/products/${product.slug}`} className="font-semibold text-brand underline underline-offset-4">
                      {item.productLabel}
                    </Link>
                  ) : (
                    item.productLabel
                  )}
                </dd>
              </div>
              {item.work.length > 0 && (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-4">
                  <dt className="text-ink-soft">시공 내용</dt>
                  <dd>{item.work.join(" · ")}</dd>
                </div>
              )}
              {item.completedAt && (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-4">
                  <dt className="text-ink-soft">완공</dt>
                  <dd>{item.completedAt}</dd>
                </div>
              )}
            </dl>
            <p className="mt-4 text-base text-ink-soft">고객의 주소와 개인정보는 공개하지 않습니다.</p>
          </div>
        </div>

        <section aria-labelledby="case-description-title" className="mt-12 max-w-3xl border-t border-line pt-10">
          <h2 id="case-description-title" className="text-[1.625rem] font-bold">
            시공 내용
          </h2>
          <div className="mt-5 space-y-4 text-lg">
            {item.description.map((d) => (
              <p key={d}>{d}</p>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          {product && (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex min-h-[3.25rem] items-center justify-center gap-1.5 rounded-md border-2 border-ink px-6 text-lg font-bold hover:bg-sand"
            >
              이 제품 자세히 보기
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
          )}
          <Link
            href="/cases"
            className="inline-flex min-h-[3.25rem] items-center justify-center rounded-md border-2 border-ink px-6 text-lg font-bold hover:bg-sand"
          >
            시공 사례 목록으로
          </Link>
        </div>
      </article>

      <CallBanner />
    </>
  );
}
