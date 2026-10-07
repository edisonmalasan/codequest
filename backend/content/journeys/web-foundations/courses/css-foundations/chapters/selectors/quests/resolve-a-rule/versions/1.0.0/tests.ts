export const cases = [
  {
    id: 'normal-summary-color',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.summary',
    property: 'color',
    expectedValue: 'teal',
    feedback: 'Set .summary color to teal.',
  },
  {
    id: 'boundary-paragraph-rhythm',
    category: 'boundary',
    kind: 'css-declaration',
    selector: 'p',
    property: 'line-height',
    expectedValue: '1.5',
    feedback: 'Set p line-height to 1.5.',
  },
];
