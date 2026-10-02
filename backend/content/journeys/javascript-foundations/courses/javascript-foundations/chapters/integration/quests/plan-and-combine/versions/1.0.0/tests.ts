export const cases = [
  {
    id: 'total-mixed',
    kind: 'function',
    category: 'normal',
    functionName: 'stockTotal',
    args: [
      [
        {
          name: 'rope',
          quantity: 2,
        },
        {
          name: 'map',
          quantity: 0,
        },
        {
          name: 'lamp',
          quantity: 3,
        },
      ],
    ],
    expected: 5,
    feedback: 'stockTotal adds quantities, not the number of records.',
  },
  {
    id: 'total-empty',
    kind: 'function',
    category: 'boundary',
    functionName: 'stockTotal',
    args: [[]],
    expected: 0,
    feedback: 'stockTotal adds quantities, not the number of records.',
  },
  {
    id: 'count-mixed',
    kind: 'function',
    category: 'normal',
    functionName: 'availableCount',
    args: [
      [
        {
          name: 'rope',
          quantity: 2,
        },
        {
          name: 'map',
          quantity: 0,
        },
        {
          name: 'lamp',
          quantity: 3,
        },
      ],
    ],
    expected: 2,
    feedback:
      'availableCount counts records with positive quantity, excluding zero.',
  },
  {
    id: 'count-zero',
    kind: 'function',
    category: 'boundary',
    functionName: 'availableCount',
    args: [
      [
        {
          name: 'key',
          quantity: 0,
        },
      ],
    ],
    expected: 0,
    feedback:
      'availableCount counts records with positive quantity, excluding zero.',
  },
  {
    id: 'summary-mixed',
    kind: 'function',
    category: 'normal',
    functionName: 'inventorySummary',
    args: [
      [
        {
          name: 'rope',
          quantity: 2,
        },
        {
          name: 'map',
          quantity: 0,
        },
        {
          name: 'lamp',
          quantity: 3,
        },
      ],
    ],
    expected: {
      total: 5,
      available: 2,
    },
    feedback:
      'Return exactly total and available: summed units and number of positive-quantity records.',
  },
  {
    id: 'summary-empty',
    kind: 'function',
    category: 'boundary',
    functionName: 'inventorySummary',
    args: [[]],
    expected: {
      total: 0,
      available: 0,
    },
    feedback:
      'Return exactly total and available: summed units and number of positive-quantity records.',
  },
  {
    id: 'summary-single',
    kind: 'function',
    category: 'boundary',
    functionName: 'inventorySummary',
    args: [
      [
        {
          name: 'key',
          quantity: 4,
        },
      ],
    ],
    expected: {
      total: 4,
      available: 1,
    },
    feedback:
      'Return exactly total and available: summed units and number of positive-quantity records.',
  },
];
