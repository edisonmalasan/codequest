export const cases = [
  {
    id: 'normal-heading-family',
    category: 'normal',
    kind: 'css-declaration',
    selector: 'h1',
    property: 'font-family',
    expectedValue: 'serif',
    feedback: 'Set h1 font-family to serif.',
  },
  {
    id: 'boundary-heading-scale',
    category: 'boundary',
    kind: 'css-declaration',
    selector: 'h1',
    property: 'font-size',
    expectedValue: '2rem',
    feedback: 'Set h1 font-size to 2rem.',
  },
];
