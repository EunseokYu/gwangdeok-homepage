import type { Metadata } from "next";
import { company } from "@/data/company";
import { siteConfig } from "./site";

/**
 * 페이지별 제목·설명·공유 정보.
 * (하위 페이지의 openGraph 는 상위 설정을 통째로 덮어쓰므로 공통 값을 여기서 함께 넣습니다)
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: siteConfig.url ? { canonical: path } : undefined,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: company.name,
      title: `${title} | ${company.shortName}`,
      description,
      ...(siteConfig.url ? { url: path } : {}),
    },
  };
}
