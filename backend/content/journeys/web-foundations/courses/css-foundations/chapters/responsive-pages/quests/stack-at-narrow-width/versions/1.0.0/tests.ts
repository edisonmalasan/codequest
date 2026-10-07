export const cases = [
  {
    id: 'normal-wide-stops',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.stops',
    property: 'grid-template-columns',
    expectedValue: '1fr 1fr',
    feedback: 'Set .stops grid-template-columns to 1fr 1fr.',
  },
  {
    id: 'boundary-narrow-stops',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '.stops',
    property: 'grid-template-columns',
    expectedValue: '1fr',
    media: { type: 'max-width', widthPx: 600 },
    feedback: 'Set .stops grid-template-columns to 1fr inside max-width 600px.',
  },
];
