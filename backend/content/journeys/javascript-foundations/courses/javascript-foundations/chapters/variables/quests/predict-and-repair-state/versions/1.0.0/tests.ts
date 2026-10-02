export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: '4\n2\n0',
    feedback:
      'Trace assignment order and check the spelling of the counter name.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: '4\n2\n0',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
