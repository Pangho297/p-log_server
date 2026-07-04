import { customAlphabet } from 'nanoid';

export const makeSuffix = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  6,
);

type CloudflareImageExtractOptions = {
  accountHash?: string;
  allowedVariants?: string[];
};

function canUseCloudflareImageUrl(
  accountHash: string,
  variant: string,
  options: CloudflareImageExtractOptions,
) {
  if (options.accountHash && accountHash !== options.accountHash) {
    return false;
  }

  if (options.allowedVariants && !options.allowedVariants.includes(variant)) {
    return false;
  }

  return true;
}

/** Cloudflare image delivery URL에서 이미지 Id만 추출하여 배열로 반환 */
export function extractCloudflareImageIds(
  markdown: string,
  options: CloudflareImageExtractOptions = {},
): string[] {
  /** 대상 형태 https://imagedelivery.net/<계정/해시>/<imageId>/<variant> */
  const regex =
    /https?:\/\/imagedelivery\.net\/([^)\s/]+)\/([^)\s/]+)\/([^)\s/?#]+)/g;
  const ids = new Set<string>();
  let m: RegExpExecArray | null;

  /** image Id 캡쳐
   *
   * - 마크다운 문자열 전체를 반복 스캔
   * - 매칭될 때마다 m[1](캡처한 ID)를 Set에 집어 넣음
   */
  while ((m = regex.exec(markdown)) !== null) {
    const [, accountHash, imageId, variant] = m;

    if (imageId && canUseCloudflareImageUrl(accountHash, variant, options)) {
      ids.add(imageId);
    }
  }

  return [...ids];
}

/** Cloudflare 이미지 Id가 아닌 이미지 Url들을 뽑아오는 함수 */
export function extractCloudflareImageUrls(
  markdown?: string,
  options: CloudflareImageExtractOptions = {},
): string[] | null {
  if (!markdown) return null;
  /**
   * 대상 형태:
   * - https://imagedelivery.net/<accountHash>/<imageId>/<variant>
   * - 뒤에 쿼리스트링(?...)이 붙는 경우도 허용
   */
  const regex =
    /https?:\/\/imagedelivery\.net\/([^)\s/]+)\/[^)\s/]+\/([^)\s/?#]+)(?:\?[^)\s#]*)?/g;

  const urls = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = regex.exec(markdown)) !== null) {
    const [, accountHash, variant] = m;

    if (canUseCloudflareImageUrl(accountHash, variant, options)) {
      urls.add(m[0]); // 전체 매칭 URL
    }
  }

  return [...urls];
}
