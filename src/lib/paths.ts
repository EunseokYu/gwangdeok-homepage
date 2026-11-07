/**
 * 사이트가 하위 주소에 올라갈 때(예: https://아이디.github.io/gwangdeok-homepage/)의 앞부분.
 * GitHub Pages 배포 시 자동 배포 설정이 NEXT_PUBLIC_BASE_PATH 를 넣어 줍니다. 평소에는 빈 값입니다.
 *
 * 페이지 링크(next/link)에는 Next.js 가 자동으로 붙여 주지만,
 * public 폴더의 사진 경로에는 직접 붙여야 하므로 이 함수를 씁니다.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(src: string): string {
  if (!basePath || !src.startsWith("/") || src.startsWith(`${basePath}/`)) return src;
  return `${basePath}${src}`;
}
