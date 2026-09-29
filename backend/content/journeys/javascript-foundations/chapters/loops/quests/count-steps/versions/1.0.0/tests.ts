export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: '1\n2\n3',
    feedback:
      'Include steps 1 through 3 exactly once and print no steps for a zero limit.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: '1\n2\n3',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
