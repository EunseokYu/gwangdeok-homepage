import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { company } from "@/data/company";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // 공개 도메인이 정해지면 NEXT_PUBLIC_SITE_URL 로 지정합니다. (임의 도메인을 넣지 않음)
  ...(siteConfig.url ? { metadataBase: new URL(siteConfig.url) } : {}),
  title: {
    default: siteConfig.title,
    template: `%s | ${company.shortName}`,
  },
  description: siteConfig.description,
  applicationName: company.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: company.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
  },
  // 확인용 주소가 검색 결과에 나오지 않도록 기본은 ‘검색 제외’
  robots: siteConfig.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 아이폰 하단 안전 영역(env(safe-area-inset-bottom))을 쓰기 위해 필요
  viewportFit: "cover",
  themeColor: "#ffffff",
  // 확대 제한을 두지 않습니다 (maximumScale 미설정)
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
