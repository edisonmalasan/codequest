import type {
  InteractiveEvent,
  InteractiveResult,
  InteractiveSnapshot,
  InteractiveWebAdapter,
} from '@/features/interactive';
import { InteractiveSourceError } from '@/features/interactive';
import { validateBuildSnapshot } from './build-starter';

/** Enforces the reviewed Build manifest at the final Run boundary. */
export class BoundedBuildAdapter implements InteractiveWebAdapter {
  constructor(private readonly adapter: InteractiveWebAdapter) {}

  attach(host: HTMLElement): void {
    this.adapter.attach(host);
  }

  subscribe(listener: (result: InteractiveResult) => void): () => void {
    return this.adapter.subscribe(listener);
  }

  async start(
    snapshot: InteractiveSnapshot,
    signal?: AbortSignal,
  ): Promise<InteractiveResult> {
    try {
      const captured = validateBuildSnapshot(snapshot.files);
      return await this.adapter.start(captured, signal);
    } catch (error) {
      if (!(error instanceof InteractiveSourceError)) throw error;
      await this.adapter.cancel();
      return {
        generationId: crypto.randomUUID(),
        status: 'unsupported',
        message: error.message,
        output: [],
        filteredActiveContent: false,
        description: '',
        durationMs: 0,
      };
    }
  }

  dispatch(
    event: InteractiveEvent,
    signal?: AbortSignal,
  ): Promise<InteractiveResult> {
    return this.adapter.dispatch(event, signal);
  }

  reload(signal?: AbortSignal): Promise<InteractiveResult> {
    return this.adapter.reload(signal);
  }

  readText(elementId: string): string | null {
    return this.adapter.readText(elementId);
  }

  cancel(): Promise<void> {
    return this.adapter.cancel();
  }

  dispose(): Promise<void> {
    return this.adapter.dispose();
  }
}
