import { CaseCard } from "@/components/CaseCard";
import { ContactPanel } from "@/components/ContactPanel";
import { FaqList } from "@/components/FaqList";
import { ImageFrame } from "@/components/ImageFrame";
import { Notice } from "@/components/Notice";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProductBrowser } from "@/components/ProductBrowser";
import { QuickLinks } from "@/components/QuickLinks";
import { Section } from "@/components/Section";
import { ButtonLink, buttonClass } from "@/components/Button";
import { PhoneIcon } from "@/components/icons";
import { company, telHref } from "@/data/company";
import { faqNeedsReview, getAllCases, getAllProducts, hasExampleCases } from "@/lib/content";
import type { ImageAsset } from "@/types/content";

/** 첫 화면 사진 — 실제 회사 사진이 들어오면 이 값만 바꿉니다 */
const heroImage: ImageAsset = {
  src: "/images/design-examples/hero-mobile-home.jpg",
  alt: "흰 벽과 짙은 회색 하부, 나무 기둥 현관과 데크가 있는 단층 이동식주택 디자인 예시 이미지",
  width: 1116,
  height: 494,
  isDesignExample: true,
};

export default function HomePage() {
  const products = getAllProducts();
  const cases = getAllCases().slice(0, 3);
  const showProductImageNote = products.some((p) => p.images.some((i) => i.isDesignExample));

  return (
    <>
      {/* 첫 화면 */}
      <section aria-labelledby="hero-title" className="bg-sand">
        <div className="page-container grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:py-20">
          <div>
            <h1 id="hero-title" className="text-[2.25rem] font-extrabold leading-[1.25] text-ink sm:text-5xl lg:text-[3.5rem]">
              이동식주택,
              <br />
              제작부터 설치까지.
            </h1>
            <p className="mt-5 text-xl text-ink-soft md:text-[1.375rem]">원하시는 용도와 예산에 맞춰 상담해 드립니다.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/products" arrow className="grow basis-[9rem] sm:grow-0 sm:basis-auto sm:min-w-44">
                제품 보기
              </ButtonLink>
              <a href={telHref(company.phone.main)} className={buttonClass("outline", "grow basis-[9rem] sm:grow-0 sm:basis-auto sm:min-w-44")}>
                <PhoneIcon className="h-5 w-5 shrink-0" />
                <span>전화 상담</span>
              </a>
            </div>
            <p className="mt-6 text-lg text-ink">
              대표전화{" "}
              <a href={telHref(company.phone.main)} className="font-bold text-brand underline underline-offset-4">
                {company.phone.main}
              </a>
            </p>
          </div>
          <ImageFrame image={heroImage} priority sizes="(min-width: 1024px) 680px, 100vw" />
        </div>
      </section>

      {/* 주요 안내 바로가기 */}
      <div className="border-b border-line bg-white">
        <div className="page-container py-8 md:py-12">
          <QuickLinks />
        </div>
      </div>

      {/* 제품 안내 */}
      <Section
        id="products"
        title="제품을 살펴보세요"
        description="제품별 사진과 기본 사양, 가격 안내를 확인하세요."
        action={
          <ButtonLink href="/products" variant="plain" arrow>
            제품 안내 전체 보기
          </ButtonLink>
        }
      >
        <ProductBrowser products={products} />
        {showProductImageNote && (
          <p className="mt-6 text-base text-ink-soft">
            ‘디자인 예시’로 표시된 사진은 화면 구성을 보여 주기 위한 이미지이며 실제 제품 사진이 아닙니다.
          </p>
        )}
      </Section>

      {/* 시공 사례 */}
      <Section
        id="cases"
        tone="sand"
        title="시공 사례를 확인해 보세요"
        description="완공 사진과 시공 내용을 보실 수 있습니다."
        action={
          <ButtonLink href="/cases" variant="plain" arrow>
            시공 사례 전체 보기
          </ButtonLink>
        }
      >
        {hasExampleCases(cases) && (
          <Notice className="mb-6">
            현재 보이는 사례는 화면 구성을 확인하기 위한 <strong>개발용 예시</strong>입니다. 실제 시공 사례 자료로 교체될
            예정입니다.
          </Notice>
        )}
        {cases.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {cases.map((c) => (
              <li key={c.slug} className="min-w-0">
                <CaseCard item={c} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg">시공 사례를 준비하고 있습니다.</p>
        )}
      </Section>

      {/* 제작·설치 과정 */}
      <Section
        id="process"
        title="제작부터 설치까지, 이렇게 진행합니다"
        action={
          <ButtonLink href="/process" variant="plain" arrow>
            과정 자세히 보기
          </ButtonLink>
        }
      >
        <ProcessSteps />
      </Section>

      {/* 자주 묻는 질문 */}
      <Section id="faq" tone="sand" title="자주 묻는 질문">
        <div className="max-w-4xl">
          {faqNeedsReview() && (
            <Notice className="mb-6">아래 답변은 회사 확인 전 초안입니다. 정확한 내용은 전화로 문의해 주세요.</Notice>
          )}
          <FaqList />
        </div>
      </Section>

      {/* 연락처·오시는 길 */}
      <Section id="contact" title="방문 전 전화로 문의해 주세요" description="전화 상담과 주소·지도 안내입니다.">
        <ContactPanel />
      </Section>
    </>
  );
}
