export const VALIDATION_LIMITS = {
  sourceBytes: 65_536,
  definitionBytes: 16_384,
  packetBytes: 16_384,
  cases: 10,
  feedbackBytes: 512,
  valueBytes: 4_096,
  outputBytes: 12_288,
  caseDeadlineMs: 2_000,
  totalDeadlineMs: 6_000,
  recoveryMs: 1_000,
} as const;

interface CaseBase {
  id: string;
  label: string;
  feedback: string;
}

export type ValidationCase =
  | (CaseBase & { mode: 'output-match'; expectedLines: readonly string[] })
  | (CaseBase & { mode: 'value-test'; expected: unknown })
  | (CaseBase & {
      mode: 'function-test';
      functionName: string;
      args: readonly unknown[];
      expected: unknown;
    })
  | (CaseBase & {
      mode: 'custom-test';
      predicate:
        | { kind: 'output-contains'; text: string }
        | { kind: 'number-range'; min: number; max: number };
    });

export interface ValidationDefinition {
  cases: readonly ValidationCase[];
}

export type ValidationStatus =
  | 'completed'
  | 'invalid-definition'
  | 'syntax-error'
  | 'runtime-error'
  | 'timeout'
  | 'output-limit'
  | 'cancelled'
  | 'internal-error';

export interface ValidationCaseResult {
  id: string;
  label: string;
  status: 'passed' | 'failed';
  message: string;
}

export interface ValidationResult {
  checkId: string;
  status: ValidationStatus;
  passed: boolean;
  cases: readonly ValidationCaseResult[];
  failedCaseIds: readonly string[];
  feedback: string;
  durationMs: number;
}

export interface ValidationRequest {
  source: string;
  definition: ValidationDefinition;
  signal?: AbortSignal;
}

export interface ValidationStrategy {
  validate(request: ValidationRequest): Promise<ValidationResult>;
  cancel(): Promise<void>;
  dispose(): Promise<void>;
}
