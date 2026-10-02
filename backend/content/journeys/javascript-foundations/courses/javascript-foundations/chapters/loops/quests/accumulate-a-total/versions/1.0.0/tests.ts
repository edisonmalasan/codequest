export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: '0\n1\n10',
    feedback:
      'Keep the old total when adding a number, include the endpoint and leave the empty sum at zero.',
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
