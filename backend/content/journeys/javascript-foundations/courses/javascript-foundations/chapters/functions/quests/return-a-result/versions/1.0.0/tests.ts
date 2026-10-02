export const cases = [
  {
    id: 'normal-order',
    kind: 'function',
    category: 'normal',
    functionName: 'resourceCost',
    args: [3, 4, 2],
    expected: 14,
    feedback:
      'Return quantity * price plus one fee; printing alone does not return a number.',
  },
  {
    id: 'zero-quantity',
    kind: 'function',
    category: 'boundary',
    functionName: 'resourceCost',
    args: [0, 4, 2],
    expected: 2,
    feedback:
      'Return quantity * price plus one fee; printing alone does not return a number.',
  },
  {
    id: 'no-fee',
    kind: 'function',
    category: 'boundary',
    functionName: 'resourceCost',
    args: [2, 5, 0],
    expected: 10,
    feedback:
      'Return quantity * price plus one fee; printing alone does not return a number.',
  },
  {
    id: 'single-item',
    kind: 'function',
    category: 'normal',
    functionName: 'resourceCost',
    args: [1, 7, 3],
    expected: 10,
    feedback:
      'Return quantity * price plus one fee; printing alone does not return a number.',
  },
];
