import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const CurrentBusinessId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.businessId ?? '';
  },
);