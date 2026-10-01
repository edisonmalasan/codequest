import { resolve } from 'node:path';
import {
  loadAuthoredCurriculum,
  loadCurriculumCatalog,
  type AuthoredCurriculum,
  type CatalogChapter,
  type CatalogJourney,
  type CatalogQuest,
  type CatalogQuestSnapshot,
  type CurriculumCatalog,
} from './curriculum-catalog';
import { ContentError } from './static-files';

const identityPattern = /^[A-Za-z][A-Za-z0-9-]{1,63}$/;
const versionPattern = /^(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})$/;

export interface AuthorCatalog {
  readonly authored: AuthoredCurriculum;
  readonly published: CurriculumCatalog;
}

export interface SelectedQuest {
  readonly journey: CatalogJourney;
  readonly chapter: CatalogChapter;
  readonly quest: CatalogQuest;
  readonly snapshot: CatalogQuestSnapshot;
  readonly publishedVersion?: string;
  readonly publishedAssessmentVersion?: string;
  readonly isPublishedSelection: boolean;
}

export interface SelectedJourney {
  readonly journey: CatalogJourney;
  readonly isPublished: boolean;
}

export function loadAuthorCatalog(contentRoot: string): AuthorCatalog {
  const root = resolve(contentRoot);
  return {
    authored: loadAuthoredCurriculum(root),
    published: loadCurriculumCatalog(root),
  };
}

function checkIdentity(value: string): void {
  if (!identityPattern.test(value))
    throw new ContentError('selection', 'Invalid stable ID or slug');
}

export function selectJourney(
  catalog: AuthorCatalog,
  identity: string,
): SelectedJourney {
  checkIdentity(identity);
  const matches = catalog.authored.journeys.filter(
    (journey) =>
      journey.metadata.id === identity || journey.metadata.slug === identity,
  );
  if (matches.length !== 1)
    throw new ContentError(
      'selection',
      matches.length ? 'Ambiguous Journey identity' : 'Journey not found',
    );
  const journey = matches[0];
  return {
    journey,
    isPublished: catalog.published.journeys.some(
      (item) => item.metadata.id === journey.metadata.id,
    ),
  };
}

export function selectQuest(
  catalog: AuthorCatalog,
  identity: string,
  version: string | 'current',
): SelectedQuest {
  checkIdentity(identity);
  if (version !== 'current' && !versionPattern.test(version))
    throw new ContentError('selection', 'Invalid content version');
  const matches = catalog.authored.journeys.flatMap((journey) =>
    journey.chapters.flatMap((chapter) =>
      chapter.quests
        .filter(
          (quest) =>
            quest.metadata.id === identity || quest.metadata.slug === identity,
        )
        .map((quest) => ({ journey, chapter, quest })),
    ),
  );
  if (matches.length !== 1)
    throw new ContentError(
      'selection',
      matches.length ? 'Ambiguous Quest identity' : 'Quest not found',
    );
  const { journey, chapter, quest } = matches[0];
  const selectedVersion =
    version === 'current' ? quest.metadata.currentVersion : version;
  const snapshot = quest.snapshots[selectedVersion];
  if (!snapshot)
    throw new ContentError(
      'selection',
      `Quest version ${selectedVersion} not found`,
    );
  const published = catalog.published.journeys
    .flatMap((item) => item.chapters)
    .flatMap((item) => item.quests)
    .find((item) => item.metadata.id === quest.metadata.id);
  const publishedVersion = published?.activeSnapshot.metadata.contentVersion;
  const publishedAssessmentVersion =
    published?.activeSnapshot.metadata.assessmentVersion;
  return {
    journey,
    chapter,
    quest,
    snapshot,
    publishedVersion,
    publishedAssessmentVersion,
    isPublishedSelection:
      publishedVersion === snapshot.metadata.contentVersion &&
      publishedAssessmentVersion === snapshot.metadata.assessmentVersion,
  };
}
