import { company, mapLinks, telHref } from "@/data/company";
import { CopyAddressButton } from "./CopyAddressButton";
import { ExternalIcon, MapPinIcon, PhoneIcon } from "./icons";

/** 전화 상담 + 주소·지도 안내. 홈 하단과 회사 안내 페이지에서 함께 사용합니다. */
export function ContactPanel({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="rounded-lg border border-line bg-white p-6 md:p-8">
        {showHeading && <h3 className="text-[1.375rem] font-bold text-ink">전화 상담</h3>}
        <p className="mt-2 text-lg text-ink-soft">번호를 누르면 대표전화로 연결됩니다.</p>
        <a
          href={telHref(company.phone.main)}
          className="mt-5 inline-flex items-center gap-3 rounded text-[2rem] font-extrabold tracking-tight text-brand md:text-[2.5rem]"
        >
          <PhoneIcon className="h-8 w-8 shrink-0" />
          {company.phone.main}
          <span className="sr-only">(대표전화로 전화 걸기)</span>
        </a>
        <p className="mt-3 text-lg">
          휴대전화{" "}
          <a href={telHref(company.phone.mobile)} className="font-bold text-ink underline underline-offset-4">
            {company.phone.mobile}
          </a>
        </p>
        {company.hours && <p className="mt-2 text-lg text-ink-soft">상담 시간 {company.hours}</p>}
        <a
          href={telHref(company.phone.main)}
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-brand px-5 text-xl font-bold text-white transition-colors hover:bg-brand-hover sm:w-auto sm:inline-flex"
        >
          <PhoneIcon className="h-6 w-6" />
          대표전화로 상담하기
        </a>
      </div>

      <div className="rounded-lg border border-line bg-white p-6 md:p-8">
        {showHeading && <h3 className="text-[1.375rem] font-bold text-ink">주소</h3>}
        <p className="mt-2 flex items-start gap-2 text-xl font-semibold text-ink">
          <MapPinIcon className="mt-1 h-6 w-6 shrink-0 text-brand" />
          <span>{company.address}</span>
        </p>
        <div className="mt-5">
          <CopyAddressButton address={company.address} />
        </div>
        <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {mapLinks.map((m) => (
            <li key={m.href}>
              <a
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-2 rounded-md border border-line-strong px-4 text-lg font-semibold text-ink transition-colors hover:border-ink hover:bg-sand"
              >
                {m.label}
                <ExternalIcon className="h-5 w-5 shrink-0" />
                <span className="sr-only">(새 창에서 열림)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-base text-ink-soft">지도 서비스에서 주소로 검색한 결과가 새 창으로 열립니다.</p>
      </div>
    </div>
  );
}
