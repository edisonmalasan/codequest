import { ConflictException } from '@nestjs/common';
import { CurriculumCatalog, PublishedQuest } from './curriculum-catalog';

export interface UnmetPrerequisite {
  readonly questId: string;
  readonly slug: string;
  readonly title: string;
}

export function publishedQuests(catalog: CurriculumCatalog): PublishedQuest[] {
  return catalog.journeys.flatMap((journey) =>
    journey.chapters.flatMap((chapter) => chapter.quests),
  );
}

export function unmetPrerequisites(
  quest: PublishedQuest,
  catalog: CurriculumCatalog,
  currentCompletedIds: ReadonlySet<string>,
): UnmetPrerequisite[] {
  if (currentCompletedIds.has(quest.metadata.id)) return [];
  const byId = new Map(
    publishedQuests(catalog).map((item) => [item.metadata.id, item]),
  );
  return quest.activeSnapshot.metadata.prerequisiteQuestIds.flatMap((id) => {
    const prerequisite = byId.get(id);
    if (!prerequisite)
      throw new ConflictException('Published prerequisite unavailable');
    return currentCompletedIds.has(id)
      ? []
      : [
          {
            questId: id,
            slug: prerequisite.metadata.slug,
            title: prerequisite.activeSnapshot.metadata.title,
          },
        ];
  });
}
