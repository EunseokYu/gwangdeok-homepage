"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/paths";
import type { ImageAsset } from "@/types/content";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface SmartImageProps {
  image: ImageAsset | null | undefined;
  /** 화면 너비별 표시 크기. 예: "(min-width: 1024px) 33vw, 100vw" */
  sizes: string;
  priority?: boolean;
  /** cover: 틀을 가득 채움 / contain: 잘림 없이 전체 표시 */
  fit?: "cover" | "contain";
  placeholderLabel?: string;
  placeholderAs?: "div" | "span";
}

/**
 * 사진이 없거나 불러오지 못하면 ‘사진 준비 중’ 대체 표시로 바꿉니다.
 * 부모 요소가 크기(비율)를 정하고, 이 컴포넌트는 그 안을 채웁니다.
 */
export function SmartImage({
  image,
  sizes,
  priority,
  fit = "cover",
  placeholderLabel,
  placeholderAs,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 화면이 준비되기 전에 이미 실패한 사진도 대체 표시로 바꿉니다
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [image?.src]);

  if (!image || failed) {
    return <ImagePlaceholder label={placeholderLabel} as={placeholderAs} />;
  }

  return (
    <Image
      ref={imgRef}
      src={withBasePath(image.src)}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
    />
  );
}
