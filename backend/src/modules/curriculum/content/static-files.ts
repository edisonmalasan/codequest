import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { parseDocument } from 'yaml';
import { casesSchema } from './content-schema';

export class ContentError extends Error {
  constructor(
    public readonly file: string,
    public readonly reason: string,
  ) {
    super(`${file}: ${reason}`);
  }
}

export function safeFile(root: string, file: string, maxBytes: number): string {
  const absolute = resolve(root, file);
  const path = relative(root, absolute);
  if (
    path === '' ||
    path === '..' ||
    path.startsWith(`..${sep}`) ||
    isAbsolute(path)
  )
    throw new ContentError(file, 'Path escapes content root');
  if (!existsSync(absolute))
    throw new ContentError(file, 'Required file is missing');
  let cursor = absolute;
  while (cursor !== root) {
    if (lstatSync(cursor).isSymbolicLink())
      throw new ContentError(file, 'Symbolic links are not permitted');
    cursor = dirname(cursor);
  }
  if (!lstatSync(absolute).isFile())
    throw new ContentError(file, 'Expected a regular file');
  if (lstatSync(absolute).size > maxBytes)
    throw new ContentError(file, 'File exceeds size limit');
  if (!realpathSync(absolute).startsWith(`${realpathSync(root)}${sep}`))
    throw new ContentError(file, 'Path escapes content root');
  return readFileSync(absolute, 'utf8');
}

export function readYaml(root: string, file: string): unknown {
  const source = safeFile(root, file, 32_768);
  const doc = parseDocument(source, { uniqueKeys: true, strict: true });
  if (doc.errors.length > 0)
    throw new ContentError(file, 'Invalid YAML or duplicate key');
  return doc.toJS();
}

interface StaticNode {
  type: string;
  children?: unknown;
  url?: unknown;
  alt?: unknown;
}
function isNode(value: unknown): value is StaticNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

const allowed = new Set([
  'root',
  'paragraph',
  'heading',
  'text',
  'emphasis',
  'strong',
  'inlineCode',
  'code',
  'list',
  'listItem',
  'blockquote',
  'thematicBreak',
  'break',
  'link',
  'image',
]);
export function checkLesson(root: string, file: string): void {
  const source = safeFile(root, file, 65_536);
  if (!source.trim()) throw new ContentError(file, 'Lesson must contain text');
  let tree: unknown;
  try {
    tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  } catch {
    throw new ContentError(file, 'Invalid MDX syntax');
  }
  function inspect(node: unknown): void {
    if (!isNode(node) || !allowed.has(node.type))
      throw new ContentError(file, 'Disallowed MDX node');
    if (node.type === 'image') {
      if (typeof node.alt !== 'string' || !node.alt.trim())
        throw new ContentError(file, 'Image requires text alternative');
      if (
        typeof node.url !== 'string' ||
        !/^\.\/assets\/[a-zA-Z0-9/_-]+\.(?:png|webp)$/.test(node.url)
      )
        throw new ContentError(file, 'Image must use a local assets path');
      safeFile(root, join(dirname(file), node.url), 262_144);
    }
    if (
      node.type === 'link' &&
      (typeof node.url !== 'string' || !/^(?:https:\/\/|\.\/|#)/.test(node.url))
    )
      throw new ContentError(file, 'Unsafe link URL');
    if (Array.isArray(node.children))
      for (const child of node.children) inspect(child);
  }
  inspect(tree);
}

function literal(node: ts.Expression, depth = 0): unknown {
  if (depth > 8) throw new Error('Assessment nesting exceeds limit');
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  )
    return -Number(node.operand.text);
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((element) => literal(element, depth + 1));
  if (ts.isObjectLiteralExpression(node)) {
    const record: Record<string, unknown> = Object.create(null);
    for (const property of node.properties) {
      if (
        !ts.isPropertyAssignment(property) ||
        !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
      )
        throw new Error('Assessment must contain literal properties');
      const key = property.name.text;
      if (['__proto__', 'constructor', 'prototype'].includes(key))
        throw new Error('Unsafe assessment property');
      if (Object.hasOwn(record, key))
        throw new Error('Duplicate assessment property');
      record[key] = literal(property.initializer, depth + 1);
    }
    return record;
  }
  throw new Error('Assessment must be data-only');
}

export function readCases(root: string, file: string) {
  const source = safeFile(root, file, 32_768);
  const script = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const diagnostics =
    ts.transpileModule(source, {
      fileName: file,
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022 },
    }).diagnostics ?? [];
  if (
    diagnostics.some((item) => item.category === ts.DiagnosticCategory.Error) ||
    script.statements.length !== 1
  )
    throw new ContentError(
      file,
      'Expected one valid exported cases declaration',
    );
  const statement = script.statements[0];
  if (
    !ts.isVariableStatement(statement) ||
    statement.modifiers?.length !== 1 ||
    statement.modifiers[0].kind !== ts.SyntaxKind.ExportKeyword ||
    statement.declarationList.declarations.length !== 1 ||
    !(statement.declarationList.flags & ts.NodeFlags.Const)
  )
    throw new ContentError(
      file,
      'Expected one exported const cases declaration',
    );
  const declaration = statement.declarationList.declarations[0];
  if (
    !ts.isIdentifier(declaration.name) ||
    declaration.name.text !== 'cases' ||
    declaration.type !== undefined ||
    !declaration.initializer
  )
    throw new ContentError(file, 'Expected exported cases declaration');
  const expression = declaration.initializer;
  let value: unknown;
  try {
    value = literal(expression);
  } catch {
    throw new ContentError(file, 'Assessment must be bounded literal data');
  }
  const parsed = casesSchema.safeParse(value);
  if (!parsed.success)
    throw new ContentError(
      file,
      `Invalid cases: ${parsed.error.issues.map((issue) => issue.path.join('.') || issue.code).join(', ')}`,
    );
  return parsed.data;
}

export function checkStarter(root: string, file: string): void {
  const source = safeFile(root, file, 32_768);
  if (!source.trim())
    throw new ContentError(file, 'Starter source must not be empty');
  const script = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const diagnostics =
    ts.transpileModule(source, {
      fileName: file,
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022 },
    }).diagnostics ?? [];
  if (diagnostics.some((item) => item.category === ts.DiagnosticCategory.Error))
    throw new ContentError(file, 'Invalid starter syntax');
  const prohibited = new Set([
    'fetch',
    'require',
    'process',
    'globalThis',
    'window',
    'document',
    'navigator',
    'localStorage',
    'sessionStorage',
    'WebSocket',
    'XMLHttpRequest',
    'eval',
    'Function',
    'setTimeout',
    'setInterval',
    'Promise',
  ]);
  function inspect(node: ts.Node): void {
    if (
      ts.isImportDeclaration(node) ||
      ts.isExportDeclaration(node) ||
      ts.isImportEqualsDeclaration(node) ||
      ts.isExportAssignment(node) ||
      ts.isClassDeclaration(node) ||
      ts.isClassExpression(node) ||
      ts.isNewExpression(node) ||
      ts.isAwaitExpression(node) ||
      ts.isYieldExpression(node) ||
      ts.isTryStatement(node) ||
      ts.isThrowStatement(node) ||
      ts.isTaggedTemplateExpression(node) ||
      (ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword) ||
      (ts.isIdentifier(node) && prohibited.has(node.text))
    )
      throw new ContentError(
        file,
        'Starter uses a capability outside Foundations',
      );
    ts.forEachChild(node, inspect);
  }
  inspect(script);
}
