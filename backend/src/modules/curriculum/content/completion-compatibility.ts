import { PublishedQuest } from './curriculum-catalog';

/** Whether an accepted historical assessment still represents the active quest. */
export function completionIsCurrent(
  quest: PublishedQuest,
  contentVersion: string,
  assessmentVersion: string,
): boolean {
  const active = quest.activeSnapshot.metadata;
  let content = contentVersion;
  let assessment = assessmentVersion;
  const visited = new Set<string>();
  while (
    content !== active.contentVersion ||
    assessment !== active.assessmentVersion
  ) {
    const key = `${content}:${assessment}`;
    if (visited.has(key)) return false;
    visited.add(key);
    const transition = quest.metadata.transitions.find(
      (item) => item.from === content && item.fromAssessment === assessment,
    );
    if (
      !transition ||
      transition.compatibility !== 'compatible' ||
      transition.curriculumReview !== 'approved' ||
      transition.technicalReview !== 'approved'
    )
      return false;
    content = transition.to;
    assessment = transition.toAssessment;
  }
  return true;
}
