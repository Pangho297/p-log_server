import { UnauthorizedException } from '../exceptions/validation';

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

export function extractBearer(authHeader?: string) {
  if (!authHeader) {
    throw new UnauthorizedException('Access Token이 존재하지 않습니다.');
  }

  const [schema, token] = authHeader.split(' ');

  if (schema !== 'Bearer' || !token) {
    throw new UnauthorizedException('Access Token이 존재하지 않습니다.');
  }

  return token;
}

export function parseCookieHeader(
  cookieHeader?: string,
): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .reduce<Record<string, string>>((cookies, item) => {
      const [rawName, ...rawValue] = item.trim().split('=');

      if (!rawName || rawValue.length === 0) {
        return cookies;
      }

      const value = rawValue.join('=');

      try {
        cookies[rawName] = decodeURIComponent(value);
      } catch {
        cookies[rawName] = value;
      }

      return cookies;
    }, {});
}

export function getCookie(cookieHeader: string | undefined, name: string) {
  return parseCookieHeader(cookieHeader)[name];
}
