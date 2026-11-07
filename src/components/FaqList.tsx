import { faqs } from "@/data/faq";
import type { FaqItem } from "@/types/content";
import { PlusIcon } from "./icons";

/**
 * 아코디언 형태의 자주 묻는 질문.
 * 브라우저 기본 <details> 를 사용해 자바스크립트 없이도 Tab·Enter·Space 로 열고 닫을 수 있습니다.
 */
export function FaqList({ items = faqs }: { items?: FaqItem[] }) {
  if (items.length === 0) {
    return <p className="text-lg">자주 묻는 질문을 준비하고 있습니다. 궁금한 점은 전화로 문의해 주세요.</p>;
  }
  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-white">
      {items.map((item) => (
        <details key={item.id} id={`faq-${item.id}`} className="group">
          <summary className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 text-lg font-bold text-ink hover:bg-sand md:px-6 md:text-xl">
            <span>
              <span className="mr-2 text-brand" aria-hidden="true">
                Q.
              </span>
              {item.question}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-base font-semibold text-ink-soft">
              <span className="group-open:hidden">열기</span>
              <span className="hidden group-open:inline">닫기</span>
              <PlusIcon className="h-5 w-5 transition-transform duration-150 group-open:rotate-45" />
            </span>
          </summary>
          <div className="space-y-2 px-5 pb-6 text-lg text-ink md:px-6">
            {item.answer.map((a) => (
              <p key={a}>{a}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
