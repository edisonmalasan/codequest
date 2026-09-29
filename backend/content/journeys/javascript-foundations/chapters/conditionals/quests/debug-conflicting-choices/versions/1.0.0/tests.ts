export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: 'Debt\nEmpty\nStock',
    feedback:
      'Use exclusive categories and ensure zero is Empty; remove duplicate output.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: 'Debt\nEmpty\nStock',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
