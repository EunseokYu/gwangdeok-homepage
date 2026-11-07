import type { Metadata } from "next";
import { CallBanner } from "@/components/CallBanner";
import { CostGuide } from "@/components/CostGuide";
import { FaqList } from "@/components/FaqList";
import { PageIntro } from "@/components/PageIntro";
import { ProcessSteps } from "@/components/ProcessSteps";
import { Section } from "@/components/Section";
import { CheckIcon } from "@/components/icons";
import { faqs } from "@/data/faq";
import { consultationChecklist } from "@/data/process";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "제작·설치 과정",
  description: "상담, 현장 확인, 제작, 운송·설치까지 이동식주택이 완성되는 과정과 비용 구성을 안내합니다.",
  path: "/process",
});

export default function ProcessPage() {
  const relatedFaqs = faqs.filter((f) => ["transport-cost", "lead-time", "site-preparation"].includes(f.id));
  return (
    <>
      <PageIntro
        title="제작부터 설치까지, 이렇게 진행합니다"
        description="상담부터 운송·설치까지의 기본 흐름입니다. 제품과 현장 여건에 따라 순서와 기간은 달라질 수 있습니다."
        crumbs={[{ label: "홈", href: "/" }, { label: "제작·설치 과정" }]}
      />

      <Section id="steps" title="진행 단계">
        <ProcessSteps detailed />
      </Section>

      <Section
        id="cost"
        tone="sand"
        title="비용은 이렇게 나누어 안내합니다"
        description="제품 가격과 현장 여건에 따른 비용을 구분해 설명해 드립니다."
      >
        <CostGuide />
      </Section>

      <Section id="prepare" title="상담 전에 준비하시면 좋아요" description="모두 준비하지 않으셔도 상담할 수 있습니다.">
        <ul className="grid max-w-4xl gap-3 md:grid-cols-2">
          {consultationChecklist.map((c) => (
            <li key={c} className="flex items-start gap-3 rounded-lg border border-line bg-white p-5 text-lg">
              <CheckIcon className="mt-1 h-6 w-6 shrink-0 text-brand" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="process-faq" tone="sand" title="과정에 대해 자주 묻는 질문">
        <div className="max-w-4xl">
          <FaqList items={relatedFaqs} />
        </div>
      </Section>

      <CallBanner />
    </>
  );
}
