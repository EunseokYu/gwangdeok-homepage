"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

type Status = "idle" | "copied" | "failed";

/** 주소 복사 버튼 + 결과 안내 (화면 낭독기에도 읽힘) */
export function CopyAddressButton({ address }: { address: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const t = window.setTimeout(() => setStatus("idle"), 5000);
    return () => window.clearTimeout(t);
  }, [status]);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        // 오래된 브라우저용 예비 방법
        const ta = document.createElement("textarea");
        ta.value = address;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("copy failed");
      }
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md border-2 border-ink bg-white px-5 text-lg font-bold text-ink transition-colors hover:bg-sand"
      >
        {status === "copied" ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
        주소 복사
      </button>
      <p role="status" aria-live="polite" className="mt-2 min-h-[1.75rem] text-base font-semibold">
        {status === "copied" && <span className="text-brand">주소를 복사했습니다. 지도 앱에 붙여 넣어 검색하세요.</span>}
        {status === "failed" && (
          <span className="text-ink">복사하지 못했습니다. 주소를 길게 눌러 직접 복사해 주세요.</span>
        )}
      </p>
    </div>
  );
}
