import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { exportJWK, generateKeyPair, jwtVerify, SignJWT } from 'jose';

// Test process only. The private key and registered users never leave this process.
const issuer = 'http://127.0.0.1:54321/auth/v1';
const { privateKey, publicKey } = await generateKeyPair('RS256');
const publicJwk = {
  ...(await exportJWK(publicKey)),
  kid: 'learning-test-key',
  alg: 'RS256',
  use: 'sig',
};
const users = new Map();

function respond(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
    'access-control-allow-origin': 'http://127.0.0.1:3200',
    'access-control-allow-headers':
      'apikey, authorization, content-type, x-client-info, x-supabase-api-version',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let input = '';
  for await (const chunk of request) {
    input += chunk;
    if (input.length > 4096) throw new Error('Request too large');
  }
  return JSON.parse(input);
}

async function sessionFor(user) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await new SignJWT({
    email: user.email,
    role: 'authenticated',
  })
    .setProtectedHeader({ alg: 'RS256', kid: publicJwk.kid })
    .setIssuer(issuer)
    .setAudience('authenticated')
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);
  return {
    user,
    access_token: accessToken,
    refresh_token: randomUUID(),
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: now + 3600,
  };
}

createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') return respond(response, 204, {});
    const path = new URL(request.url ?? '/', issuer).pathname;
    if (request.method === 'GET' && path === '/auth/v1/.well-known/jwks.json')
      return respond(response, 200, { keys: [publicJwk] });
    if (request.method === 'POST' && path === '/auth/v1/signup') {
      const input = await readJson(request);
      if (
        typeof input.email !== 'string' ||
        !/^[^@]+@[^@]+$/.test(input.email) ||
        typeof input.password !== 'string' ||
        input.password.length < 8
      )
        return respond(response, 400, { msg: 'Invalid registration' });
      const user = {
        id: randomUUID(),
        aud: 'authenticated',
        role: 'authenticated',
        email: input.email,
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        identities: [],
      };
      users.set(user.id, user);
      return respond(response, 200, await sessionFor(user));
    }
    if (request.method === 'GET' && path === '/auth/v1/user') {
      const token = request.headers.authorization?.replace(/^Bearer /i, '');
      if (!token) return respond(response, 401, { msg: 'Missing session' });
      const { payload } = await jwtVerify(token, publicKey, {
        issuer,
        audience: 'authenticated',
      });
      const user = users.get(payload.sub);
      return user
        ? respond(response, 200, user)
        : respond(response, 401, { msg: 'Unknown session' });
    }
    return respond(response, 404, { msg: 'Unknown test fixture route' });
  } catch {
    return respond(response, 400, { msg: 'Invalid test fixture request' });
  }
}).listen(54321, '127.0.0.1');
