export interface CapstoneResponses {
  readonly explanation: string;
  readonly transfer: string;
}

export function readCapstoneResponses(
  value: unknown,
): CapstoneResponses | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null;
  if (!('explanation' in value) || !('transfer' in value)) return null;
  const { explanation, transfer } = value;
  if (Object.keys(value).length !== 2) return null;
  for (const text of [explanation, transfer]) {
    if (
      typeof text !== 'string' ||
      !text.trim() ||
      text.length > 2000 ||
      new TextEncoder().encode(text).length > 4000
    )
      return null;
  }
  if (typeof explanation !== 'string' || typeof transfer !== 'string')
    return null;
  return { explanation, transfer };
}
