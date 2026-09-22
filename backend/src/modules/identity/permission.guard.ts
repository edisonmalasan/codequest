import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CodequestPermission } from './permissions';
import { REQUIRED_PERMISSIONS } from './require-permissions';
import { AuthenticatedRequest, getPrincipal } from './request-principal';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const principal = getPrincipal(
      context.switchToHttp().getRequest<AuthenticatedRequest>(),
    );
    if (principal === undefined) {
      throw new UnauthorizedException('Authentication required');
    }
    const required = this.reflector.getAllAndOverride<
      readonly CodequestPermission[]
    >(REQUIRED_PERMISSIONS, [context.getHandler(), context.getClass()]);
    if (
      required === undefined ||
      required.length === 0 ||
      required.some((permission) => !principal.permissions.includes(permission))
    ) {
      throw new ForbiddenException('Permission denied');
    }
    return true;
  }
}
