export const cases = [
  {
    id: 'normal-reading-width',
    category: 'normal',
    kind: 'css-declaration',
    selector: 'main',
    property: 'max-width',
    expectedValue: '48rem',
    feedback: 'Set main max-width to 48rem.',
  },
  {
    id: 'boundary-inner-space',
    category: 'boundary',
    kind: 'css-declaration',
    selector: 'main',
    property: 'padding',
    expectedValue: '1.5rem',
    feedback: 'Set main padding to 1.5rem.',
  },
];
