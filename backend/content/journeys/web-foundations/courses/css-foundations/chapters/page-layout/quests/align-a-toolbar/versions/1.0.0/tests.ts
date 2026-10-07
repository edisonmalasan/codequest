export const cases = [
  {
    id: 'normal-flex-display',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.trail-links',
    property: 'display',
    expectedValue: 'flex',
    feedback: 'Set .trail-links display to flex.',
  },
  {
    id: 'boundary-flex-gap',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '.trail-links',
    property: 'gap',
    expectedValue: '1rem',
    feedback: 'Set .trail-links gap to 1rem.',
  },
  {
    id: 'normal-flex-distribution',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.trail-links',
    property: 'justify-content',
    expectedValue: 'space-between',
    feedback: 'Set .trail-links justify-content to space-between.',
  },
];
