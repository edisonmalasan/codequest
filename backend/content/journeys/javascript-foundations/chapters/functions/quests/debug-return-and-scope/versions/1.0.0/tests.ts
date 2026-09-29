export const cases = [
  {
    id: 'sum-three',
    kind: 'function',
    category: 'normal',
    functionName: 'sumSteps',
    args: [3],
    expected: 6,
    feedback: 'Initialize a local accumulator and return the inclusive sum.',
  },
  {
    id: 'sum-empty',
    kind: 'function',
    category: 'boundary',
    functionName: 'sumSteps',
    args: [0],
    expected: 0,
    feedback: 'Initialize a local accumulator and return the inclusive sum.',
  },
  {
    id: 'repeat-three',
    kind: 'function',
    category: 'normal',
    functionName: 'repeatTotals',
    args: [3],
    expected: 12,
    feedback:
      'Repeated calls must each start at zero and return their own result.',
  },
  {
    id: 'repeat-empty',
    kind: 'function',
    category: 'boundary',
    functionName: 'repeatTotals',
    args: [0],
    expected: 0,
    feedback:
      'Repeated calls must each start at zero and return their own result.',
  },
  {
    id: 'repeat-one',
    kind: 'function',
    category: 'boundary',
    functionName: 'repeatTotals',
    args: [1],
    expected: 2,
    feedback:
      'Repeated calls must each start at zero and return their own result.',
  },
];
