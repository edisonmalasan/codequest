export const cases = [
  {
    id: 'normal-one-sample',
    category: 'normal',
    kind: 'interactive-text',
    selector: '#sample-count',
    events: [
      {
        type: 'click',
        targetId: 'sample-button',
      },
    ],
    expectedText: 'Samples: 1',
    feedback: 'Count the first sample.',
  },
  {
    id: 'boundary-three-samples',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#sample-count',
    events: [
      {
        type: 'click',
        targetId: 'sample-button',
      },
      {
        type: 'click',
        targetId: 'sample-button',
      },
      {
        type: 'click',
        targetId: 'sample-button',
      },
    ],
    expectedText: 'Samples: 3',
    feedback: 'Keep count across repeated clicks.',
  },
];
