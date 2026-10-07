export const cases = [
  {
    id: 'normal-heading-weight',
    category: 'normal',
    kind: 'css-declaration',
    selector: 'h1',
    property: 'font-weight',
    expectedValue: 'bold',
    feedback: 'Set h1 font-weight to bold.',
  },
  {
    id: 'boundary-source-color',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '#source',
    property: 'color',
    expectedValue: 'teal',
    feedback: 'Set #source color to teal.',
  },
];
