import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';
import postcss from 'postcss';
import { buildStaticDocument } from '@/features/preview/static-document';
import { validDefinition } from './validation-definition';
import { parseWebSource } from './web-source';
import type {
  ValidationCaseResult,
  ValidationRequest,
  ValidationResult,
  ValidationStatus,
  ValidationStrategy,
} from './validation-types';

type Child = DefaultTreeAdapterTypes.ChildNode;
const safeSelector =
  /^(?:#[a-z][a-z0-9-]{0,31}|\.[a-z][a-z0-9-]{0,31}|[a-z][a-z0-9-]{0,31})$/;
const safeValue = /^[a-zA-Z0-9#(),.%\s-]{1,128}$/;

function terminal(
  id: string,
  started: number,
  status: ValidationStatus,
  cases: readonly ValidationCaseResult[] = [],
  feedback = '',
): ValidationResult {
  return {
    checkId: id,
    status,
    passed:
      status === 'completed' &&
      cases.length > 0 &&
      cases.every((item) => item.status === 'passed'),
    cases,
    failedCaseIds: cases
      .filter((item) => item.status === 'failed')
      .map((item) => item.id),
    feedback,
    durationMs: Math.max(0, performance.now() - started),
  };
}

function textOf(node: Child): string {
  if ('value' in node) return node.value;
  if (!('childNodes' in node)) return '';
  return node.childNodes.map(textOf).join('');
}

function findId(nodes: readonly Child[], id: string): Child | undefined {
  for (const node of nodes) {
    if (
      'tagName' in node &&
      node.attrs.some((attr) => attr.name === 'id' && attr.value === id)
    )
      return node;
    if ('childNodes' in node) {
      const found = findId(node.childNodes, id);
      if (found) return found;
    }
  }
  return undefined;
}

function boundedTree(nodes: readonly Child[]): boolean {
  const pending = nodes.map((node) => ({ node, depth: 0 }));
  let count = 0;
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) break;
    if (current.depth > 32 || ++count > 512) return false;
    if ('childNodes' in current.node)
      for (const child of current.node.childNodes)
        pending.push({ node: child, depth: current.depth + 1 });
  }
  return true;
}

function declarations(css: string): Map<string, Map<string, string>> | null {
  const values = new Map<string, Map<string, string>>();
  let count = 0;
  try {
    const root = postcss.parse(css);
    root.walk((node) => {
      if (node.type === 'atrule' || node.type === 'comment')
        throw new Error('Unsupported CSS');
      if (node.type === 'rule') {
        if (!safeSelector.test(node.selector) || ++count > 64)
          throw new Error('Unsupported selector');
        return;
      }
      if (node.type === 'decl') {
        if (
          node.parent?.type !== 'rule' ||
          !['color', 'background-color', 'display', 'font-size'].includes(
            node.prop,
          ) ||
          !safeValue.test(node.value) ||
          /url\s*\(/i.test(node.value) ||
          ++count > 256
        )
          throw new Error('Unsupported declaration');
        const selector = node.parent.selector;
        const map = values.get(selector) ?? new Map<string, string>();
        map.set(node.prop, node.value.trim());
        values.set(selector, map);
      }
    });
  } catch {
    return null;
  }
  return values;
}

export class StaticWebValidationStrategy implements ValidationStrategy {
  private generation = 0;
  private disposed = false;

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const generation = ++this.generation;
    const id = crypto.randomUUID();
    const started = performance.now();
    if (this.disposed || request.signal?.aborted)
      return terminal(id, started, 'cancelled', [], 'Check cancelled');
    if (
      !validDefinition(request.definition) ||
      request.definition.cases.some(
        (item) => !['html-element', 'css-declaration'].includes(item.mode),
      )
    )
      return terminal(
        id,
        started,
        'invalid-definition',
        [],
        'Web check definition is invalid',
      );
    const source = parseWebSource(request.source);
    if (!source || source.mode !== 'static-web')
      return terminal(
        id,
        started,
        'output-limit',
        [],
        'Web source is invalid or exceeds the limit',
      );
    const html =
      source.files.find((file) => file.language === 'html')?.source ?? '';
    const css =
      source.files.find((file) => file.language === 'css')?.source ?? '';
    try {
      const preview = buildStaticDocument(source.files);
      if (preview.filteredActiveContent)
        return terminal(
          id,
          started,
          'invalid-definition',
          [],
          'Active markup is not supported by this exercise',
        );
      const styles = declarations(css);
      if (!styles)
        return terminal(
          id,
          started,
          'invalid-definition',
          [],
          'Unsupported or unsafe CSS',
        );
      const fragment = parseFragment(html);
      if (!boundedTree(fragment.childNodes))
        return terminal(
          id,
          started,
          'output-limit',
          [],
          'Web document exceeds node or depth limits',
        );
      const cases: ValidationCaseResult[] = request.definition.cases.map(
        (item) => {
          const passed =
            item.mode === 'html-element'
              ? (() => {
                  const found = findId(
                    fragment.childNodes,
                    item.selector.slice(1),
                  );
                  return (
                    found !== undefined &&
                    textOf(found).trim() === item.expectedText
                  );
                })()
              : item.mode === 'css-declaration'
                ? styles.get(item.selector)?.get(item.property) ===
                  item.expectedValue
                : false;
          return {
            id: item.id,
            label: item.label,
            status: passed ? 'passed' : 'failed',
            message: passed ? 'Passed' : item.feedback,
          };
        },
      );
      if (this.generation !== generation || request.signal?.aborted)
        return terminal(id, started, 'cancelled', [], 'Check cancelled');
      return terminal(id, started, 'completed', cases);
    } catch {
      return terminal(
        id,
        started,
        'internal-error',
        [],
        'Static web check unavailable',
      );
    }
  }

  async cancel(): Promise<void> {
    this.generation += 1;
  }
  async dispose(): Promise<void> {
    this.generation += 1;
    this.disposed = true;
  }
}
