export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: 'Ready: true\nReady: false\nReady: false',
    feedback:
      'Departure needs both supplies at or above 2 and a map; keep the declared message spacing.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: 'Ready: true\nReady: false\nReady: false',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
