import { ImageIcon } from "./icons";

/** 사진이 없을 때 같은 자리를 지키는 대체 표시 */
export function ImagePlaceholder({
  label = "사진 준비 중",
  as: Tag = "div",
}: {
  label?: string;
  as?: "div" | "span";
}) {
  return (
    <Tag className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sand-deep p-4 text-center text-ink-soft">
      <ImageIcon className="h-10 w-10" />
      <span className="text-base font-semibold">{label}</span>
    </Tag>
  );
}
