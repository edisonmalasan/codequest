import type { QuestDetail } from '@/lib/api-client';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { lessonAssetUrl } from '@/features/curriculum/lesson-document';
import { resolveRunnerOrigin } from '@/features/runtime';
import {
  lessonSnapshotRepository,
  LOCAL_LIMITS,
  type IndexedDbLessonSnapshotRepository,
} from '@/lib/local-persistence';

export function lessonImagePaths(markdown: string): string[] {
  const processor = unified().use(remarkParse).use(remarkRehype);
  const tree = processor.runSync(processor.parse(markdown));
  const paths = new Set<string>();
  const visit = (node: (typeof tree.children)[number] | typeof tree) => {
    if (node.type === 'element' && node.tagName === 'img') {
      const source = node.properties.src;
      if (
        typeof source === 'string' &&
        /^\.\/assets\/[a-zA-Z0-9/_-]+\.(?:png|webp)$/.test(source)
      )
        paths.add(source.slice(2));
    }
    if ('children' in node) node.children.forEach(visit);
  };
  visit(tree);
  return [...paths];
}

async function boundedImage(response: Response): Promise<Blob> {
  const mime = response.headers.get('content-type')?.split(';')[0].trim();
  if (
    !response.ok ||
    response.redirected ||
    !mime ||
    !['image/png', 'image/webp'].includes(mime)
  )
    throw new Error('Lesson illustration unavailable');
  const claimedSize = Number(response.headers.get('content-length'));
  if (claimedSize > LOCAL_LIMITS.lessonAssetBytes)
    throw new Error('Lesson illustration exceeds the device limit');
  if (!response.body) throw new Error('Lesson illustration unavailable');
  const reader = response.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > LOCAL_LIMITS.lessonAssetBytes)
        throw new Error('Lesson illustration exceeds the device limit');
      const copy = new Uint8Array(value.byteLength);
      copy.set(value);
      chunks.push(copy.buffer);
    }
  } catch (error) {
    await reader.cancel();
    throw error;
  } finally {
    reader.releaseLock();
  }
  if (bytes === 0) throw new Error('Lesson illustration unavailable');
  return new Blob(chunks, { type: mime });
}

export async function saveLessonForOffline(
  ownerId: string,
  quest: QuestDetail,
  apiBaseUrl: string,
  repository: IndexedDbLessonSnapshotRepository = lessonSnapshotRepository,
  request: typeof fetch = fetch,
): Promise<void> {
  const paths = lessonImagePaths(quest.lesson);
  if (paths.length > 8)
    throw new Error('Lesson has too many illustrations for offline storage');
  const assets = new Map<string, Blob>();
  let bytes = 0;
  for (const path of paths) {
    const url = lessonAssetUrl(
      `./${path}`,
      quest.slug,
      quest.contentVersion,
      apiBaseUrl,
    );
    if (!url) throw new Error('Lesson illustration unavailable');
    const response = await request(url, {
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
    });
    const blob = await boundedImage(response);
    bytes += blob.size;
    if (bytes > LOCAL_LIMITS.lessonAssetsBytes)
      throw new Error('Lesson illustrations exceed the device limit');
    assets.set(path, blob);
  }
  await repository.saveDownloaded(ownerId, quest, assets);
}

export async function prepareOfflineRunner(): Promise<boolean> {
  if (!navigator.onLine || !('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration('/');
  if (
    !registration?.active ||
    !navigator.serviceWorker.controller ||
    registration.installing ||
    registration.waiting
  )
    return false;
  const cachedDocument = await caches.match('/offline-learning', {
    ignoreSearch: true,
  });
  if (!cachedDocument) return false;
  const origin = resolveRunnerOrigin(
    process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
    window.location.origin,
  );
  if (!origin) return false;
  const setupId = crypto.randomUUID();
  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.title = 'Prepare isolated offline JavaScript runner';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  const url = new URL('/runtime/offline-setup.html', origin);
  url.searchParams.set('parentOrigin', window.location.origin);
  url.hash = setupId;
  frame.src = url.href;
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve(ready && !registration.installing && !registration.waiting);
    };
    const onMessage = (event: MessageEvent<unknown>) => {
      if (
        event.source !== frame.contentWindow ||
        event.origin !== origin ||
        typeof event.data !== 'object' ||
        event.data === null ||
        !('type' in event.data) ||
        event.data.type !== 'offline-runner-setup' ||
        !('setupId' in event.data) ||
        event.data.setupId !== setupId ||
        !('status' in event.data) ||
        (event.data.status !== 'ready' && event.data.status !== 'unavailable')
      )
        return;
      finish(event.data.status === 'ready');
    };
    const timer = window.setTimeout(() => finish(false), 15_000);
    window.addEventListener('message', onMessage);
    frame.addEventListener('error', () => finish(false), { once: true });
    document.body.append(frame);
  });
}
