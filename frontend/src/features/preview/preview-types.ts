import type { ExecutionResult } from '@/features/runtime';

export const PREVIEW_LIMITS = {
  htmlBytes: 65_536,
  cssBytes: 32_768,
  javascriptBytes: 65_536,
  documentBytes: 131_072,
  packetBytes: 147_456,
  handshakeMs: 1_000,
  renderMs: 2_000,
} as const;

export type PreviewLanguage = 'html' | 'css' | 'javascript';

export interface PreviewFile {
  id: string;
  language: PreviewLanguage;
  source: string;
}

export type PreviewStatus =
  'ready' | 'error' | 'timeout' | 'cancelled' | 'unavailable';

export interface PreviewResult {
  generationId: string;
  status: PreviewStatus;
  message: string;
  filteredActiveContent: boolean;
  execution?: ExecutionResult;
}

export interface PreviewAdapter {
  attach(host: HTMLElement): void;
  preview(
    files: readonly PreviewFile[],
    signal?: AbortSignal,
  ): Promise<PreviewResult>;
  reload(signal?: AbortSignal): Promise<PreviewResult>;
  cancel(): Promise<void>;
  dispose(): Promise<void>;
}
