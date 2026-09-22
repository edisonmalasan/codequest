import 'reflect-metadata';
import { writeFile } from 'node:fs/promises';
import { createApplication } from './application';
import { loadBackendConfig } from './infrastructure/config/backend-config';
import { createOpenApiDocument } from './infrastructure/openapi/setup-openapi';

async function exportOpenApi(outputPath: string): Promise<void> {
  const config = loadBackendConfig({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://contract@127.0.0.1/contract',
  });
  const app = await createApplication(config, {
    nestLogger: false,
    enableShutdownHooks: false,
  });
  try {
    const document = createOpenApiDocument(app);
    await writeFile(
      outputPath,
      `${JSON.stringify(document, null, 2)}\n`,
      'utf8',
    );
  } finally {
    await app.close();
  }
}

const outputPath = process.argv[2];
if (outputPath === undefined || outputPath.trim() === '') {
  process.stderr.write('Expected an OpenAPI output path\n');
  process.exitCode = 1;
} else {
  exportOpenApi(outputPath).catch((error: unknown) => {
    process.stderr.write(
      `OpenAPI export failed: ${error instanceof Error ? error.name : 'UnknownError'}\n`,
    );
    process.exitCode = 1;
  });
}
