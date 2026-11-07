import { company } from "@/data/company";

/**
 * 사이트 공통 설정.
 * 도메인은 정해진 뒤 환경변수 NEXT_PUBLIC_SITE_URL 로만 지정합니다. (임의 도메인 금지)
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: company.name,
  title: `${company.shortName} | 이동식주택·농촌체류형 쉼터 제작·설치`,
  description:
    "(주)광덕건업은 이동식주택과 농촌체류형 쉼터를 제작·설치하고, 중고컨테이너 매입·판매를 상담합니다. 제품 사진과 기본 사양, 시공 사례, 제작·설치 과정을 확인하세요.",
  url: rawUrl ? rawUrl.replace(/\/$/, "") : null,
  locale: "ko_KR",
  /**
   * 검색엔진 노출 여부. 예시 자료가 남아 있는 동안은 노출하지 않습니다.
   * 정식 공개할 때 배포 환경변수 NEXT_PUBLIC_ALLOW_INDEXING=true 로 켭니다.
   */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
};
