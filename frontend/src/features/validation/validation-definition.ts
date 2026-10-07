import { utf8Bytes } from '@/features/runtime/execution-protocol';
import { isCssCaseProperty, validCssCaseValue } from './css-case-contract';
import {
  VALIDATION_LIMITS,
  type ValidationDefinition,
} from './validation-types';

function record(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const actual = Object.keys(descriptors);
  return (
    actual.length === keys.length &&
    keys.every((key) => {
      const descriptor = descriptors[key];
      return (
        descriptor !== undefined &&
        descriptor.enumerable &&
        Object.hasOwn(descriptor, 'value')
      );
    })
  );
}

const semanticTags = new Set([
  'a',
  'button',
  'em',
  'figcaption',
  'figure',
  'fieldset',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'header',
  'img',
  'input',
  'label',
  'legend',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'section',
  'strong',
  'table',
  'td',
  'th',
  'tr',
  'ul',
]);

function validSemanticAttribute(value: unknown, tag: string): boolean {
  if (
    !record(value) ||
    !exactKeys(value, ['name', 'value']) ||
    typeof value.name !== 'string' ||
    typeof value.value !== 'string' ||
    !value.value ||
    utf8Bytes(value.value) > 128
  )
    return false;
  if (value.name === 'href')
    return tag === 'a' && /^#[a-z][a-z0-9-]{0,31}$/.test(value.value);
  if (value.name === 'for')
    return tag === 'label' && /^[a-z][a-z0-9-]{0,31}$/.test(value.value);
  if (value.name === 'name')
    return tag === 'input' && /^[a-z][a-z0-9-]{0,31}$/.test(value.value);
  if (value.name === 'type')
    return tag === 'input' && ['text', 'email', 'search'].includes(value.value);
  return value.name === 'alt' ? tag === 'img' : value.name === 'aria-label';
}

export function isJsonValue(
  value: unknown,
  seen = new Set<object>(),
  depth = 0,
): boolean {
  if (depth > 8) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (value.length > 200) return false;
      const descriptors = Object.getOwnPropertyDescriptors(value);
      if (
        Object.keys(descriptors).some(
          (key) =>
            key !== 'length' &&
            (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length),
        )
      )
        return false;
      for (let index = 0; index < value.length; index += 1) {
        const descriptor = descriptors[index];
        if (
          !descriptor ||
          !Object.hasOwn(descriptor, 'value') ||
          !isJsonValue(descriptor.value, seen, depth + 1)
        )
          return false;
      }
      return true;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return false;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Object.keys(descriptors);
    if (keys.length > 200) return false;
    return keys.every((key) => {
      const descriptor = descriptors[key];
      return (
        descriptor !== undefined &&
        descriptor.enumerable &&
        Object.hasOwn(descriptor, 'value') &&
        isJsonValue(descriptor.value, seen, depth + 1)
      );
    });
  } catch {
    return false;
  } finally {
    seen.delete(value);
  }
}

function validateDefinition(value: unknown): value is ValidationDefinition {
  if (
    !record(value) ||
    !exactKeys(value, ['cases']) ||
    !Array.isArray(value.cases) ||
    value.cases.length < 1 ||
    value.cases.length > VALIDATION_LIMITS.cases
  )
    return false;
  const ids = new Set<string>();
  for (const item of value.cases) {
    if (
      !record(item) ||
      typeof item.id !== 'string' ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(item.id) ||
      ids.has(item.id) ||
      typeof item.label !== 'string' ||
      !item.label.trim() ||
      typeof item.feedback !== 'string' ||
      !item.feedback.trim() ||
      utf8Bytes(item.label) > VALIDATION_LIMITS.feedbackBytes ||
      utf8Bytes(item.feedback) > VALIDATION_LIMITS.feedbackBytes
    )
      return false;
    ids.add(item.id);
    if (item.mode === 'output-match') {
      if (
        !exactKeys(item, [
          'id',
          'label',
          'feedback',
          'mode',
          'expectedLines',
        ]) ||
        !Array.isArray(item.expectedLines) ||
        item.expectedLines.length > 200 ||
        !item.expectedLines.every((line) => typeof line === 'string') ||
        utf8Bytes(item.expectedLines.join('')) > VALIDATION_LIMITS.outputBytes
      )
        return false;
    } else if (item.mode === 'value-test') {
      if (
        !exactKeys(item, ['id', 'label', 'feedback', 'mode', 'expected']) ||
        !isJsonValue(item.expected)
      )
        return false;
    } else if (item.mode === 'function-test') {
      if (
        !exactKeys(item, [
          'id',
          'label',
          'feedback',
          'mode',
          'functionName',
          'args',
          'expected',
        ]) ||
        typeof item.functionName !== 'string' ||
        !/^[A-Za-z_$][\w$]{0,63}$/.test(item.functionName) ||
        !Array.isArray(item.args) ||
        item.args.length > 10 ||
        !item.args.every((arg) => isJsonValue(arg)) ||
        !isJsonValue(item.expected)
      )
        return false;
    } else if (item.mode === 'custom-test') {
      if (
        !exactKeys(item, ['id', 'label', 'feedback', 'mode', 'predicate']) ||
        !record(item.predicate)
      )
        return false;
      const predicate = item.predicate;
      if (predicate.kind === 'output-contains') {
        if (
          !exactKeys(predicate, ['kind', 'text']) ||
          typeof predicate.text !== 'string' ||
          !predicate.text ||
          utf8Bytes(predicate.text) > VALIDATION_LIMITS.valueBytes
        )
          return false;
      } else if (predicate.kind === 'number-range') {
        if (
          !exactKeys(predicate, ['kind', 'min', 'max']) ||
          typeof predicate.min !== 'number' ||
          typeof predicate.max !== 'number' ||
          !Number.isFinite(predicate.min) ||
          !Number.isFinite(predicate.max) ||
          predicate.min > predicate.max
        )
          return false;
      } else return false;
    } else if (item.mode === 'html-element') {
      if (
        !exactKeys(item, [
          'id',
          'label',
          'feedback',
          'mode',
          'selector',
          'expectedText',
        ]) ||
        typeof item.selector !== 'string' ||
        !/^#[a-z][a-z0-9-]{0,31}$/.test(item.selector) ||
        typeof item.expectedText !== 'string' ||
        utf8Bytes(item.expectedText) > 512
      )
        return false;
    } else if (item.mode === 'html-semantic') {
      const tag = item.tag;
      if (
        !exactKeys(
          item,
          item.expectedText === undefined
            ? [
                'id',
                'label',
                'feedback',
                'mode',
                'selector',
                'tag',
                'expectedAttributes',
              ]
            : [
                'id',
                'label',
                'feedback',
                'mode',
                'selector',
                'tag',
                'expectedText',
                'expectedAttributes',
              ],
        ) ||
        typeof item.selector !== 'string' ||
        !/^#[a-z][a-z0-9-]{0,31}$/.test(item.selector) ||
        typeof tag !== 'string' ||
        !semanticTags.has(tag) ||
        (item.expectedText !== undefined &&
          (typeof item.expectedText !== 'string' ||
            utf8Bytes(item.expectedText) > 512)) ||
        !Array.isArray(item.expectedAttributes) ||
        item.expectedAttributes.length > 4 ||
        !item.expectedAttributes.every((attribute) =>
          validSemanticAttribute(attribute, tag),
        ) ||
        new Set(item.expectedAttributes.map((attribute) => attribute.name))
          .size !== item.expectedAttributes.length
      )
        return false;
    } else if (item.mode === 'css-declaration') {
      if (
        !exactKeys(
          item,
          item.media === undefined
            ? [
                'id',
                'label',
                'feedback',
                'mode',
                'selector',
                'property',
                'expectedValue',
              ]
            : [
                'id',
                'label',
                'feedback',
                'mode',
                'selector',
                'property',
                'expectedValue',
                'media',
              ],
        ) ||
        typeof item.selector !== 'string' ||
        !/^(?:#[a-z][a-z0-9-]{0,31}|\.[a-z][a-z0-9-]{0,31}|[a-z][a-z0-9-]{0,31})$/.test(
          item.selector,
        ) ||
        !isCssCaseProperty(item.property) ||
        typeof item.expectedValue !== 'string' ||
        !validCssCaseValue(item.property, item.expectedValue) ||
        (item.media !== undefined &&
          (!record(item.media) ||
            !exactKeys(item.media, ['type', 'widthPx']) ||
            !['min-width', 'max-width'].includes(String(item.media.type)) ||
            typeof item.media.widthPx !== 'number' ||
            !Number.isInteger(item.media.widthPx) ||
            item.media.widthPx < 320 ||
            item.media.widthPx > 1440))
      )
        return false;
    } else if (item.mode === 'interactive-text') {
      if (
        !exactKeys(item, [
          'id',
          'label',
          'feedback',
          'mode',
          'selector',
          'events',
          'expectedText',
        ]) ||
        typeof item.selector !== 'string' ||
        !/^#[a-z][a-z0-9-]{0,31}$/.test(item.selector) ||
        typeof item.expectedText !== 'string' ||
        utf8Bytes(item.expectedText) > 512 ||
        !Array.isArray(item.events) ||
        item.events.length > 8 ||
        !item.events.every(
          (event) =>
            record(event) &&
            exactKeys(
              event,
              event.value === undefined
                ? ['type', 'targetId']
                : ['type', 'targetId', 'value'],
            ) &&
            ['click', 'input', 'change'].includes(String(event.type)) &&
            typeof event.targetId === 'string' &&
            /^[a-z][a-z0-9-]{0,31}$/.test(event.targetId) &&
            (event.value === undefined ||
              (typeof event.value === 'string' &&
                utf8Bytes(event.value) <= 512)),
        )
      )
        return false;
    } else return false;
  }
  try {
    return (
      utf8Bytes(JSON.stringify(value)) <= VALIDATION_LIMITS.definitionBytes
    );
  } catch {
    return false;
  }
}

export function validDefinition(value: unknown): value is ValidationDefinition {
  try {
    return validateDefinition(value);
  } catch {
    return false;
  }
}
