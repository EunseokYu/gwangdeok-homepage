# (주)광덕건업 홈페이지

이동식주택·농촌체류형 쉼터·중고컨테이너를 안내하고 전화 상담과 방문 문의로 이어지게 하는 회사 홈페이지입니다.

- 기술: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4
- 추가 라이브러리 없음 (아이콘·로고는 직접 그린 SVG)
- 회원가입·결제·관리자·데이터베이스·문의 폼 없음 (정적 콘텐츠 + 전화·지도 연결)

---

## 1. 실행 방법

필요한 것: **Node.js 20.9 이상** (`node -v` 로 확인)

```bash
cd gwangdeok-homepage
npm install          # 처음 한 번 (package-lock.json 이 생깁니다. 함께 커밋하세요)
npm run dev          # 개발 서버 → 브라우저에서 http://localhost:3000
```

검사와 빌드:

```bash
npm run typecheck    # 타입 검사
npm run lint         # 코드 규칙 검사
npm run build        # 배포용 빌드 → out/ 폴더에 HTML 파일 생성
npm run preview      # out/ 폴더를 내 컴퓨터에서 열어 보기
npm run check        # 위 세 가지(typecheck → lint → build)를 한 번에
```

> 휴대폰으로 확인하려면: 같은 와이파이에서 `npm run dev -- -H 0.0.0.0` 실행 후
> 휴대폰 브라우저에 `http://(컴퓨터 IP):3000` 입력. 컴퓨터 IP 는 Windows `ipconfig`, Mac `ipconfig getifaddr en0`.

---

## 2. 페이지 구성

| 주소 | 내용 |
|---|---|
| `/` | 홈: 첫 화면 → 주요 안내 바로가기 → 제품(분류 필터) → 시공 사례 → 제작·설치 과정 → 자주 묻는 질문 → 연락처·오시는 길 |
| `/products` | 제품 안내. `?category=mobile-home` / `shelter` / `container` 로 분류가 선택된 상태로 열림 |
| `/products/[slug]` | 제품 상세: 사진 갤러리(크게 보기), 설명, 평면도, 기본 사양, 옵션, 가격 포함·별도, 관련 사례, 전화 상담 |
| `/cases`, `/cases/[slug]` | 시공 사례 목록·상세 |
| `/process` | 제작·설치 과정, 비용 구성, 상담 전 준비물, 관련 질문 |
| `/about` | 회사 안내·연락처·오시는 길(`#location`): 주소 복사, 네이버·카카오·구글 지도 링크 |

공통: 상단 헤더(PC 메뉴·대표전화 / 모바일 ‘메뉴’ 버튼과 제품 분류 바로가기), 푸터, 모바일 하단 고정 메뉴(제품 보기 · 오시는 길 · 전화 상담), ‘본문 바로가기’ 링크.

---

## 3. 폴더 구조

```
src/
  app/                 페이지 (layout.tsx = 공통 틀, globals.css = 색·여백 기준)
    icon.svg, favicon.ico, apple-icon.png   파비콘 (B안 심벌)
    opengraph-image.png                     카카오톡·SNS 공유 이미지
  components/          화면 부품 (헤더, 카드, 갤러리, FAQ 등)
  data/                ★ 내용은 모두 여기서 고칩니다
    company.ts         회사명·전화·주소·사업자 정보·지도 링크
    products.ts        제품
    cases.ts           시공 사례
    faq.ts             자주 묻는 질문
    process.ts         제작·설치 단계, 상담 준비물, 비용 구성
    categories.ts      제품 분류 이름·설명
    navigation.ts      메뉴
  types/content.ts     데이터 형식(어떤 칸이 있는지)
public/
  images/products/     실제 제품 사진을 넣을 곳
  images/cases/        실제 시공 사진을 넣을 곳
  images/design-examples/   시안에서 잘라 낸 ‘디자인 예시’ 이미지 (실제 사진으로 교체 대상)
  brand/               로고 심벌 SVG (딥그린 / 흰색)
```

---

## 4. 데이터·사진 교체 방법

### 사진 넣기
1. 사진을 `public/images/products/` (제품) 또는 `public/images/cases/` (사례)에 넣습니다.
   - 파일 이름은 영문 소문자·숫자·하이픈 (예: `mobile-home-a-front.jpg`)
   - 가로 1600~2000px 정도의 JPG면 충분합니다. 화면 크기에 맞게 Next.js 가 자동으로 줄여 보냅니다.
2. 사진의 가로·세로 픽셀을 확인합니다. (Windows: 파일 오른쪽 클릭 → 속성 → 자세히 / Mac: 파일 선택 후 ⌘+I)
3. 데이터 파일의 `images` 에 적습니다.

```ts
images: [
  {
    src: "/images/products/mobile-home-a-front.jpg",
    alt: "흰색 외벽과 데크가 있는 단층 이동식주택 정면",   // 사진에 보이는 내용을 구체적으로
    width: 1800,
    height: 1200,
    // isDesignExample 은 지웁니다 (실제 사진이면 ‘디자인 예시’ 표시가 사라짐)
  },
],
```

사진 파일이 없거나 주소가 틀리면 화면에 ‘사진 준비 중’이 표시되고 레이아웃은 유지됩니다.

### 제품 바꾸기 (`src/data/products.ts`)
- 지금 있는 3개는 **개발용 예시**(`isExample: true`)입니다. 실제 제품으로 바꾸면 `isExample: false` 로 바꾸세요. 모든 제품이 false 가 되면 ‘개발용 예시 데이터’ 안내가 사라집니다.
- `slug` 는 주소가 됩니다. (예: `mobile-home-a` → `/products/mobile-home-a`)
- 확인된 값만 넣습니다.
  - `area`: 면적 (예: `"약 33㎡(10평)"`), 없으면 `null`
  - `keySpecs`: 카드에 함께 보일 핵심 사양
  - `specs`: 상세 페이지 사양 표. 값이 `null` 이면 ‘회사 확인 후 기재’로 보입니다
  - `options`, `priceIncludes`, `priceExcludes`: 비어 있으면 ‘상담할 때 안내’ 문구가 보입니다
  - `price`: `{ kind: "consult" }`(가격 상담) / `{ kind: "fixed", amount: 32000000 }` / `{ kind: "from", amount: 25000000 }`(~원부터)
  - `floorPlan`: 평면도 이미지 (사진과 같은 형식), 없으면 `null`

### 시공 사례 바꾸기 (`src/data/cases.ts`)
- 지금 3개는 **개발용 예시**입니다. 실제 사례로 바꾸거나 지우세요.
- 지역은 공개 가능한 범위만 (예: `"충남 천안"`). 번지·마을 이름·고객 이름 금지.
- 사진에 얼굴·차량 번호판·문패·주소가 보이면 가리거나 다른 사진을 쓰세요.
- 생성 이미지나 시안 이미지를 실제 사례 사진으로 쓰지 마세요.

### 자주 묻는 질문 (`src/data/faq.ts`)
- 모든 답변이 **회사 확인 전 초안**(`needsReview: true`)입니다. 확인 후 `false` 로 바꾸면 ‘회사 확인 전 초안’ 안내가 사라집니다.

### 회사 정보 (`src/data/company.ts`)
- `hours`(상담 시간), `representative`(대표자), `businessRegistrationNumber`(사업자등록번호)는 확인 전이라 `null` 입니다. 값을 넣으면 푸터와 회사 안내에 자동으로 표시됩니다.

### 첫 화면 사진
- `src/app/page.tsx` 위쪽의 `heroImage` 값을 바꿉니다.

---

## 5. 디자인 기준

- 색: 흰색 바탕, 따뜻한 회색 `#F5F2EC`, 본문 차콜 `#1F2321`, 강조 딥그린 `#293F36` (`src/app/globals.css`)
- 글자: 본문 18px, 줄 간격 1.75. 한글은 어절 단위 줄바꿈
- 여백: 섹션 위아래 모바일 48px · 태블릿 72px · PC 96px, 본문 최대 너비 1248px, 모바일 좌우 20px
- 버튼·터치 영역: 높이 48~56px
- 글꼴: 글꼴 파일을 포함하지 않고 기기 기본 한글 글꼴(애플 SD 고딕 Neo, 맑은 고딕, Noto Sans KR 등)을 사용합니다. 라이선스 부담이 없습니다.
  Pretendard(SIL OFL, 무료·상업 이용 가능)를 쓰려면 글꼴 파일을 `public/fonts` 에 넣고 `next/font/local` 로 연결하면 됩니다.
- 로고: B안 ‘간결한 GD · 딥그린’을 시안 보드를 참고해 SVG로 다시 그린 것입니다. (`src/components/Logo.tsx`, `public/brand/`)
  인쇄물·간판 등에 쓰려면 디자이너에게 최종 원본(AI/SVG)을 받아 교체하는 것을 권합니다.

---

## 6. 배포 전 확인 사항

### 회사에 확인받을 것 (사용자가 할 일)
| 항목 | 위치 | 현재 상태 |
|---|---|---|
| 회사명·대표전화·휴대전화·주소 | `data/company.ts` | 기존 ok114 사이트 기준. 최종 확인 필요 |
| 대표자·사업자등록번호 | `data/company.ts` | 비어 있음 (표시 안 됨) |
| 상담 시간·휴무일 | `data/company.ts` → `hours` | 비어 있음 (표시 안 됨) |
| 실제 제품명·사진·면적·사양·옵션·가격·포함/별도 항목·평면도 | `data/products.ts` | 개발용 예시 |
| 실제 시공 사례 사진·지역·내용 (고객 동의 포함) | `data/cases.ts` | 개발용 예시 |
| FAQ 답변 5개 | `data/faq.ts` | 초안 |
| 제작·설치 단계가 실제 업무와 맞는지 | `data/process.ts` | 기본 흐름 |
| 첫 화면·제품 사진 (회사 제공 사진) | `public/images/` | 시안에서 잘라 낸 ‘디자인 예시’ |

### 기술 점검
- [ ] `npm run check` 통과 (타입 검사·린트·빌드)
- [ ] 실제 휴대폰(아이폰·안드로이드 각 1대 이상)에서 전화 걸기, 주소 복사, 지도 링크, 하단 메뉴 확인
- [ ] 50~60대 고객과 비슷한 분 1~2명에게 “제품 가격 안내 찾기 / 전화번호 찾기 / 오시는 길 찾기”를 부탁하고 막히는 곳 관찰
- [ ] 도메인이 정해지면 `.env.example` 을 `.env.local` 로 복사하고 `NEXT_PUBLIC_SITE_URL` 입력
      (배포 서비스에서는 그 서비스의 환경변수 설정 화면에 같은 이름으로 입력)
- [ ] 개발용 예시 데이터와 ‘디자인 예시’ 이미지가 남아 있지 않은지 확인
      (`grep -rn "isExample: true\|isDesignExample: true\|needsReview: true" src/data`)
- [ ] 나중에 문의 폼·방문 통계 등 개인정보를 받는 기능을 넣으면 개인정보처리방침 페이지 추가

### 확인용 배포: GitHub Pages
`main` 브랜치에 올리면 `.github/workflows/deploy.yml` 이 자동으로 실행됩니다.
설치 → 타입 검사 → 린트 → 빌드 → 배포 순서이고, 주소는 `https://(아이디).github.io/gwangdeok-homepage/` 입니다.

- 처음 한 번: 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 바꿉니다.
- 진행 상황: 저장소 **Actions** 탭. 초록 체크면 배포 완료, 빨간 X 면 눌러서 오류 내용을 확인합니다.
- 지금은 **검색 제외(noindex)** 상태입니다. 예시 자료를 실제 자료로 바꾼 뒤 정식 공개할 때
  `deploy.yml` 의 `NEXT_PUBLIC_ALLOW_INDEXING` 을 `"true"` 로 바꿉니다.
- 타입 검사·린트·빌드 중 하나라도 실패하면 배포하지 않고 이전 사이트가 그대로 유지됩니다.

### 정식 운영
GitHub Pages 주소는 확인용으로 쓰는 것을 권합니다. 정식 운영 전에 회사 도메인과 호스팅 방식을 정하세요.
정적 파일(out/)이라 대부분의 호스팅에 올릴 수 있습니다. Vercel 무료(Hobby) 요금제는 비상업용이므로 회사 사이트에는 맞지 않습니다.
