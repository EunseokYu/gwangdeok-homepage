"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { company, telHref } from "@/data/company";
import { categoryShortcuts, mainNav, mobileNav } from "@/data/navigation";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { LogoLockup } from "./Logo";

function isActive(pathname: string, href: string): boolean {
  const path = href.split(/[?#]/)[0];
  if (path === "/") return pathname === "/";
  // 제품 분류 메뉴는 같은 /products 를 가리키므로 현재 위치 표시에서 제외
  if (href.includes("?")) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // 메뉴가 열려 있을 때: ESC 로 닫기, 첫 항목으로 포커스, 뒤쪽 화면 스크롤 막기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  // 화면이 넓어져 PC 메뉴가 보이면 모바일 메뉴를 닫습니다
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 lg:min-h-20">
          <Link href="/" className="-ml-1 rounded px-1 py-1" aria-label={`${company.shortName} 홈으로`}>
            <LogoLockup />
          </Link>

          <nav aria-label="주요 메뉴" className="hidden lg:block">
            <ul className="flex flex-wrap items-center gap-1 xl:gap-3">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-12 items-center rounded px-3 text-[1.0625rem] font-semibold transition-colors hover:text-brand ${
                        active ? "text-brand underline decoration-2 underline-offset-[10px]" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <a
            href={telHref(company.phone.main)}
            className="hidden min-h-12 items-center gap-2 rounded border-l border-line pl-5 text-brand lg:flex"
          >
            <PhoneIcon className="h-6 w-6" />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-ink-soft">대표전화</span>
              <span className="text-[1.375rem] font-extrabold tracking-tight">{company.phone.main}</span>
            </span>
          </a>

          <button
            ref={buttonRef}
            type="button"
            className="inline-flex min-h-12 items-center gap-1.5 rounded-md border-2 border-ink px-3.5 text-[1.0625rem] font-bold text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span>{open ? "닫기" : "메뉴"}</span>
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <>
            <div
              className="fixed inset-x-0 bottom-0 top-16 z-0 bg-black/40 lg:hidden"
              aria-hidden="true"
              onClick={() => close(false)}
            />
            <div
              id="mobile-menu"
              ref={panelRef}
              className="absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-white lg:hidden"
            >
              <nav aria-label="전체 메뉴" className="page-container py-4">
                <ul className="divide-y divide-line">
                  {mobileNav.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className={`flex min-h-14 items-center text-xl font-semibold ${active ? "text-brand" : "text-ink"}`}
                        >
                          {item.label}
                          {active && <span className="ml-2 text-base font-semibold">(현재 페이지)</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <a
                  href={telHref(company.phone.main)}
                  className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-md bg-brand px-4 text-xl font-bold text-white"
                >
                  <PhoneIcon className="h-6 w-6" />
                  전화 상담 {company.phone.main}
                </a>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* 모바일: 헤더 아래 제품 분류 바로가기 (스크롤하면 함께 올라갑니다) */}
      <nav aria-label="제품 분류 바로가기" className="border-b border-line bg-sand lg:hidden">
        <ul className="page-container grid grid-cols-3 divide-x divide-line">
          {categoryShortcuts.map((item) => (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className="flex min-h-12 items-center justify-center px-1 text-center text-base font-semibold text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
