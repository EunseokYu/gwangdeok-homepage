import { costBreakdown } from "@/data/process";

/** 제품 가격과 총비용(운송·기초·설치 등)을 구분해 설명 */
export function CostGuide({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" | "h4" }) {
  const Heading = headingLevel;
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      <div className="rounded-lg border border-line bg-white p-6 md:p-8">
        <Heading className="text-[1.375rem] font-bold text-ink">① {costBreakdown.product.title}</Heading>
        <p className="mt-3 text-lg text-ink">{costBreakdown.product.description}</p>
      </div>
      <div className="rounded-lg border border-line bg-white p-6 md:p-8">
        <Heading className="text-[1.375rem] font-bold text-ink">② {costBreakdown.site.title}</Heading>
        <p className="mt-3 text-lg text-ink">{costBreakdown.site.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {costBreakdown.site.items.map((item) => (
            <li key={item} className="rounded-md border border-line bg-sand px-3 py-1.5 text-base font-semibold text-ink">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-lg font-semibold text-ink md:col-span-2">
        총비용 = ① 제품 가격 + ② 현장 여건에 따른 비용. 두 금액을 나누어 안내해 드립니다.
      </p>
    </div>
  );
}
