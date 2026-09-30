import { Injectable, Logger } from '@nestjs/common';

export const ANALYTICS_EVENTS = [
  'signup_completed',
  'first_quest_started',
  'first_code_run',
  'code_run',
  'validation_checked',
  'first_quest_completed',
  'quest_attempted',
  'quest_completed',
  'quest_failed',
  'hint_used',
  'execution_error',
  'validation_failed',
  'capstone_started',
  'capstone_completed',
  'streak_continued',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
const BACKEND_EVENTS: readonly AnalyticsEventName[] = [
  'signup_completed',
  'first_quest_started',
  'first_quest_completed',
  'quest_attempted',
  'quest_completed',
  'quest_failed',
  'hint_used',
  'capstone_started',
  'capstone_completed',
  'streak_continued',
];
export type AnalyticsCohort = 'account' | 'guest';
export type AnalyticsSource = 'backend_fact' | 'client_observed';

const PROPERTY_KEYS = new Set([
  'quest_id',
  'content_version',
  'assessment_version',
  'outcome_category',
  'error_category',
  'chapter_id',
]);
const SAFE_VALUE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const QUEST_ID = /^(?:Q|CAP)\d{2,3}$/;
const CHAPTER_ID = /^CH\d{2,3}$/;
const VERSION = /^\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const CATEGORIES = new Set([
  'success',
  'syntax-error',
  'runtime-error',
  'timeout',
  'output-limit',
  'internal-error',
  'passed',
  'failed',
]);
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AnalyticsFact {
  readonly name: AnalyticsEventName;
  readonly ownerId: string;
  readonly factId: string;
  readonly occurredAt?: Date;
  readonly properties?: Readonly<Record<string, string>>;
}

export interface AnalyticsPayload {
  readonly event: AnalyticsEventName;
  readonly distinct_id: string;
  readonly timestamp?: string;
  readonly properties: Readonly<Record<string, string | number>>;
}

export function backendAnalyticsPayload(fact: AnalyticsFact): AnalyticsPayload {
  if (
    !BACKEND_EVENTS.includes(fact.name) ||
    !UUID.test(fact.ownerId) ||
    !SAFE_VALUE.test(fact.factId)
  )
    throw new Error('Invalid analytics fact');
  const properties: Record<string, string | number> = {
    contract_version: 1,
    source_trust: 'backend_fact',
    cohort: 'account',
    event_id: `${fact.name}:${fact.ownerId}:${fact.factId}`,
  };
  if (
    [
      'quest_attempted',
      'quest_failed',
      'quest_completed',
      'first_quest_completed',
      'capstone_completed',
      'streak_continued',
    ].includes(fact.name)
  )
    properties.client_reported = 'true';
  for (const [key, value] of Object.entries(fact.properties ?? {})) {
    if (
      !PROPERTY_KEYS.has(key) ||
      !SAFE_VALUE.test(value) ||
      (key === 'quest_id' && !QUEST_ID.test(value)) ||
      (key === 'chapter_id' && !CHAPTER_ID.test(value)) ||
      ((key === 'content_version' || key === 'assessment_version') &&
        !VERSION.test(value)) ||
      ((key === 'outcome_category' || key === 'error_category') &&
        !CATEGORIES.has(value))
    )
      throw new Error('Invalid analytics property');
    properties[key] = value;
  }
  if (fact.occurredAt && !Number.isFinite(fact.occurredAt.getTime()))
    throw new Error('Invalid analytics timestamp');
  return {
    event: fact.name,
    distinct_id: fact.ownerId,
    ...(fact.occurredAt ? { timestamp: fact.occurredAt.toISOString() } : {}),
    properties,
  };
}

export interface AnalyticsConfig {
  readonly approved?: string;
  readonly projectKey?: string;
  readonly host?: string;
}

export function analyticsEndpoint(config: AnalyticsConfig): string | null {
  if (
    config.approved !== 'true' ||
    !config.projectKey ||
    !/^[A-Za-z0-9_-]{8,128}$/.test(config.projectKey) ||
    !config.host
  )
    return null;
  try {
    const url = new URL(config.host);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      return null;
    return `${url.origin}/capture/`;
  } catch {
    return null;
  }
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly endpoint: string | null;

  constructor(
    private readonly config: AnalyticsConfig,
    private readonly transport: typeof fetch = fetch,
  ) {
    this.endpoint = analyticsEndpoint(config);
  }

  async capture(fact: AnalyticsFact): Promise<void> {
    if (!this.endpoint) return;
    try {
      const payload = backendAnalyticsPayload(fact);
      const response = await this.transport(this.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, api_key: this.config.projectKey }),
        signal: AbortSignal.timeout(1500),
      });
      if (!response.ok) this.logger.warn('Analytics capture failed');
    } catch {
      this.logger.warn('Analytics capture failed');
    }
  }
}
