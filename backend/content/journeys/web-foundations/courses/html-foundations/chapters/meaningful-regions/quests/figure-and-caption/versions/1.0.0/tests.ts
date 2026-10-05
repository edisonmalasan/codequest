export const cases = [
  {
    id: 'normal-figure',
    category: 'normal',
    kind: 'html-semantic',
    selector: '#crossing',
    tag: 'figure',
    expectedAttributes: [],
    feedback: 'Group image and caption in a figure.',
  },
  {
    id: 'normal-image',
    category: 'normal',
    kind: 'html-semantic',
    selector: '#crossing-image',
    tag: 'img',
    expectedAttributes: [
      {
        name: 'alt',
        value: 'Two paths meet by the river',
      },
    ],
    feedback: 'Give the illustration a useful alt.',
  },
  {
    id: 'boundary-caption',
    category: 'boundary',
    kind: 'html-semantic',
    selector: '#crossing-caption',
    tag: 'figcaption',
    expectedText: 'River crossing',
    expectedAttributes: [],
    feedback: 'Use figcaption for the figure label.',
  },
];
