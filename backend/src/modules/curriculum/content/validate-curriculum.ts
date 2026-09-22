import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import {
  casesSchema,
  chapterSchema,
  conceptsSchema,
  journeySchema,
  questSchema,
  versionSchema,
  type Quest,
  type QuestVersion,
} from './content-schema';
import {
  checkLesson,
  checkStarter,
  ContentError,
  readCases,
  readYaml,
} from './static-files';

type Cases = z.infer<typeof casesSchema>;
interface Snapshot {
  metadata: QuestVersion;
  cases: Cases;
  path: string;
}
interface AuthoredQuest {
  metadata: Quest;
  journeyId: string;
  snapshots: Map<string, Snapshot>;
  path: string;
}
const semver = (value: string) => value.split('.').map(Number);
function compareVersions(left: string, right: string): number {
  const a = semver(left),
    b = semver(right);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function directories(root: string, folder: string): string[] {
  const absolute = resolve(root, folder);
  if (!existsSync(absolute))
    throw new ContentError(folder, 'Required directory is missing');
  if (
    lstatSync(absolute).isSymbolicLink() ||
    !lstatSync(absolute).isDirectory()
  )
    throw new ContentError(folder, 'Expected a regular directory');
  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => {
      if (entry.isSymbolicLink())
        throw new ContentError(
          join(folder, entry.name),
          'Symbolic links are not permitted',
        );
      return entry.isDirectory();
    })
    .map((entry) => entry.name)
    .sort();
}

function metadata<T>(root: string, file: string, schema: z.ZodType<T>): T {
  const result = schema.safeParse(readYaml(root, file));
  if (!result.success)
    throw new ContentError(
      file,
      `Invalid metadata: ${result.error.issues.map((issue) => issue.path.join('.') || issue.code).join(', ')}`,
    );
  return result.data;
}

function unique(values: readonly string[], path: string, name: string): void {
  if (new Set(values).size !== values.length)
    throw new ContentError(path, `Duplicate ${name}`);
}

function exactInventory(
  declared: readonly string[],
  actual: readonly string[],
  path: string,
): void {
  if (
    declared.length !== actual.length ||
    actual.some((id) => !declared.includes(id))
  )
    throw new ContentError(
      path,
      'Declared child IDs do not match authored children',
    );
}

export function validateCurriculum(contentRoot: string): void {
  const root = resolve(contentRoot);
  let visitedFiles = 0;
  const authoredFile =
    /^(?:README\.md|concepts\.yaml|publication\.yaml|journeys\/[^/]+\/journey\.yaml|journeys\/[^/]+\/chapters\/[^/]+\/chapter\.yaml|journeys\/[^/]+\/chapters\/[^/]+\/quests\/[^/]+\/quest\.yaml|journeys\/[^/]+\/chapters\/[^/]+\/quests\/[^/]+\/versions\/[^/]+\/(?:version\.yaml|lesson\.mdx|starter\.js|tests\.ts|assets\/[a-zA-Z0-9/_-]+\.(?:png|webp)))$/;
  function scan(folder: string, depth: number): void {
    if (depth > 16)
      throw new ContentError(
        relativePath(folder),
        'Content tree exceeds depth limit',
      );
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isSymbolicLink())
        throw new ContentError(
          relativePath(path),
          'Symbolic links are not permitted',
        );
      if (entry.isDirectory()) scan(path, depth + 1);
      else if (!entry.isFile() || lstatSync(path).size > 262_144)
        throw new ContentError(
          relativePath(path),
          'Invalid or oversized content file',
        );
      else if (!authoredFile.test(relativePath(path).replaceAll('\\', '/')))
        throw new ContentError(relativePath(path), 'Unexpected content file');
      if (++visitedFiles > 2000)
        throw new ContentError('content', 'Content tree exceeds file limit');
    }
  }
  function relativePath(path: string): string {
    return path.slice(root.length + 1);
  }
  scan(root, 0);
  const concepts = metadata(root, 'concepts.yaml', conceptsSchema);
  unique(
    concepts.concepts.map((concept) => concept.id),
    'concepts.yaml',
    'concept ID',
  );
  const conceptIds = new Set(concepts.concepts.map((concept) => concept.id));
  const journeyIds: string[] = [],
    journeySlugs: string[] = [],
    journeyPositions: string[] = [];
  const chapterIds: string[] = [],
    questIds: string[] = [];
  const quests = new Map<string, AuthoredQuest>();
  for (const journeyDir of directories(root, 'journeys')) {
    const journeyPath = join('journeys', journeyDir);
    const journey = metadata(
      root,
      join(journeyPath, 'journey.yaml'),
      journeySchema,
    );
    if (journey.slug !== journeyDir)
      throw new ContentError(journeyPath, 'Journey directory must match slug');
    journeyIds.push(journey.id);
    journeySlugs.push(journey.slug);
    journeyPositions.push(String(journey.position));
    unique(
      journey.outcomes.map((outcome) => outcome.id),
      journeyPath,
      'outcome ID',
    );
    if (
      journey.id === 'JAVASCRIPT-FOUNDATIONS' &&
      journey.outcomes.length !== 8
    )
      throw new ContentError(journeyPath, 'Foundations must declare O1–O8');
    const authoredChapters: string[] = [],
      chapterSlugs: string[] = [],
      chapterPositions: string[] = [];
    for (const chapterDir of directories(root, join(journeyPath, 'chapters'))) {
      const chapterPath = join(journeyPath, 'chapters', chapterDir);
      const chapter = metadata(
        root,
        join(chapterPath, 'chapter.yaml'),
        chapterSchema,
      );
      if (chapter.slug !== chapterDir || chapter.journeyId !== journey.id)
        throw new ContentError(
          chapterPath,
          'Chapter slug or parent does not match',
        );
      if (
        journey.id === 'JAVASCRIPT-FOUNDATIONS' &&
        chapter.id !== `CH${String(chapter.position).padStart(2, '0')}`
      )
        throw new ContentError(
          chapterPath,
          'Foundations chapter order is invalid',
        );
      chapterIds.push(chapter.id);
      authoredChapters.push(chapter.id);
      chapterSlugs.push(chapter.slug);
      chapterPositions.push(String(chapter.position));
      const authoredQuests: string[] = [],
        questSlugs: string[] = [],
        questPositions: string[] = [];
      for (const questDir of directories(root, join(chapterPath, 'quests'))) {
        const questPath = join(chapterPath, 'quests', questDir);
        const quest = metadata(
          root,
          join(questPath, 'quest.yaml'),
          questSchema,
        );
        if (quest.slug !== questDir || quest.chapterId !== chapter.id)
          throw new ContentError(
            questPath,
            'Quest slug or parent does not match',
          );
        if (
          journey.id === 'JAVASCRIPT-FOUNDATIONS' &&
          /^Q(0[1-9]|1\d|2[0-4])$/.test(quest.id)
        ) {
          const number = Number(quest.id.slice(1));
          const expectedChapter =
            number <= 4
              ? 1
              : number <= 7
                ? 2
                : number <= 10
                  ? 3
                  : number <= 14
                    ? 4
                    : number <= 18
                      ? 5
                      : number <= 22
                        ? 6
                        : 7;
          const firstInChapter = [0, 1, 5, 8, 11, 15, 19, 23][expectedChapter];
          if (
            chapter.id !== `CH${String(expectedChapter).padStart(2, '0')}` ||
            quest.position !== number - firstInChapter + 1
          )
            throw new ContentError(
              questPath,
              'Foundations quest chapter or sequence is invalid',
            );
          if (quest.guestEligible !== number <= 4)
            throw new ContentError(
              questPath,
              'Foundations guest subset must be Q01–Q04',
            );
        } else if (
          journey.id === 'JAVASCRIPT-FOUNDATIONS' &&
          quest.guestEligible
        ) {
          throw new ContentError(
            questPath,
            'Only Q01–Q04 may be guest eligible',
          );
        }
        questIds.push(quest.id);
        authoredQuests.push(quest.id);
        questSlugs.push(quest.slug);
        questPositions.push(String(quest.position));
        const snapshots = new Map<string, Snapshot>();
        for (const versionDir of directories(
          root,
          join(questPath, 'versions'),
        )) {
          const versionPath = join(questPath, 'versions', versionDir);
          const version = metadata(
            root,
            join(versionPath, 'version.yaml'),
            versionSchema,
          );
          if (version.contentVersion !== versionDir)
            throw new ContentError(
              versionPath,
              'Snapshot directory must match content version',
            );
          const lesson = join(versionPath, 'lesson.mdx');
          checkLesson(root, lesson);
          checkStarter(root, join(versionPath, 'starter.js'));
          const cases = readCases(root, join(versionPath, 'tests.ts'));
          exactInventory(
            version.caseIds,
            cases.map((item) => item.id),
            join(versionPath, 'version.yaml'),
          );
          if (
            !version.conceptIds.length ||
            version.conceptIds.some((id) => !conceptIds.has(id))
          )
            throw new ContentError(
              versionPath,
              'Unknown or missing concept ID',
            );
          if (!journey.outcomes.some((item) => item.id === version.outcomeId))
            throw new ContentError(versionPath, 'Unknown outcome ID');
          if (
            quest.kind === 'capstone' &&
            (!version.explanationPrompt || !version.transferPrompt)
          )
            throw new ContentError(
              versionPath,
              'Capstone requires separate explanation and transfer prompts',
            );
          if (
            quest.kind === 'instructional' &&
            (version.explanationPrompt || version.transferPrompt)
          )
            throw new ContentError(
              versionPath,
              'Reasoning prompts are reserved for capstone',
            );
          snapshots.set(versionDir, {
            metadata: version,
            cases,
            path: versionPath,
          });
        }
        if (!snapshots.has(quest.currentVersion))
          throw new ContentError(
            questPath,
            'Current content version is missing',
          );
        if (journey.id === 'JAVASCRIPT-FOUNDATIONS') {
          const numbered = /^Q(0[1-9]|1\d|2[0-4])$/.test(quest.id);
          if (numbered !== (quest.kind === 'instructional'))
            throw new ContentError(
              questPath,
              'Foundations Q01–Q24 are instructional; final quest is capstone',
            );
          if (!numbered && (chapter.id !== 'CH07' || quest.position !== 3))
            throw new ContentError(
              questPath,
              'Foundations capstone must close chapter seven',
            );
        }
        quests.set(quest.id, {
          metadata: quest,
          journeyId: journey.id,
          snapshots,
          path: questPath,
        });
      }
      unique(questSlugs, chapterPath, 'quest slug');
      unique(questPositions, chapterPath, 'quest position');
      exactInventory(
        chapter.questIds,
        authoredQuests,
        join(chapterPath, 'chapter.yaml'),
      );
    }
    unique(chapterSlugs, journeyPath, 'chapter slug');
    unique(chapterPositions, journeyPath, 'chapter position');
    exactInventory(
      journey.chapterIds,
      authoredChapters,
      join(journeyPath, 'journey.yaml'),
    );
  }
  unique(journeyIds, 'journeys', 'journey ID');
  unique(journeySlugs, 'journeys', 'journey slug');
  unique(journeyPositions, 'journeys', 'journey position');
  unique(chapterIds, 'journeys', 'chapter ID');
  unique(questIds, 'journeys', 'quest ID');
  unique(
    [...conceptIds, ...journeyIds, ...chapterIds, ...questIds],
    'content',
    'stable ID',
  );
  const graph = new Map<string, string[]>();
  for (const [questId, quest] of quests) {
    const versions = [...quest.snapshots].sort(([a], [b]) =>
      compareVersions(a, b),
    );
    if (
      versions.length === 0 ||
      versions.at(-1)?.[0] !== quest.metadata.currentVersion
    )
      throw new ContentError(quest.path, 'Current version must be latest');
    const current = quest.snapshots.get(quest.metadata.currentVersion);
    if (!current) throw new ContentError(quest.path, 'Current version missing');
    graph.set(questId, current.metadata.prerequisiteQuestIds);
    if (
      quest.journeyId === 'JAVASCRIPT-FOUNDATIONS' &&
      quest.metadata.kind === 'capstone' &&
      !current.metadata.prerequisiteQuestIds.includes('Q24')
    )
      throw new ContentError(
        quest.path,
        'Foundations capstone must require Q24',
      );
    for (const [versionId, snapshot] of versions) {
      for (const prerequisite of snapshot.metadata.prerequisiteQuestIds) {
        if (!quests.has(prerequisite) || prerequisite === questId)
          throw new ContentError(
            snapshot.path,
            'Unknown or self prerequisite quest ID',
          );
        if (quests.get(prerequisite)?.journeyId !== quest.journeyId)
          throw new ContentError(
            snapshot.path,
            'Prerequisite must belong to the same journey',
          );
      }
      if (
        quest.journeyId === 'JAVASCRIPT-FOUNDATIONS' &&
        /^Q\d{2}$/.test(questId)
      ) {
        const number = Number(questId.slice(1));
        if (number === 1 && snapshot.metadata.prerequisiteQuestIds.length)
          throw new ContentError(snapshot.path, 'Q01 must be open');
        if (
          number > 1 &&
          number <= 24 &&
          !snapshot.metadata.prerequisiteQuestIds.includes(
            `Q${String(number - 1).padStart(2, '0')}`,
          )
        )
          throw new ContentError(
            snapshot.path,
            'Foundations quest must require the prior quest',
          );
      }
      if (versionId !== snapshot.metadata.contentVersion)
        throw new ContentError(snapshot.path, 'Invalid snapshot version');
    }
    const transitions = quest.metadata.transitions;
    if (transitions.length !== versions.length - 1)
      throw new ContentError(
        quest.path,
        'Every adjacent version needs one transition',
      );
    for (let index = 1; index < versions.length; index++) {
      const previous = versions[index - 1][1],
        next = versions[index][1],
        transition = transitions[index - 1];
      if (
        transition.from !== previous.metadata.contentVersion ||
        transition.to !== next.metadata.contentVersion ||
        transition.fromAssessment !== previous.metadata.assessmentVersion ||
        transition.toAssessment !== next.metadata.assessmentVersion
      )
        throw new ContentError(
          quest.path,
          'Transition versions do not match snapshots',
        );
      if (
        (transition.compatibility === 'compatible') !==
        (transition.pendingWork === 'accept-new')
      )
        throw new ContentError(
          quest.path,
          'Contradictory compatibility decision',
        );
      if (
        JSON.stringify(previous.cases) !== JSON.stringify(next.cases) &&
        previous.metadata.assessmentVersion === next.metadata.assessmentVersion
      )
        throw new ContentError(
          next.path,
          'Changed criteria require a new assessment version',
        );
      if (
        compareVersions(
          previous.metadata.assessmentVersion,
          next.metadata.assessmentVersion,
        ) > 0
      )
        throw new ContentError(
          next.path,
          'Assessment version must not decrease',
        );
    }
  }
  const visited = new Set<string>(),
    active = new Set<string>();
  function visit(id: string): void {
    if (active.has(id))
      throw new ContentError(
        quests.get(id)?.path ?? 'journeys',
        `Prerequisite cycle at ${id}`,
      );
    if (visited.has(id)) return;
    active.add(id);
    for (const next of graph.get(id) ?? []) visit(next);
    active.delete(id);
    visited.add(id);
  }
  for (const id of graph.keys()) visit(id);
}
