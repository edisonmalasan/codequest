export const OBSERVED_EVENTS = [
  'first_quest_started',
  'first_code_run',
  'code_run',
  'validation_checked',
  'hint_used',
  'execution_error',
  'validation_failed',
] as const;

export type ObservedEventName = (typeof OBSERVED_EVENTS)[number];
type Cohort = 'guest' | 'account';
const SAFE_VALUE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const QUEST_ID = /^(?:Q|CAP)\d{2,3}$/;
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
const PROPERTY_KEYS = new Set([
  'quest_id',
  'content_version',
  'assessment_version',
  'outcome_category',
  'error_category',
]);
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ObservedEvent {
  readonly name: ObservedEventName;
  readonly ownerId: string | null;
  readonly eventId: string;
  readonly properties?: Readonly<Record<string, string>>;
}

export function observedPayload(event: ObservedEvent, guestId: string) {
  if (
    !OBSERVED_EVENTS.includes(event.name) ||
    !UUID.test(event.eventId) ||
    (event.ownerId !== null && !UUID.test(event.ownerId)) ||
    !UUID.test(guestId)
  )
    throw new Error('Invalid observed analytics event');
  const cohort: Cohort = event.ownerId === null ? 'guest' : 'account';
  const properties: Record<string, string | number> = {
    contract_version: 1,
    source_trust: 'client_observed',
    cohort,
    event_id: event.eventId,
  };
  for (const [key, value] of Object.entries(event.properties ?? {})) {
    if (
      !PROPERTY_KEYS.has(key) ||
      !SAFE_VALUE.test(value) ||
      (key === 'quest_id' && !QUEST_ID.test(value)) ||
      ((key === 'content_version' || key === 'assessment_version') &&
        !VERSION.test(value)) ||
      ((key === 'outcome_category' || key === 'error_category') &&
        !CATEGORIES.has(value))
    )
      throw new Error('Invalid observed analytics property');
    properties[key] = value;
  }
  return {
    event: event.name,
    distinct_id: event.ownerId ?? guestId,
    properties,
  };
}

export function observedEndpoint(config: {
  approved?: string;
  projectKey?: string;
  host?: string;
}): string | null {
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

export interface ObservedAnalyticsConfig {
  readonly approved?: string;
  readonly projectKey?: string;
  readonly host?: string;
}

export class ObservedAnalytics {
  private readonly endpoint: string | null;
  private guestId: string | null = null;
  private currentOwner: string | null = null;
  private readonly firstRuns = new Set<string>();
  private readonly firstGuestStarts = new Set<string>();

  constructor(
    private readonly config: ObservedAnalyticsConfig,
    private readonly transport: typeof fetch = fetch,
  ) {
    this.endpoint = observedEndpoint(config);
  }

  ownerChanged(nextOwner: string | null): void {
    if (this.currentOwner === nextOwner) return;
    this.currentOwner = nextOwner;
    this.guestId = null;
    this.firstGuestStarts.clear();
    this.firstRuns.delete('guest');
  }

  capture(event: ObservedEvent): void {
    if (!this.endpoint || typeof navigator === 'undefined' || !navigator.onLine)
      return;
    try {
      const guestId = event.ownerId ?? (this.guestId ??= crypto.randomUUID());
      const payload = observedPayload(event, guestId);
      void this.transport(this.endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, api_key: this.config.projectKey }),
      }).catch(() => undefined);
    } catch {
      // Analytics is optional; a malformed event cannot interrupt learning.
    }
  }

  firstRun(
    ownerId: string | null,
    properties: Readonly<Record<string, string>>,
  ): void {
    if (!this.endpoint || typeof navigator === 'undefined' || !navigator.onLine)
      return;
    const key = ownerId ?? 'guest';
    if (this.firstRuns.has(key)) return;
    this.firstRuns.add(key);
    this.capture({
      name: 'first_code_run',
      ownerId,
      eventId: crypto.randomUUID(),
      properties,
    });
  }

  guestFirstStart(
    questId: string,
    properties: Readonly<Record<string, string>>,
  ): void {
    if (
      !this.endpoint ||
      typeof navigator === 'undefined' ||
      !navigator.onLine ||
      this.firstGuestStarts.has(questId) ||
      this.firstGuestStarts.size > 0
    )
      return;
    this.firstGuestStarts.add(questId);
    this.capture({
      name: 'first_quest_started',
      ownerId: null,
      eventId: crypto.randomUUID(),
      properties,
    });
  }
}

const analytics = new ObservedAnalytics({
  approved: process.env.NEXT_PUBLIC_ANALYTICS_CAPTURE_APPROVED,
  projectKey: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_KEY,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

export function captureObserved(event: ObservedEvent): void {
  analytics.capture(event);
}

export function updateObservedOwner(nextOwner: string | null): void {
  analytics.ownerChanged(nextOwner);
}

export function captureFirstRun(
  ownerId: string | null,
  properties: Readonly<Record<string, string>>,
): void {
  analytics.firstRun(ownerId, properties);
}

export function captureGuestFirstStart(
  questId: string,
  properties: Readonly<Record<string, string>>,
): void {
  analytics.guestFirstStart(questId, properties);
}
