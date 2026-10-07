export const cases = [
  {
    id: 'normal-wide-grid',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.guide-layout',
    property: 'display',
    expectedValue: 'grid',
    media: { type: 'min-width', widthPx: 900 },
    feedback: 'Set .guide-layout display to grid inside min-width 900px.',
  },
  {
    id: 'boundary-wide-tracks',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '.guide-layout',
    property: 'grid-template-columns',
    expectedValue: '1fr 2fr',
    media: { type: 'min-width', widthPx: 900 },
    feedback:
      'Set .guide-layout grid-template-columns to 1fr 2fr inside min-width 900px.',
  },
];
