export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: '0\n1\n10',
    feedback:
      'The endpoint belongs in the sum: trace limit 1 and then include the last number for limit 4.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: '0\n1\n10',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
