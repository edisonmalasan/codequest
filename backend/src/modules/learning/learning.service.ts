import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isDeepStrictEqual } from 'node:util';
import { and, count, desc, eq } from 'drizzle-orm';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';
import {
  chapters,
  journeys,
  questAttempts,
  questCompletions,
  quests,
  questSubmissions,
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
  AttemptHistoryDto,
  AttemptResponseDto,
  CreateAttemptDto,
} from './attempt.dto';
import {
  normalizeAttemptReport,
  NormalizedReport,
  parseStoredReport,
} from './attempt-report';

interface LocatedQuest {
  journey: PublishedJourney;
  chapter: PublishedChapter;
  quest: PublishedQuest;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Injectable()
export class LearningService {
  constructor(
    @Inject(DatabaseConnectionService)
    private readonly connection: DatabaseConnectionService,
    @Inject(CURRICULUM_CATALOG) private readonly catalog: CurriculumCatalog,
  ) {}

  private locate(slug: string): LocatedQuest {
    for (const journey of this.catalog.journeys)
      for (const chapter of journey.chapters)
        for (const quest of chapter.quests)
          if (quest.metadata.slug === slug) return { journey, chapter, quest };
    throw new NotFoundException('Published quest not found');
  }

  async submit(
    userId: string,
    slug: string,
    body: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    const located = this.locate(slug);
    const { journey, chapter, quest } = located;
    const snapshot = quest.activeSnapshot;
    if (Buffer.byteLength(body.source, 'utf8') > 65_536)
      throw new BadRequestException('Source exceeds limit');
    if (Buffer.byteLength(JSON.stringify(body.report), 'utf8') > 16_384)
      throw new BadRequestException('Validation report exceeds limit');

    return this.connection.database.transaction(async (tx) => {
      await tx.insert(users).values({ id: userId }).onConflictDoNothing();
      await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .for('update');

      const existing = await tx
        .select({
          id: questAttempts.id,
          questId: questAttempts.questId,
          questVersionId: questAttempts.questVersionId,
          submittedAt: questAttempts.submittedAt,
          source: questSubmissions.source,
          report: questSubmissions.reportedResult,
        })
        .from(questAttempts)
        .innerJoin(
          questSubmissions,
          eq(questSubmissions.attemptId, questAttempts.id),
        )
        .where(
          and(
            eq(questAttempts.userId, userId),
            eq(questAttempts.clientEventId, body.clientEventId),
          ),
        )
        .limit(1);
      if (existing[0]) {
        const row = existing[0];
        const version = await tx
          .select()
          .from(questVersions)
          .where(eq(questVersions.id, row.questVersionId))
          .limit(1);
        if (
          row.questId !== quest.metadata.id ||
          row.source !== body.source ||
          !isDeepStrictEqual(row.report, body.report) ||
          version[0]?.contentVersion !== body.contentVersion ||
          version[0]?.assessmentVersion !== body.assessmentVersion
        )
          throw new ConflictException(
            'Event ID already used for different submission',
          );
        const [{ value: attemptCount }] = await tx
          .select({ value: count() })
          .from(questAttempts)
          .where(
            and(
              eq(questAttempts.userId, userId),
              eq(questAttempts.questId, row.questId),
            ),
          );
        const completion = await tx
          .select({ id: questCompletions.acceptedAttemptId })
          .from(questCompletions)
          .where(
            and(
              eq(questCompletions.userId, userId),
              eq(questCompletions.questId, row.questId),
            ),
          )
          .limit(1);
        return this.response(
          row.id,
          row.questId,
          body.clientEventId,
          body,
          parseStoredReport(row.report),
          row.submittedAt,
          attemptCount,
          completion[0]?.id === row.id,
        );
      }

      if (
        body.contentVersion !== snapshot.metadata.contentVersion ||
        body.assessmentVersion !== snapshot.metadata.assessmentVersion
      )
        throw new ConflictException(
          'Quest version changed; retry with the current version',
        );
      const report = normalizeAttemptReport(body.report, snapshot.cases);
      if (
        report.cases.some(
          (item) =>
            Buffer.byteLength(item.label, 'utf8') > 512 ||
            Buffer.byteLength(item.message, 'utf8') > 512,
        ) ||
        Buffer.byteLength(report.feedback, 'utf8') > 512
      )
        throw new BadRequestException('Validation report exceeds limit');

      await tx
        .insert(journeys)
        .values({
          id: journey.metadata.id,
          position: journey.metadata.position,
        })
        .onConflictDoNothing();
      await tx
        .insert(chapters)
        .values({
          id: chapter.metadata.id,
          journeyId: journey.metadata.id,
          position: chapter.metadata.position,
        })
        .onConflictDoNothing();
      await tx
        .insert(quests)
        .values({
          id: quest.metadata.id,
          chapterId: chapter.metadata.id,
          position: quest.metadata.position,
          kind: quest.metadata.kind,
        })
        .onConflictDoNothing();
      await tx
        .insert(questVersions)
        .values({
          questId: quest.metadata.id,
          contentVersion: body.contentVersion,
          assessmentVersion: body.assessmentVersion,
        })
        .onConflictDoNothing();
      const version = await tx
        .select()
        .from(questVersions)
        .where(
          and(
            eq(questVersions.questId, quest.metadata.id),
            eq(questVersions.contentVersion, body.contentVersion),
          ),
        )
        .limit(1);
      if (
        !version[0] ||
        version[0].assessmentVersion !== body.assessmentVersion
      )
        throw new ConflictException('Assessment version is unavailable');

      const prerequisites = snapshot.metadata.prerequisiteQuestIds;
      if (report.passed)
        for (const prerequisiteQuestId of prerequisites) {
          const completion = await tx
            .select({ questId: questCompletions.questId })
            .from(questCompletions)
            .where(
              and(
                eq(questCompletions.userId, userId),
                eq(questCompletions.questId, prerequisiteQuestId),
              ),
            )
            .limit(1);
          if (!completion[0])
            throw new ConflictException(
              'Complete prerequisites before submitting',
            );
        }

      const [attempt] = await tx
        .insert(questAttempts)
        .values({
          userId,
          questId: quest.metadata.id,
          questVersionId: version[0].id,
          clientEventId: body.clientEventId,
        })
        .returning({
          id: questAttempts.id,
          submittedAt: questAttempts.submittedAt,
        });
      await tx.insert(questSubmissions).values({
        attemptId: attempt.id,
        source: body.source,
        reportedResult: report,
      });
      let accepted = false;
      if (report.passed) {
        const inserted = await tx
          .insert(questCompletions)
          .values({
            userId,
            questId: quest.metadata.id,
            acceptedAttemptId: attempt.id,
          })
          .onConflictDoNothing()
          .returning({ id: questCompletions.acceptedAttemptId });
        accepted = inserted.length > 0;
      }
      const [{ value: attemptCount }] = await tx
        .select({ value: count() })
        .from(questAttempts)
        .where(
          and(
            eq(questAttempts.userId, userId),
            eq(questAttempts.questId, quest.metadata.id),
          ),
        );
      return this.response(
        attempt.id,
        quest.metadata.id,
        body.clientEventId,
        body,
        report,
        attempt.submittedAt,
        attemptCount,
        accepted,
      );
    });
  }

  async history(userId: string, slug: string): Promise<AttemptHistoryDto> {
    const { quest } = this.locate(slug);
    const [total] = await this.connection.database
      .select({ value: count() })
      .from(questAttempts)
      .where(
        and(
          eq(questAttempts.userId, userId),
          eq(questAttempts.questId, quest.metadata.id),
        ),
      );
    const rows = await this.connection.database
      .select({
        id: questAttempts.id,
        clientEventId: questAttempts.clientEventId,
        submittedAt: questAttempts.submittedAt,
        source: questSubmissions.source,
        report: questSubmissions.reportedResult,
        contentVersion: questVersions.contentVersion,
        assessmentVersion: questVersions.assessmentVersion,
        acceptedAttemptId: questCompletions.acceptedAttemptId,
      })
      .from(questAttempts)
      .innerJoin(
        questSubmissions,
        eq(questSubmissions.attemptId, questAttempts.id),
      )
      .innerJoin(
        questVersions,
        eq(questVersions.id, questAttempts.questVersionId),
      )
      .leftJoin(
        questCompletions,
        and(
          eq(questCompletions.userId, userId),
          eq(questCompletions.acceptedAttemptId, questAttempts.id),
        ),
      )
      .where(
        and(
          eq(questAttempts.userId, userId),
          eq(questAttempts.questId, quest.metadata.id),
        ),
      )
      .orderBy(desc(questAttempts.submittedAt), desc(questAttempts.id))
      .limit(20);
    return {
      attemptCount: total.value,
      attempts: rows.map((row) => {
        const report = isRecord(row.report) ? row.report : {};
        return {
          id: row.id,
          questId: quest.metadata.id,
          clientEventId: row.clientEventId,
          contentVersion: row.contentVersion,
          assessmentVersion: row.assessmentVersion,
          submittedAt: row.submittedAt.toISOString(),
          attemptCount: total.value,
          reportedPassed: report.passed === true,
          accepted: row.acceptedAttemptId === row.id,
          clientReported: true,
          source: row.source,
          report,
        };
      }),
    };
  }

  private response(
    id: string,
    questId: string,
    clientEventId: string,
    body: CreateAttemptDto,
    report: NormalizedReport,
    submittedAt: Date,
    attemptCount: number,
    accepted: boolean,
  ): AttemptResponseDto {
    return {
      id,
      questId,
      clientEventId,
      contentVersion: body.contentVersion,
      assessmentVersion: body.assessmentVersion,
      submittedAt: submittedAt.toISOString(),
      attemptCount,
      reportedPassed: report.passed,
      accepted,
      clientReported: true,
      source: body.source,
      report,
    };
  }
}
