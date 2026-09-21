import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FoundationLogger } from './foundation-logger';
import { getRequestId } from './request-context';

interface ErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly status: number;
    readonly requestId: string;
    readonly details?: readonly string[];
  };
}

interface HttpExceptionPayload {
  readonly message?: string | string[];
}

function isHttpExceptionPayload(value: unknown): value is HttpExceptionPayload {
  return typeof value === 'object' && value !== null && 'message' in value;
}

function errorCode(status: number, hasValidationDetails: boolean): string {
  if (hasValidationDetails) return 'VALIDATION_FAILED';
  if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
  if (status === HttpStatus.TOO_MANY_REQUESTS) return 'RATE_LIMIT_EXCEEDED';
  if (status === HttpStatus.INTERNAL_SERVER_ERROR) return 'INTERNAL_ERROR';
  return `HTTP_${status}`;
}

function safeMessage(status: number, response: unknown): string {
  if (status === HttpStatus.NOT_FOUND) return 'Resource not found';
  if (status === HttpStatus.TOO_MANY_REQUESTS) return 'Too many requests';
  if (status >= 500) return 'Internal server error';
  if (typeof response === 'string') return response.slice(0, 200);
  if (
    isHttpExceptionPayload(response) &&
    typeof response.message === 'string'
  ) {
    return response.message.slice(0, 200);
  }
  return 'Request failed';
}

function validationDetails(response: unknown): readonly string[] | undefined {
  if (!isHttpExceptionPayload(response) || !Array.isArray(response.message)) {
    return undefined;
  }
  return response.message
    .filter((message): message is string => typeof message === 'string')
    .slice(0, 20)
    .map((message) => message.slice(0, 200));
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: FoundationLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    const requestId = getRequestId(request);
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = isHttpException ? exception.getResponse() : undefined;
    const details = validationDetails(response);

    if (!isHttpException) {
      this.logger.unexpectedError({
        event: 'request.failed',
        service: 'codequest-api',
        requestId,
        errorName:
          exception instanceof Error
            ? exception.name
            : 'UnknownApplicationError',
      });
    }

    const body: ErrorBody = {
      error: {
        code: errorCode(status, details !== undefined),
        message: safeMessage(status, response),
        status,
        requestId,
        ...(details === undefined ? {} : { details }),
      },
    };
    void reply.status(status).send(body);
  }
}
