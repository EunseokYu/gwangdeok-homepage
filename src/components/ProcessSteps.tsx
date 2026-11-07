import { processSteps } from "@/data/process";

/** 제작·설치 4단계. PC 가로 4칸, 태블릿 2칸, 모바일 세로 목록 */
export function ProcessSteps({ detailed = false }: { detailed?: boolean }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {processSteps.map((step) => (
        <li key={step.number} className="flex min-w-0 flex-col rounded-lg border border-line bg-white p-6">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-brand px-2 text-lg font-bold text-white"
              aria-hidden="true"
            >
              {String(step.number).padStart(2, "0")}
            </span>
            <h3 className="text-[1.375rem] font-bold text-ink">
              <span className="sr-only">{step.number}단계: </span>
              {step.title}
            </h3>
          </div>
          <p className="mt-4 text-lg text-ink">{step.summary}</p>
          {detailed && (
            <ul className="mt-4 space-y-2 border-t border-line pt-4 text-base text-ink-soft">
              {step.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-soft" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
