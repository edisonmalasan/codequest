export const EXECUTION_LIMITS = {
  sourceBytes: 65_536,
  outputEntries: 200,
  outputBytes: 12_288,
  packetBytes: 16_384,
  errorBytes: 1_024,
  deadlineMs: 2_000,
  recoveryMs: 1_000,
} as const;

export type ExecutionStatus =
  | 'success'
  | 'syntax-error'
  | 'runtime-error'
  | 'timeout'
  | 'output-limit'
  | 'cancelled'
  | 'internal-error';

export interface ExecutionRequest {
  source: string;
  signal?: AbortSignal;
}

export interface ExecutionResult {
  runId: string;
  status: ExecutionStatus;
  output: readonly string[];
  value: string;
  message: string;
  durationMs: number;
}

export interface ExecutionAdapter {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  cancel(): Promise<void>;
  dispose(): Promise<void>;
}

export type WorkerTerminalStatus =
  | 'success'
  | 'syntax-error'
  | 'runtime-error'
  | 'timeout'
  | 'output-limit'
  | 'cancelled'
  | 'internal-error';

export interface WorkerTerminalPacket {
  type: 'result';
  runId: string;
  status: WorkerTerminalStatus;
  output: readonly string[];
  value: string;
  message: string;
}
