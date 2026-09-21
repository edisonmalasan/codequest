export interface RequestCompletionEvent {
  readonly event: 'request.completed';
  readonly service: 'codequest-api';
  readonly requestId: string;
  readonly method: string;
  readonly path: string;
  readonly status: number;
  readonly durationMs: number;
}

export interface UnexpectedErrorEvent {
  readonly event: 'request.failed';
  readonly service: 'codequest-api';
  readonly requestId: string;
  readonly errorName: string;
}

export interface FoundationLogger {
  requestCompleted(event: RequestCompletionEvent): void;
  unexpectedError(event: UnexpectedErrorEvent): void;
}

export class JsonFoundationLogger implements FoundationLogger {
  requestCompleted(event: RequestCompletionEvent): void {
    process.stdout.write(`${JSON.stringify(event)}\n`);
  }

  unexpectedError(event: UnexpectedErrorEvent): void {
    process.stderr.write(`${JSON.stringify(event)}\n`);
  }
}
