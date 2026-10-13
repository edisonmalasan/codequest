import { db, type BuildRecord, type CodeQuestDatabase } from '@/lib/db';
import { LocalPersistenceError } from '@/lib/local-persistence';
import {
  BUILD_FILE_IDS,
  BUILD_MANIFEST_VERSION,
  BUILD_SCHEMA_VERSION,
  BUILD_TEMPLATE_VERSION,
} from './build-starter';

const MAX_OWNER_BYTES = 128;
const MAX_BUILDS_PER_OWNER = 50;
const MAX_RECORD_BYTES = 2_048;
const MAX_DATE_TIMESTAMP = 8_640_000_000_000_000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validOwner(ownerId: string): void {
  if (
    typeof ownerId !== 'string' ||
    !ownerId ||
    new TextEncoder().encode(ownerId).length > MAX_OWNER_BYTES
  ) {
    throw new LocalPersistenceError('invalid');
  }
}

function validBuildId(buildId: string): void {
  if (typeof buildId !== 'string' || !UUID_PATTERN.test(buildId)) {
    throw new LocalPersistenceError('invalid');
  }
}

function checkedRecord(value: BuildRecord, ownerId: string): BuildRecord {
  if (
    !value ||
    value.ownerId !== ownerId ||
    !UUID_PATTERN.test(value.id) ||
    value.workspaceId !== `build:${value.id}` ||
    value.schemaVersion !== BUILD_SCHEMA_VERSION ||
    value.manifestVersion !== BUILD_MANIFEST_VERSION ||
    value.templateVersion !== BUILD_TEMPLATE_VERSION ||
    !Array.isArray(value.fileIds) ||
    value.fileIds.length !== BUILD_FILE_IDS.length ||
    value.fileIds.some((fileId, index) => fileId !== BUILD_FILE_IDS[index]) ||
    !Number.isSafeInteger(value.createdAt) ||
    value.createdAt < 0 ||
    value.createdAt > MAX_DATE_TIMESTAMP ||
    !Number.isSafeInteger(value.updatedAt) ||
    value.updatedAt < value.createdAt ||
    value.updatedAt > MAX_DATE_TIMESTAMP
  ) {
    throw new LocalPersistenceError('corrupt');
  }
  try {
    if (
      new TextEncoder().encode(JSON.stringify(value)).length > MAX_RECORD_BYTES
    ) {
      throw new LocalPersistenceError('corrupt');
    }
  } catch (cause) {
    if (cause instanceof LocalPersistenceError) throw cause;
    throw new LocalPersistenceError('corrupt', cause);
  }
  return value;
}

function storageFailure(cause: unknown): LocalPersistenceError {
  if (cause instanceof LocalPersistenceError) return cause;
  if (cause instanceof DOMException && cause.name === 'QuotaExceededError') {
    return new LocalPersistenceError('quota', cause);
  }
  return new LocalPersistenceError('unavailable', cause);
}

/** Device-only Build metadata; source stays in EditorWorkspace drafts. */
export class IndexedDbBuildRepository {
  constructor(
    private readonly database: CodeQuestDatabase = db,
    private readonly now: () => number = Date.now,
    private readonly newId: () => string = () => crypto.randomUUID(),
  ) {}

  async create(ownerId: string): Promise<BuildRecord> {
    validOwner(ownerId);
    const id = this.newId();
    validBuildId(id);
    const timestamp = this.now();
    const record: BuildRecord = checkedRecord(
      {
        id,
        ownerId,
        workspaceId: `build:${id}`,
        schemaVersion: BUILD_SCHEMA_VERSION,
        manifestVersion: BUILD_MANIFEST_VERSION,
        templateVersion: BUILD_TEMPLATE_VERSION,
        fileIds: [...BUILD_FILE_IDS],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ownerId,
    );
    try {
      await this.database.transaction('rw', this.database.builds, async () => {
        const count = await this.database.builds
          .where('ownerId')
          .equals(ownerId)
          .count();
        if (count >= MAX_BUILDS_PER_OWNER) {
          throw new LocalPersistenceError('too-large');
        }
        await this.database.builds.add(record);
      });
    } catch (cause) {
      throw storageFailure(cause);
    }
    return record;
  }

  async list(ownerId: string): Promise<BuildRecord[]> {
    validOwner(ownerId);
    let records: BuildRecord[];
    try {
      records = await this.database.builds
        .where('ownerId')
        .equals(ownerId)
        .toArray();
    } catch (cause) {
      throw storageFailure(cause);
    }
    if (records.length > MAX_BUILDS_PER_OWNER) {
      throw new LocalPersistenceError('corrupt');
    }
    return records
      .map((record) => checkedRecord(record, ownerId))
      .sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
  }

  async load(ownerId: string, buildId: string): Promise<BuildRecord | null> {
    validOwner(ownerId);
    validBuildId(buildId);
    let record: BuildRecord | undefined;
    try {
      record = await this.database.builds.get(buildId);
    } catch (cause) {
      throw storageFailure(cause);
    }
    if (!record || record.ownerId !== ownerId) return null;
    return checkedRecord(record, ownerId);
  }

  /** Call after explicit UI confirmation. This removes device-local data only. */
  async remove(ownerId: string, buildId: string): Promise<boolean> {
    validOwner(ownerId);
    validBuildId(buildId);
    try {
      return await this.database.transaction(
        'rw',
        [this.database.builds, this.database.drafts, this.database.preferences],
        async () => {
          const record = await this.database.builds.get(buildId);
          if (!record || record.ownerId !== ownerId) return false;
          checkedRecord(record, ownerId);
          await this.database.drafts
            .where('[ownerId+workspaceId]')
            .equals([ownerId, record.workspaceId])
            .delete();
          await this.database.preferences
            .where('[ownerId+workspaceId]')
            .equals([ownerId, record.workspaceId])
            .delete();
          await this.database.builds.delete(buildId);
          return true;
        },
      );
    } catch (cause) {
      throw storageFailure(cause);
    }
  }
}

export const buildRepository = new IndexedDbBuildRepository();
export type { BuildRecord } from '@/lib/db';
