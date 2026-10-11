export const cases = [
  {
    id: 'normal-click-opens',
    category: 'normal',
    kind: 'interactive-text',
    selector: '#gate-status',
    events: [
      {
        type: 'click',
        targetId: 'gate-button',
      },
    ],
    expectedText: 'Gate open',
    feedback: 'Open the gate on click.',
  },
  {
    id: 'boundary-initial-closed',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#gate-status',
    events: [],
    expectedText: 'Gate closed',
    feedback: 'Keep the initial closed state.',
  },
];
