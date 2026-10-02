export const cases = [
  {
    id: 'total-mixed',
    kind: 'function',
    category: 'normal',
    functionName: 'totalQuantity',
    args: [
      [
        {
          id: 'rope',
          name: 'rope',
          quantity: 2,
        },
        {
          id: 'map',
          name: 'map',
          quantity: 0,
        },
        {
          id: 'lamp',
          name: 'lamp',
          quantity: 3,
        },
      ],
    ],
    expected: 5,
    feedback: 'Add units, including zero, rather than counting records.',
  },
  {
    id: 'total-empty',
    kind: 'function',
    category: 'boundary',
    functionName: 'totalQuantity',
    args: [[]],
    expected: 0,
    feedback: 'An empty collection has zero units.',
  },
  {
    id: 'available-boundary',
    kind: 'function',
    category: 'boundary',
    functionName: 'availableNames',
    args: [
      [
        {
          id: 'rope',
          name: 'rope',
          quantity: 2,
        },
        {
          id: 'map',
          name: 'map',
          quantity: 0,
        },
        {
          id: 'lamp',
          name: 'lamp',
          quantity: 3,
        },
      ],
    ],
    expected: ['rope', 'lamp'],
    feedback: 'Select quantities greater than zero and retain input order.',
  },
  {
    id: 'adjust-clamped',
    kind: 'function',
    category: 'boundary',
    functionName: 'adjustQuantity',
    args: [
      [
        {
          id: 'rope',
          name: 'rope',
          quantity: 2,
        },
        {
          id: 'map',
          name: 'map',
          quantity: 0,
        },
        {
          id: 'lamp',
          name: 'lamp',
          quantity: 3,
        },
      ],
      'rope',
      -7,
    ],
    expected: [
      {
        id: 'rope',
        name: 'rope',
        quantity: 0,
      },
      {
        id: 'map',
        name: 'map',
        quantity: 0,
      },
      {
        id: 'lamp',
        name: 'lamp',
        quantity: 3,
      },
    ],
    feedback:
      'Clamp the chosen quantity at zero; retain every other record and order.',
  },
  {
    id: 'adjust-missing',
    kind: 'function',
    category: 'boundary',
    functionName: 'adjustQuantity',
    args: [
      [
        {
          id: 'rope',
          name: 'rope',
          quantity: 2,
        },
        {
          id: 'map',
          name: 'map',
          quantity: 0,
        },
        {
          id: 'lamp',
          name: 'lamp',
          quantity: 3,
        },
      ],
      'unknown',
      4,
    ],
    expected: [
      {
        id: 'rope',
        name: 'rope',
        quantity: 2,
      },
      {
        id: 'map',
        name: 'map',
        quantity: 0,
      },
      {
        id: 'lamp',
        name: 'lamp',
        quantity: 3,
      },
    ],
    feedback: 'A missing ID leaves values and record order unchanged.',
  },
  {
    id: 'report-updated',
    kind: 'function',
    category: 'normal',
    functionName: 'inventoryReport',
    args: [
      [
        {
          id: 'rope',
          name: 'rope',
          quantity: 2,
        },
        {
          id: 'map',
          name: 'map',
          quantity: 0,
        },
        {
          id: 'lamp',
          name: 'lamp',
          quantity: 3,
        },
      ],
      'map',
      4,
    ],
    expected: {
      items: [
        {
          id: 'rope',
          name: 'rope',
          quantity: 2,
        },
        {
          id: 'map',
          name: 'map',
          quantity: 4,
        },
        {
          id: 'lamp',
          name: 'lamp',
          quantity: 3,
        },
      ],
      total: 9,
      available: ['rope', 'map', 'lamp'],
    },
    feedback:
      'Build all report fields from the adjusted collection, not the old values.',
  },
  {
    id: 'report-empty',
    kind: 'function',
    category: 'boundary',
    functionName: 'inventoryReport',
    args: [[], 'none', 1],
    expected: {
      items: [],
      total: 0,
      available: [],
    },
    feedback:
      'Empty inventory still returns the complete declared report shape.',
  },
  {
    id: 'largest-mixed',
    kind: 'function',
    category: 'normal',
    functionName: 'largestQuantity',
    args: [
      [
        {
          id: 'rope',
          name: 'rope',
          quantity: 2,
        },
        {
          id: 'map',
          name: 'map',
          quantity: 0,
        },
        {
          id: 'lamp',
          name: 'lamp',
          quantity: 3,
        },
      ],
    ],
    expected: 3,
    feedback: 'Inspect all records; the largest quantity can be last.',
  },
  {
    id: 'largest-empty',
    kind: 'function',
    category: 'boundary',
    functionName: 'largestQuantity',
    args: [[]],
    expected: 0,
    feedback: 'Repair first-item access: an empty inventory has maximum zero.',
  },
  {
    id: 'transfer-boundaries',
    kind: 'function',
    category: 'boundary',
    functionName: 'lowStockNames',
    args: [
      [
        {
          id: 'grain',
          name: 'grain',
          quantity: 1,
        },
        {
          id: 'water',
          name: 'water',
          quantity: 2,
        },
        {
          id: 'fuel',
          name: 'fuel',
          quantity: 3,
        },
        {
          id: 'spare',
          name: 'grain',
          quantity: 0,
        },
      ],
      2,
    ],
    expected: ['grain', 'water', 'grain'],
    feedback:
      'Transfer uses quantity at most the threshold, includes zero and equality, and keeps repeated names/order.',
  },
];
