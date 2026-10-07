export const cases = [
  {
    id: 'normal-grid-display',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.observations',
    property: 'display',
    expectedValue: 'grid',
    feedback: 'Set .observations display to grid.',
  },
  {
    id: 'boundary-grid-tracks',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '.observations',
    property: 'grid-template-columns',
    expectedValue: '1fr 1fr',
    feedback: 'Set .observations grid-template-columns to 1fr 1fr.',
  },
  {
    id: 'normal-grid-gap',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.observations',
    property: 'gap',
    expectedValue: '1rem',
    feedback: 'Set .observations gap to 1rem.',
  },
];
