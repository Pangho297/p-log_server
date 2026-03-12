import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { JWTPayload } from '../types/common';

type RequestWithUser = Request & { user?: JWTPayload };

export const User = createParamDecorator<string>((_, ctx) => {
  const req = ctx.switchToHttp().getRequest<RequestWithUser>();
  const payload = req.user;

  if (!payload) return undefined;

  return payload.sub;
});
