import { resolvePreviewOrigin } from '@/features/preview';
import { resolveRunnerOrigin } from '@/features/runtime';
import {
  INTERACTIVE_LIMITS,
  type InteractiveSnapshot,
} from './interactive-types';

export class InteractiveSourceError extends Error {}

export interface CapturedInteractiveSnapshot extends InteractiveSnapshot {
  readonly html: string;
  readonly css: string;
  readonly javascript: string;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function captureInteractiveSnapshot(
  snapshot: InteractiveSnapshot,
): CapturedInteractiveSnapshot {
  if (
    !snapshot ||
    typeof snapshot.contentVersion !== 'string' ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(snapshot.contentVersion) ||
    !Array.isArray(snapshot.files) ||
    snapshot.files.length < 2 ||
    snapshot.files.length > 3
  ) {
    throw new InteractiveSourceError(
      'Interactive files or version are invalid',
    );
  }

  const languages = new Map<string, string>();
  const fileIds = new Set<string>();
  const files = snapshot.files.map((file) => {
    if (
      !file ||
      typeof file.id !== 'string' ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(file.id) ||
      typeof file.source !== 'string' ||
      !['html', 'css', 'javascript'].includes(file.language) ||
      fileIds.has(file.id) ||
      languages.has(file.language)
    ) {
      throw new InteractiveSourceError('Interactive files are invalid');
    }
    const bound =
      file.language === 'html'
        ? INTERACTIVE_LIMITS.htmlBytes
        : file.language === 'css'
          ? INTERACTIVE_LIMITS.cssBytes
          : INTERACTIVE_LIMITS.javascriptBytes;
    if (byteLength(file.source) > bound) {
      throw new InteractiveSourceError('Interactive source exceeds its limit');
    }
    fileIds.add(file.id);
    languages.set(file.language, file.source);
    return Object.freeze({
      id: file.id,
      language: file.language,
      source: file.source,
    });
  });

  const html = languages.get('html');
  const javascript = languages.get('javascript');
  if (html === undefined || javascript === undefined) {
    throw new InteractiveSourceError('HTML and JavaScript files are required');
  }
  return Object.freeze({
    contentVersion: snapshot.contentVersion,
    files: Object.freeze(files),
    html,
    css: languages.get('css') ?? '',
    javascript,
  });
}

export function resolveInteractiveOrigins(
  applicationOrigin: string,
  configuredRunner: string | undefined,
  configuredPreview: string | undefined,
): { runnerOrigin: string; previewOrigin: string } | null {
  const runnerOrigin = resolveRunnerOrigin(configuredRunner, applicationOrigin);
  if (runnerOrigin === null) return null;
  const previewOrigin = resolvePreviewOrigin(
    configuredPreview,
    applicationOrigin,
    runnerOrigin,
  );
  if (previewOrigin === null) return null;
  return { runnerOrigin, previewOrigin };
}
