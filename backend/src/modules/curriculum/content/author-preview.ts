import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import type {
  AuthorCatalog,
  SelectedJourney,
  SelectedQuest,
} from './author-selection';
import { ContentError } from './static-files';

interface Node {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  depth?: number;
  ordered?: boolean;
  children?: Node[];
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ] ?? character,
  );
}

function element(tag: string, content: string): string {
  return `<${tag}>${content}</${tag}>`;
}

function lessonHtml(
  source: string,
  assets: SelectedQuest['snapshot']['assets'],
): string {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as Node;
  const render = (node: Node): string => {
    const children = () => (node.children ?? []).map(render).join('');
    switch (node.type) {
      case 'root':
        return children();
      case 'paragraph':
        return element('p', children());
      case 'heading':
        return element(
          `h${Math.min(Math.max(node.depth ?? 2, 1), 6)}`,
          children(),
        );
      case 'text':
        return escapeHtml(node.value ?? '');
      case 'emphasis':
        return element('em', children());
      case 'strong':
        return element('strong', children());
      case 'inlineCode':
        return element('code', escapeHtml(node.value ?? ''));
      case 'code':
        return element('pre', element('code', escapeHtml(node.value ?? '')));
      case 'list':
        return element(node.ordered ? 'ol' : 'ul', children());
      case 'listItem':
        return element('li', children());
      case 'blockquote':
        return element('blockquote', children());
      case 'thematicBreak':
        return '<hr>';
      case 'break':
        return '<br>';
      case 'link': {
        const url = node.url ?? '';
        return `${children()} <code>${escapeHtml(url)}</code>`;
      }
      case 'image': {
        const path = (node.url ?? '').replace(/^\.\//, '');
        const asset = assets[path];
        if (!asset)
          throw new ContentError('lesson.mdx', `Missing local image ${path}`);
        return `<img src="data:${asset.mediaType};base64,${asset.bytesBase64}" alt="${escapeHtml(node.alt ?? '')}">`;
      }
      default:
        throw new ContentError('lesson.mdx', 'Unsupported preview node');
    }
  };
  return render(tree);
}

function document(title: string, body: string): string {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"><title>${escapeHtml(title)}</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;color:#1a1a1a;background:#fafafa}h1,h2,h3{line-height:1.25}pre{overflow:auto;padding:1rem;background:#eee}code{white-space:pre-wrap}img{max-width:100%;height:auto}.status{padding:.7rem;border:2px solid #555;font-weight:700}section{border-top:1px solid #aaa;margin-top:2rem}dt{font-weight:700}dd{margin-bottom:.6rem}li{margin:.4rem 0}</style><main>${body}</main></html>`;
}

function label(published: boolean): string {
  return published
    ? 'Published selection — editorial preview'
    : 'Unapproved / unpublished authored snapshot — editorial preview';
}

export function renderQuestPreview(selection: SelectedQuest): string {
  const { journey, chapter, quest, snapshot } = selection;
  const metadata = snapshot.metadata;
  const cases = snapshot.cases
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.id)}</strong> (${escapeHtml(item.category)}, ${escapeHtml(item.kind)}): ${escapeHtml(item.feedback)}<pre>${escapeHtml(JSON.stringify(item))}</pre></li>`,
    )
    .join('');
  const body = `<h1>${escapeHtml(metadata.title)}</h1><p class="status">${label(selection.isPublishedSelection)}</p>
    <dl><dt>Identity</dt><dd>${escapeHtml(quest.metadata.id)}</dd><dt>Hierarchy</dt><dd>${escapeHtml(journey.metadata.title)} (${escapeHtml(journey.metadata.id)}) / ${escapeHtml(chapter.metadata.title)} (${escapeHtml(chapter.metadata.id)})</dd><dt>Authored current</dt><dd>${escapeHtml(quest.metadata.currentVersion)}</dd><dt>Selected content / assessment</dt><dd>${escapeHtml(metadata.contentVersion)} / ${escapeHtml(metadata.assessmentVersion)}</dd><dt>Published content / assessment</dt><dd>${escapeHtml(selection.publishedVersion ?? 'none')} / ${escapeHtml(selection.publishedAssessmentVersion ?? 'none')}</dd><dt>Prerequisites</dt><dd>${escapeHtml(metadata.prerequisiteQuestIds.join(', ') || 'none')}</dd><dt>Objective</dt><dd>${escapeHtml(metadata.objective)}</dd></dl>
    <section aria-label="Lesson"><h2>Lesson</h2>${lessonHtml(snapshot.lesson, snapshot.assets)}</section>
    <section><h2>Starter source</h2><pre><code>${escapeHtml(snapshot.starterCode)}</code></pre></section>
    <section><h2>Hints</h2><ol><li>${escapeHtml(metadata.hints.question)}</li><li>${escapeHtml(metadata.hints.concept)}</li><li>${escapeHtml(metadata.hints.nextStep)}</li></ol></section>
    <section><h2>Declarative cases</h2><ol>${cases}</ol></section>`;
  return document(`${metadata.title} — author preview`, body);
}

export function renderJourneyPreview(
  catalog: AuthorCatalog,
  selection: SelectedJourney,
): string {
  const journey = selection.journey;
  const published = catalog.published.journeys.find(
    (item) => item.metadata.id === journey.metadata.id,
  );
  const chapters = journey.chapters
    .map((chapter) => {
      const quests = chapter.quests
        .map((quest) => {
          const current = quest.snapshots[quest.metadata.currentVersion];
          const selected = published?.chapters
            .flatMap((item) => item.quests)
            .find(
              (item) => item.metadata.id === quest.metadata.id,
            )?.activeSnapshot;
          const exact =
            selected?.metadata.contentVersion ===
              current.metadata.contentVersion &&
            selected.metadata.assessmentVersion ===
              current.metadata.assessmentVersion;
          return `<li><strong>${escapeHtml(current.metadata.title)}</strong> (${escapeHtml(quest.metadata.id)}, ${escapeHtml(quest.metadata.slug)}) — authored ${escapeHtml(current.metadata.contentVersion)} / ${escapeHtml(current.metadata.assessmentVersion)}; published ${escapeHtml(selected?.metadata.contentVersion ?? 'none')} / ${escapeHtml(selected?.metadata.assessmentVersion ?? 'none')}; ${exact ? 'current snapshot selected' : 'current snapshot unselected'}; prerequisites: ${escapeHtml(current.metadata.prerequisiteQuestIds.join(', ') || 'none')}</li>`;
        })
        .join('');
      return `<section><h2>${escapeHtml(chapter.metadata.title)} (${escapeHtml(chapter.metadata.id)})</h2><p>${escapeHtml(chapter.metadata.objectiveSummary)}</p><ol>${quests}</ol></section>`;
    })
    .join('');
  return document(
    `${journey.metadata.title} — author preview`,
    `<h1>${escapeHtml(journey.metadata.title)}</h1><p class="status">${label(selection.isPublished)}. Authored review: ${escapeHtml(journey.metadata.status)}. This outline does not show learner availability.</p><p>Stable ID: ${escapeHtml(journey.metadata.id)}; slug: ${escapeHtml(journey.metadata.slug)}. Published manifest: ${published ? 'selected' : 'not selected'}.</p>${chapters}`,
  );
}
