import { customAlphabet } from 'nanoid';

export const makeSuffix = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  6,
);

/** Cloudflare image delivery URL에서 이미지 Id만 추출하여 배열로 반환 */
export function extractCloudflareImageIds(markdown: string): string[] {
  /** 대상 형태 https://imagedelivery.net/<계정/해시>/<imageId>/<variant> */
  const regex =
    /https?:\/\/imagedelivery\.net\/[^)\s/]+\/([^)\s/]+)\/[^)\s/]+/g;
  const ids = new Set<string>();
  let m: RegExpExecArray | null;

  /** image Id 캡쳐
   *
   * - 마크다운 문자열 전체를 반복 스캔
   * - 매칭될 때마다 m[1](캡처한 ID)를 Set에 집어 넣음
   */
  while ((m = regex.exec(markdown)) !== null) {
    if (m[1]) ids.add(m[1]);
  }

  return [...ids];
}
