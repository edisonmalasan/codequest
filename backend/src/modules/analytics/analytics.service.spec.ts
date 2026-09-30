import { describe, expect, it, vi } from 'vitest';
import {
  AnalyticsService,
  analyticsEndpoint,
  backendAnalyticsPayload,
} from './analytics.service';

const OWNER = '00000000-0000-4000-8000-000000000001';
const FACT = '00000000-0000-4000-8000-000000000101';
const allowed = {
  name: 'quest_completed' as const,
  ownerId: OWNER,
  factId: FACT,
  properties: { quest_id: 'Q01', content_version: '1.0.0' },
};

describe('bounded backend analytics', () => {
  it('rejects unknown names, private fields, malformed identities and oversized values', () => {
    expect(backendAnalyticsPayload(allowed)).toEqual({
      event: 'quest_completed',
      distinct_id: OWNER,
      properties: {
        contract_version: 1,
        source_trust: 'backend_fact',
        cohort: 'account',
        client_reported: 'true',
        event_id: `quest_completed:${OWNER}:${FACT}`,
        quest_id: 'Q01',
        content_version: '1.0.0',
      },
    });
    const badProperties: Readonly<Record<string, string>>[] = [
      { source: 'private code' },
      { output: 'private output' },
      { email: 'person@example.test' },
      { quest_id: 'x'.repeat(129) },
      { quest_id: 'Q01?token=secret' },
      { error_category: 'privateSecret' },
    ];
    for (const properties of badProperties) {
      expect(() =>
        backendAnalyticsPayload({ ...allowed, properties }),
      ).toThrow();
    }
    expect(() =>
      backendAnalyticsPayload({
        ...allowed,
        name: 'pageview' as typeof allowed.name,
      }),
    ).toThrow();
    expect(() =>
      backendAnalyticsPayload({
        ...allowed,
        name: 'code_run' as typeof allowed.name,
      }),
    ).toThrow();
    expect(() =>
      backendAnalyticsPayload({ ...allowed, ownerId: 'someone@example.test' }),
    ).toThrow();
  });

  it('makes no request without explicit approval, key and HTTPS host', async () => {
    const fetcher = vi.fn();
    for (const config of [
      {},
      { projectKey: 'valid_key_123', host: 'https://capture.example.test' },
      {
        approved: 'true',
        projectKey: 'valid_key_123',
        host: 'http://capture.example.test',
      },
      {
        approved: 'true',
        projectKey: 'short',
        host: 'https://capture.example.test',
      },
    ]) {
      const service = new AnalyticsService(config, fetcher);
      await service.capture(allowed);
      expect(analyticsEndpoint(config)).toBeNull();
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('sends a bounded payload to a fake collector and isolates failure', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const service = new AnalyticsService(
      {
        approved: 'true',
        projectKey: 'valid_key_123',
        host: 'https://capture.example.test',
      },
      fetcher,
    );
    await service.capture(allowed);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, request] = fetcher.mock.calls[0];
    expect(url).toBe('https://capture.example.test/capture/');
    expect(request.headers).toEqual({ 'content-type': 'application/json' });
    const body = JSON.parse(request.body as string);
    expect(body).toMatchObject({
      event: 'quest_completed',
      distinct_id: OWNER,
      api_key: 'valid_key_123',
    });
    expect(JSON.stringify(body)).not.toContain('private code');
    fetcher.mockRejectedValueOnce(new Error('collector unavailable'));
    await expect(service.capture(allowed)).resolves.toBeUndefined();
  });
});
