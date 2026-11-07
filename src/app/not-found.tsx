import Link from "next/link";
import { company, telHref } from "@/data/company";

export default function NotFound() {
  return (
    <section className="section-y">
      <div className="page-container max-w-3xl">
        <h1 className="text-[2rem] font-extrabold md:text-[2.5rem]">페이지를 찾을 수 없습니다</h1>
        <p className="mt-4 text-lg text-ink-soft">주소가 바뀌었거나 없는 페이지입니다. 아래에서 원하시는 곳으로 이동해 주세요.</p>
        <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <li>
            <Link href="/" className="flex min-h-[3.25rem] items-center justify-center rounded-md bg-brand px-6 text-lg font-bold text-white">
              홈으로
            </Link>
          </li>
          <li>
            <Link href="/products" className="flex min-h-[3.25rem] items-center justify-center rounded-md border-2 border-ink px-6 text-lg font-bold">
              제품 안내
            </Link>
          </li>
          <li>
            <a
              href={telHref(company.phone.main)}
              className="flex min-h-[3.25rem] items-center justify-center rounded-md border-2 border-ink px-6 text-lg font-bold"
            >
              전화 문의 {company.phone.main}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
