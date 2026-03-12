import { UnauthorizedException } from "../exceptions/validation";

export function extractBearer(authHeader?: string) {
  if (!authHeader) {
    throw new UnauthorizedException("Access Token이 존재하지 않습니다.");
  }

  const [schema, token] = authHeader.split(" ")

  if (schema !== "Bearer" || !token) {
    throw new UnauthorizedException("Access Token이 존재하지 않습니다.");
  }

  return token;
}