const DEFAULT_RETURN_PATH = '/account';

function hasUnsafeCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return character === '\\' || code <= 31 || code === 127;
  });
}

export function safeReturnPath(value: string | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    value.length === 0 ||
    value.length > 512 ||
    hasUnsafeCharacter(value)
  ) {
    return DEFAULT_RETURN_PATH;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return DEFAULT_RETURN_PATH;
  }
  if (
    hasUnsafeCharacter(decoded) ||
    !decoded.startsWith('/') ||
    decoded.startsWith('//')
  ) {
    return DEFAULT_RETURN_PATH;
  }

  const base = new URL('https://codequest.local');
  const destination = new URL(decoded, base);
  if (destination.origin !== base.origin) return DEFAULT_RETURN_PATH;
  return `${destination.pathname}${destination.search}`;
}
