import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
  checkHistory,
  rewrittenSnapshots,
} from './check-curriculum-history.mjs';

const oldPath =
  'backend/content/journeys/j/chapters/c/quests/q/versions/1.0.0/lesson.mdx';
const newPath =
  'backend/content/journeys/j/chapters/c/quests/q/versions/1.0.1/lesson.mdx';

test('editing or deleting a merged snapshot fails the history check', () => {
  const old = new Set([oldPath]);
  assert.deepEqual(rewrittenSnapshots(old, [['M', oldPath]]), [['M', oldPath]]);
  assert.deepEqual(rewrittenSnapshots(old, [['D', oldPath]]), [['D', oldPath]]);
});

test('adding a new snapshot preserves old history', () => {
  assert.deepEqual(
    rewrittenSnapshots(new Set([oldPath]), [['A', newPath]]),
    [],
  );
});

test('Git merge-base check rejects a rewritten merged snapshot and accepts a new version', () => {
  const root = mkdtempSync(join(tmpdir(), 'codequest-history-'));
  const git = (...args) =>
    execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  try {
    git('init', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');
    mkdirSync(dirname(join(root, oldPath)), { recursive: true });
    writeFileSync(join(root, oldPath), 'original');
    git('add', '.');
    git('commit', '-m', 'baseline');
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    git('switch', '-c', 'test/new-version');
    writeFileSync(join(root, oldPath), 'rewritten');
    assert.throws(() => checkHistory(root), /must not change/);
    git('restore', '--', oldPath);
    mkdirSync(dirname(join(root, newPath)), { recursive: true });
    writeFileSync(join(root, newPath), 'new version');
    git('add', newPath);
    assert.doesNotThrow(() => checkHistory(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('one exact Course-path relocation preserves immutable snapshot bytes', () => {
  const root = mkdtempSync(join(tmpdir(), 'codequest-course-history-'));
  const git = (...args) =>
    execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  const previous =
    'backend/content/journeys/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/lesson.mdx';
  const relocated = previous.replace(
    '/chapters/',
    '/courses/javascript-foundations/chapters/',
  );
  try {
    git('init', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');
    mkdirSync(dirname(join(root, previous)), { recursive: true });
    writeFileSync(join(root, previous), 'original');
    git('add', '.');
    git('commit', '-m', 'baseline');
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    git('switch', '-c', 'test/course-relocation');
    mkdirSync(dirname(join(root, relocated)), { recursive: true });
    writeFileSync(join(root, relocated), 'original');
    rmSync(join(root, previous));
    git('add', '.');
    assert.doesNotThrow(() => checkHistory(root));
    writeFileSync(join(root, relocated), 'changed');
    assert.throws(() => checkHistory(root), /must not change/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
