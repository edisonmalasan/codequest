export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: 'false\ntrue\ntrue\nfalse',
    feedback:
      'The threshold includes 10; strict equality distinguishes number 10 from string "10".',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: 'false\ntrue\ntrue\nfalse',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
