import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";

export interface Crumb {
  label: string;
  href?: string;
}

/** 하위 페이지 머리말: 현재 위치(브레드크럼) + 제목 + 설명 */
export function PageIntro({
  title,
  description,
  crumbs,
}: {
  title: string;
  description?: ReactNode;
  crumbs: Crumb[];
}) {
  return (
    <div className="border-b border-line bg-sand">
      <div className="page-container py-10 md:py-14 lg:py-16">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-[2rem] font-extrabold text-ink md:text-[2.75rem]">{title}</h1>
        {description && <p className="mt-4 max-w-3xl text-lg text-ink-soft md:text-xl">{description}</p>}
      </div>
    </div>
  );
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="현재 위치">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-base text-ink-soft">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
              {c.href && !last ? (
                <Link href={c.href} className="inline-flex min-h-10 items-center underline underline-offset-4 hover:text-brand">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="font-semibold text-ink">
                  {c.label}
                </span>
              )}
              {!last && <ChevronRightIcon className="h-4 w-4 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
