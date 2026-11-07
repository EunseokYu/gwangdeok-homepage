import { company } from "@/data/company";

/**
 * B안 ‘간결한 GD · 딥그린’ 심벌.
 * 지붕과 GD 모노그램을 결합하고 하단 받침을 제거한 단색 형태입니다.
 * 같은 도형이 public/brand/gd-symbol.svg, src/app/icon.svg 에도 들어 있습니다.
 */
export function LogoSymbol({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M0 72L120 0L240 72V94L120 22L0 94Z" />
      <path d="M18 101.2L113 44.2V68.2L42 110.8V216H89V174H66V150H113V240H38A20 20 0 0 1 18 220Z" />
      <path
        fillRule="evenodd"
        d="M129 45.4L224 102.4V200A40 40 0 0 1 184 240H129ZM153 83.8L200 112V200A16 16 0 0 1 184 216H153Z"
      />
    </svg>
  );
}

/** 가로형 로고: 심벌 + ‘광덕건업’ */
export function LogoLockup({ tone = "default" }: { tone?: "default" | "inverse" }) {
  const symbolColor = tone === "inverse" ? "text-white" : "text-brand";
  const textColor = tone === "inverse" ? "text-white" : "text-ink";
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoSymbol className={`h-9 w-9 shrink-0 lg:h-10 lg:w-10 ${symbolColor}`} />
      <span className={`text-[1.375rem] font-extrabold tracking-[-0.03em] lg:text-[1.5rem] ${textColor}`}>
        {company.shortName}
      </span>
    </span>
  );
}
