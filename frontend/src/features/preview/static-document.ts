import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';

import { PREVIEW_LIMITS, type PreviewFile } from './preview-types';

const ALLOWED_TAGS = new Set([
  'a',
  'article',
  'aside',
  'b',
  'blockquote',
  'br',
  'button',
  'caption',
  'code',
  'dd',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'i',
  'img',
  'li',
  'main',
  'mark',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'small',
  'span',
  'strong',
  'summary',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);
const VOID_TAGS = new Set(['br', 'hr', 'img']);
const SAFE_ATTRIBUTES = new Set([
  'alt',
  'class',
  'colspan',
  'height',
  'id',
  'role',
  'rowspan',
  'title',
  'width',
]);
const IMAGE_DATA = /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i;
const CHILD_POLICY = [
  "default-src 'none'",
  "script-src 'none'",
  "style-src 'unsafe-inline'",
  'img-src data:',
  "connect-src 'none'",
  "frame-src 'none'",
  "worker-src 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ');

type ChildNode = DefaultTreeAdapterTypes.ChildNode;

export interface StaticDocument {
  html: string;
  javascript?: string;
  filteredActiveContent: boolean;
}

export class PreviewSourceError extends Error {}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

function escapeText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function renderNode(node: ChildNode, filtered: { value: boolean }): string {
  if ('value' in node) return escapeText(node.value);
  if (!('tagName' in node)) return '';
  const tag = node.tagName.toLowerCase();
  if (
    node.namespaceURI !== 'http://www.w3.org/1999/xhtml' ||
    !ALLOWED_TAGS.has(tag)
  ) {
    filtered.value = true;
    return '';
  }

  const attrs: string[] = [];
  for (const attr of node.attrs) {
    const name = attr.name.toLowerCase();
    if (SAFE_ATTRIBUTES.has(name) || name.startsWith('aria-')) {
      attrs.push(`${name}="${escapeAttribute(attr.value)}"`);
    } else if (
      tag === 'img' &&
      name === 'src' &&
      attr.value.length <= 16_384 &&
      IMAGE_DATA.test(attr.value)
    ) {
      attrs.push(`src="${escapeAttribute(attr.value)}"`);
    } else {
      filtered.value = true;
    }
  }
  const open = `<${tag}${attrs.length ? ` ${attrs.join(' ')}` : ''}>`;
  if (VOID_TAGS.has(tag)) return open;
  const children = node.childNodes
    .map((child) => renderNode(child, filtered))
    .join('');
  return `${open}${children}</${tag}>`;
}

export function buildStaticDocument(
  files: readonly PreviewFile[],
): StaticDocument {
  if (!Array.isArray(files) || files.length > 3) {
    throw new PreviewSourceError('Preview files are invalid');
  }
  const sourceByLanguage = new Map<PreviewFile['language'], string>();
  const fileIds = new Set<string>();
  for (const file of files) {
    if (
      !file ||
      typeof file.id !== 'string' ||
      !file.id ||
      typeof file.source !== 'string' ||
      fileIds.has(file.id) ||
      sourceByLanguage.has(file.language) ||
      !['html', 'css', 'javascript'].includes(file.language)
    ) {
      throw new PreviewSourceError('Preview files are invalid');
    }
    fileIds.add(file.id);
    sourceByLanguage.set(file.language, file.source);
  }
  const htmlSource = sourceByLanguage.get('html');
  if (htmlSource === undefined)
    throw new PreviewSourceError('An HTML file is required');
  const cssSource = sourceByLanguage.get('css') ?? '';
  const javascript = sourceByLanguage.get('javascript');
  if (
    utf8Bytes(htmlSource) > PREVIEW_LIMITS.htmlBytes ||
    utf8Bytes(cssSource) > PREVIEW_LIMITS.cssBytes ||
    (javascript !== undefined &&
      utf8Bytes(javascript) > PREVIEW_LIMITS.javascriptBytes)
  ) {
    throw new PreviewSourceError('Preview source exceeds its limit');
  }

  const filtered = { value: false };
  const fragment = parseFragment(htmlSource);
  const body = fragment.childNodes
    .map((node) => renderNode(node, filtered))
    .join('');
  const css = cssSource.replaceAll('<', '\\3C ');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CHILD_POLICY}"><meta name="referrer" content="no-referrer"><style>${css}</style></head><body>${body}</body></html>`;
  if (utf8Bytes(html) > PREVIEW_LIMITS.documentBytes) {
    throw new PreviewSourceError('Preview document exceeds its limit');
  }
  return { html, javascript, filteredActiveContent: filtered.value };
}
