import Link from "next/link";
import { company, telHref } from "@/data/company";
import { PhoneIcon } from "./icons";

/** 페이지 마지막의 상담 안내 띠 */
export function CallBanner({ title = "궁금한 점은 전화로 편하게 물어보세요" }: { title?: string }) {
  return (
    <section aria-labelledby="call-banner-title" className="section-y bg-brand-tint">
      <div className="page-container flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="call-banner-title" className="text-[1.625rem] font-bold text-ink md:text-[2rem]">
            {title}
          </h2>
          <p className="mt-2 text-lg text-ink-soft md:text-xl">원하시는 용도와 예산에 맞춰 상담해 드립니다.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={telHref(company.phone.main)}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-brand px-6 text-xl font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <PhoneIcon className="h-6 w-6" />
            전화 상담 {company.phone.main}
          </a>
          <Link
            href="/about#location"
            className="inline-flex min-h-14 items-center justify-center rounded-md border-2 border-ink bg-white px-6 text-xl font-bold text-ink transition-colors hover:bg-sand"
          >
            오시는 길
          </Link>
        </div>
      </div>
    </section>
  );
}
