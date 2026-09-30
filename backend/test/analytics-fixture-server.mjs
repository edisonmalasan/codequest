/* global process, Response */
import 'reflect-metadata';
import { appendFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import nestTesting from '@nestjs/testing';
import nestFastify from '@nestjs/platform-fastify';
import appModule from '../dist/app.module.js';
import application from '../dist/application.js';
import backendConfig from '../dist/infrastructure/config/backend-config.js';
import analyticsModule from '../dist/modules/analytics/analytics.service.js';
import authVerifier from '../dist/modules/identity/auth-token-verifier.js';
import authPrincipal from '../dist/modules/identity/auth-principal.js';

const { Test } = nestTesting;
const { FastifyAdapter } = nestFastify;
const { AppModule } = appModule;
const { configureApplication } = application;
const { loadBackendConfig } = backendConfig;
const { AnalyticsService } = analyticsModule;
const { AUTH_TOKEN_VERIFIER } = authVerifier;
const { createAuthPrincipal } = authPrincipal;

const ownerId = randomUUID();
writeFileSync(join(tmpdir(), 'codequest-analytics-owner.txt'), ownerId, 'utf8');
const captureFile = process.env.CODEQUEST_ANALYTICS_FIXTURE_PATH;
if (!captureFile) throw new Error('Fixture capture path required');

async function main() {
  const config = loadBackendConfig(process.env);
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.register(config)],
  })
    .overrideProvider(AUTH_TOKEN_VERIFIER)
    .useValue({ verify: async () => createAuthPrincipal(ownerId) })
    .overrideProvider(AnalyticsService)
    .useFactory({
      factory: () =>
        new AnalyticsService(
          {
            approved: 'true',
            projectKey: 'local_fixture_key',
            host: 'https://capture.example.test',
          },
          async (_input, init) => {
            appendFileSync(captureFile, `${init?.body}\n`, 'utf8');
            return new Response(null, { status: 200 });
          },
        ),
    })
    .compile();
  const app = moduleRef.createNestApplication(
    new FastifyAdapter({ bodyLimit: config.bodyLimitBytes }),
  );
  await configureApplication(app, config, { nestLogger: false });
  await app.init();
  await app.listen(config.port, config.host);
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Fixture failed'}\n`,
  );
  process.exitCode = 1;
});
