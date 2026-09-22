import {
  AUTHENTICATED_LEARNER_PERMISSIONS,
  CodequestPermission,
} from './permissions';

export interface AuthPrincipal {
  readonly subject: string;
  readonly userId: string;
  readonly permissions: readonly CodequestPermission[];
}

export function createAuthPrincipal(subject: string): AuthPrincipal {
  return Object.freeze({
    subject,
    userId: subject,
    permissions: AUTHENTICATED_LEARNER_PERMISSIONS,
  });
}
