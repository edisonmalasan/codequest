import 'reflect-metadata';
import { resolve } from 'node:path';
import { createApplication } from '../application';
import { loadBackendConfig } from '../infrastructure/config/backend-config';
import {
  loadCurriculumCatalog,
  type CurriculumCatalog,
  type PublishedQuest,
} from '../modules/curriculum/content/curriculum-catalog';

function syntheticCatalog(): CurriculumCatalog {
  const catalog = loadCurriculumCatalog(resolve(process.cwd(), 'content'));
  const journey = catalog.journeys[0];
  const course = journey?.courses[0];
  const chapter = course?.chapters[0];
  const base = chapter?.quests[0];
  if (!journey || !course || !chapter || !base)
    throw new Error('Published learning fixture is unavailable');

  const exercise = {
    schemaVersion: 1 as const,
    mode: 'static-web' as const,
    files: [
      {
        id: 'page',
        name: 'index.html',
        language: 'html' as const,
        starterFile: 'starter.html' as const,
        starterSource: '<h1 id="answer">Hello</h1>',
      },
      {
        id: 'style',
        name: 'style.css',
        language: 'css' as const,
        starterFile: 'starter.css' as const,
        starterSource: 'h1 { color: blue; }',
      },
    ],
  };
  const quest: PublishedQuest = {
    metadata: {
      ...base.metadata,
      id: 'WEB01',
      slug: 'synthetic-static-web',
      position: 99,
      guestEligible: false,
    },
    activeSnapshot: {
      ...base.activeSnapshot,
      metadata: {
        ...base.activeSnapshot.metadata,
        title: 'Synthetic web exercise',
        objective: 'Build a heading and style it.',
        prerequisiteQuestIds: [],
        caseIds: ['heading', 'color'],
        exercise: {
          schemaVersion: exercise.schemaVersion,
          mode: exercise.mode,
          files: exercise.files.map((file) => ({
            id: file.id,
            name: file.name,
            language: file.language,
            starterFile: file.starterFile,
          })),
        },
      },
      starterCode: '',
      exercise,
      cases: [
        {
          id: 'heading',
          category: 'normal',
          kind: 'html-element',
          selector: '#answer',
          expectedText: 'Hello',
          feedback: 'Add the heading.',
        },
        {
          id: 'color',
          category: 'boundary',
          kind: 'css-declaration',
          selector: 'h1',
          property: 'color',
          expectedValue: 'blue',
          feedback: 'Use blue.',
        },
      ],
    },
  };
  const testChapter = { ...chapter, quests: [...chapter.quests, quest] };
  const testCourse = {
    ...course,
    chapters: course.chapters.map((item) =>
      item.metadata.id === chapter.metadata.id ? testChapter : item,
    ),
  };
  return {
    ...catalog,
    journeys: catalog.journeys.map((item) =>
      item.metadata.id === journey.metadata.id
        ? {
            ...item,
            courses: item.courses.map((entry) =>
              entry.metadata.id === course.metadata.id ? testCourse : entry,
            ),
            chapters: item.chapters.map((entry) =>
              entry.metadata.id === chapter.metadata.id ? testChapter : entry,
            ),
          }
        : item,
    ),
  };
}

async function bootstrap(): Promise<void> {
  const testUrl = process.env.DATABASE_TEST_URL;
  if (
    process.env.NODE_ENV !== 'test' ||
    !testUrl ||
    !['localhost', '127.0.0.1', '[::1]'].includes(new URL(testUrl).hostname)
  )
    throw new Error(
      'Learning fixture requires an isolated local test database',
    );
  const config = loadBackendConfig({ ...process.env, DATABASE_URL: testUrl });
  const app = await createApplication(config, {
    curriculumCatalog: syntheticCatalog(),
  });
  await app.listen(config.port, config.host);
}

bootstrap().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Fixture startup failed'}\n`,
  );
  process.exitCode = 1;
});
