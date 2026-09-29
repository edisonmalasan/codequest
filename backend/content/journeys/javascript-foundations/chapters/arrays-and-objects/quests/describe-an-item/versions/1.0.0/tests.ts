export const cases = [
  {
    id: 'add-stock',
    kind: 'function',
    category: 'normal',
    functionName: 'restock',
    args: [
      {
        name: 'rope',
        count: 2,
      },
      3,
    ],
    expected: {
      name: 'rope',
      count: 5,
    },
    feedback:
      'Return name unchanged and count equal to the old count plus amount, with exactly those two properties.',
  },
  {
    id: 'no-addition',
    kind: 'function',
    category: 'boundary',
    functionName: 'restock',
    args: [
      {
        name: 'map',
        count: 4,
      },
      0,
    ],
    expected: {
      name: 'map',
      count: 4,
    },
    feedback:
      'Return name unchanged and count equal to the old count plus amount, with exactly those two properties.',
  },
  {
    id: 'empty-stock',
    kind: 'function',
    category: 'boundary',
    functionName: 'restock',
    args: [
      {
        name: 'lamp',
        count: 0,
      },
      2,
    ],
    expected: {
      name: 'lamp',
      count: 2,
    },
    feedback:
      'Return name unchanged and count equal to the old count plus amount, with exactly those two properties.',
  },
];
