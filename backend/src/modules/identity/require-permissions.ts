import { SetMetadata } from '@nestjs/common';
import { CodequestPermission } from './permissions';

export const REQUIRED_PERMISSIONS = Symbol('REQUIRED_PERMISSIONS');

export function RequirePermissions(...permissions: CodequestPermission[]) {
  return SetMetadata(REQUIRED_PERMISSIONS, Object.freeze([...permissions]));
}
