export const cases = [
  {
    id: 'rope-pack',
    kind: 'function',
    category: 'normal',
    functionName: 'pack',
    args: ['rope'],
    expected: [3, 'rope', 'lamp', 'water'],
    feedback:
      'Preserve the first item, replace index 1 with lamp and return count plus the ordered items.',
  },
  {
    id: 'empty-first',
    kind: 'function',
    category: 'boundary',
    functionName: 'pack',
    args: [''],
    expected: [3, '', 'lamp', 'water'],
    feedback:
      'Preserve the first item, replace index 1 with lamp and return count plus the ordered items.',
  },
  {
    id: 'key-pack',
    kind: 'function',
    category: 'normal',
    functionName: 'pack',
    args: ['key'],
    expected: [3, 'key', 'lamp', 'water'],
    feedback:
      'Preserve the first item, replace index 1 with lamp and return count plus the ordered items.',
  },
];
