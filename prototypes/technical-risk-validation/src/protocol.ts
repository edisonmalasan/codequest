export const limits = { source: 65536, message: 16384, output: 65536, entries: 200, deadline: 2000 } as const;
export type Candidate = 'opaque' | 'dedicated' | 'control';
export type RunStatus = 'success' | 'syntax-error' | 'runtime-error' | 'output-limit' | 'timeout' | 'stopped' | 'protocol-error';
export type RunIdentity = { run: string; task: string; contentVersion: string; assessmentVersion: string };
export type RunResult = RunIdentity & { status: RunStatus; output: string[]; value: string; elapsed: number; candidate: Candidate };

export function byteLength(value: string): number { return new TextEncoder().encode(value).byteLength; }
export function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
export function decodeResult(raw: unknown, identity: RunIdentity): { status: RunStatus; output: string[]; value: string } | null {
  // Browser structured clone has already allocated raw. No claimed hard allocation quota.
  if (typeof raw !== 'string' || raw.length > limits.message || byteLength(raw) > limits.message) return null;
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return null; }
  if (!isRecord(data) || data.run !== identity.run || data.task !== identity.task || data.contentVersion !== identity.contentVersion || data.assessmentVersion !== identity.assessmentVersion) return null;
  const status = data.status;
  if (status !== 'success' && status !== 'syntax-error' && status !== 'runtime-error' && status !== 'output-limit') return null;
  if (!Array.isArray(data.output) || data.output.length > limits.entries || !data.output.every((entry: unknown): entry is string => typeof entry === 'string') || typeof data.value !== 'string') return null;
  if (byteLength(data.output.join('')) + byteLength(data.value) > limits.output) return null;
  return { status, output: data.output, value: data.value };
}
