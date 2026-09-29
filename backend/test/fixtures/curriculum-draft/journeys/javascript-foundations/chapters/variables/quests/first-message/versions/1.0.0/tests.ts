export const cases = [
  {
    id: 'normal-message',
    kind: 'console',
    category: 'normal',
    expectedOutput: 'I am ready to code!',
    feedback: 'Compare the printed words with the target sentence.',
  },
  {
    id: 'boundary-exact-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: 'I am ready to code!',
    feedback:
      'Check exact capitalization, spacing, punctuation, and extra lines.',
  },
];
