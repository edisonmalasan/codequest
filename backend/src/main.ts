import 'reflect-metadata';
import { createApplication } from './application';
import { loadBackendConfig } from './infrastructure/config/backend-config';

async function bootstrap(): Promise<void> {
  const config = loadBackendConfig(process.env);
  const app = await createApplication(config);
  await app.listen(config.port, config.host);
}

bootstrap().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : 'UnknownStartupError';
  const message = error instanceof Error ? error.message : 'Startup failed';
  process.stderr.write(
    `${JSON.stringify({ event: 'application.startup_failed', errorName, message })}\n`,
  );
  process.exitCode = 1;
});
