import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

const bootstrapPolicy =
  "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const workerPolicy =
  "default-src 'none'; script-src 'unsafe-eval'; worker-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'";

function fixture(bad = '') {
  const handlers = new Map<string, (event: unknown) => void>();
  const records = new Map<string, Response>();
  const cache = {
    put: async (path: string, response: Response) => {
      records.set(path, response.clone());
    },
    match: async (path: string) => records.get(path)?.clone(),
  };
  const remove = vi.fn(async () => {
    records.clear();
    return true;
  });
  const request = vi.fn(async (input: Request) => {
    const path = new URL(input.url).pathname;
    const body =
      bad === 'bytes'
        ? 'wrong'
        : bad === 'oversize'
          ? 'x'.repeat(65537)
          : readFileSync(`public${path}`);
    return new Response(body, {
      headers: {
        'content-type':
          bad === 'mime'
            ? 'text/plain'
            : path.endsWith('.html')
              ? 'text/html'
              : 'application/javascript',
        'content-security-policy':
          bad === 'csp'
            ? 'default-src *'
            : path.endsWith('-worker.js')
              ? workerPolicy
              : bootstrapPolicy,
      },
    });
  });
  class OriginRequest extends Request {
    constructor(input: string, options?: RequestInit) {
      super(new URL(input, 'https://runner.test'), options);
    }
  }
  runInNewContext(readFileSync('public/runtime/offline-sw.js', 'utf8'), {
    self: {
      location: { origin: 'https://runner.test' },
      clients: { claim: vi.fn() },
      addEventListener: (type: string, handler: (event: unknown) => void) =>
        handlers.set(type, handler),
    },
    caches: { open: async () => cache, delete: remove, keys: async () => [] },
    crypto: webcrypto,
    Request: OriginRequest,
    Response,
    URL,
    Uint8Array,
    fetch: request,
  });
  const install = async () => {
    let result: Promise<void> | undefined;
    handlers.get('install')?.({
      waitUntil: (value: Promise<void>) => {
        result = value;
      },
    });
    await result;
  };
  const serve = (url: string, options?: RequestInit) => {
    let result: Promise<Response> | undefined;
    handlers.get('fetch')?.({
      request: new Request(url, options),
      respondWith: (value: Promise<Response>) => {
        result = value;
      },
    });
    return result;
  };
  return { install, serve, records, request, remove };
}

describe('fixed isolated offline runtime cache', () => {
  it('pins six resource bytes and policies with credential-free installation', async () => {
    const test = fixture();
    await test.install();
    expect(test.records.size).toBe(6);
    expect(
      test.request.mock.calls.every(
        ([request]) => request.credentials === 'omit',
      ),
    ).toBe(true);
    const response = await test.serve(
      'https://runner.test/runtime/bootstrap.html?parentOrigin=https%3A%2F%2Fapp.test',
    );
    expect(response?.status).toBe(200);
    expect(response?.headers.get('content-security-policy')).toBe(
      bootstrapPolicy,
    );
    for (const url of [
      'https://runner.test/runtime/bootstrap.html?unknown=1',
      'https://runner.test/runtime/offline-sw.js',
      'https://runner.test/api/me',
      'https://app.test/runtime/bootstrap.html',
    ])
      expect(test.serve(url)).toBeUndefined();
    expect(
      test.serve('https://runner.test/runtime/bootstrap.html', {
        headers: { authorization: 'Bearer fixture' },
      }),
    ).toBeUndefined();
  });
  it.each(['bytes', 'csp', 'mime', 'oversize'])(
    'rejects mismatched %s and removes incomplete installation',
    async (kind) => {
      const test = fixture(kind);
      await expect(test.install()).rejects.toThrow();
      expect(test.remove).toHaveBeenCalledWith('codequest-runtime-1');
      expect(test.records.size).toBe(0);
    },
  );
  it('does not serve cache bytes or policies altered after installation', async () => {
    const test = fixture();
    await test.install();
    test.request.mockRejectedValue(new Error('offline'));
    test.records.set('/runtime/javascript-worker.js', new Response('tampered'));
    expect(
      (await test.serve('https://runner.test/runtime/javascript-worker.js'))
        ?.type,
    ).toBe('error');
  });
});
