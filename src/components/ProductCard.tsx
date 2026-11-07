import Link from "next/link";
import { getCategory } from "@/data/categories";
import { formatPrice } from "@/lib/content";
import type { Product } from "@/types/content";
import { ChevronRightIcon } from "./icons";
import { ImageFrame } from "./ImageFrame";

export function ProductCard({ product, headingLevel = "h3" }: { product: Product; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const category = getCategory(product.category);
  const shownSpecs = product.keySpecs.filter((s) => s.value);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white">
      <ImageFrame
        image={product.images[0]}
        rounded={false}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-base font-semibold text-brand">
          {category.label}
          {product.isExample && <span className="font-normal text-ink-soft"> · 개발용 예시 데이터</span>}
        </p>
        <Heading className="mt-1 text-[1.5rem] font-bold text-ink">{product.name}</Heading>
        <p className="mt-1 text-lg text-ink-soft">{product.summary}</p>

        {(product.area || shownSpecs.length > 0) && (
          <dl className="mt-4 space-y-1 text-base">
            {product.area && (
              <div className="flex gap-2">
                <dt className="text-ink-soft">면적</dt>
                <dd className="font-semibold">{product.area}</dd>
              </div>
            )}
            {shownSpecs.map((s) => (
              <div key={s.label} className="flex gap-2">
                <dt className="text-ink-soft">{s.label}</dt>
                <dd className="font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-5 rounded-md bg-sand px-4 py-3 text-xl font-bold text-ink">
          <span className="sr-only">가격: </span>
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto pt-5">
          <Link
            href={`/products/${product.slug}`}
            className="flex min-h-[3.25rem] items-center justify-center gap-1.5 rounded-md border-2 border-ink px-4 text-lg font-bold text-ink transition-colors hover:bg-sand"
          >
            사진·상세 보기<span className="sr-only">: {product.name}</span>
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
