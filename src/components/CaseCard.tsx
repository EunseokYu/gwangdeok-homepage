import Link from "next/link";
import type { CaseStudy } from "@/types/content";
import { ChevronRightIcon } from "./icons";
import { ImageFrame } from "./ImageFrame";

export function CaseCard({ item, headingLevel = "h3" }: { item: CaseStudy; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white">
      <ImageFrame
        image={item.images[0]}
        rounded={false}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
        placeholderLabel={item.isExample ? "예시 · 완공 사진 자리" : "사진 준비 중"}
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {item.isExample && <p className="text-base font-semibold text-ink-soft">개발용 예시 · 실제 사례 아님</p>}
        <Heading className="mt-1 text-[1.375rem] font-bold text-ink">{item.title}</Heading>
        <dl className="mt-3 space-y-1 text-base">
          {item.region && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-ink-soft">지역</dt>
              <dd>{item.region}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="shrink-0 text-ink-soft">제품</dt>
            <dd>{item.productLabel}</dd>
          </div>
          {item.work.length > 0 && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-ink-soft">시공 내용</dt>
              <dd>{item.work.join(" · ")}</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto pt-5">
          <Link
            href={`/cases/${item.slug}`}
            className="flex min-h-[3.25rem] items-center justify-center gap-1.5 rounded-md border-2 border-ink px-4 text-lg font-bold text-ink transition-colors hover:bg-sand"
          >
            사례 상세 보기<span className="sr-only">: {item.title}</span>
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
