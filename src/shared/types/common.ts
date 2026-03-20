export type UUID = string;

export type TokenType = 'refresh' | 'access';
export interface JWTPayload {
  /** claim 값 (보통은 userId) */
  sub: string;

  /** 토큰 타입 */
  type: TokenType;

  /** JWT ID */
  jti?: string;

  /** 토큰 발급 시간 (Issued At) (Unix) */
  iat?: number;

  /** 토큰 만료 시간 (Expiration Time) (Unix) */
  exp?: number;
}

export interface CloudflareDirectURLResponse {
  result: {
    id: string;
    uploadURL: string;
  };
  result_info: object | null;
  success: boolean;
  errors: any[];
  messages: any[];
}
