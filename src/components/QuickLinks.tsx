import Link from "next/link";
import type { ReactNode } from "react";
import { HomeIcon, ImageIcon, MapPinIcon, ToolsIcon } from "./icons";

const links: { href: string; label: string; sub: string; icon: ReactNode }[] = [
  { href: "/products", label: "제품·가격 안내", sub: "사진과 기본 사양", icon: <HomeIcon className="h-8 w-8" /> },
  { href: "/cases", label: "시공 사례", sub: "완공 사진과 시공 내용", icon: <ImageIcon className="h-8 w-8" /> },
  { href: "/process", label: "제작·설치 과정", sub: "상담부터 설치까지", icon: <ToolsIcon className="h-8 w-8" /> },
  { href: "/about#location", label: "오시는 길", sub: "주소와 지도 보기", icon: <MapPinIcon className="h-8 w-8" /> },
];

/** 주요 안내 바로가기: PC 가로 4칸, 모바일 2×2 */
export function QuickLinks() {
  return (
    <nav aria-label="주요 안내 바로가기">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {links.map((l) => (
          <li key={l.href} className="min-w-0">
            <Link
              href={l.href}
              className="flex h-full min-h-24 flex-col items-start gap-2 rounded-lg border border-line bg-white p-4 transition-colors hover:border-brand hover:bg-brand-tint sm:flex-row sm:items-center sm:gap-4 md:p-5"
            >
              <span className="text-brand">{l.icon}</span>
              <span className="min-w-0">
                <span className="block text-lg font-bold leading-snug text-ink md:text-xl">{l.label}</span>
                <span className="mt-0.5 block text-base leading-snug text-ink-soft">{l.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
