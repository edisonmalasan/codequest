import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { parse } from 'yaml';

const source = resolve('content');
const target = resolve('dist/content');
const evidenceTarget = resolve('dist/docs');
const distRoot = resolve('dist');

if (
  !target.startsWith(`${distRoot}${sep}`) ||
  !evidenceTarget.startsWith(`${distRoot}${sep}`)
)
  throw new Error('Curriculum build target is outside backend/dist');

await rm(target, { recursive: true, force: true });
await rm(evidenceTarget, { recursive: true, force: true });
await mkdir(resolve('dist'), { recursive: true });
await cp(source, target, { recursive: true });

const publication = parse(
  await readFile(resolve(source, 'publication.yaml'), 'utf8'),
);
const referenced = new Set();
for (const journey of publication.journeys ?? [])
  for (const course of journey.courses ?? [])
    for (const quest of course.quests ?? []) {
      const record = quest.interactiveEvidence?.record;
      if (record !== undefined) referenced.add(record);
    }
for (const record of referenced) {
  if (typeof record !== 'string' || !/^docs\/[a-z0-9-/]+\.md$/.test(record))
    throw new Error('Invalid interactive publication evidence path');
  const input = resolve('..', record);
  const output = resolve('dist', record);
  if (!output.startsWith(`${evidenceTarget}${sep}`))
    throw new Error('Interactive publication evidence target is unsafe');
  await mkdir(dirname(output), { recursive: true });
  await cp(input, output);
}
