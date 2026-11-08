/**
 * 제품 데이터 — 제품 목록, 제품 카드, 제품 상세, 가격·사양 안내가 모두 이 파일 하나를 씁니다.
 *
 * ⚠️ 지금 들어 있는 3개 항목은 모두 ‘개발용 예시 데이터’입니다. (isExample: true)
 *    - 사진은 홈페이지 시안에서 잘라 낸 ‘디자인 예시’ 이미지이며 실제 제품 사진이 아닙니다.
 *    - 첫 번째 제품(이동식주택 예시)은 상세 페이지 모양을 확인하도록 칸을 모두 채운 예시입니다.
 *      수치는 ○ 로, 가격은 ‘가격 상담’으로 두었습니다. 실제 값으로 바꾸기 전에 공개하지 마세요.
 *
 * ■ 값을 모를 때는 null 로 둡니다. 화면에는 ‘상담 시 안내’ 또는 ‘회사 확인 후 기재’로 보입니다.
 *   모르는 항목을 ‘포함’이나 ‘별도’로 추측해 적지 마세요.
 * ■ 제품을 하나 추가하면 products 폴더에 같은 이름(slug)의 HTML 파일도 하나 만들어야 합니다. (README 참고)
 * ■ 공개 전에 check.html 을 열면 비어 있거나 서로 맞지 않는 항목을 한눈에 볼 수 있습니다.
 *
 * ── 칸 설명 ───────────────────────────────────────────────
 * slug          주소에 쓰는 영문 이름. products/<slug>.html 파일 이름과 같아야 합니다.
 * category      "mobile-home"(이동식주택) / "shelter"(농촌체류형 쉼터) / "container"(중고컨테이너)
 * name          제품 이름. 정식 모델명이 없으면 구성으로 부릅니다. 예: "방 1개와 거실형"
 * availability  "on-sale"(판매 중) / "discontinued"(판매 종료) / null(확인 전)
 * summary       제품 카드의 한 줄 설명
 * tagline       상세 페이지 첫 화면의 ‘특징 한 문장’
 * layoutSummary 공간 구성 요약. 예: "방 1 · 거실 · 주방 · 욕실"
 *
 * images[]      사진. 첫 번째 사진이 대표 사진입니다.
 *   src           사진 파일 위치. 예: "images/products/mobile-home-a-front.jpg"
 *   alt           화면을 볼 수 없는 분께 읽어 주는 설명 (사진에 보이는 내용을 구체적으로)
 *   width,height  원본 사진의 가로·세로 픽셀
 *   space         공간 이름: "외관" / "거실" / "주방" / "침실" / "욕실" / "수납" / "출입구" 등
 *   caption       사진 아래 짧은 설명
 *   optionsShown  사진에 들어간 선택 옵션 이름 목록. 아래 options 의 name 과 똑같이 적습니다.
 *                 값이 있으면 사진 옆에 ‘선택 옵션 적용’이 표시됩니다.
 *   isDesignExample  실제 제품 사진이 아니면 true (‘디자인 예시’ 표시)
 *
 * lifestyle     ‘어떤 생활을 위한 집인가요’
 *   fitsFor       이렇게 쓰시기 좋습니다 (사용 장면)
 *   layoutPoints  [{ layout: 공간 구성, benefit: 그래서 생활이 어떻게 편한지 }]
 *   otherPlanHint 다른 평면이 더 맞는 경우
 *
 * floorPlan     평면도 이미지 (사진과 같은 형식). 없으면 null — 임의로 그린 도면을 넣지 마세요.
 * size          크기. value 와 basis(산정 기준)를 꼭 함께 적습니다. 다락·데크는 실내 면적에 합치지 않습니다.
 * rooms[]       공간별 구성 [{ name, note }]
 * keySpecs[]    제품 카드에 함께 보일 핵심 사양 [{ label, value }]
 * specGroups[]  기본 사양 묶음 [{ group, items: [{ label, value, hint }] }]
 *                 hint 는 전문용어 풀이 (없으면 생략)
 * options[]     승인된 선택 옵션
 *   name          옵션 이름
 *   range         선택할 수 있는 범위
 *   vsBase        기본 제공과 무엇이 다른지
 *   cost          { type: "extra"(추가금) / "quote"(별도 견적) / null(확인 전), amount: 원 단위 숫자 또는 null }
 *   schedule      "affects"(제작기간 늘어날 수 있음) / "none"(영향 없음) / null(확인 전)
 * customization 기본 제공·개별 변경 안내 { base: [...], custom: [...] }
 *
 * price         { kind: "consult"(가격 상담) / "fixed"(정가) / "from"(~원부터), amount, vat, appliesTo }
 *   vat           "included"(부가세 포함) / "excluded"(부가세 별도) / null(확인 전)
 *   appliesTo     이 가격이 어떤 사양 기준인지. 예: "기본 사양 기준, 선택 옵션 제외"
 * costScope[]   가격 포함 범위 [{ item, status, note }]
 *   status        "included"(제품 가격에 포함) / "excluded"(별도) / null(상담 시 안내)
 * schedule      { productionNote, siteNote }
 *   productionNote  확인된 제작 기간 안내. 회사 확인 전이면 null
 *                   (‘빠르면 제작 2주’ 같은 문구는 조건과 함께, 회사 확인 후에만 넣습니다)
 * relatedCaseSlugs  관련 시공 사례의 slug 목록
 * isExample     개발용 예시 데이터이면 true (화면에 ‘개발용 예시’ 안내가 표시됩니다)
 */
window.GD = window.GD || {};

/** 기본 사양 7개 묶음의 빈 틀. 값이 null 이면 ‘회사 확인 후 기재’로 표시됩니다. */
GD.emptySpecGroups = function () {
  return [
    { group: "구조·골조", items: [{ label: "구조", value: null }] },
    { group: "지붕·외장", items: [{ label: "지붕", value: null }, { label: "외장재", value: null }] },
    { group: "단열·방수", items: [{ label: "단열재", value: null }, { label: "방수", value: null }] },
    { group: "창호·현관", items: [{ label: "창호", value: null }, { label: "현관문", value: null }] },
    { group: "바닥·벽·천장", items: [{ label: "바닥", value: null }, { label: "벽·천장", value: null }] },
    { group: "주방·욕실", items: [{ label: "주방", value: null }, { label: "욕실", value: null }] },
    {
      group: "전기·급배수·냉난방",
      items: [
        { label: "전기", value: null },
        { label: "급배수", value: null },
        { label: "냉난방", value: null },
      ],
    },
  ];
};

/** 가격 포함 범위의 빈 틀 */
GD.emptyCostScope = function () {
  return [
    { item: "선택 옵션", status: null },
    { item: "운송", status: null },
    { item: "장비(크레인 등)", status: null },
    { item: "현장 설치", status: null },
    { item: "기초·토목 공사", status: null },
    { item: "전기·급배수 연결", status: null },
  ];
};

GD.products = [
  /* ───────────── 예시 1: 상세 페이지 모양 확인용 (모든 칸 채움) ───────────── */
  {
    slug: "mobile-home-example",
    category: "mobile-home",
    name: "방 1개와 거실형 (예시)",
    availability: null,
    summary: "침실과 거실을 나눈 구성 (예시)",
    tagline: "침실과 거실을 나눠, 쉬는 공간과 생활 공간을 구분한 이동식주택입니다. (예시 문구)",
    layoutSummary: "방 1 · 거실 · 주방 · 욕실",

    images: [
      {
        src: "images/design-examples/hero-mobile-home.jpg",
        alt: "흰 벽과 짙은 회색 하부, 나무 기둥 현관과 데크가 있는 단층 이동식주택 디자인 예시 이미지",
        width: 1116,
        height: 494,
        space: "외관",
        caption: "현관 앞에 데크를 두어 신발을 벗고 들어가기 전 짐을 내려놓을 수 있습니다. (예시 설명)",
        optionsShown: ["데크"],
        isDesignExample: true,
      },
      {
        src: "images/design-examples/product-mobile-home.jpg",
        alt: "짙은 회색 외벽에 창문 두 개와 출입문이 있는 단층 이동식주택 디자인 예시 이미지",
        width: 900,
        height: 459,
        space: "외관",
        caption: "기본 외장 상태의 옆모습입니다. (예시 설명)",
        optionsShown: [],
        isDesignExample: true,
      },
      // 아래 4장은 아직 사진이 없어 ‘사진 준비 중’으로 보입니다. 사진을 넣으면 그대로 표시됩니다.
      {
        src: "images/products/example-living.jpg",
        alt: "거실 사진 자리 (예시)",
        width: 1600,
        height: 1067,
        space: "거실",
        caption: "큰 창 쪽에 거실을 두어 낮에는 조명 없이도 밝게 지낼 수 있습니다. (예시 설명)",
        optionsShown: [],
      },
      {
        src: "images/products/example-kitchen.jpg",
        alt: "주방 사진 자리 (예시)",
        width: 1600,
        height: 1067,
        space: "주방",
        caption: "싱크대와 수납장을 한쪽 벽에 모아 동선이 짧습니다. (예시 설명)",
        optionsShown: [],
      },
      {
        src: "images/products/example-bedroom.jpg",
        alt: "침실 사진 자리 (예시)",
        width: 1600,
        height: 1067,
        space: "침실",
        caption: "거실 반대쪽 끝에 두어 손님이 와도 쉬는 공간이 나뉩니다. (예시 설명)",
        optionsShown: [],
      },
      {
        src: "images/products/example-bathroom.jpg",
        alt: "욕실 사진 자리 (예시)",
        width: 1600,
        height: 1067,
        space: "욕실",
        caption: "샤워 공간과 세면대를 함께 둔 욕실입니다. (예시 설명)",
        optionsShown: [],
      },
    ],

    lifestyle: {
      fitsFor: [
        "주말마다 머무는 세컨하우스 (예시)",
        "텃밭 가까이에서 지내는 공간 (예시)",
        "한두 분이 생활하는 작은 집 (예시)",
      ],
      layoutPoints: [
        {
          layout: "현관 바로 옆에 주방",
          benefit: "들고 온 장바구니와 짐을 바로 정리할 수 있습니다. (예시)",
        },
        {
          layout: "침실을 거실 반대쪽 끝에 배치",
          benefit: "손님이 와도 쉬는 공간이 분리됩니다. (예시)",
        },
        {
          layout: "욕실을 침실과 거실 사이에 배치",
          benefit: "어느 방에서도 가깝게 오갈 수 있습니다. (예시)",
        },
      ],
      otherPlanHint:
        "방이 두 개 필요하시거나 여럿이 함께 지내신다면 다른 평면이 더 맞을 수 있습니다. 상담할 때 함께 보세요. (예시)",
    },

    floorPlan: null,

    size: {
      exterior: { value: "가로 ○m × 세로 ○m × 높이 ○m (예시)", basis: "외벽 바깥 기준, 지붕 돌출부 포함 여부 확인 필요" },
      interior: { value: "약 ○㎡ (예시)", basis: "벽 안쪽 바닥 면적 기준" },
      loft: null,
      deck: { value: "약 ○㎡ (예시)", basis: "선택 옵션. 실내 면적에 포함하지 않음" },
    },
    rooms: [
      { name: "거실", note: "창 쪽 생활 공간 (예시)" },
      { name: "주방", note: "현관 옆, 한쪽 벽 배치 (예시)" },
      { name: "침실", note: "거실 반대쪽 끝 (예시)" },
      { name: "욕실", note: "샤워·세면·변기 (예시)" },
    ],

    keySpecs: [],

    specGroups: [
      { group: "구조·골조", items: [{ label: "구조", value: "예시 — 회사 확인 후 기재", hint: "집의 뼈대가 되는 기둥과 보" }] },
      {
        group: "지붕·외장",
        items: [
          { label: "지붕", value: "예시 — 회사 확인 후 기재" },
          { label: "외장재", value: "예시 — 회사 확인 후 기재", hint: "바깥벽을 덮는 마감 재료" },
        ],
      },
      {
        group: "단열·방수",
        items: [
          { label: "단열재", value: "예시 — 회사 확인 후 기재", hint: "벽·지붕 안에 넣어 바깥 온도가 덜 전해지게 하는 재료" },
          { label: "방수", value: null, hint: "빗물이 지붕·벽 안으로 스며들지 않게 하는 처리" },
        ],
      },
      {
        group: "창호·현관",
        items: [
          { label: "창호", value: "예시 — 회사 확인 후 기재", hint: "창틀과 유리를 함께 부르는 말" },
          { label: "현관문", value: null },
        ],
      },
      { group: "바닥·벽·천장", items: [{ label: "바닥", value: null }, { label: "벽·천장", value: null }] },
      { group: "주방·욕실", items: [{ label: "주방", value: null }, { label: "욕실", value: null }] },
      {
        group: "전기·급배수·냉난방",
        items: [
          { label: "전기", value: null },
          { label: "급배수", value: null, hint: "깨끗한 물을 들이고 쓴 물을 내보내는 배관" },
          { label: "냉난방", value: null },
        ],
      },
    ],

    options: [
      {
        name: "데크",
        range: "현관 앞 크기 협의 (예시)",
        vsBase: "기본 구성에는 데크가 없습니다. (예시)",
        cost: { type: "quote", amount: null },
        schedule: "affects",
      },
      {
        name: "창 크기·위치 조정",
        range: "구조에 영향이 없는 범위 (예시)",
        vsBase: "기본 평면의 창 위치를 바꿉니다. (예시)",
        cost: { type: null, amount: null },
        schedule: null,
      },
    ],

    customization: {
      base: ["평면도와 기본 사양에 적힌 구성", "기본 사양 표의 자재와 설비"],
      custom: [
        "방 개수·벽 위치처럼 구조와 배치를 바꾸는 요청",
        "목록에 없는 자재·설비로 바꾸는 요청",
      ],
    },

    price: { kind: "consult", amount: null, vat: null, appliesTo: "기본 사양 기준 (예시)" },
    costScope: GD.emptyCostScope(),

    schedule: {
      productionNote: null,
      siteNote: "설치할 곳의 진입로, 기초를 놓을 자리, 전기·물 연결 여건을 상담할 때 함께 확인합니다.",
    },

    relatedCaseSlugs: ["example-case-1", "example-case-2"],
    isExample: true,
  },

  /* ───────────── 예시 2: 대부분 비어 있는 상태 (빈 칸이 어떻게 보이는지 확인용) ───────────── */
  {
    slug: "shelter-example",
    category: "shelter",
    name: "농촌체류형 쉼터 (예시)",
    availability: null,
    summary: "평면·기본 사양 안내",
    tagline: null,
    layoutSummary: null,
    images: [
      {
        src: "images/design-examples/product-shelter.jpg",
        alt: "흰 벽과 나무 마감 현관, 큰 창이 있는 단층 쉼터 디자인 예시 이미지",
        width: 900,
        height: 461,
        space: "외관",
        caption: null,
        optionsShown: [],
        isDesignExample: true,
      },
    ],
    lifestyle: {
      fitsFor: [],
      layoutPoints: [],
      otherPlanHint: null,
      /** 내용이 확정되기 전 ‘어떤 생활을 위한 집인가요’에 대신 보여 줄 설명 */
      intro: [
        "농촌체류형 쉼터는 농지에서 영농을 하며 임시로 머무를 수 있도록 설치하는 시설입니다.",
        "농지법령에 따른 면적·입지·안전 기준과 신고 절차가 있습니다. 설치 예정 토지에서 가능한지 상담할 때 함께 확인해 주세요.",
      ],
    },
    floorPlan: null,
    size: { exterior: null, interior: null, loft: null, deck: null },
    rooms: [],
    keySpecs: [],
    specGroups: GD.emptySpecGroups(),
    options: [],
    customization: null,
    price: { kind: "consult", amount: null, vat: null, appliesTo: null },
    costScope: GD.emptyCostScope(),
    schedule: { productionNote: null, siteNote: null },
    relatedCaseSlugs: ["example-case-3"],
    isExample: true,
  },

  /* ───────────── 예시 3: 중고컨테이너 (재고에 따라 달라지는 제품) ───────────── */
  {
    slug: "used-container-example",
    category: "container",
    name: "중고컨테이너 (예시)",
    availability: null,
    summary: "매입·판매 상담",
    tagline: null,
    layoutSummary: null,
    images: [
      {
        src: "images/design-examples/product-container.jpg",
        alt: "방범창이 달린 창문과 출입문이 있는 회색 컨테이너 디자인 예시 이미지",
        width: 900,
        height: 462,
        space: "외관",
        caption: null,
        optionsShown: [],
        isDesignExample: true,
      },
    ],
    lifestyle: {
      fitsFor: [],
      layoutPoints: [],
      otherPlanHint: null,
      intro: [
        "중고컨테이너 판매와 매입을 상담합니다.",
        "매입한 컨테이너는 상태에 따라 수리·개선한 뒤 다시 판매하기도 합니다. 크기와 상태, 가격은 보유 현황에 따라 달라지므로 전화로 문의해 주세요.",
      ],
    },
    floorPlan: null,
    size: { exterior: null, interior: null, loft: null, deck: null },
    rooms: [],
    keySpecs: [],
    specGroups: [
      {
        group: "컨테이너 정보",
        items: [
          { label: "규격", value: null },
          { label: "상태", value: null },
          { label: "수리·개선 내용", value: null },
        ],
      },
    ],
    options: [],
    customization: null,
    price: { kind: "consult", amount: null, vat: null, appliesTo: null },
    costScope: [
      { item: "운송", status: null },
      { item: "장비(크레인 등)", status: null },
    ],
    schedule: { productionNote: null, siteNote: null },
    relatedCaseSlugs: [],
    isExample: true,
  },
];
