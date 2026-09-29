export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: '14\n2\n10',
    feedback:
      'Multiply quantity by unit price, then add the fee once; zero quantity still retains the fee.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: '14\n2\n10',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
