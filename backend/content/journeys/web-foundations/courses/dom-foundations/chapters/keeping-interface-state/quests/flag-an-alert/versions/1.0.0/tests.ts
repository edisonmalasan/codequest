export const cases = [
  {
    id: 'normal-flag-message',
    category: 'normal',
    kind: 'interactive-text',
    selector: '#alert',
    events: [
      {
        type: 'click',
        targetId: 'flag-button',
      },
    ],
    expectedText: 'Reading flagged',
    feedback: 'Describe the flagged state in text.',
  },
  {
    id: 'boundary-initial-calm',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#alert',
    events: [],
    expectedText: 'All clear',
    feedback: 'Keep the initial calm message.',
  },
];
