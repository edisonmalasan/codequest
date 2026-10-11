export const cases = [
  {
    id: 'normal-reading',
    category: 'normal',
    kind: 'interactive-text',
    selector: '#reading-status',
    events: [
      {
        type: 'input',
        targetId: 'reading-input',
        value: '42',
      },
    ],
    expectedText: 'Reading accepted: 42',
    feedback: 'Accept an in-range reading.',
  },
  {
    id: 'boundary-outside',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#reading-status',
    events: [
      {
        type: 'input',
        targetId: 'reading-input',
        value: '101',
      },
    ],
    expectedText: 'Reading outside range',
    feedback: 'Reject out-of-range values.',
  },
  {
    id: 'boundary-empty',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#reading-status',
    events: [
      {
        type: 'input',
        targetId: 'reading-input',
        value: '',
      },
    ],
    expectedText: 'Enter a reading',
    feedback: 'Explain empty input.',
  },
];
