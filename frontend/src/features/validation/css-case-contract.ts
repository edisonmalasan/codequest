export const cssCaseProperties = [
  'color',
  'background-color',
  'display',
  'font-size',
  'font-family',
  'font-weight',
  'line-height',
  'text-align',
  'letter-spacing',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  'box-sizing',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'gap',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'grid-template-columns',
] as const;

export type CssCaseProperty = (typeof cssCaseProperties)[number];

const propertySet: ReadonlySet<string> = new Set(cssCaseProperties);

export function isCssCaseProperty(value: unknown): value is CssCaseProperty {
  return typeof value === 'string' && propertySet.has(value);
}

const color =
  /^(?:#[0-9a-f]{3}(?:[0-9a-f]{3})?|black|white|red|blue|green|navy|teal|purple|orange|yellow|gray|grey|transparent)$/i;
const length =
  /^(?:0|(?:[1-9]\d{0,3}|0?\.\d{1,3}|[1-9]\d{0,3}\.\d{1,3})(?:px|rem|em|%|vw|vh))$/i;
const lengthOrAuto =
  /^(?:auto|0|(?:[1-9]\d{0,3}|0?\.\d{1,3}|[1-9]\d{0,3}\.\d{1,3})(?:px|rem|em|%|vw|vh))$/i;

function tokenList(value: string, pattern: RegExp, maximum: number): boolean {
  const tokens = value.trim().split(/\s+/);
  return (
    tokens.length <= maximum && tokens.every((token) => pattern.test(token))
  );
}

export function validCssCaseValue(
  property: CssCaseProperty,
  value: string,
): boolean {
  if (!value || value.length > 128 || value !== value.trim()) return false;
  if (['color', 'background-color', 'border-color'].includes(property))
    return color.test(value);
  if (property === 'display')
    return ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'].includes(
      value,
    );
  if (property === 'font-family')
    return ['system-ui', 'sans-serif', 'serif', 'monospace'].includes(value);
  if (property === 'font-weight')
    return ['normal', 'bold', '400', '500', '600', '700'].includes(value);
  if (property === 'line-height')
    return (
      /^(?:[1-3](?:\.\d{1,2})?|0?\.\d{1,2})$/.test(value) || length.test(value)
    );
  if (property === 'text-align')
    return ['left', 'center', 'right'].includes(value);
  if (property === 'border-style')
    return ['none', 'solid', 'dashed'].includes(value);
  if (property === 'box-sizing')
    return ['content-box', 'border-box'].includes(value);
  if (property === 'flex-direction') return ['row', 'column'].includes(value);
  if (property === 'flex-wrap') return ['nowrap', 'wrap'].includes(value);
  if (property === 'justify-content')
    return [
      'flex-start',
      'flex-end',
      'center',
      'space-between',
      'space-around',
    ].includes(value);
  if (property === 'align-items')
    return ['stretch', 'flex-start', 'flex-end', 'center'].includes(value);
  if (property === 'grid-template-columns')
    return tokenList(
      value,
      /^(?:[1-9]\d{0,2}fr|[1-9]\d{0,3}px|[1-9]\d{0,2}%)$/,
      4,
    );
  if (property === 'margin' || property === 'padding')
    return tokenList(value, property === 'margin' ? lengthOrAuto : length, 4);
  if (
    property.startsWith('margin-') ||
    property === 'width' ||
    property === 'height' ||
    property === 'max-width' ||
    property === 'max-height'
  )
    return lengthOrAuto.test(value);
  return length.test(value);
}
