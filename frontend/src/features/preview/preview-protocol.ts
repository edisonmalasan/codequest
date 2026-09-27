import { PREVIEW_LIMITS } from './preview-types';

export type PreviewResponseKind = 'ready' | 'error' | 'stale' | 'invalid';

export function classifyPreviewResponse(
  packet: unknown,
  generationId: string,
  readySeen: boolean,
): PreviewResponseKind {
  if (typeof packet !== 'object' || packet === null || Array.isArray(packet))
    return 'invalid';
  let encoded: string | undefined;
  try {
    encoded = JSON.stringify(packet);
  } catch {
    return 'invalid';
  }
  if (
    !encoded ||
    new TextEncoder().encode(encoded).length > PREVIEW_LIMITS.packetBytes
  )
    return 'invalid';
  if (!('generationId' in packet) || packet.generationId !== generationId)
    return 'stale';
  if (
    Object.keys(packet).length !== 2 ||
    !('type' in packet) ||
    typeof packet.type !== 'string'
  )
    return 'invalid';
  if (packet.type === 'ready') return readySeen ? 'invalid' : 'ready';
  if (packet.type === 'error') return 'error';
  return 'invalid';
}
