export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: 'Practice\nSilver\nSilver\nGold\nGold',
    feedback:
      'Check both inclusive thresholds and make the first matching category the intended one.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: 'Practice\nSilver\nSilver\nGold\nGold',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
