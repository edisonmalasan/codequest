import { utf8Bytes } from '@/features/runtime/execution-protocol';

export interface WebSourceFile {
  readonly id: string;
  readonly language: 'html' | 'css' | 'javascript';
  readonly source: string;
}

export interface WebSourceBundle {
  readonly schemaVersion: 1;
  readonly questId: string;
  readonly contentVersion: string;
  readonly assessmentVersion: string;
  readonly mode: 'static-web' | 'interactive-web';
  readonly files: readonly WebSourceFile[];
}

const safeId = /^[A-Za-z][A-Za-z0-9-]{1,47}$/;
const safeFileId = /^[a-z][a-z0-9-]{0,31}$/;
const semver = /^\d{1,5}\.\d{1,5}\.\d{1,5}$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function keys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  return (
    Object.keys(value).length === expected.length &&
    expected.every((key) => Object.hasOwn(value, key))
  );
}

export function parseWebSource(source: string): WebSourceBundle | null {
  if (utf8Bytes(source) > 65_536) return null;
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return null;
  }
  if (
    !record(value) ||
    !keys(value, [
      'schemaVersion',
      'questId',
      'contentVersion',
      'assessmentVersion',
      'mode',
      'files',
    ]) ||
    value.schemaVersion !== 1 ||
    typeof value.questId !== 'string' ||
    !safeId.test(value.questId) ||
    typeof value.contentVersion !== 'string' ||
    !semver.test(value.contentVersion) ||
    typeof value.assessmentVersion !== 'string' ||
    !semver.test(value.assessmentVersion) ||
    !['static-web', 'interactive-web'].includes(String(value.mode)) ||
    !Array.isArray(value.files) ||
    value.files.length < 1 ||
    value.files.length > 3
  )
    return null;
  const files: WebSourceFile[] = [];
  const ids = new Set<string>();
  const languages = new Set<string>();
  for (const item of value.files) {
    if (
      !record(item) ||
      !keys(item, ['id', 'language', 'source']) ||
      typeof item.id !== 'string' ||
      !safeFileId.test(item.id) ||
      ids.has(item.id) ||
      !['html', 'css', 'javascript'].includes(String(item.language)) ||
      languages.has(String(item.language)) ||
      typeof item.source !== 'string' ||
      utf8Bytes(item.source) > (item.language === 'css' ? 32_768 : 65_536)
    )
      return null;
    ids.add(item.id);
    languages.add(String(item.language));
    files.push({
      id: item.id,
      language: item.language as WebSourceFile['language'],
      source: item.source,
    });
  }
  if (
    !languages.has('html') ||
    (value.mode === 'static-web' && languages.has('javascript')) ||
    (value.mode === 'interactive-web' && !languages.has('javascript'))
  )
    return null;
  if (JSON.stringify(value) !== source) return null;
  return value as unknown as WebSourceBundle;
}

export function serializeWebSource(bundle: WebSourceBundle): string | null {
  const source = JSON.stringify(bundle);
  return parseWebSource(source) ? source : null;
}
