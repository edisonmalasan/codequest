import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';
import {
  chapters,
  journeys,
  questAttempts,
  questCompletions,
  questHintUses,
  quests,
  questStarts,
  questVersions,
  users,
} from '../../infrastructure/database/schema';
import {
  CURRICULUM_CATALOG,
  CurriculumCatalog,
  PublishedChapter,
  PublishedJourney,
  PublishedQuest,
} from '../curriculum/content/curriculum-catalog';
import {
  ActivityResponseDto,
  ChapterProgressDto,
  JourneyProgressDto,
  QuestProgressDto,
  StartQuestDto,
  UseHintDto,
} from './progress.dto';

function earliest(dates: Date[]): string | null {
  return dates.length
    ? new Date(Math.min(...dates.map((date) => date.getTime()))).toISOString()
    : null;
}

function latest(dates: Date[]): string | null {
  return dates.length
    ? new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString()
    : null;
}

function aggregate(quests: QuestProgressDto[]) {
  const totalQuests = quests.length;
  const completedQuests = quests.filter(
    (quest) => quest.status === 'completed',
  ).length;
  return {
    completedQuests,
    totalQuests,
    percentage: totalQuests
      ? Math.floor((100 * completedQuests) / totalQuests)
      : 0,
    status: (totalQuests && completedQuests === totalQuests
      ? 'completed'
      : quests.some((quest) => quest.status !== 'not_started')
        ? 'in_progress'
        : 'not_started') as QuestProgressDto['status'],
  };
}

function completionIsCurrent(
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

@Injectable()
export class ProgressService {
  constructor(
    @Inject(DatabaseConnectionService)
    private readonly connection: DatabaseConnectionService,
    @Inject(CURRICULUM_CATALOG) private readonly catalog: CurriculumCatalog,
  ) {}

  private locateQuest(slug: string): {
    journey: PublishedJourney;
    chapter: PublishedChapter;
    quest: PublishedQuest;
  } {
    for (const journey of this.catalog.journeys)
      for (const chapter of journey.chapters)
        for (const quest of chapter.quests)
          if (quest.metadata.slug === slug) return { journey, chapter, quest };
    throw new NotFoundException('Published quest not found');
  }

  private locateChapter(slug: string): PublishedChapter {
    for (const journey of this.catalog.journeys)
      for (const chapter of journey.chapters)
        if (chapter.metadata.slug === slug) return chapter;
    throw new NotFoundException('Published chapter not found');
  }

  private locateJourney(slug: string): PublishedJourney {
    const journey = this.catalog.journeys.find(
      (item) => item.metadata.slug === slug,
    );
    if (!journey) throw new NotFoundException('Published Journey not found');
    return journey;
  }

  private checkVersion(quest: PublishedQuest, version: string): void {
    if (quest.activeSnapshot.metadata.contentVersion !== version)
      throw new ConflictException(
        'Quest version changed; retry with the current version',
      );
  }

  private async ensureVersion(
    userId: string,
    journey: PublishedJourney,
    chapter: PublishedChapter,
    quest: PublishedQuest,
  ) {
    const db = this.connection.database;
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
    await db
      .insert(journeys)
      .values({ id: journey.metadata.id, position: journey.metadata.position })
      .onConflictDoNothing();
    await db
      .insert(chapters)
      .values({
        id: chapter.metadata.id,
        journeyId: journey.metadata.id,
        position: chapter.metadata.position,
      })
      .onConflictDoNothing();
    await db
      .insert(quests)
      .values({
        id: quest.metadata.id,
        chapterId: chapter.metadata.id,
        position: quest.metadata.position,
        kind: quest.metadata.kind,
      })
      .onConflictDoNothing();
    const snapshot = quest.activeSnapshot.metadata;
    await db
      .insert(questVersions)
      .values({
        questId: quest.metadata.id,
        contentVersion: snapshot.contentVersion,
        assessmentVersion: snapshot.assessmentVersion,
      })
      .onConflictDoNothing();
    const version = await db
      .select({ id: questVersions.id })
      .from(questVersions)
      .where(
        and(
          eq(questVersions.questId, quest.metadata.id),
          eq(questVersions.contentVersion, snapshot.contentVersion),
          eq(questVersions.assessmentVersion, snapshot.assessmentVersion),
        ),
      )
      .limit(1);
    if (!version[0])
      throw new ConflictException('Assessment version is unavailable');
    return version[0].id;
  }

  async start(
    userId: string,
    slug: string,
    body: StartQuestDto,
  ): Promise<ActivityResponseDto> {
    const { journey, chapter, quest } = this.locateQuest(slug);
    this.checkVersion(quest, body.contentVersion);
    const versionId = await this.ensureVersion(userId, journey, chapter, quest);
    const db = this.connection.database;
    await db
      .insert(questStarts)
      .values({ userId, questId: quest.metadata.id, questVersionId: versionId })
      .onConflictDoNothing();
    const rows = await db
      .select({ startedAt: questStarts.startedAt })
      .from(questStarts)
      .where(
        and(
          eq(questStarts.userId, userId),
          eq(questStarts.questId, quest.metadata.id),
        ),
      )
      .limit(1);
    return {
      questId: quest.metadata.id,
      occurredAt: rows[0].startedAt.toISOString(),
    };
  }

  async useHint(
    userId: string,
    slug: string,
    body: UseHintDto,
  ): Promise<ActivityResponseDto> {
    const { journey, chapter, quest } = this.locateQuest(slug);
    this.checkVersion(quest, body.contentVersion);
    if (!['question', 'concept', 'nextStep'].includes(body.hintKey))
      throw new ConflictException('Published hint not found');
    const versionId = await this.ensureVersion(userId, journey, chapter, quest);
    const db = this.connection.database;
    await db
      .insert(questHintUses)
      .values({
        userId,
        questId: quest.metadata.id,
        questVersionId: versionId,
        hintKey: body.hintKey,
      })
      .onConflictDoNothing();
    const rows = await db
      .select({ usedAt: questHintUses.usedAt })
      .from(questHintUses)
      .where(
        and(
          eq(questHintUses.userId, userId),
          eq(questHintUses.questId, quest.metadata.id),
          eq(questHintUses.questVersionId, versionId),
          eq(questHintUses.hintKey, body.hintKey),
        ),
      )
      .limit(1);
    return {
      questId: quest.metadata.id,
      occurredAt: rows[0].usedAt.toISOString(),
    };
  }

  private async questsProgress(
    userId: string,
    catalogQuests: readonly PublishedQuest[],
  ): Promise<QuestProgressDto[]> {
    if (!catalogQuests.length) return [];
    const db = this.connection.database;
    const ids = catalogQuests.map((quest) => quest.metadata.id);
    const [starts, hints, attempts, completions] = await Promise.all([
      db
        .select({ questId: questStarts.questId, at: questStarts.startedAt })
        .from(questStarts)
        .where(
          and(
            eq(questStarts.userId, userId),
            inArray(questStarts.questId, ids),
          ),
        ),
      db
        .select({
          questId: questHintUses.questId,
          at: questHintUses.usedAt,
          hintKey: questHintUses.hintKey,
          contentVersion: questVersions.contentVersion,
        })
        .from(questHintUses)
        .innerJoin(
          questVersions,
          eq(questHintUses.questVersionId, questVersions.id),
        )
        .where(
          and(
            eq(questHintUses.userId, userId),
            inArray(questHintUses.questId, ids),
          ),
        ),
      db
        .select({
          questId: questAttempts.questId,
          at: questAttempts.submittedAt,
        })
        .from(questAttempts)
        .where(
          and(
            eq(questAttempts.userId, userId),
            inArray(questAttempts.questId, ids),
          ),
        ),
      db
        .select({
          questId: questCompletions.questId,
          at: questCompletions.acceptedAt,
          contentVersion: questVersions.contentVersion,
          assessmentVersion: questVersions.assessmentVersion,
        })
        .from(questCompletions)
        .innerJoin(
          questAttempts,
          eq(questCompletions.acceptedAttemptId, questAttempts.id),
        )
        .innerJoin(
          questVersions,
          eq(questAttempts.questVersionId, questVersions.id),
        )
        .where(
          and(
            eq(questCompletions.userId, userId),
            inArray(questCompletions.questId, ids),
          ),
        ),
    ]);
    return catalogQuests.map((quest) => {
      const id = quest.metadata.id;
      const startDates = starts
        .filter((row) => row.questId === id)
        .map((row) => row.at);
      const hintRows = hints.filter((row) => row.questId === id);
      const attemptDates = attempts
        .filter((row) => row.questId === id)
        .map((row) => row.at);
      const completion = completions.find((row) => row.questId === id);
      const currentCompletion =
        completion &&
        completionIsCurrent(
          quest,
          completion.contentVersion,
          completion.assessmentVersion,
        )
          ? completion
          : undefined;
      const startedAt = earliest([
        ...startDates,
        ...hintRows.map((row) => row.at),
        ...attemptDates,
      ]);
      const completedAt = currentCompletion?.at.toISOString() ?? null;
      return {
        questId: id,
        status: currentCompletion
          ? 'completed'
          : startedAt
            ? 'in_progress'
            : 'not_started',
        startedAt,
        completedAt,
        lastActivityAt: latest([
          ...startDates,
          ...hintRows.map((row) => row.at),
          ...attemptDates,
          ...(completion ? [completion.at] : []),
        ]),
        attemptCount: attemptDates.length,
        hintCount: new Set(
          hintRows
            .filter(
              (row) =>
                row.contentVersion ===
                quest.activeSnapshot.metadata.contentVersion,
            )
            .map((row) => row.hintKey),
        ).size,
      };
    });
  }

  async quest(userId: string, slug: string): Promise<QuestProgressDto> {
    return (
      await this.questsProgress(userId, [this.locateQuest(slug).quest])
    )[0];
  }

  async chapter(userId: string, slug: string): Promise<ChapterProgressDto> {
    const chapter = this.locateChapter(slug);
    const progress = await this.questsProgress(userId, chapter.quests);
    return {
      chapterId: chapter.metadata.id,
      ...aggregate(progress),
      quests: progress,
    };
  }

  async journey(userId: string, slug: string): Promise<JourneyProgressDto> {
    const journey = this.locateJourney(slug);
    const all = await this.questsProgress(
      userId,
      journey.chapters.flatMap((chapter) => chapter.quests),
    );
    const chaptersProgress = journey.chapters.map((chapter) => {
      const ids = new Set(chapter.quests.map((quest) => quest.metadata.id));
      const progress = all.filter((quest) => ids.has(quest.questId));
      return {
        chapterId: chapter.metadata.id,
        ...aggregate(progress),
        quests: progress,
      };
    });
    return {
      journeyId: journey.metadata.id,
      ...aggregate(all),
      chapters: chaptersProgress,
    };
  }
}
