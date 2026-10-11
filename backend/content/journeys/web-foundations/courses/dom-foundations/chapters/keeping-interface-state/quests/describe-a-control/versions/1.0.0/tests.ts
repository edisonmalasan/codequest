export const cases = [
  {
    id: 'normal-night-status',
    category: 'normal',
    kind: 'interactive-text',
    selector: '#mode-status',
    events: [
      {
        type: 'click',
        targetId: 'mode-button',
      },
    ],
    expectedText: 'Night mode active',
    feedback: 'Announce the active mode.',
  },
  {
    id: 'boundary-initial-day',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#mode-status',
    events: [],
    expectedText: 'Day mode active',
    feedback: 'Keep the initial day message.',
  },
];
