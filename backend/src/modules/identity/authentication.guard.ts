import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AUTH_TOKEN_VERIFIER, AuthTokenVerifier } from './auth-token-verifier';
import { attachPrincipal, AuthenticatedRequest } from './request-principal';

const BEARER_PATTERN =
  /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @Inject(AUTH_TOKEN_VERIFIER)
    private readonly tokenVerifier: AuthTokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? BEARER_PATTERN.exec(authorization)
        : null;
    if (match === null) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const principal = await this.tokenVerifier.verify(match[1]);
      attachPrincipal(request as AuthenticatedRequest, principal);
      return true;
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }
}
