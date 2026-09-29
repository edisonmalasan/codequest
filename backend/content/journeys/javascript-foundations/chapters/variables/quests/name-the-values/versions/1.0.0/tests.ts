export const cases = [
  {
    id: 'normal-output',
    kind: 'console',
    category: 'normal',
    expectedOutput: '12\nnumber\nMira\nstring\ntrue\nboolean\n0\nnumber',
    feedback:
      'Check each binding value and typeof result; numeric and boolean literals are not quoted.',
  },
  {
    id: 'boundary-output',
    kind: 'console',
    category: 'boundary',
    expectedOutput: '12\nnumber\nMira\nstring\ntrue\nboolean\n0\nnumber',
    feedback:
      'Inspect the declared boundary examples and remove extra console lines.',
  },
];
