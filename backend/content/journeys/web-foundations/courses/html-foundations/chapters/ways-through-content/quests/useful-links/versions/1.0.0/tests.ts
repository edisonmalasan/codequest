export const cases = [
  {
    id: 'normal-link',
    category: 'normal',
    kind: 'html-semantic',
    selector: '#hours-link',
    tag: 'a',
    expectedText: 'Opening hours',
    expectedAttributes: [
      {
        name: 'href',
        value: '#hours',
      },
    ],
    feedback: 'Use the descriptive link and local fragment.',
  },
  {
    id: 'boundary-target',
    category: 'boundary',
    kind: 'html-semantic',
    selector: '#hours',
    tag: 'section',
    expectedAttributes: [],
    feedback: 'Add the matching target section.',
  },
];
