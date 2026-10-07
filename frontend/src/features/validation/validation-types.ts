import type { CssCaseProperty } from './css-case-contract';

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
    })
  | (CaseBase & {
      mode: 'html-element';
      selector: string;
      expectedText: string;
    })
  | (CaseBase & {
      mode: 'html-semantic';
      selector: string;
      tag: string;
      expectedText?: string;
      expectedAttributes: readonly {
        name: 'alt' | 'aria-label' | 'for' | 'href' | 'name' | 'type';
        value: string;
      }[];
    })
  | (CaseBase & {
      mode: 'css-declaration';
      selector: string;
      property: CssCaseProperty;
      expectedValue: string;
      media?: { type: 'min-width' | 'max-width'; widthPx: number };
    })
  | (CaseBase & {
      mode: 'interactive-text';
      selector: string;
      events: readonly {
        type: 'click' | 'input' | 'change';
        targetId: string;
        value?: string;
      }[];
      expectedText: string;
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
