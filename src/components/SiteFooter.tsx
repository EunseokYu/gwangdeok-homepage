import Link from "next/link";
import { company, telHref } from "@/data/company";
import { footerNav } from "@/data/navigation";
import { LogoLockup } from "./Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-brand text-white">
      <div className="page-container py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-14">
          <div>
            <LogoLockup tone="inverse" />
            <p className="mt-4 text-lg text-white/90">{company.tagline} 제작·설치</p>
          </div>

          <div>
            <h2 className="text-lg font-bold">연락처</h2>
            <dl className="mt-4 space-y-2 text-lg">
              <div className="flex flex-wrap gap-x-3">
                <dt className="text-white/85">대표전화</dt>
                <dd>
                  <a href={telHref(company.phone.main)} className="font-bold underline underline-offset-4">
                    {company.phone.main}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="text-white/85">휴대전화</dt>
                <dd>
                  <a href={telHref(company.phone.mobile)} className="underline underline-offset-4">
                    {company.phone.mobile}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="text-white/85">주소</dt>
                <dd>{company.address}</dd>
              </div>
            </dl>
          </div>

          <nav aria-label="하단 메뉴">
            <h2 className="text-lg font-bold">바로가기</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 lg:grid-cols-1">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-12 items-center text-lg hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 space-y-2 border-t border-white/25 pt-8 text-base leading-relaxed text-white/90">
          <p>
            상호 {company.name}
            {company.representative && <> · 대표 {company.representative}</>}
            {company.businessRegistrationNumber && <> · 사업자등록번호 {company.businessRegistrationNumber}</>}
          </p>
          <p>‘디자인 예시’로 표시된 사진은 실제 제품·시공 사진이 아닙니다.</p>
          <p>제품 사양과 가격은 상담 시점과 현장 여건에 따라 달라질 수 있습니다.</p>
          <p className="pt-2">© {year} {company.name}</p>
        </div>
      </div>
    </footer>
  );
}
