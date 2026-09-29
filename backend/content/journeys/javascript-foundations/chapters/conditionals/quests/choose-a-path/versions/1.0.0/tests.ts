export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: 'Explore\nStay',
    feedback:
      'Trace true and false separately and print exactly one appropriate message for each.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: 'Explore\nStay',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
