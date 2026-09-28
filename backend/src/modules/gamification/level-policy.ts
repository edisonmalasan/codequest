export interface LevelPolicy {
  readonly id: string;
  readonly xpPerLevel: number;
  readonly provisional: boolean;
}

export const PROVISIONAL_LEVEL_POLICY: LevelPolicy = Object.freeze({
  id: 'provisional-linear-100-v1',
  xpPerLevel: 100,
  provisional: true,
});

export interface DerivedLevel {
  readonly level: number;
  readonly levelStartXp: number;
  readonly nextLevelAtXp: number;
  readonly xpIntoLevel: number;
  readonly xpToNextLevel: number;
  readonly curveId: string;
  readonly curveProvisional: boolean;
}

export function deriveLevel(
  totalXp: number,
  policy: LevelPolicy = PROVISIONAL_LEVEL_POLICY,
): DerivedLevel {
  if (!Number.isSafeInteger(totalXp) || totalXp < 0)
    throw new RangeError('Total XP must be a nonnegative safe integer');
  if (!Number.isSafeInteger(policy.xpPerLevel) || policy.xpPerLevel <= 0)
    throw new RangeError('XP per level must be a positive safe integer');
  const completedLevels = Math.floor(totalXp / policy.xpPerLevel);
  const levelStartXp = completedLevels * policy.xpPerLevel;
  const nextLevelAtXp = levelStartXp + policy.xpPerLevel;
  if (!Number.isSafeInteger(nextLevelAtXp))
    throw new RangeError('Next level boundary exceeds safe integer range');
  const xpIntoLevel = totalXp - levelStartXp;
  return {
    level: completedLevels + 1,
    levelStartXp,
    nextLevelAtXp,
    xpIntoLevel,
    xpToNextLevel: policy.xpPerLevel - xpIntoLevel,
    curveId: policy.id,
    curveProvisional: policy.provisional,
  };
}
