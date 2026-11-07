/**
 * 회사 정보 — 모든 페이지가 이 파일 하나만 참조합니다.
 *
 * 출처: 기존 회사 사이트(https://www.ok114.co.kr/0415512836)에서 확인한 정보.
 * 공개 전 회사에 최종 확인해야 합니다. (README ‘배포 전 확인 사항’ 참고)
 *
 * 확인되지 않은 값은 null 로 둡니다. null 인 항목은 화면에 표시되지 않습니다.
 */

const address = "충남 천안시 동남구 광덕면 차령로 4509";

export const company = {
  name: "(주)광덕건업",
  shortName: "광덕건업",
  tagline: "이동식주택 · 체류형 쉼터",

  phone: {
    /** 대표전화 — 사이트 전체의 주된 상담 번호 */
    main: "041-551-2836",
    mobile: "010-6345-5719",
  },

  address,

  /** 영업시간·휴무일 — 회사 확인 전에는 null (화면에 표시하지 않음) */
  hours: null as string | null,

  /** 사업자 정보 — 확인된 값만 입력. null 이면 푸터에 표시하지 않음 */
  representative: null as string | null,
  businessRegistrationNumber: null as string | null,

  businesses: [
    {
      title: "이동식주택 제작·설치",
      description: "용도와 예산을 듣고 사양을 협의해 제작한 뒤 현장에 운송·설치합니다.",
    },
    {
      title: "농촌체류형 쉼터 제작·설치",
      description: "설치 예정 토지와 용도를 함께 확인하며 상담합니다.",
    },
    {
      title: "중고컨테이너 매입·판매",
      description: "중고컨테이너 판매와 매입 상담을 합니다.",
    },
    {
      title: "컨테이너·중고 주택 수리 후 재판매",
      description: "매입한 컨테이너와 중고 주택을 수리·개선해 다시 판매합니다.",
    },
    {
      title: "토목·설계·시공 상담",
      description: "설치에 필요한 토목·설계·시공 관련 내용을 상담합니다.",
    },
  ],
} as const;

/** 전화 연결용 링크 (tel:0415512836) */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

/**
 * 지도 서비스 검색 링크.
 * 좌표를 임의로 넣지 않고, 주소 검색 결과로 이동합니다.
 */
export const mapLinks = [
  {
    label: "네이버 지도에서 보기",
    href: `https://map.naver.com/p/search/${encodeURIComponent(address)}`,
  },
  {
    label: "카카오맵에서 보기",
    href: `https://map.kakao.com/link/search/${encodeURIComponent(address)}`,
  },
  {
    label: "구글 지도에서 보기",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  },
] as const;
