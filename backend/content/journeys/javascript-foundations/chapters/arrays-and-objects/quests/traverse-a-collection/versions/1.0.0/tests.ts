export const cases = [
  {
    id: 'several-values',
    kind: 'function',
    category: 'normal',
    functionName: 'sumNumbers',
    args: [[2, 5, 3]],
    expected: 10,
    feedback:
      'Add the array element, not its index; keep the empty total at zero and include every value.',
  },
  {
    id: 'empty-array',
    kind: 'function',
    category: 'boundary',
    functionName: 'sumNumbers',
    args: [[]],
    expected: 0,
    feedback:
      'Add the array element, not its index; keep the empty total at zero and include every value.',
  },
  {
    id: 'single-value',
    kind: 'function',
    category: 'boundary',
    functionName: 'sumNumbers',
    args: [[7]],
    expected: 7,
    feedback:
      'Add the array element, not its index; keep the empty total at zero and include every value.',
  },
  {
    id: 'mixed-signs',
    kind: 'function',
    category: 'normal',
    functionName: 'sumNumbers',
    args: [[-2, 5, 0]],
    expected: 3,
    feedback:
      'Add the array element, not its index; keep the empty total at zero and include every value.',
  },
];
