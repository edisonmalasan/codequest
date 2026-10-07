import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { and, count, eq, inArray } from 'drizzle-orm';
import { AnalyticsService } from '../analytics/analytics.service';
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
  PublishedCourse,
  PublishedJourney,
  PublishedQuest,
  chapterJourneyPosition,
} from '../curriculum/content/curriculum-catalog';
import { completionIsCurrent } from '../curriculum/content/completion-compatibility';
import {
  publishedQuests,
  unmetPrerequisites,
} from '../curriculum/content/unlock-policy';
import {
  ActivityResponseDto,
  ChapterProgressDto,
  CourseProgressDto,
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
  const locked =
    quests.length > 0 &&
    quests.every((quest) => quest.availability === 'locked');
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
    availability: locked ? ('locked' as const) : ('available' as const),
    unmetPrerequisites: locked ? quests[0].unmetPrerequisites : [],
  };
}

@Injectable()
export class ProgressService {
  constructor(
    @Inject(DatabaseConnectionService)
    private readonly connection: DatabaseConnectionService,
    @Inject(CURRICULUM_CATALOG) private readonly catalog: CurriculumCatalog,
    @Optional()
    @Inject(AnalyticsService)
    private readonly analytics?: AnalyticsService,
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

  private locateCourse(slug: string): PublishedCourse {
    for (const journey of this.catalog.journeys) {
      const course = journey.courses.find(
        (item) => item.metadata.slug === slug,
      );
      if (course) return course;
    }
    throw new NotFoundException('Published Course not found');
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
    const insertedUser = await db
      .insert(users)
      .values({ id: userId })
      .onConflictDoNothing()
      .returning({ createdAt: users.createdAt });
    await db
      .insert(journeys)
      .values({ id: journey.metadata.id, position: journey.metadata.position })
      .onConflictDoNothing();
    await db
      .insert(chapters)
      .values({
        id: chapter.metadata.id,
        journeyId: journey.metadata.id,
        position: chapterJourneyPosition(journey, chapter),
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
    return { id: version[0].id, accountCreatedAt: insertedUser[0]?.createdAt };
  }

  async start(
    userId: string,
    slug: string,
    body: StartQuestDto,
  ): Promise<ActivityResponseDto> {
    const { journey, chapter, quest } = this.locateQuest(slug);
    this.checkVersion(quest, body.contentVersion);
    await this.requireAvailable(userId, quest.metadata.id);
    const version = await this.ensureVersion(userId, journey, chapter, quest);
    if (version.accountCreatedAt)
      await this.analytics?.capture({
        name: 'signup_completed',
        ownerId: userId,
        factId: userId,
        occurredAt: version.accountCreatedAt,
      });
    const versionId = version.id;
    const db = this.connection.database;
    const result = await db.transaction(async (tx) => {
      await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      const inserted = await tx
        .insert(questStarts)
        .values({
          userId,
          questId: quest.metadata.id,
          questVersionId: versionId,
        })
        .onConflictDoNothing()
        .returning({ startedAt: questStarts.startedAt });
      const [total] = await tx
        .select({ value: count() })
        .from(questStarts)
        .where(eq(questStarts.userId, userId));
      return {
        inserted,
        firstForOwner: inserted.length > 0 && total.value === 1,
      };
    });
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
    if (result.inserted.length) {
      if (result.firstForOwner)
        await this.analytics?.capture({
          name: 'first_quest_started',
          ownerId: userId,
          factId: quest.metadata.id,
          occurredAt: result.inserted[0].startedAt,
          properties: {
            quest_id: quest.metadata.id,
            chapter_id: chapter.metadata.id,
            content_version: body.contentVersion,
          },
        });
      if (quest.metadata.kind === 'capstone')
        await this.analytics?.capture({
          name: 'capstone_started',
          ownerId: userId,
          factId: quest.metadata.id,
          occurredAt: result.inserted[0].startedAt,
          properties: {
            quest_id: quest.metadata.id,
            chapter_id: chapter.metadata.id,
            content_version: body.contentVersion,
          },
        });
    }
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
    await this.requireAvailable(userId, quest.metadata.id);
    const version = await this.ensureVersion(userId, journey, chapter, quest);
    if (version.accountCreatedAt)
      await this.analytics?.capture({
        name: 'signup_completed',
        ownerId: userId,
        factId: userId,
        occurredAt: version.accountCreatedAt,
      });
    const versionId = version.id;
    const db = this.connection.database;
    const inserted = await db
      .insert(questHintUses)
      .values({
        userId,
        questId: quest.metadata.id,
        questVersionId: versionId,
        hintKey: body.hintKey,
      })
      .onConflictDoNothing()
      .returning({ usedAt: questHintUses.usedAt });
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
    if (inserted.length)
      await this.analytics?.capture({
        name: 'hint_used',
        ownerId: userId,
        factId: `${quest.metadata.id}:${versionId}:${body.hintKey}`,
        occurredAt: inserted[0].usedAt,
        properties: {
          quest_id: quest.metadata.id,
          chapter_id: chapter.metadata.id,
          content_version: body.contentVersion,
        },
      });
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
    const catalogById = new Map(
      catalogQuests.map((quest) => [quest.metadata.id, quest]),
    );
    const currentCompletedIds = new Set(
      completions
        .filter((row) => {
          const published = catalogById.get(row.questId);
          return (
            published !== undefined &&
            completionIsCurrent(
              published,
              row.contentVersion,
              row.assessmentVersion,
            )
          );
        })
        .map((row) => row.questId),
    );
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
      const unmet = unmetPrerequisites(
        quest,
        this.catalog,
        currentCompletedIds,
      );
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
        availability: unmet.length ? 'locked' : 'available',
        unmetPrerequisites: unmet,
      };
    });
  }

  private allProgress(userId: string): Promise<QuestProgressDto[]> {
    return this.questsProgress(userId, publishedQuests(this.catalog));
  }

  private async requireAvailable(
    userId: string,
    questId: string,
  ): Promise<void> {
    const progress = await this.allProgress(userId);
    if (
      progress.find((quest) => quest.questId === questId)?.availability !==
      'available'
    )
      throw new ConflictException(
        'Complete published prerequisites before continuing',
      );
  }

  async quest(userId: string, slug: string): Promise<QuestProgressDto> {
    const id = this.locateQuest(slug).quest.metadata.id;
    const progress = await this.allProgress(userId);
    const result = progress.find((quest) => quest.questId === id);
    if (!result) throw new NotFoundException('Published quest not found');
    return result;
  }

  async chapter(userId: string, slug: string): Promise<ChapterProgressDto> {
    const chapter = this.locateChapter(slug);
    const ids = new Set(chapter.quests.map((quest) => quest.metadata.id));
    const progress = (await this.allProgress(userId)).filter((quest) =>
      ids.has(quest.questId),
    );
    return {
      chapterId: chapter.metadata.id,
      ...aggregate(progress),
      quests: progress,
    };
  }

  async journey(userId: string, slug: string): Promise<JourneyProgressDto> {
    const journey = this.locateJourney(slug);
    const ids = new Set(
      journey.chapters.flatMap((chapter) =>
        chapter.quests.map((quest) => quest.metadata.id),
      ),
    );
    const all = (await this.allProgress(userId)).filter((quest) =>
      ids.has(quest.questId),
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

  async course(userId: string, slug: string): Promise<CourseProgressDto> {
    const course = this.locateCourse(slug);
    const ids = new Set(
      course.chapters.flatMap((chapter) =>
        chapter.quests.map((quest) => quest.metadata.id),
      ),
    );
    const all = (await this.allProgress(userId)).filter((quest) =>
      ids.has(quest.questId),
    );
    const chaptersProgress = course.chapters.map((chapter) => {
      const chapterIds = new Set(
        chapter.quests.map((quest) => quest.metadata.id),
      );
      const progress = all.filter((quest) => chapterIds.has(quest.questId));
      return {
        chapterId: chapter.metadata.id,
        ...aggregate(progress),
        quests: progress,
      };
    });
    return {
      courseId: course.metadata.id,
      ...aggregate(all),
      chapters: chaptersProgress,
    };
  }
}
