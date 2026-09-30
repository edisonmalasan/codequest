import { Buffer } from 'node:buffer';
import console from 'node:console';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const require = createRequire(import.meta.url);
require('reflect-metadata');
const {
  loadCurriculumCatalog,
} = require('../dist/modules/curriculum/content/curriculum-catalog.js');
const {
  CurriculumService,
} = require('../dist/modules/curriculum/curriculum.service.js');

const service = new CurriculumService(
  loadCurriculumCatalog(resolve('content')),
);
const entries = [];
for (const journey of service.listJourneys()) {
  const detail = service.findJourney(journey.slug);
  for (const chapter of detail.chapters) {
    const chapterDetail = service.findChapter(chapter.slug);
    for (const quest of chapterDetail.quests) {
      const bytes = Buffer.from(JSON.stringify(service.findQuest(quest.slug)));
      entries.push({
        slug: quest.slug,
        bytes: bytes.byteLength,
        gzipBytes: gzipSync(bytes).byteLength,
      });
    }
  }
}
if (entries.length === 0)
  throw new Error('No published Quest payloads to measure.');
for (const entry of entries)
  console.log(
    `${entry.slug}: ${entry.bytes} raw JSON bytes, ${entry.gzipBytes} gzip bytes`,
  );
console.log(
  `published Quest payloads: ${entries.length}; max raw: ${Math.max(...entries.map((entry) => entry.bytes))}; max gzip: ${Math.max(...entries.map((entry) => entry.gzipBytes))}`,
);
