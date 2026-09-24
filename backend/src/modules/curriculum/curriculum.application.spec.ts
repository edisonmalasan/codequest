import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { createApplication } from '../../application';
import {
  BackendConfig,
  loadBackendConfig,
} from '../../infrastructure/config/backend-config';
import { createOpenApiDocument } from '../../infrastructure/openapi/setup-openapi';
import { loadCurriculumCatalog } from './content/curriculum-catalog';

const source = resolve(process.cwd(), 'content');
const roots: string[] = [];
const applications: NestFastifyApplication[] = [];

function publishedFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-api-content-'));
  roots.push(root);
  cpSync(source, root, { recursive: true });
  const journey = join(root, 'journeys/javascript-foundations/journey.yaml');
  writeFileSync(
    journey,
    readFileSync(journey, 'utf8').replace('status: draft', 'status: reviewed'),
  );
  const snapshot = join(
    root,
    'journeys/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
  );
  mkdirSync(join(snapshot, 'assets'), { recursive: true });
  writeFileSync(
    join(snapshot, 'assets/scope.webp'),
    Buffer.from('quest-image'),
  );
  writeFileSync(
    join(snapshot, 'lesson.mdx'),
    `${readFileSync(join(snapshot, 'lesson.mdx'), 'utf8')}\n\n![Scope diagram](./assets/scope.webp)\n`,
  );
  writeFileSync(
    join(root, 'publication.yaml'),
    `schemaVersion: 1
journeys:
  - id: JAVASCRIPT-FOUNDATIONS
    curriculumReview: approved
    technicalReview: approved
    quests:
      - id: Q01
        contentVersion: 1.0.0
        assessmentVersion: 1.0.0
`,
  );
  return root;
}

function configuration(overrides: Partial<BackendConfig> = {}): BackendConfig {
  return {
    ...loadBackendConfig({
      NODE_ENV: 'test',
      DATABASE_URL:
        'postgresql://codequest:local-password@127.0.0.1:5432/codequest',
      SUPABASE_AUTH_ISSUER: 'http://127.0.0.1:54321/auth/v1',
      SUPABASE_AUTH_AUDIENCE: 'authenticated',
      SUPABASE_AUTH_JWKS_URL:
        'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
    }),
    ...overrides,
  };
}

async function application(
  root?: string,
  overrides?: Partial<BackendConfig>,
): Promise<NestFastifyApplication> {
  const app = await createApplication(configuration(overrides), {
    enableShutdownHooks: false,
    nestLogger: false,
    ...(root ? { curriculumCatalog: loadCurriculumCatalog(root) } : {}),
  });
  applications.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(applications.splice(0).map((app) => app.close()));
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('public curriculum API', () => {
  it('keeps draft source out of the empty production catalog', async () => {
    const app = await application();
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    expect(
      (await fastify.inject({ method: 'GET', url: '/api/v1/journeys' })).json(),
    ).toEqual([]);
    for (const path of [
      'journeys/javascript-foundations',
      'courses/javascript-foundations',
      'chapters/variables',
      'quests/first-message',
    ]) {
      const response = await fastify.inject({
        method: 'GET',
        url: `/api/v1/${path}`,
        headers: { 'x-request-id': 'curriculum-missing' },
      });
      expect(response.statusCode).toBe(404);
      expect(response.json().error).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Resource not found',
        requestId: 'curriculum-missing',
      });
      expect(response.body).not.toContain('draft');
    }
  }, 30_000);

  it('serves all five public routes from one selected snapshot', async () => {
    const app = await application(publishedFixture());
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const list = await fastify.inject({
      method: 'GET',
      url: '/api/v1/journeys',
    });
    expect(list.statusCode).toBe(200);
    expect(list.json()).toEqual([
      expect.objectContaining({
        id: 'JAVASCRIPT-FOUNDATIONS',
        slug: 'javascript-foundations',
        chapterCount: 1,
        questCount: 1,
      }),
    ]);

    const journey = await fastify.inject({
      method: 'GET',
      url: '/api/v1/journeys/javascript-foundations',
    });
    const alias = await fastify.inject({
      method: 'GET',
      url: '/api/v1/courses/javascript-foundations',
    });
    expect(alias.json()).toEqual(journey.json());
    expect(journey.json().chapters[0].slug).toBe('variables');

    const chapter = await fastify.inject({
      method: 'GET',
      url: '/api/v1/chapters/variables',
    });
    expect(chapter.json().quests[0]).toMatchObject({
      id: 'Q01',
      contentVersion: '1.0.0',
    });

    const quest = await fastify.inject({
      method: 'GET',
      url: '/api/v1/quests/first-message',
    });
    expect(quest.json()).toMatchObject({
      id: 'Q01',
      assessmentVersion: '1.0.0',
      difficulty: 'introductory',
      xpAward: 10,
    });
    expect(quest.json().lesson).toContain('# First message');
    expect(quest.json().cases).toHaveLength(2);
    expect(quest.body).not.toContain('publication.yaml');
    expect(quest.body).not.toContain('curriculumReview');

    const asset = await fastify.inject({
      method: 'GET',
      url: '/api/v1/quests/first-message/assets/1.0.0?path=assets%2Fscope.webp',
    });
    expect(asset.statusCode).toBe(200);
    expect(asset.rawPayload).toEqual(Buffer.from('quest-image'));
    expect(asset.headers).toMatchObject({
      'content-type': 'image/webp',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    });
  });

  it.each([
    [
      'unselected version',
      'first-message/assets/9.9.9?path=assets%2Fscope.webp',
    ],
    [
      'path traversal',
      'first-message/assets/1.0.0?path=assets%2F..%2Fstarter.js',
    ],
    ['unsupported type', 'first-message/assets/1.0.0?path=assets%2Fscope.svg'],
    ['missing file', 'first-message/assets/1.0.0?path=assets%2Fmissing.webp'],
    ['draft Quest', 'draft-quest/assets/1.0.0?path=assets%2Fscope.webp'],
  ])('hides %s asset requests behind safe not-found', async (_name, path) => {
    const app = await application(publishedFixture());
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/quests/${path}`,
      headers: { 'x-request-id': 'asset-not-found' },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().error).toEqual({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      status: 404,
      requestId: 'asset-not-found',
    });
    expect(response.body).not.toContain('starter.js');
    expect(response.body).not.toContain('publication.yaml');
  });

  it('documents public curriculum routes without bearer security', async () => {
    const app = await application();
    const document = createOpenApiDocument(app);
    const curriculumPaths = [
      '/api/v1/journeys',
      '/api/v1/journeys/{slug}',
      '/api/v1/courses/{slug}',
      '/api/v1/chapters/{slug}',
      '/api/v1/quests/{slug}',
      '/api/v1/quests/{slug}/assets/{contentVersion}',
    ];
    for (const path of curriculumPaths) {
      expect(document.paths[path]?.get).toBeDefined();
      expect(document.paths[path]?.get?.security).toBeUndefined();
    }
    const schemas = JSON.stringify(document.components?.schemas);
    expect(schemas).not.toContain('publication.yaml');
    expect(schemas).not.toContain('curriculumReview');
    expect(schemas).not.toContain('repositoryPath');
  });

  it('uses the normalized correlated envelope when curriculum reads are throttled', async () => {
    const app = await application(undefined, { rateLimitMax: 1 });
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();
    expect(
      (await fastify.inject({ method: 'GET', url: '/api/v1/journeys' }))
        .statusCode,
    ).toBe(200);
    const limited = await fastify.inject({
      method: 'GET',
      url: '/api/v1/journeys',
      headers: { 'x-request-id': 'curriculum-limited' },
    });
    expect(limited.statusCode).toBe(429);
    expect(limited.json().error).toEqual({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      status: 429,
      requestId: 'curriculum-limited',
    });
  });
});
