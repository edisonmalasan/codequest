import { Body, Controller, Get, Module, Post, Version } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IsString, MinLength } from 'class-validator';
import { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { configureApplication, createApplication } from './application';
import {
  FoundationLogger,
  RequestCompletionEvent,
  UnexpectedErrorEvent,
} from './common/http/foundation-logger';
import {
  BackendConfig,
  loadBackendConfig,
} from './infrastructure/config/backend-config';

interface ErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly status: number;
    readonly requestId: string;
    readonly details?: readonly string[];
  };
}

class EchoRequestDto {
  @IsString()
  @MinLength(2)
  value!: string;
}

@Controller()
class TestController {
  @Post('echo')
  @Version('1')
  echo(@Body() body: EchoRequestDto): EchoRequestDto {
    return body;
  }

  @Get('failure')
  @Version('1')
  fail(): never {
    throw new Error('private failure detail');
  }
}

Reflect.defineMetadata(
  'design:paramtypes',
  [EchoRequestDto],
  TestController.prototype,
  'echo',
);

@Module({ controllers: [TestController] })
class TestApplicationModule {}

class CapturingFoundationLogger implements FoundationLogger {
  readonly completions: RequestCompletionEvent[] = [];
  readonly failures: UnexpectedErrorEvent[] = [];

  requestCompleted(event: RequestCompletionEvent): void {
    this.completions.push(event);
  }

  unexpectedError(event: UnexpectedErrorEvent): void {
    this.failures.push(event);
  }
}

function configuration(overrides: Partial<BackendConfig> = {}): BackendConfig {
  return Object.freeze({
    ...loadBackendConfig({ NODE_ENV: 'test' }),
    ...overrides,
  });
}

async function createTestApplication(
  logger: FoundationLogger,
): Promise<NestFastifyApplication> {
  const config = configuration();
  const app = await NestFactory.create<NestFastifyApplication>(
    TestApplicationModule,
    new FastifyAdapter({ bodyLimit: config.bodyLimitBytes }),
    { logger: false },
  );
  await configureApplication(app, config, {
    foundationLogger: logger,
    nestLogger: false,
    enableShutdownHooks: false,
  });
  await app.init();
  const fastify: FastifyInstance = app.getHttpAdapter().getInstance();
  await fastify.ready();
  return app;
}

describe('backend HTTP foundation', () => {
  const applications: NestFastifyApplication[] = [];

  afterEach(async () => {
    await Promise.all(applications.splice(0).map((app) => app.close()));
  });

  it('serves the versioned health contract and normalizes missing routes', async () => {
    const app = await createApplication(configuration(), {
      foundationLogger: new CapturingFoundationLogger(),
      nestLogger: false,
      enableShutdownHooks: false,
    });
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const health = await fastify.inject({
      method: 'GET',
      url: '/api/v1/health',
    });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({
      status: 'ok',
      service: 'codequest-api',
      version: '1',
    });

    const missing = await fastify.inject({
      method: 'GET',
      url: '/api/v2/health',
    });
    expect(missing.statusCode).toBe(404);
    expect(missing.json<ErrorResponse>().error).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      status: 404,
    });
  });

  it('propagates valid request IDs and replaces invalid IDs', async () => {
    const logger = new CapturingFoundationLogger();
    const app = await createApplication(configuration(), {
      foundationLogger: logger,
      nestLogger: false,
      enableShutdownHooks: false,
    });
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const retained = await fastify.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { 'x-request-id': 'client-request_42' },
    });
    expect(retained.headers['x-request-id']).toBe('client-request_42');

    const replaced = await fastify.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { 'x-request-id': 'invalid id with spaces' },
    });
    expect(replaced.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('logs only allowlisted completion metadata without query or header values', async () => {
    const logger = new CapturingFoundationLogger();
    const app = await createApplication(configuration(), {
      foundationLogger: logger,
      nestLogger: false,
      enableShutdownHooks: false,
    });
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    await fastify.inject({
      method: 'GET',
      url: '/api/v1/health?secret=query-secret',
      headers: {
        authorization: 'Bearer header-secret',
        cookie: 'session=cookie-secret',
        'x-request-id': 'log-test',
      },
    });

    expect(logger.completions).toHaveLength(1);
    expect(logger.completions[0]).toMatchObject({
      event: 'request.completed',
      service: 'codequest-api',
      requestId: 'log-test',
      method: 'GET',
      path: '/api/v1/health',
      status: 200,
    });
    const serialized = JSON.stringify(logger.completions[0]);
    expect(serialized).not.toContain('query-secret');
    expect(serialized).not.toContain('header-secret');
    expect(serialized).not.toContain('cookie-secret');
  });

  it('strictly validates DTO input and normalizes validation errors', async () => {
    const app = await createTestApplication(new CapturingFoundationLogger());
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const valid = await fastify.inject({
      method: 'POST',
      url: '/api/v1/echo',
      payload: { value: 'valid' },
    });
    expect(valid.statusCode).toBe(201);
    expect(valid.json()).toEqual({ value: 'valid' });

    const invalid = await fastify.inject({
      method: 'POST',
      url: '/api/v1/echo',
      headers: { 'x-request-id': 'validation-test' },
      payload: { value: 1, unexpected: 'raw-secret' },
    });
    expect(invalid.statusCode).toBe(400);
    const error = invalid.json<ErrorResponse>().error;
    expect(error).toMatchObject({
      code: 'VALIDATION_FAILED',
      status: 400,
      requestId: 'validation-test',
    });
    expect(error.details).toEqual(
      expect.arrayContaining([
        expect.stringContaining('unexpected'),
        expect.stringContaining('value'),
      ]),
    );
    expect(JSON.stringify(error)).not.toContain('raw-secret');
  });

  it('contains unexpected errors and records only their class', async () => {
    const logger = new CapturingFoundationLogger();
    const app = await createTestApplication(logger);
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/failure',
      headers: { 'x-request-id': 'failure-test' },
    });
    expect(response.statusCode).toBe(500);
    expect(response.json<ErrorResponse>().error).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      status: 500,
      requestId: 'failure-test',
    });
    expect(response.body).not.toContain('private failure detail');
    expect(logger.failures).toEqual([
      {
        event: 'request.failed',
        service: 'codequest-api',
        requestId: 'failure-test',
        errorName: 'Error',
      },
    ]);
  });

  it('grants CORS only to configured origins', async () => {
    const app = await createApplication(
      configuration({ corsOrigins: ['https://allowed.example'] }),
      {
        foundationLogger: new CapturingFoundationLogger(),
        nestLogger: false,
        enableShutdownHooks: false,
      },
    );
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const allowed = await fastify.inject({
      method: 'OPTIONS',
      url: '/api/v1/health',
      headers: {
        origin: 'https://allowed.example',
        'access-control-request-method': 'GET',
      },
    });
    expect(allowed.headers['access-control-allow-origin']).toBe(
      'https://allowed.example',
    );

    const denied = await fastify.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://denied.example' },
    });
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('publishes OpenAPI for the implemented health surface only', async () => {
    const app = await createApplication(configuration(), {
      foundationLogger: new CapturingFoundationLogger(),
      nestLogger: false,
      enableShutdownHooks: false,
    });
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/openapi.json',
    });
    expect(response.statusCode).toBe(200);
    const document = response.json<{
      openapi: string;
      paths: Record<string, unknown>;
    }>();
    expect(document.openapi).toMatch(/^3\./);
    expect(document.paths).toHaveProperty('/api/v1/health');
    expect(Object.keys(document.paths)).toEqual(['/api/v1/health']);

    const docs = await fastify.inject({ method: 'GET', url: '/api/docs' });
    expect(docs.statusCode).toBe(200);
  });

  it('returns a correlated normalized response after the request limit', async () => {
    const app = await createApplication(configuration({ rateLimitMax: 1 }), {
      foundationLogger: new CapturingFoundationLogger(),
      nestLogger: false,
      enableShutdownHooks: false,
    });
    applications.push(app);
    const fastify: FastifyInstance = app.getHttpAdapter().getInstance();

    const first = await fastify.inject({
      method: 'GET',
      url: '/api/v1/health',
    });
    expect(first.statusCode).toBe(200);

    const limited = await fastify.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { 'x-request-id': 'limited-request' },
    });
    expect(limited.statusCode).toBe(429);
    expect(limited.json<ErrorResponse>().error).toEqual({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      status: 429,
      requestId: 'limited-request',
    });
  });
});
