export const CODEQUEST_PERMISSIONS = [
  'account:establish:self',
  'account:read:self',
] as const;

export type CodequestPermission = (typeof CODEQUEST_PERMISSIONS)[number];

export const AUTHENTICATED_LEARNER_PERMISSIONS: readonly CodequestPermission[] =
  Object.freeze([...CODEQUEST_PERMISSIONS]);
