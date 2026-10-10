import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import {
  chapterSchema,
  conceptsSchema,
  courseSchema,
  journeySchema,
  publicationSchema,
  questSchema,
  versionSchema,
  type Chapter,
  type Course,
  type CurriculumCase,
  type Exercise,
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
  safeBuffer,
  safeFile,
} from './static-files';
import { validateCurriculum } from './validate-curriculum';

export interface CatalogConcept {
  readonly id: string;
  readonly title: string;
}

export interface CatalogQuestAsset {
  readonly mediaType: 'image/png' | 'image/webp';
  readonly bytesBase64: string;
}

export interface CatalogQuestSnapshot {
  readonly metadata: QuestVersion;
  readonly lesson: string;
  readonly starterCode: string;
  readonly exercise?: Omit<Exercise, 'files'> & {
    readonly files: readonly (Exercise['files'][number] & {
      readonly starterSource: string;
    })[];
  };
  readonly cases: readonly CurriculumCase[];
  readonly assets: Readonly<Record<string, CatalogQuestAsset>>;
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
  readonly courses: readonly CatalogCourse[];
  readonly chapters: readonly CatalogChapter[];
}

export interface CatalogCourse {
  readonly metadata: Course;
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

export interface PublishedJourney {
  readonly metadata: Journey;
  readonly courses: readonly PublishedCourse[];
  readonly chapters: readonly PublishedChapter[];
}

// Persisted chapters are ordered within a Journey. Authored chapter positions
// restart for each Course, so they cannot be used as the Journey-wide key.
export function chapterJourneyPosition(
  journey: PublishedJourney,
  chapter: PublishedChapter,
): number {
  const index = journey.chapters.findIndex(
    (candidate) => candidate.metadata.id === chapter.metadata.id,
  );
  if (index < 0)
    throw new Error('Published chapter is missing from its Journey');
  return index + 1;
}

export interface PublishedCourse extends Omit<CatalogCourse, 'chapters'> {
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

function loadAssets(
  root: string,
  snapshotPath: string,
): Record<string, CatalogQuestAsset> {
  const assetRoot = join(root, snapshotPath, 'assets');
  if (!existsSync(assetRoot)) return {};
  const assets: Record<string, CatalogQuestAsset> = {};
  const visit = (folder: string): void => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const absolute = join(folder, entry.name);
      if (entry.isDirectory()) {
        visit(absolute);
        continue;
      }
      const path = relative(join(root, snapshotPath), absolute)
        .split(sep)
        .join('/');
      const extension = path.endsWith('.png')
        ? 'image/png'
        : path.endsWith('.webp')
          ? 'image/webp'
          : undefined;
      if (!extension) throw new ContentError(path, 'Unsupported lesson asset');
      assets[path] = {
        mediaType: extension,
        bytesBase64: safeBuffer(root, absolute, 262_144).toString('base64'),
      };
    }
  };
  visit(assetRoot);
  return assets;
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
    const courses = folders(join(root, journeyPath, 'courses')).map(
      (courseSlug) => {
        const coursePath = join(journeyPath, 'courses', courseSlug);
        const course = parse(
          root,
          join(coursePath, 'course.yaml'),
          courseSchema,
        );
        const chapters = folders(join(root, coursePath, 'chapters')).map(
          (chapterSlug) => {
            const chapterPath = join(coursePath, 'chapters', chapterSlug);
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
                  const snapshotPath = join(
                    questPath,
                    'versions',
                    snapshotVersion,
                  );
                  const lessonFile = join(snapshotPath, 'lesson.mdx');
                  const metadata = parse(
                    root,
                    join(snapshotPath, 'version.yaml'),
                    versionSchema,
                  );
                  const exercise = metadata.exercise
                    ? {
                        ...metadata.exercise,
                        files: metadata.exercise.files.map((file) => ({
                          ...file,
                          starterSource: safeFile(
                            root,
                            join(snapshotPath, file.starterFile),
                            file.language === 'css' ? 32_768 : 65_536,
                          ),
                        })),
                      }
                    : undefined;
                  checkLesson(root, lessonFile);
                  if (!exercise)
                    checkStarter(root, join(snapshotPath, 'starter.js'));
                  snapshots[snapshotVersion] = {
                    metadata,
                    lesson: safeFile(root, lessonFile, 65_536),
                    starterCode: exercise
                      ? (exercise.files.find(
                          (file) => file.language === 'javascript',
                        )?.starterSource ?? '')
                      : safeFile(
                          root,
                          join(snapshotPath, 'starter.js'),
                          32_768,
                        ),
                    ...(exercise ? { exercise } : {}),
                    cases: readCases(root, join(snapshotPath, 'tests.ts')),
                    assets: loadAssets(root, snapshotPath),
                  };
                }
                return { metadata: quest, snapshots };
              },
            );
            quests.sort(
              (left, right) => left.metadata.position - right.metadata.position,
            );
            return { metadata: chapter, quests };
          },
        );
        chapters.sort(
          (left, right) => left.metadata.position - right.metadata.position,
        );
        return { metadata: course, chapters };
      },
    );
    courses.sort(
      (left, right) => left.metadata.position - right.metadata.position,
    );
    return {
      metadata: journey,
      courses,
      chapters: courses.flatMap((course) => course.chapters),
    };
  });
  journeys.sort(
    (left, right) => left.metadata.position - right.metadata.position,
  );
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

export function loadCurriculumCatalog(
  contentRoot: string,
  evidenceRoot = basename(dirname(resolve(contentRoot))) === 'dist'
    ? resolve(contentRoot, '..')
    : resolve(contentRoot, '../..'),
): CurriculumCatalog {
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
  const routeSlugs = new Set<string>();
  const courseSlugs = new Set<string>();
  const journeys: PublishedJourney[] = publicationResult.data.journeys.map(
    (selection, journeyIndex) => {
      const path = `publication.yaml:journeys.${journeyIndex}`;
      const journey = authored.journeys.find(
        (candidate) => candidate.metadata.id === selection.id,
      );
      if (!journey) throw new ContentError(path, 'Unknown journey selection');
      if (journey.metadata.status !== 'reviewed')
        throw new ContentError(path, 'Selected journey is not reviewed');
      if (routeSlugs.has(journey.metadata.slug))
        throw new ContentError(path, 'Published journey slug is ambiguous');
      routeSlugs.add(journey.metadata.slug);
      const publishedCourses: PublishedCourse[] = selection.courses.map(
        (courseSelection, courseIndex) => {
          const coursePath = `${path}.courses.${courseIndex}`;
          const course = journey.courses.find(
            (candidate) => candidate.metadata.id === courseSelection.id,
          );
          if (!course || course.metadata.status !== 'reviewed')
            throw new ContentError(
              coursePath,
              'Selected Course is missing or unreviewed',
            );
          if (courseSlugs.has(course.metadata.slug))
            throw new ContentError(
              coursePath,
              'Published Course slug is ambiguous',
            );
          courseSlugs.add(course.metadata.slug);
          const authoredQuests = course.chapters.flatMap(
            (chapter) => chapter.quests,
          );
          if (
            !sameInventory(
              authoredQuests.map((quest) => quest.metadata.id),
              courseSelection.quests.map((quest) => quest.id),
            )
          )
            throw new ContentError(
              coursePath,
              'Published Course inventory is incomplete',
            );
          const chapters: PublishedChapter[] = course.chapters.map(
            (chapter) => ({
              metadata: chapter.metadata,
              quests: chapter.quests.map((quest) => {
                const questIndex = courseSelection.quests.findIndex(
                  (candidate) => candidate.id === quest.metadata.id,
                );
                const questSelection = courseSelection.quests[questIndex];
                const questPath = `${coursePath}.quests.${questIndex}`;
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
                if (
                  snapshot.exercise?.mode !== undefined &&
                  snapshot.exercise.mode !== 'javascript' &&
                  (questSelection.curriculumReview !== 'approved' ||
                    questSelection.technicalReview !== 'approved')
                )
                  throw new ContentError(
                    questPath,
                    'Web exercise review is missing',
                  );
                if (
                  snapshot.exercise?.mode === 'interactive-web' &&
                  !questSelection.interactiveEvidence
                )
                  throw new ContentError(
                    questPath,
                    'Interactive publication evidence is missing',
                  );
                if (snapshot.exercise?.mode === 'interactive-web') {
                  const evidence = questSelection.interactiveEvidence;
                  if (
                    !evidence ||
                    evidence.contentVersion !==
                      snapshot.metadata.contentVersion ||
                    evidence.assessmentVersion !==
                      snapshot.metadata.assessmentVersion
                  )
                    throw new ContentError(
                      questPath,
                      'Interactive publication evidence does not match the selected snapshot',
                    );
                  const record = resolve(evidenceRoot, evidence.record);
                  if (
                    !existsSync(record) ||
                    !lstatSync(record).isFile() ||
                    lstatSync(record).isSymbolicLink()
                  )
                    throw new ContentError(
                      questPath,
                      'Interactive publication evidence record is unavailable',
                    );
                }
                publishedQuestIds.add(quest.metadata.id);
                return { metadata: quest.metadata, activeSnapshot: snapshot };
              }),
            }),
          );
          for (const chapter of chapters) {
            if (routeSlugs.has(chapter.metadata.slug))
              throw new ContentError(
                coursePath,
                'Published chapter slug is ambiguous',
              );
            routeSlugs.add(chapter.metadata.slug);
            for (const quest of chapter.quests) {
              if (routeSlugs.has(quest.metadata.slug))
                throw new ContentError(
                  coursePath,
                  'Published quest slug is ambiguous',
                );
              routeSlugs.add(quest.metadata.slug);
            }
          }
          return { metadata: course.metadata, chapters };
        },
      );
      publishedCourses.sort(
        (left, right) => left.metadata.position - right.metadata.position,
      );
      return {
        metadata: journey.metadata,
        courses: publishedCourses,
        chapters: publishedCourses.flatMap((course) => course.chapters),
      };
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
