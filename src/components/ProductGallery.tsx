"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/paths";
import type { ImageAsset } from "@/types/content";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ExpandIcon } from "./icons";
import { ImageFrame } from "./ImageFrame";
import { ImagePlaceholder } from "./ImagePlaceholder";

/**
 * 사진 갤러리 + 크게 보기.
 * - 자동으로 넘어가지 않습니다.
 * - 크게 보기 창: ‘닫기’ 버튼, ESC, 좌우 방향키, ‘이전/다음 사진’ 버튼 지원.
 * - 브라우저 기본 <dialog> 를 사용해 창 밖으로 포커스가 나가지 않고, 닫으면 원래 버튼으로 포커스가 돌아갑니다.
 */
export function ProductGallery({ images, title }: { images: ImageAsset[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const openZoom = () => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.showModal();
    setZoomOpen(true);
  };

  const closeZoom = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, []);

  // 창이 닫히면(닫기 버튼·ESC 모두) 원래 위치로 포커스를 돌려줍니다
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setZoomOpen(false);
      returnFocusRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  if (count === 0) {
    return (
      <div className="aspect-[16/10] overflow-hidden rounded-lg border border-line">
        <ImagePlaceholder label={`${title} 사진 준비 중`} />
      </div>
    );
  }

  const current = images[Math.min(index, count - 1)];

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={openZoom}
          className="block w-full rounded-lg"
          aria-label={`사진 크게 보기 (${index + 1}/${count}번째): ${current.alt}`}
        >
          <ImageFrame as="span" image={current} priority sizes="(min-width: 1024px) 680px, 100vw" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-ink-soft" aria-live="polite">
          사진 {index + 1} / {count}
        </p>
        <button
          type="button"
          onClick={openZoom}
          className="inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-ink px-4 text-lg font-bold text-ink hover:bg-sand"
        >
          <ExpandIcon className="h-5 w-5" />
          사진 크게 보기
        </button>
      </div>

      {count > 1 && (
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3" aria-label="사진 목록">
          {images.map((img, i) => (
            <li key={img.src + i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 사진 보기`}
                aria-current={i === index ? "true" : undefined}
                className={`block w-full overflow-hidden rounded-md border-[3px] ${
                  i === index ? "border-brand" : "border-transparent hover:border-line-strong"
                }`}
              >
                <span className="relative block aspect-[4/3] bg-sand-deep">
                  <Image src={withBasePath(img.src)} alt="" fill sizes="160px" className="object-cover" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${title} 사진 크게 보기`}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-white"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {zoomOpen && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
              <p className="text-lg font-semibold">
                {title} 사진 {index + 1} / {count}
              </p>
              <button
                type="button"
                onClick={closeZoom}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-white bg-black/40 px-4 text-lg font-bold"
                autoFocus
              >
                <CloseIcon className="h-5 w-5" />
                닫기
              </button>
            </div>

            <div className="relative min-h-0 flex-1 px-2 md:px-20">
              <Image
                key={current.src}
                src={withBasePath(current.src)}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
              {current.isDesignExample && (
                <span className="absolute bottom-3 right-4 rounded bg-black/70 px-2.5 py-1 text-base font-semibold md:right-24">
                  디자인 예시
                </span>
              )}
            </div>

            <p className="px-4 pt-3 text-center text-base text-white/90 md:px-8">{current.alt}</p>

            <div
              className="flex items-center justify-center gap-3 px-4 py-4"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={count < 2}
                className="inline-flex min-h-12 items-center gap-1 rounded-md border-2 border-white bg-black/40 px-4 text-lg font-bold disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                이전 사진
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={count < 2}
                className="inline-flex min-h-12 items-center gap-1 rounded-md border-2 border-white bg-black/40 px-4 text-lg font-bold disabled:opacity-40"
              >
                다음 사진
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
