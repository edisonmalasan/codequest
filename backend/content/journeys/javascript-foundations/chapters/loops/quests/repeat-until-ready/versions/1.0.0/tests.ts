export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: '3\n3',
    feedback:
      'Stop at energy 3 and perform no update for the already-ready example.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: '3\n3',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
