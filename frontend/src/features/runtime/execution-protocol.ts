import {
  EXECUTION_LIMITS,
  type WorkerTerminalPacket,
  type WorkerTerminalStatus,
} from './execution-types';

const terminalStatuses = new Set<WorkerTerminalStatus>([
  'success',
  'syntax-error',
  'runtime-error',
  'timeout',
  'output-limit',
  'cancelled',
  'internal-error',
]);

export function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function decodeTerminalPacket(
  value: unknown,
  activeRunId: string,
): WorkerTerminalPacket | null {
  if (!isRecord(value) || value.type !== 'result') return null;
  if (value.runId !== activeRunId || typeof value.runId !== 'string') {
    return null;
  }
  if (
    typeof value.status !== 'string' ||
    !terminalStatuses.has(value.status as WorkerTerminalStatus) ||
    typeof value.value !== 'string' ||
    typeof value.message !== 'string' ||
    !Array.isArray(value.output) ||
    value.output.length > EXECUTION_LIMITS.outputEntries ||
    !value.output.every((entry): entry is string => typeof entry === 'string')
  ) {
    return null;
  }

  let encoded: string;
  try {
    encoded = JSON.stringify(value);
  } catch {
    return null;
  }
  if (utf8Bytes(encoded) > EXECUTION_LIMITS.packetBytes) return null;
  if (utf8Bytes(value.message) > EXECUTION_LIMITS.errorBytes) return null;
  if (
    utf8Bytes(value.output.join('')) + utf8Bytes(value.value) >
    EXECUTION_LIMITS.outputBytes
  ) {
    return null;
  }

  return {
    type: 'result',
    runId: value.runId,
    status: value.status as WorkerTerminalStatus,
    output: value.output,
    value: value.value,
    message: value.message,
  };
}

export function resolveRunnerOrigin(
  configuredValue: string | undefined,
  applicationOrigin: string,
): string | null {
  if (!configuredValue) return null;
  try {
    const configured = new URL(configuredValue);
    const application = new URL(applicationOrigin);
    if (
      configured.username ||
      configured.password ||
      configured.pathname !== '/' ||
      configured.search ||
      configured.hash ||
      configured.origin === application.origin
    ) {
      return null;
    }
    const loopback = ['127.0.0.1', '127.0.0.2', 'localhost'].includes(
      configured.hostname,
    );
    if (configured.protocol !== 'https:' && !loopback) return null;
    return configured.origin;
  } catch {
    return null;
  }
}
