import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';
import {
  InteractiveSourceError,
  type CapturedInteractiveSnapshot,
} from './interactive-snapshot';
import { INTERACTIVE_LIMITS } from './interactive-types';

type ChildNode = DefaultTreeAdapterTypes.ChildNode;

const DISPLAY_TAGS = new Set([
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
  'input',
  'label',
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
const VOID_TAGS = new Set(['br', 'hr', 'img', 'input']);
const DISPLAY_ATTRIBUTES = new Set([
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
const SAFE_NAME = /^[a-z][a-z0-9-]*$/;

export interface InteractiveNode {
  readonly nodeId: string;
  readonly parentId: string | null;
  readonly tag: string;
  readonly elementId: string;
  readonly classes: readonly string[];
  readonly ownText: string;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface InteractiveDocument {
  readonly body: string;
  readonly css: string;
  readonly nodes: readonly InteractiveNode[];
  readonly filteredActiveContent: boolean;
  readonly description: string;
}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
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

export function buildInteractiveDocument(
  snapshot: CapturedInteractiveSnapshot,
): InteractiveDocument {
  const fragment = parseFragment(snapshot.html);
  const nodes: InteractiveNode[] = [];
  const filtered = { value: false };

  function render(
    node: ChildNode,
    parentId: string | null,
    depth: number,
  ): string {
    if (depth > INTERACTIVE_LIMITS.depth) {
      throw new InteractiveSourceError('Interactive document is too deep');
    }
    if ('value' in node) return escapeText(node.value);
    if (!('tagName' in node)) return '';
    const tag = node.tagName.toLowerCase();
    if (
      node.namespaceURI !== 'http://www.w3.org/1999/xhtml' ||
      !DISPLAY_TAGS.has(tag)
    ) {
      filtered.value = true;
      return '';
    }
    if (nodes.length >= INTERACTIVE_LIMITS.nodes) {
      throw new InteractiveSourceError(
        'Interactive document has too many elements',
      );
    }

    const nodeId = `n${nodes.length}`;
    const attrs: string[] = [`data-cq-node="${nodeId}"`];
    const accepted: Record<string, string> = {};
    for (const attr of node.attrs) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (
        SAFE_NAME.test(name) &&
        value.length <= 1_024 &&
        (DISPLAY_ATTRIBUTES.has(name) || /^aria-[a-z-]+$/.test(name))
      ) {
        accepted[name] = value;
        attrs.push(`${name}="${escapeAttribute(value)}"`);
      } else if (
        tag === 'img' &&
        name === 'src' &&
        value.length <= 16_384 &&
        IMAGE_DATA.test(value)
      ) {
        accepted[name] = value;
        attrs.push(`src="${escapeAttribute(value)}"`);
      } else if (
        tag === 'input' &&
        ['type', 'value', 'placeholder'].includes(name) &&
        value.length <= 256 &&
        (name !== 'type' || value === 'text')
      ) {
        accepted[name] = value;
        attrs.push(`${name}="${escapeAttribute(value)}"`);
      } else {
        filtered.value = true;
      }
    }
    if (tag === 'input' && accepted.type !== 'text') {
      accepted.type = 'text';
      attrs.push('type="text"');
    }
    const ownText = node.childNodes
      .filter(
        (child): child is DefaultTreeAdapterTypes.TextNode => 'value' in child,
      )
      .map((child) => child.value)
      .join('');
    const classes = (accepted.class ?? '').split(/\s+/).filter(Boolean);
    nodes.push(
      Object.freeze({
        nodeId,
        parentId,
        tag,
        elementId: accepted.id ?? '',
        classes: Object.freeze(classes),
        ownText,
        attributes: Object.freeze(accepted),
      }),
    );
    const children = VOID_TAGS.has(tag)
      ? ''
      : node.childNodes
          .map((child) => render(child, nodeId, depth + 1))
          .join('');
    return `<${tag} ${attrs.join(' ')}>${children}${VOID_TAGS.has(tag) ? '' : `</${tag}>`}`;
  }

  const body = fragment.childNodes
    .map((node) => render(node, null, 0))
    .join('');
  const css = snapshot.css.replaceAll('<', '\\3C ');
  if (utf8Bytes(body) + utf8Bytes(css) > INTERACTIVE_LIMITS.documentBytes) {
    throw new InteractiveSourceError('Interactive document exceeds its limit');
  }
  const description = nodes
    .filter((node) => ['h1', 'h2', 'h3', 'p', 'button'].includes(node.tag))
    .map((node) => node.ownText.trim())
    .filter(Boolean)
    .join(' · ')
    .slice(0, 2_048);
  return Object.freeze({
    body,
    css,
    nodes: Object.freeze(nodes),
    filteredActiveContent: filtered.value,
    description,
  });
}
