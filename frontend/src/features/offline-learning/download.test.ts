import { describe, expect, it, vi } from 'vitest';
import { questFixtures } from '@/features/curriculum/journey-course-test-data';
import { IndexedDbLessonSnapshotRepository } from '@/lib/local-persistence';
import { lessonImagePaths, saveLessonForOffline } from './download';

describe('explicit lesson download', () => {
  it('extracts only local versioned image paths and deduplicates them', () => {
    expect(
      lessonImagePaths(
        '![A](./assets/a.png) ![B](./assets/a.png) ![C](https://bad.test/a.png)',
      ),
    ).toEqual(['assets/a.png']);
    expect(
      lessonImagePaths(
        '![Reference][image]\n\n[image]: ./assets/reference.webp\n\n`![Code](./assets/code.png)`',
      ),
    ).toEqual(['assets/reference.webp']);
  });
  it('fetches public illustrations without credentials and saves only after all succeed', async () => {
    const repository = new IndexedDbLessonSnapshotRepository();
    const save = vi.spyOn(repository, 'saveDownloaded').mockResolvedValue();
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('image', {
        headers: { 'content-type': 'image/png' },
      }),
    );
    await saveLessonForOffline(
      'guest',
      { ...questFixtures.Q01, lesson: '![A](./assets/a.png)' },
      'https://api.test',
      repository,
      request,
    );
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining('/assets/1.0.0?path=assets%2Fa.png'),
      {
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
      },
    );
    expect(save).toHaveBeenCalledOnce();
    save.mockClear();
    request.mockResolvedValue(new Response('bad', { status: 500 }));
    await expect(
      saveLessonForOffline(
        'guest',
        { ...questFixtures.Q01, lesson: '![A](./assets/a.png)' },
        'https://api.test',
        repository,
        request,
      ),
    ).rejects.toThrow();
    expect(save).not.toHaveBeenCalled();
  });
  it('rejects oversized streamed illustrations before writing a snapshot', async () => {
    const repository = new IndexedDbLessonSnapshotRepository();
    const save = vi.spyOn(repository, 'saveDownloaded').mockResolvedValue();
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('x'.repeat(524289), {
        headers: { 'content-type': 'image/png' },
      }),
    );
    await expect(
      saveLessonForOffline(
        'guest',
        { ...questFixtures.Q01, lesson: '![A](./assets/a.png)' },
        'https://api.test',
        repository,
        request,
      ),
    ).rejects.toThrow(/limit/);
    expect(save).not.toHaveBeenCalled();
  });
});
