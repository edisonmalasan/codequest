import { randomUUID } from 'node:crypto';
import { FastifyRequest } from 'fastify';

interface RequestContext {
  readonly requestId: string;
  readonly startedAt: bigint;
}

const contexts = new WeakMap<FastifyRequest, RequestContext>();
const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function assignRequestContext(request: FastifyRequest): RequestContext {
  const candidate = headerValue(request.headers['x-request-id']);
  const context = Object.freeze({
    requestId:
      candidate !== undefined && REQUEST_ID_PATTERN.test(candidate)
        ? candidate
        : randomUUID(),
    startedAt: process.hrtime.bigint(),
  });
  contexts.set(request, context);
  return context;
}

export function getRequestContext(
  request: FastifyRequest,
): RequestContext | undefined {
  return contexts.get(request);
}

export function getRequestId(request: FastifyRequest): string {
  return getRequestContext(request)?.requestId ?? randomUUID();
}
