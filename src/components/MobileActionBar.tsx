import Link from "next/link";
import { company, telHref } from "@/data/company";
import { PhoneIcon } from "./icons";

/**
 * 모바일 하단 고정 메뉴: 제품 보기 / 오시는 길 / 전화 상담
 * 본문이 가려지지 않도록 globals.css 에서 body 아래쪽 여백을 확보합니다.
 */
export function MobileActionBar() {
  return (
    <nav
      aria-label="빠른 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-[1fr_1fr_1.3fr] gap-2 px-2 py-2">
        <li>
          <Link
            href="/products"
            className="flex min-h-14 items-center justify-center rounded-md border-2 border-ink bg-white px-1 text-[1.0625rem] font-bold text-ink"
          >
            제품 보기
          </Link>
        </li>
        <li>
          <Link
            href="/about#location"
            className="flex min-h-14 items-center justify-center rounded-md border-2 border-ink bg-white px-1 text-[1.0625rem] font-bold text-ink"
          >
            오시는 길
          </Link>
        </li>
        <li>
          <a
            href={telHref(company.phone.main)}
            className="flex min-h-14 items-center justify-center gap-1.5 rounded-md bg-brand px-1 text-[1.0625rem] font-bold text-white"
          >
            <PhoneIcon className="h-5 w-5 shrink-0" />
            전화 상담
          </a>
        </li>
      </ul>
    </nav>
  );
}
