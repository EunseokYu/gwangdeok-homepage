import type { Metadata } from "next";
import { CallBanner } from "@/components/CallBanner";
import { CaseCard } from "@/components/CaseCard";
import { Notice } from "@/components/Notice";
import { PageIntro } from "@/components/PageIntro";
import { getAllCases, hasExampleCases } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "시공 사례",
  description: "광덕건업이 제작·설치한 이동식주택과 농촌체류형 쉼터의 완공 사진과 시공 내용을 확인하세요.",
  path: "/cases",
});

export default function CasesPage() {
  const cases = getAllCases();
  return (
    <>
      <PageIntro
        title="시공 사례"
        description="완공 사진과 제품, 시공 내용을 확인하세요. 고객의 주소와 개인정보는 공개하지 않습니다."
        crumbs={[{ label: "홈", href: "/" }, { label: "시공 사례" }]}
      />
      <section aria-label="시공 사례 목록" className="section-y">
        <div className="page-container">
          {hasExampleCases(cases) && (
            <Notice className="mb-8">
              현재 보이는 사례는 화면 구성을 확인하기 위한 <strong>개발용 예시</strong>입니다. 실제 시공 사례가 아닙니다.
            </Notice>
          )}
          {cases.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {cases.map((c) => (
                <li key={c.slug} className="min-w-0">
                  <CaseCard item={c} headingLevel="h2" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg">시공 사례를 준비하고 있습니다.</p>
          )}
        </div>
      </section>
      <CallBanner />
    </>
  );
}
