import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ObservedAnalytics,
  captureObserved,
  observedEndpoint,
  observedPayload,
} from './observed-analytics';

const OWNER = '00000000-0000-4000-8000-000000000001';
const GUEST = '00000000-0000-4000-8000-000000000002';
const EVENT = '00000000-0000-4000-8000-000000000003';

describe('bounded observed analytics', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('keeps guest and account cohorts distinct without private fields', () => {
    const event = {
      name: 'first_code_run' as const,
      ownerId: null,
      eventId: EVENT,
      properties: { quest_id: 'Q01' },
    };
    expect(observedPayload(event, GUEST)).toMatchObject({
      event: 'first_code_run',
      distinct_id: GUEST,
      properties: { cohort: 'guest', source_trust: 'client_observed' },
    });
    expect(observedPayload({ ...event, ownerId: OWNER }, GUEST)).toMatchObject({
      distinct_id: OWNER,
      properties: { cohort: 'account' },
    });
    const badProperties: Readonly<Record<string, string>>[] = [
      { source: 'private code' },
      { report: 'private report' },
      { url: '/lesson?token=secret' },
      { quest_id: 'x'.repeat(129) },
      { outcome_category: 'privateSecret' },
    ];
    for (const properties of badProperties)
      expect(() => observedPayload({ ...event, properties }, GUEST)).toThrow();
    expect(() =>
      observedPayload(
        { ...event, name: 'quest_completed' as typeof event.name },
        GUEST,
      ),
    ).toThrow();
    expect(observedPayload({ ...event, name: 'code_run' }, GUEST).event).toBe(
      'code_run',
    );
    expect(
      observedPayload({ ...event, name: 'validation_checked' }, GUEST).event,
    ).toBe('validation_checked');
  });

  it('requires explicit HTTPS approval and makes no default request or identifier', () => {
    expect(
      observedEndpoint({
        projectKey: 'valid_key_123',
        host: 'https://capture.example.test',
      }),
    ).toBeNull();
    expect(
      observedEndpoint({
        approved: 'true',
        projectKey: 'valid_key_123',
        host: 'http://capture.example.test',
      }),
    ).toBeNull();
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const uuid = vi.spyOn(crypto, 'randomUUID');
    captureObserved({ name: 'first_code_run', ownerId: null, eventId: EVENT });
    expect(fetcher).not.toHaveBeenCalled();
    expect(uuid).not.toHaveBeenCalled();
    fetcher.mockRestore();
    uuid.mockRestore();
  });

  it('sends an explicit event to a fake collector without credentials or source', () => {
    vi.stubGlobal('navigator', { onLine: true });
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const adapter = new ObservedAnalytics(
      {
        approved: 'true',
        projectKey: 'fixture_key_123',
        host: 'https://capture.example.test',
      },
      fetcher,
    );
    adapter.capture({
      name: 'validation_failed',
      ownerId: OWNER,
      eventId: EVENT,
      properties: { quest_id: 'Q01' },
    });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, request] = fetcher.mock.calls[0];
    expect(url).toBe('https://capture.example.test/capture/');
    expect(request).toMatchObject({
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
    });
    expect(JSON.parse(request?.body as string)).toMatchObject({
      event: 'validation_failed',
      distinct_id: OWNER,
      properties: { source_trust: 'client_observed', cohort: 'account' },
    });
    expect(request?.body).not.toContain('private code');
  });

  it('invokes the default browser transport with its required global receiver', () => {
    vi.stubGlobal('navigator', { onLine: true });
    const fetcher = vi.fn(function (this: typeof globalThis) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(new Response(null, { status: 200 }));
    });
    vi.stubGlobal('fetch', fetcher);
    const adapter = new ObservedAnalytics({
      approved: 'true',
      projectKey: 'fixture_key_123',
      host: 'https://capture.example.test',
    });
    adapter.capture({ name: 'code_run', ownerId: OWNER, eventId: EVENT });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('keeps guest identities separate across owner switches and sends nothing offline', () => {
    vi.stubGlobal('navigator', { onLine: true });
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const adapter = new ObservedAnalytics(
      {
        approved: 'true',
        projectKey: 'fixture_key_123',
        host: 'https://capture.example.test',
      },
      fetcher,
    );
    adapter.capture({ name: 'code_run', ownerId: null, eventId: EVENT });
    adapter.ownerChanged(OWNER);
    adapter.capture({
      name: 'code_run',
      ownerId: OWNER,
      eventId: crypto.randomUUID(),
    });
    adapter.ownerChanged(null);
    adapter.capture({
      name: 'validation_checked',
      ownerId: null,
      eventId: crypto.randomUUID(),
    });
    const identities = fetcher.mock.calls.map(
      ([, request]) => JSON.parse(request.body as string).distinct_id as string,
    );
    expect(identities[0]).not.toBe(identities[2]);
    expect(identities[1]).toBe(OWNER);
    vi.stubGlobal('navigator', { onLine: false });
    adapter.capture({
      name: 'code_run',
      ownerId: null,
      eventId: crypto.randomUUID(),
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
