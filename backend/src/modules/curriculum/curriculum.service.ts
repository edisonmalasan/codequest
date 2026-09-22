import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CURRICULUM_CATALOG,
  CurriculumCatalog,
  PublishedChapter,
  PublishedJourney,
  PublishedQuest,
} from './content/curriculum-catalog';
import {
  ChapterDetailDto,
  ChapterSummaryDto,
  JourneyDetailDto,
  JourneySummaryDto,
  QuestCaseDto,
  QuestDetailDto,
  QuestSummaryDto,
} from './curriculum.dto';

@Injectable()
export class CurriculumService {
  constructor(
    @Inject(CURRICULUM_CATALOG)
    private readonly catalog: CurriculumCatalog,
  ) {}

  listJourneys(): JourneySummaryDto[] {
    return this.catalog.journeys.map((journey) => this.journeySummary(journey));
  }

  findJourney(slug: string): JourneyDetailDto {
    const journey = this.catalog.journeys.find(
      (item) => item.metadata.slug === slug,
    );
    if (!journey) throw new NotFoundException();
    return {
      ...this.journeySummary(journey),
      entryRequirements: [...journey.metadata.entryRequirements],
      outcomes: journey.metadata.outcomes.map((outcome) => ({ ...outcome })),
      chapters: journey.chapters.map((chapter) => this.chapterSummary(chapter)),
    };
  }

  findChapter(slug: string): ChapterDetailDto {
    const located = this.locateChapter(slug);
    if (!located) throw new NotFoundException();
    return {
      ...this.chapterSummary(located.chapter),
      journey: this.journeySummary(located.journey),
      quests: located.chapter.quests.map((quest) => this.questSummary(quest)),
    };
  }

  findQuest(slug: string): QuestDetailDto {
    const located = this.locateQuest(slug);
    if (!located) throw new NotFoundException();
    const snapshot = located.quest.activeSnapshot;
    const concepts = snapshot.metadata.conceptIds.map((id) => {
      const concept = this.catalog.concepts.find((item) => item.id === id);
      if (!concept) throw new Error('Catalog concept invariant failed');
      return { ...concept };
    });
    const prerequisites = snapshot.metadata.prerequisiteQuestIds.map((id) => {
      const prerequisite = this.findQuestById(id);
      if (!prerequisite)
        throw new Error('Catalog prerequisite invariant failed');
      return {
        id: prerequisite.metadata.id,
        slug: prerequisite.metadata.slug,
        title: prerequisite.activeSnapshot.metadata.title,
      };
    });
    return {
      ...this.questSummary(located.quest),
      hierarchy: {
        journey: this.journeySummary(located.journey),
        chapter: this.chapterSummary(located.chapter),
      },
      objective: snapshot.metadata.objective,
      outcomeId: snapshot.metadata.outcomeId,
      concepts,
      prerequisites,
      hints: { ...snapshot.metadata.hints },
      lesson: snapshot.lesson,
      starterCode: snapshot.starterCode,
      cases: snapshot.cases.map((item) => ({ ...item }) as QuestCaseDto),
      ...(snapshot.metadata.explanationPrompt
        ? { explanationPrompt: snapshot.metadata.explanationPrompt }
        : {}),
      ...(snapshot.metadata.transferPrompt
        ? { transferPrompt: snapshot.metadata.transferPrompt }
        : {}),
    };
  }

  private journeySummary(journey: PublishedJourney): JourneySummaryDto {
    return {
      id: journey.metadata.id,
      slug: journey.metadata.slug,
      title: journey.metadata.title,
      position: journey.metadata.position,
      chapterCount: journey.chapters.length,
      questCount: journey.chapters.reduce(
        (total, chapter) => total + chapter.quests.length,
        0,
      ),
    };
  }

  private chapterSummary(chapter: PublishedChapter): ChapterSummaryDto {
    return {
      id: chapter.metadata.id,
      slug: chapter.metadata.slug,
      title: chapter.metadata.title,
      position: chapter.metadata.position,
      objectiveSummary: chapter.metadata.objectiveSummary,
      questCount: chapter.quests.length,
    };
  }

  private questSummary(quest: PublishedQuest): QuestSummaryDto {
    return {
      id: quest.metadata.id,
      slug: quest.metadata.slug,
      title: quest.activeSnapshot.metadata.title,
      position: quest.metadata.position,
      kind: quest.metadata.kind,
      guestEligible: quest.metadata.guestEligible,
      contentVersion: quest.activeSnapshot.metadata.contentVersion,
      assessmentVersion: quest.activeSnapshot.metadata.assessmentVersion,
      difficulty: quest.activeSnapshot.metadata.difficulty,
      xpAward: quest.activeSnapshot.metadata.xpAward,
    };
  }

  private locateChapter(slug: string) {
    for (const journey of this.catalog.journeys) {
      const chapter = journey.chapters.find(
        (item) => item.metadata.slug === slug,
      );
      if (chapter) return { journey, chapter };
    }
    return undefined;
  }

  private locateQuest(slug: string) {
    for (const journey of this.catalog.journeys)
      for (const chapter of journey.chapters) {
        const quest = chapter.quests.find(
          (item) => item.metadata.slug === slug,
        );
        if (quest) return { journey, chapter, quest };
      }
    return undefined;
  }

  private findQuestById(id: string): PublishedQuest | undefined {
    for (const journey of this.catalog.journeys)
      for (const chapter of journey.chapters) {
        const quest = chapter.quests.find((item) => item.metadata.id === id);
        if (quest) return quest;
      }
    return undefined;
  }
}
