import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  description?: ReactNode;
  /** 제목 오른쪽(PC) / 아래(모바일)에 놓을 링크 등 */
  action?: ReactNode;
  tone?: "white" | "sand";
  children: ReactNode;
  /** 페이지의 첫 제목이면 h1 */
  headingLevel?: "h1" | "h2";
}

/** 제목·설명·본문 사이에 충분한 여백을 둔 공통 섹션 */
export function Section({
  id,
  title,
  description,
  action,
  tone = "white",
  children,
  headingLevel = "h2",
}: SectionProps) {
  const Heading = headingLevel;
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`section-y ${tone === "sand" ? "bg-sand" : "bg-white"}`}>
      <div className="page-container">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-8">
          <div className="max-w-3xl">
            <Heading id={headingId} className="text-[1.75rem] font-bold text-ink md:text-[2.25rem]">
              {title}
            </Heading>
            {description && <p className="mt-3 text-lg text-ink-soft md:text-xl">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
        <div className="mt-8 md:mt-10">{children}</div>
      </div>
    </section>
  );
}
