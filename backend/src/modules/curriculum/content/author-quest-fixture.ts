import { CurriculumService } from '../curriculum.service';
import type { QuestDetailDto } from '../curriculum.dto';
import type { CurriculumCatalog } from './curriculum-catalog';
import type { AuthorCatalog, SelectedQuest } from './author-selection';

/** Projects an authored snapshot through the same DTO mapper as public curriculum reads. */
export function authorQuestFixture(
  catalog: AuthorCatalog,
  selection: SelectedQuest,
): QuestDetailDto {
  const projection: CurriculumCatalog = {
    concepts: catalog.authored.concepts,
    journeys: catalog.authored.journeys.map((journey) => ({
      metadata: journey.metadata,
      courses: journey.courses.map((course) => ({
        metadata: course.metadata,
        chapters: course.chapters.map((chapter) => ({
          metadata: chapter.metadata,
          quests: chapter.quests.map((quest) => ({
            metadata: quest.metadata,
            activeSnapshot:
              quest.metadata.id === selection.quest.metadata.id
                ? selection.snapshot
                : quest.snapshots[quest.metadata.currentVersion],
          })),
        })),
      })),
      chapters: journey.chapters.map((chapter) => ({
        metadata: chapter.metadata,
        quests: chapter.quests.map((quest) => ({
          metadata: quest.metadata,
          activeSnapshot:
            quest.metadata.id === selection.quest.metadata.id
              ? selection.snapshot
              : quest.snapshots[quest.metadata.currentVersion],
        })),
      })),
    })),
  };
  return new CurriculumService(projection).findQuest(
    selection.quest.metadata.slug,
  );
}
