import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";

type Variant = "primary" | "outline" | "plain";

const base =
  "inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md px-6 py-3 text-lg font-bold leading-snug text-center transition-colors duration-150";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  outline: "border-2 border-ink bg-white text-ink hover:bg-sand",
  plain: "text-brand underline underline-offset-4 decoration-2 hover:text-brand-hover px-1",
};

export function buttonClass(variant: Variant = "primary", extra = ""): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  /** 오른쪽 꺾쇠 표시 (페이지 이동 버튼) */
  arrow?: boolean;
  icon?: ReactNode;
}

/** 사이트 안 페이지 이동 버튼 */
export function ButtonLink({ href, children, variant = "primary", className = "", arrow, icon }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {icon}
      <span>{children}</span>
      {arrow && <ChevronRightIcon className="h-5 w-5 shrink-0" />}
    </Link>
  );
}

/** 전화·외부 링크 등 일반 a 태그 버튼 */
export function ButtonAnchor({
  href,
  children,
  variant = "primary",
  className = "",
  icon,
  external,
}: ButtonLinkProps & { external?: boolean }) {
  return (
    <a
      href={href}
      className={buttonClass(variant, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon}
      <span>{children}</span>
      {external && <span className="sr-only">(새 창에서 열림)</span>}
    </a>
  );
}
