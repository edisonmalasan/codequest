import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('content');
const target = resolve('dist/content');

await rm(target, { recursive: true, force: true });
await mkdir(resolve('dist'), { recursive: true });
await cp(source, target, { recursive: true });
