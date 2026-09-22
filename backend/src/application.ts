import { LoggerService, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { FastifyInstance } from 'fastify';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/http/api-exception.filter';
import {
  FoundationLogger,
  JsonFoundationLogger,
} from './common/http/foundation-logger';
import {
  assignRequestContext,
  getRequestContext,
} from './common/http/request-context';
import { BackendConfig } from './infrastructure/config/backend-config';
import { setupOpenApi } from './infrastructure/openapi/setup-openapi';
import { CurriculumCatalog } from './modules/curriculum/content/curriculum-catalog';

export interface ApplicationOptions {
  readonly foundationLogger?: FoundationLogger;
  readonly nestLogger?: false | LoggerService;
  readonly enableShutdownHooks?: boolean;
  readonly curriculumCatalog?: CurriculumCatalog;
}

function pathname(url: string): string {
  return new URL(url, 'http://codequest.local').pathname;
}

export async function configureApplication(
  app: NestFastifyApplication,
  config: BackendConfig,
  options: ApplicationOptions = {},
): Promise<void> {
  const logger = options.foundationLogger ?? new JsonFoundationLogger();
  const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

  fastify.addHook('onRequest', (request, reply, done) => {
    const context = assignRequestContext(request);
    void reply.header('x-request-id', context.requestId);
    done();
  });
  fastify.addHook('onResponse', (request, reply, done) => {
    const context = getRequestContext(request);
    if (context !== undefined) {
      logger.requestCompleted({
        event: 'request.completed',
        service: 'codequest-api',
        requestId: context.requestId,
        method: request.method,
        path: pathname(request.url),
        status: reply.statusCode,
        durationMs:
          Number(process.hrtime.bigint() - context.startedAt) / 1_000_000,
      });
    }
    done();
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter(logger));
  app.enableCors({
    origin(origin, callback) {
      callback(
        null,
        origin === undefined || config.corsOrigins.includes(origin),
      );
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['authorization', 'content-type', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    credentials: false,
  });
  if (options.enableShutdownHooks !== false) app.enableShutdownHooks();
  setupOpenApi(app);
}

export async function createApplication(
  config: BackendConfig,
  options: ApplicationOptions = {},
): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register(config, {
      curriculumCatalog: options.curriculumCatalog,
    }),
    new FastifyAdapter({ bodyLimit: config.bodyLimitBytes }),
    { logger: options.nestLogger ?? false },
  );
  await configureApplication(app, config, options);
  await app.init();
  const fastify: FastifyInstance = app.getHttpAdapter().getInstance();
  await fastify.ready();
  return app;
}
