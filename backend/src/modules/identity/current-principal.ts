import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthPrincipal } from './auth-principal';
import { AuthenticatedRequest, getPrincipal } from './request-principal';

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthPrincipal => {
    const principal = getPrincipal(
      context.switchToHttp().getRequest<AuthenticatedRequest>(),
    );
    if (principal === undefined) {
      throw new Error('Authenticated principal is unavailable');
    }
    return principal;
  },
);
