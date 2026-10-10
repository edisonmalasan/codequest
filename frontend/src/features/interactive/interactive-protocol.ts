import {
  INTERACTIVE_LIMITS,
  type InteractiveStatus,
} from './interactive-types';

const terminalStatuses = new Set<string>([
  'ready',
  'unsupported',
  'unavailable',
  'syntax-error',
  'runtime-error',
  'timeout',
  'output-limit',
  'cancelled',
  'internal-error',
]);
const mutationKinds = new Set(['text', 'class', 'style', 'attribute', 'value']);
const styleRules: Readonly<Record<string, RegExp>> = {
  color: /^(?:#[a-fA-F0-9]{3,8}|[a-zA-Z]{1,24})$/,
  backgroundColor: /^(?:#[a-fA-F0-9]{3,8}|[a-zA-Z]{1,24})$/,
  display: /^(?:none|block|inline|inline-block|flex|grid)$/,
  fontSize: /^(?:[0-9]{1,3}(?:px|rem|em|%))$/,
};

export interface InteractiveMutation {
  readonly nodeId: string;
  readonly kind: 'text' | 'class' | 'style' | 'attribute' | 'value';
  readonly value: string;
  readonly name?: string;
}

export interface RunnerStep {
  readonly type: 'step';
  readonly sessionId: string;
  readonly stepId: string;
  readonly status: InteractiveStatus;
  readonly message: string;
  readonly output: readonly string[];
  readonly mutations: readonly InteractiveMutation[];
}

export type DisplayPacket =
  | {
      readonly type: 'rendered' | 'error' | 'invalid' | 'event-limit';
      readonly generationId: string;
    }
  | {
      readonly type: 'applied';
      readonly generationId: string;
      readonly stepId: string;
    }
  | {
      readonly type: 'interaction';
      readonly generationId: string;
      readonly eventId: string;
      readonly event: {
        readonly type: 'click' | 'input' | 'change';
        readonly targetId: string;
        readonly value?: string;
      };
    };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function interactiveStatus(value: unknown): value is InteractiveStatus {
  return typeof value === 'string' && terminalStatuses.has(value);
}

function interactionType(
  value: unknown,
): value is 'click' | 'input' | 'change' {
  return value === 'click' || value === 'input' || value === 'change';
}

function displayStatus(
  value: unknown,
): value is 'rendered' | 'error' | 'invalid' | 'event-limit' {
  return (
    value === 'rendered' ||
    value === 'error' ||
    value === 'invalid' ||
    value === 'event-limit'
  );
}

function stringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item): item is string => typeof item === 'string')
  );
}

function bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function safeAttributeText(value: string): boolean {
  return (
    value.length <= 256 &&
    !value.includes('<') &&
    !value.includes('>') &&
    [...value].every((character) => (character.codePointAt(0) ?? 0) >= 32)
  );
}

function packetSize(value: unknown): number {
  try {
    return bytes(JSON.stringify(value));
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function validInteractiveMutation(
  value: unknown,
  allowedNodes: ReadonlySet<string>,
): value is InteractiveMutation {
  if (
    !record(value) ||
    typeof value.nodeId !== 'string' ||
    !allowedNodes.has(value.nodeId) ||
    typeof value.value !== 'string' ||
    typeof value.kind !== 'string' ||
    !mutationKinds.has(value.kind) ||
    Object.keys(value).length !== (value.name === undefined ? 3 : 4)
  )
    return false;
  if (value.kind === 'text') {
    return value.name === undefined && bytes(value.value) <= 4_096;
  }
  if (value.kind === 'class') {
    return (
      value.name === undefined &&
      bytes(value.value) <= 1_024 &&
      /^[a-zA-Z0-9_\s-]*$/.test(value.value)
    );
  }
  if (value.kind === 'value') {
    return value.name === undefined && bytes(value.value) <= 256;
  }
  if (value.kind === 'attribute') {
    return (
      typeof value.name === 'string' &&
      ['title', 'aria-label'].includes(value.name) &&
      safeAttributeText(value.value)
    );
  }
  if (typeof value.name !== 'string') return false;
  const rule = styleRules[value.name];
  return rule !== undefined && rule.test(value.value);
}

export function decodeRunnerStep(
  value: unknown,
  sessionId: string,
  stepId: string,
  allowedNodes: ReadonlySet<string>,
): RunnerStep | null {
  if (
    !record(value) ||
    Object.keys(value).length !== 7 ||
    value.type !== 'step' ||
    value.sessionId !== sessionId ||
    value.stepId !== stepId ||
    !interactiveStatus(value.status) ||
    typeof value.message !== 'string' ||
    bytes(value.message) > 1_024 ||
    !stringArray(value.output) ||
    value.output.length > INTERACTIVE_LIMITS.outputEntries ||
    bytes(value.output.join('')) > INTERACTIVE_LIMITS.outputBytes ||
    !Array.isArray(value.mutations) ||
    value.mutations.length > INTERACTIVE_LIMITS.mutations ||
    !value.mutations.every((mutation): mutation is InteractiveMutation =>
      validInteractiveMutation(mutation, allowedNodes),
    ) ||
    packetSize(value) > INTERACTIVE_LIMITS.packetBytes
  )
    return null;
  return {
    type: 'step',
    sessionId,
    stepId,
    status: value.status,
    message: value.message,
    output: value.output,
    mutations: value.mutations,
  };
}

export function decodeDisplayPacket(
  value: unknown,
  generationId: string,
  allowedNodes: ReadonlySet<string>,
): DisplayPacket | null {
  if (
    !record(value) ||
    value.generationId !== generationId ||
    typeof value.type !== 'string' ||
    packetSize(value) > 1_024
  )
    return null;
  if (displayStatus(value.type) && Object.keys(value).length === 2) {
    return { type: value.type, generationId };
  }
  if (
    value.type === 'applied' &&
    Object.keys(value).length === 3 &&
    typeof value.stepId === 'string' &&
    value.stepId.length <= 64
  ) {
    return { type: 'applied', generationId, stepId: value.stepId };
  }
  if (
    value.type === 'interaction' &&
    Object.keys(value).length === 4 &&
    typeof value.eventId === 'string' &&
    value.eventId.length <= 64 &&
    record(value.event) &&
    Object.keys(value.event).length ===
      (value.event.value === undefined ? 2 : 3) &&
    interactionType(value.event.type) &&
    typeof value.event.targetId === 'string' &&
    allowedNodes.has(value.event.targetId) &&
    (value.event.value === undefined ||
      (typeof value.event.value === 'string' &&
        bytes(value.event.value) <= 256))
  ) {
    return {
      type: 'interaction',
      generationId,
      eventId: value.eventId,
      event: {
        type: value.event.type,
        targetId: value.event.targetId,
        ...(value.event.value === undefined
          ? {}
          : { value: value.event.value }),
      },
    };
  }
  return null;
}
