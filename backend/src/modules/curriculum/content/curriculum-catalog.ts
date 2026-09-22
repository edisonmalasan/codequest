import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import {
  chapterSchema,
  conceptsSchema,
  journeySchema,
  publicationSchema,
  questSchema,
  versionSchema,
  type Chapter,
  type CurriculumCase,
  type Journey,
  type Quest,
  type QuestVersion,
} from './content-schema';
import {
  checkLesson,
  checkStarter,
  ContentError,
  readCases,
  readYaml,
  safeFile,
} from './static-files';
import { validateCurriculum } from './validate-curriculum';

export interface CatalogConcept {
  readonly id: string;
  readonly title: string;
}

export interface CatalogQuestSnapshot {
  readonly metadata: QuestVersion;
  readonly lesson: string;
  readonly starterCode: string;
  readonly cases: readonly CurriculumCase[];
}

export interface CatalogQuest {
  readonly metadata: Quest;
  readonly snapshots: Readonly<Record<string, CatalogQuestSnapshot>>;
}

export interface CatalogChapter {
  readonly metadata: Chapter;
  readonly quests: readonly CatalogQuest[];
}

export interface CatalogJourney {
  readonly metadata: Journey;
  readonly chapters: readonly CatalogChapter[];
}

export interface AuthoredCurriculum {
  readonly concepts: readonly CatalogConcept[];
  readonly journeys: readonly CatalogJourney[];
}

export interface PublishedQuest {
  readonly metadata: Quest;
  readonly activeSnapshot: CatalogQuestSnapshot;
}

export interface PublishedChapter extends Omit<CatalogChapter, 'quests'> {
  readonly quests: readonly PublishedQuest[];
}

export interface PublishedJourney extends Omit<CatalogJourney, 'chapters'> {
  readonly chapters: readonly PublishedChapter[];
}

export interface CurriculumCatalog {
  readonly concepts: readonly CatalogConcept[];
  readonly journeys: readonly PublishedJourney[];
}

export const CURRICULUM_CATALOG = Symbol('CURRICULUM_CATALOG');

function parse<T>(root: string, file: string, schema: z.ZodType<T>): T {
  const result = schema.safeParse(readYaml(root, file));
  if (!result.success)
    throw new ContentError(
      file,
      `Invalid metadata: ${result.error.issues.map((issue) => issue.path.join('.') || issue.code).join(', ')}`,
    );
  return result.data;
}

function folders(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function freeze<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>))
      freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function loadAuthoredCurriculum(
  contentRoot: string,
): AuthoredCurriculum {
  const root = resolve(contentRoot);
  validateCurriculum(root);
  const concepts = parse(root, 'concepts.yaml', conceptsSchema).concepts;
  const journeys = folders(join(root, 'journeys')).map((journeySlug) => {
    const journeyPath = join('journeys', journeySlug);
    const journey = parse(
      root,
      join(journeyPath, 'journey.yaml'),
      journeySchema,
    );
    const chapters = folders(join(root, journeyPath, 'chapters')).map(
      (chapterSlug) => {
        const chapterPath = join(journeyPath, 'chapters', chapterSlug);
        const chapter = parse(
          root,
          join(chapterPath, 'chapter.yaml'),
          chapterSchema,
        );
        const quests = folders(join(root, chapterPath, 'quests')).map(
          (questSlug) => {
            const questPath = join(chapterPath, 'quests', questSlug);
            const quest = parse(
              root,
              join(questPath, 'quest.yaml'),
              questSchema,
            );
            const snapshots: Record<string, CatalogQuestSnapshot> = {};
            for (const snapshotVersion of folders(
              join(root, questPath, 'versions'),
            )) {
              const snapshotPath = join(questPath, 'versions', snapshotVersion);
              const lessonFile = join(snapshotPath, 'lesson.mdx');
              const starterFile = join(snapshotPath, 'starter.js');
              checkLesson(root, lessonFile);
              checkStarter(root, starterFile);
              snapshots[snapshotVersion] = {
                metadata: parse(
                  root,
                  join(snapshotPath, 'version.yaml'),
                  versionSchema,
                ),
                lesson: safeFile(root, lessonFile, 65_536),
                starterCode: safeFile(root, starterFile, 32_768),
                cases: readCases(root, join(snapshotPath, 'tests.ts')),
              };
            }
            return { metadata: quest, snapshots };
          },
        );
        return { metadata: chapter, quests };
      },
    );
    return { metadata: journey, chapters };
  });
  return freeze({ concepts, journeys }) as AuthoredCurriculum;
}

function sameInventory(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length && left.every((value) => right.includes(value))
  );
}

export function loadCurriculumCatalog(contentRoot: string): CurriculumCatalog {
  const root = resolve(contentRoot);
  const authored = loadAuthoredCurriculum(root);
  const publicationResult = publicationSchema.safeParse(
    readYaml(root, 'publication.yaml'),
  );
  if (!publicationResult.success)
    throw new ContentError(
      'publication.yaml',
      `Invalid publication: ${publicationResult.error.issues.map((issue) => issue.path.join('.') || issue.code).join(', ')}`,
    );

  const publishedQuestIds = new Set<string>();
  const slugs = new Set<string>();
  const journeys: PublishedJourney[] = publicationResult.data.journeys.map(
    (selection, journeyIndex) => {
      const path = `publication.yaml:journeys.${journeyIndex}`;
      const journey = authored.journeys.find(
        (candidate) => candidate.metadata.id === selection.id,
      );
      if (!journey) throw new ContentError(path, 'Unknown journey selection');
      if (journey.metadata.status !== 'reviewed')
        throw new ContentError(path, 'Selected journey is not reviewed');
      const authoredQuests = journey.chapters.flatMap(
        (chapter) => chapter.quests,
      );
      if (
        !sameInventory(
          authoredQuests.map((quest) => quest.metadata.id),
          selection.quests.map((quest) => quest.id),
        )
      )
        throw new ContentError(
          path,
          'Published journey inventory is incomplete',
        );
      const publishedChapters = journey.chapters.map((chapter) => ({
        metadata: chapter.metadata,
        quests: chapter.quests.map((quest) => {
          const questIndex = selection.quests.findIndex(
            (candidate) => candidate.id === quest.metadata.id,
          );
          const questSelection = selection.quests[questIndex];
          const questPath = `${path}.quests.${questIndex}`;
          if (!questSelection)
            throw new ContentError(questPath, 'Missing quest selection');
          const snapshot = quest.snapshots[questSelection.contentVersion];
          if (
            !snapshot ||
            snapshot.metadata.assessmentVersion !==
              questSelection.assessmentVersion
          )
            throw new ContentError(
              questPath,
              'Selected quest version is stale',
            );
          publishedQuestIds.add(quest.metadata.id);
          return { metadata: quest.metadata, activeSnapshot: snapshot };
        }),
      }));
      const selectedSlugs = [
        journey.metadata.slug,
        ...publishedChapters.flatMap((chapter) => [
          chapter.metadata.slug,
          ...chapter.quests.map((quest) => quest.metadata.slug),
        ]),
      ];
      for (const slug of selectedSlugs) {
        if (slugs.has(slug))
          throw new ContentError(path, 'Published slug is ambiguous');
        slugs.add(slug);
      }
      return { metadata: journey.metadata, chapters: publishedChapters };
    },
  );

  for (const journey of journeys)
    for (const chapter of journey.chapters)
      for (const quest of chapter.quests)
        if (
          quest.activeSnapshot.metadata.prerequisiteQuestIds.some(
            (id) => !publishedQuestIds.has(id),
          )
        )
          throw new ContentError(
            'publication.yaml',
            'Published prerequisite is not selected',
          );

  const publishedConceptIds = new Set(
    journeys.flatMap((journey) =>
      journey.chapters.flatMap((chapter) =>
        chapter.quests.flatMap(
          (quest) => quest.activeSnapshot.metadata.conceptIds,
        ),
      ),
    ),
  );
  const concepts = authored.concepts.filter((concept) =>
    publishedConceptIds.has(concept.id),
  );
  journeys.sort(
    (left, right) => left.metadata.position - right.metadata.position,
  );
  return freeze({ concepts, journeys }) as CurriculumCatalog;
}
