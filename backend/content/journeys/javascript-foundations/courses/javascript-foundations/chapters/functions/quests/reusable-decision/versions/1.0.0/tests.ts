export const cases = [
  {
    id: 'below-silver',
    kind: 'function',
    category: 'normal',
    functionName: 'scoreCategory',
    args: [49],
    expected: 'Practice',
    feedback:
      'Return the category owning this score; include 50 in Silver and 80 in Gold.',
  },
  {
    id: 'silver-start',
    kind: 'function',
    category: 'boundary',
    functionName: 'scoreCategory',
    args: [50],
    expected: 'Silver',
    feedback:
      'Return the category owning this score; include 50 in Silver and 80 in Gold.',
  },
  {
    id: 'silver-end',
    kind: 'function',
    category: 'boundary',
    functionName: 'scoreCategory',
    args: [79],
    expected: 'Silver',
    feedback:
      'Return the category owning this score; include 50 in Silver and 80 in Gold.',
  },
  {
    id: 'gold-start',
    kind: 'function',
    category: 'boundary',
    functionName: 'scoreCategory',
    args: [80],
    expected: 'Gold',
    feedback:
      'Return the category owning this score; include 50 in Silver and 80 in Gold.',
  },
  {
    id: 'upper-score',
    kind: 'function',
    category: 'normal',
    functionName: 'scoreCategory',
    args: [100],
    expected: 'Gold',
    feedback:
      'Return the category owning this score; include 50 in Silver and 80 in Gold.',
  },
  {
    id: 'zero-score',
    kind: 'function',
    category: 'boundary',
    functionName: 'scoreCategory',
    args: [0],
    expected: 'Practice',
    feedback:
      'Return the category owning this score; include 50 in Silver and 80 in Gold.',
  },
];
