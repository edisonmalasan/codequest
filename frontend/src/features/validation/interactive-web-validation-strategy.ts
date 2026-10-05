import {
  IsolatedInteractiveWebAdapter,
  captureInteractiveSnapshot,
  type InteractiveWebAdapter,
} from '@/features/interactive';
import { buildInteractiveDocument } from '@/features/interactive/interactive-document';
import type { PreviewFile } from '@/features/preview';
import { validDefinition } from './validation-definition';
import { parseWebSource } from './web-source';
import type {
  ValidationCaseResult,
  ValidationRequest,
  ValidationResult,
  ValidationStatus,
  ValidationStrategy,
} from './validation-types';

function terminal(
  id: string,
  started: number,
  status: ValidationStatus,
  cases: readonly ValidationCaseResult[] = [],
  feedback = '',
): ValidationResult {
  return {
    checkId: id,
    status,
    passed:
      status === 'completed' &&
      cases.length > 0 &&
      cases.every((item) => item.status === 'passed'),
    cases,
    failedCaseIds: cases
      .filter((item) => item.status === 'failed')
      .map((item) => item.id),
    feedback,
    durationMs: Math.max(0, performance.now() - started),
  };
}

export class InteractiveWebValidationStrategy implements ValidationStrategy {
  private generation = 0;
  private disposed = false;
  private active?: InteractiveWebAdapter;
  private host?: HTMLElement;

  constructor(
    private readonly runnerOrigin: string,
    private readonly previewOrigin: string,
    private readonly createAdapter: (
      runner: string,
      preview: string,
    ) => InteractiveWebAdapter = (runner, preview) =>
      new IsolatedInteractiveWebAdapter(runner, preview),
  ) {}

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    await this.cancel();
    const generation = this.generation;
    const id = crypto.randomUUID();
    const started = performance.now();
    if (this.disposed || request.signal?.aborted)
      return terminal(id, started, 'cancelled', [], 'Check cancelled');
    if (
      !validDefinition(request.definition) ||
      request.definition.cases.some((item) => item.mode !== 'interactive-text')
    )
      return terminal(
        id,
        started,
        'invalid-definition',
        [],
        'Interactive check definition is invalid',
      );
    const bundle = parseWebSource(request.source);
    if (!bundle || bundle.mode !== 'interactive-web')
      return terminal(
        id,
        started,
        'output-limit',
        [],
        'Web source is invalid or exceeds the limit',
      );
    const files: readonly PreviewFile[] = bundle.files;
    let parsedDocument;
    try {
      parsedDocument = buildInteractiveDocument(
        captureInteractiveSnapshot({
          contentVersion: bundle.contentVersion,
          files,
        }),
      );
    } catch {
      return terminal(
        id,
        started,
        'invalid-definition',
        [],
        'Interactive document is unsupported',
      );
    }
    if (parsedDocument.filteredActiveContent)
      return terminal(
        id,
        started,
        'invalid-definition',
        [],
        'Active markup is unsupported',
      );
    const byId = new Map(
      parsedDocument.nodes
        .filter((node) => node.elementId)
        .map((node) => [node.elementId, node.nodeId]),
    );
    if (
      byId.size !== parsedDocument.nodes.filter((node) => node.elementId).length
    )
      return terminal(
        id,
        started,
        'invalid-definition',
        [],
        'Duplicate element IDs are unsupported',
      );
    const controller = new AbortController();
    let deadlineExpired = false;
    const abort = () => controller.abort();
    request.signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(() => {
      deadlineExpired = true;
      abort();
    }, 6_000);
    const outcomes: ValidationCaseResult[] = [];
    let ownedAdapter: InteractiveWebAdapter | undefined;
    let ownedHost: HTMLElement | undefined;
    try {
      for (const item of request.definition.cases) {
        if (item.mode !== 'interactive-text') continue;
        if (generation !== this.generation || controller.signal.aborted)
          return terminal(
            id,
            started,
            deadlineExpired ? 'timeout' : 'cancelled',
            outcomes,
            deadlineExpired ? 'Check timed out' : 'Check cancelled',
          );
        const expectedNode = byId.get(item.selector.slice(1));
        if (
          !expectedNode ||
          item.events.some((event) => !byId.has(event.targetId))
        )
          return terminal(
            id,
            started,
            'invalid-definition',
            outcomes,
            'Assessment target is absent',
          );
        const host = document.createElement('div');
        host.setAttribute('aria-hidden', 'true');
        host.style.position = 'fixed';
        host.style.width = '1px';
        host.style.height = '1px';
        host.style.opacity = '0';
        document.body.append(host);
        ownedHost = host;
        this.host = host;
        const adapter = this.createAdapter(
          this.runnerOrigin,
          this.previewOrigin,
        );
        ownedAdapter = adapter;
        this.active = adapter;
        adapter.attach(host);
        const start = await adapter.start(
          { contentVersion: bundle.contentVersion, files },
          controller.signal,
        );
        let status = start.status;
        if (status === 'ready')
          for (const event of item.events) {
            const targetId = byId.get(event.targetId);
            if (!targetId) {
              status = 'unsupported';
              break;
            }
            const outcome = await adapter.dispatch(
              {
                type: event.type,
                targetId,
                ...(event.value === undefined ? {} : { value: event.value }),
              },
              controller.signal,
            );
            status = outcome.status;
            if (status !== 'ready') break;
          }
        if (status === 'ready') {
          const passed =
            adapter.readText(item.selector.slice(1)) === item.expectedText;
          outcomes.push({
            id: item.id,
            label: item.label,
            status: passed ? 'passed' : 'failed',
            message: passed ? 'Passed' : item.feedback,
          });
        } else {
          outcomes.push({
            id: item.id,
            label: item.label,
            status: 'failed',
            message: `${status.replaceAll('-', ' ')}: ${item.feedback}`,
          });
          if (
            status === 'timeout' ||
            status === 'output-limit' ||
            status === 'unavailable' ||
            status === 'internal-error'
          )
            return terminal(
              id,
              started,
              status === 'unavailable' ? 'internal-error' : status,
              outcomes,
              'Interactive check stopped',
            );
        }
        await adapter.dispose();
        host.remove();
        ownedAdapter = undefined;
        ownedHost = undefined;
        if (this.active === adapter) this.active = undefined;
        if (this.host === host) this.host = undefined;
      }
      if (generation !== this.generation || controller.signal.aborted)
        return terminal(
          id,
          started,
          deadlineExpired ? 'timeout' : 'cancelled',
          outcomes,
          deadlineExpired ? 'Check timed out' : 'Check cancelled',
        );
      return terminal(id, started, 'completed', outcomes);
    } catch {
      return terminal(
        id,
        started,
        deadlineExpired
          ? 'timeout'
          : request.signal?.aborted
            ? 'cancelled'
            : 'internal-error',
        outcomes,
        'Interactive check unavailable',
      );
    } finally {
      clearTimeout(timeout);
      request.signal?.removeEventListener('abort', abort);
      await ownedAdapter?.dispose();
      ownedHost?.remove();
      if (this.active === ownedAdapter) this.active = undefined;
      if (this.host === ownedHost) this.host = undefined;
    }
  }

  async cancel(): Promise<void> {
    this.generation += 1;
    await this.active?.cancel();
    await this.active?.dispose();
    this.host?.remove();
    this.active = undefined;
    this.host = undefined;
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    await this.cancel();
  }
}
