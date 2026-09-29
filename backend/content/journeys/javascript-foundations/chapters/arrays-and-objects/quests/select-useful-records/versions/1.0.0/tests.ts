export const cases = [
  {
    id: 'mixed-stock',
    kind: 'function',
    category: 'normal',
    functionName: 'availableNames',
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
          quantity: 1,
        },
      ],
    ],
    expected: ['rope', 'lamp'],
    feedback:
      'Select only positive quantities, preserving order and repeated names; return [] for empty or zero-only stock.',
  },
  {
    id: 'empty-records',
    kind: 'function',
    category: 'boundary',
    functionName: 'availableNames',
    args: [[]],
    expected: [],
    feedback:
      'Select only positive quantities, preserving order and repeated names; return [] for empty or zero-only stock.',
  },
  {
    id: 'zero-stock',
    kind: 'function',
    category: 'boundary',
    functionName: 'availableNames',
    args: [
      [
        {
          name: 'key',
          quantity: 0,
        },
      ],
    ],
    expected: [],
    feedback:
      'Select only positive quantities, preserving order and repeated names; return [] for empty or zero-only stock.',
  },
  {
    id: 'repeated-name',
    kind: 'function',
    category: 'normal',
    functionName: 'availableNames',
    args: [
      [
        {
          name: 'rope',
          quantity: 1,
        },
        {
          name: 'rope',
          quantity: 2,
        },
      ],
    ],
    expected: ['rope', 'rope'],
    feedback:
      'Select only positive quantities, preserving order and repeated names; return [] for empty or zero-only stock.',
  },
];
