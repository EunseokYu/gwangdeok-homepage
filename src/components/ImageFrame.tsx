import type { ImageAsset } from "@/types/content";
import { SmartImage } from "./SmartImage";

interface ImageFrameProps {
  image: ImageAsset | null | undefined;
  sizes: string;
  /** Tailwind 비율 클래스. 사진 비율을 통일해 화면 흔들림을 막습니다. */
  aspect?: string;
  priority?: boolean;
  rounded?: boolean;
  placeholderLabel?: string;
  /** 버튼 안에 넣을 때는 "span" (버튼 안에는 div 를 둘 수 없음) */
  as?: "div" | "span";
}

/** 비율이 고정된 사진 틀 + ‘디자인 예시’ 표시 */
export function ImageFrame({
  image,
  sizes,
  aspect = "aspect-[16/10]",
  priority,
  rounded = true,
  placeholderLabel,
  as: Tag = "div",
}: ImageFrameProps) {
  return (
    <Tag className={`relative block w-full overflow-hidden bg-sand-deep ${aspect} ${rounded ? "rounded-lg" : ""}`}>
      <SmartImage
        image={image}
        sizes={sizes}
        priority={priority}
        placeholderLabel={placeholderLabel}
        placeholderAs={Tag}
      />
      {image?.isDesignExample && <DesignExampleLabel />}
    </Tag>
  );
}

export function DesignExampleLabel() {
  return (
    <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded bg-ink/85 px-2.5 py-1 text-[0.9375rem] font-semibold leading-snug text-white">
      디자인 예시
    </span>
  );
}
