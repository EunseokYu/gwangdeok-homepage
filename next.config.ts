import type { NextConfig } from "next";

/**
 * 정적 내보내기(output: "export")
 * - `npm run build` 결과가 out/ 폴더에 HTML·CSS·JS 파일로 만들어집니다.
 * - 서버 없이 GitHub Pages 같은 정적 호스팅에 그대로 올릴 수 있습니다.
 * - 이 방식에서는 Next.js 이미지 자동 최적화를 쓸 수 없어 unoptimized 로 둡니다.
 *   (사진은 public/images 에 미리 적당한 크기로 줄여 넣어 주세요. 가로 1600~2000px 권장)
 *
 * NEXT_PUBLIC_BASE_PATH: 하위 주소에 올릴 때의 앞부분 (예: "/gwangdeok-homepage").
 *   GitHub Pages 자동 배포 설정(.github/workflows/deploy.yml)이 넣어 줍니다. 로컬 실행 시에는 비워 둡니다.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
