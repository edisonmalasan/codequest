import 'reflect-metadata';
import { appendFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/application';
import { loadBackendConfig } from '../src/infrastructure/config/backend-config';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { AUTH_TOKEN_VERIFIER } from '../src/modules/identity/auth-token-verifier';
import { createAuthPrincipal } from '../src/modules/identity/auth-principal';

const ownerId = randomUUID();
writeFileSync(join(tmpdir(), 'codequest-analytics-owner.txt'), ownerId, 'utf8');
const captureFile = process.env.CODEQUEST_ANALYTICS_FIXTURE_PATH;
if (!captureFile) throw new Error('Fixture capture path required');

async function main(): Promise<void> {
  const config = loadBackendConfig(process.env);
  const module = await Test.createTestingModule({
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
  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({ bodyLimit: config.bodyLimitBytes }),
  );
  await configureApplication(app, config, { nestLogger: false });
  await app.init();
  await app.listen(config.port, config.host);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Fixture failed'}\n`,
  );
  process.exitCode = 1;
});
