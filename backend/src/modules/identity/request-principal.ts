import { FastifyRequest } from 'fastify';
import { AuthPrincipal } from './auth-principal';

export const AUTH_PRINCIPAL = Symbol('AUTH_PRINCIPAL');

export interface AuthenticatedRequest extends FastifyRequest {
  [AUTH_PRINCIPAL]?: AuthPrincipal;
}

export function attachPrincipal(
  request: object,
  principal: AuthPrincipal,
): void {
  Object.defineProperty(request, AUTH_PRINCIPAL, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: principal,
  });
}

export function getPrincipal(
  request: AuthenticatedRequest,
): AuthPrincipal | undefined {
  return request[AUTH_PRINCIPAL];
}
