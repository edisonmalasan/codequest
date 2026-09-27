function parseOrigin(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.origin === 'null' ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    const loopback = ['localhost', '127.0.0.1', '127.0.0.2', '[::1]'].includes(
      url.hostname,
    );
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function resolvePreviewOrigin(
  configured: string | undefined,
  applicationOrigin: string,
  runnerOrigin: string | null,
): string | null {
  const preview = parseOrigin(configured);
  if (!preview) return null;
  if (
    preview.origin === applicationOrigin ||
    (runnerOrigin !== null && preview.origin === runnerOrigin)
  ) {
    return null;
  }
  return preview.origin;
}
