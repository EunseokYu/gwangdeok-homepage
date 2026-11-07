import type { ReactNode } from "react";
import { InfoIcon } from "./icons";

/**
 * 개발용 예시·회사 확인 전 초안 등을 알리는 안내 상자.
 * 실제 자료로 바뀌면 데이터의 isExample / needsReview 값에 따라 자동으로 사라집니다.
 */
export function Notice({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-md border border-line-strong/60 bg-sand px-4 py-3 text-base leading-relaxed text-ink ${className}`}
    >
      <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
      <div>{children}</div>
    </div>
  );
}
