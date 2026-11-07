import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactPanel } from "@/components/ContactPanel";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { company, telHref } from "@/data/company";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "회사 안내·오시는 길",
  description: `${company.name} 회사 소개와 연락처, 주소(${company.address}) 및 지도 안내.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="회사 안내·오시는 길"
        description={`${company.name}은 이동식주택과 농촌체류형 쉼터를 제작·설치하고, 중고컨테이너 매입·판매를 상담합니다.`}
        crumbs={[{ label: "홈", href: "/" }, { label: "회사 안내" }]}
      />

      <Section id="business" title="하는 일">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {company.businesses.map((b) => (
            <li key={b.title} className="rounded-lg border border-line bg-white p-6">
              <h3 className="text-[1.375rem] font-bold text-ink">{b.title}</h3>
              <p className="mt-3 text-lg text-ink">{b.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="company-info" tone="sand" title="회사 정보">
        <dl className="max-w-3xl divide-y divide-line overflow-hidden rounded-lg border border-line bg-white text-lg">
          <InfoRow label="회사명">{company.name}</InfoRow>
          {company.representative && <InfoRow label="대표">{company.representative}</InfoRow>}
          {company.businessRegistrationNumber && (
            <InfoRow label="사업자등록번호">{company.businessRegistrationNumber}</InfoRow>
          )}
          <InfoRow label="대표전화">
            <a href={telHref(company.phone.main)} className="font-bold text-brand underline underline-offset-4">
              {company.phone.main}
            </a>
          </InfoRow>
          <InfoRow label="휴대전화">
            <a href={telHref(company.phone.mobile)} className="font-semibold underline underline-offset-4">
              {company.phone.mobile}
            </a>
          </InfoRow>
          <InfoRow label="주소">{company.address}</InfoRow>
          {company.hours && <InfoRow label="상담 시간">{company.hours}</InfoRow>}
        </dl>
      </Section>

      <Section
        id="location"
        title="오시는 길"
        description="방문 전 전화로 문의해 주세요. 주소를 복사하거나 지도 서비스에서 위치를 확인할 수 있습니다."
      >
        <ContactPanel />
      </Section>
    </>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4 md:px-6">
      <dt className="font-semibold text-ink-soft">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
