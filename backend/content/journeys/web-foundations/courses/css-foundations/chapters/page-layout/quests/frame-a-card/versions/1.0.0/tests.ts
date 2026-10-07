export const cases = [
  {
    id: 'normal-border-style',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.specimen',
    property: 'border-style',
    expectedValue: 'solid',
    feedback: 'Set .specimen border-style to solid.',
  },
  {
    id: 'boundary-border-width',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '.specimen',
    property: 'border-width',
    expectedValue: '2px',
    feedback: 'Set .specimen border-width to 2px.',
  },
  {
    id: 'normal-card-padding',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.specimen',
    property: 'padding',
    expectedValue: '1rem',
    feedback: 'Set .specimen padding to 1rem.',
  },
];
