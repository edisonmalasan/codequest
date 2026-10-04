import type { PreviewFile } from '@/features/preview';

export const INTERACTIVE_LIMITS = {
  htmlBytes: 65_536,
  cssBytes: 32_768,
  javascriptBytes: 65_536,
  documentBytes: 131_072,
  nodes: 512,
  depth: 32,
  events: 64,
  mutations: 256,
  packetBytes: 16_384,
  mutationBytes: 131_072,
  outputEntries: 200,
  outputBytes: 12_288,
  deadlineMs: 2_000,
  recoveryMs: 1_000,
  sessionMs: 300_000,
} as const;

export type InteractiveStatus =
  | 'ready'
  | 'unsupported'
  | 'unavailable'
  | 'syntax-error'
  | 'runtime-error'
  | 'timeout'
  | 'output-limit'
  | 'cancelled'
  | 'internal-error';

export interface InteractiveSnapshot {
  readonly contentVersion: string;
  readonly files: readonly Readonly<PreviewFile>[];
}

export interface InteractiveEvent {
  readonly type: 'click' | 'input' | 'change';
  readonly targetId: string;
  readonly value?: string;
}

export interface InteractiveResult {
  readonly generationId: string;
  readonly status: InteractiveStatus;
  readonly message: string;
  readonly output: readonly string[];
  readonly filteredActiveContent: boolean;
  readonly description: string;
}

export interface InteractiveWebAdapter {
  attach(host: HTMLElement): void;
  start(
    snapshot: InteractiveSnapshot,
    signal?: AbortSignal,
  ): Promise<InteractiveResult>;
  dispatch(
    event: InteractiveEvent,
    signal?: AbortSignal,
  ): Promise<InteractiveResult>;
  reload(signal?: AbortSignal): Promise<InteractiveResult>;
  cancel(): Promise<void>;
  dispose(): Promise<void>;
}
