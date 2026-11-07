import type { ReactNode } from "react";
import { MobileActionBar } from "./MobileActionBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** 모든 페이지 공통 틀: 본문 바로가기 + 헤더 + 본문 + 푸터 + 모바일 하단 메뉴 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-brand px-5 py-3 text-lg font-bold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        본문 바로가기
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
