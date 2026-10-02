export const cases = [
  {
    id: 'middle-maximum',
    kind: 'function',
    category: 'normal',
    functionName: 'largestStock',
    args: [[2, 7, 4]],
    expected: 7,
    feedback:
      'Handle empty input explicitly and inspect every nonnegative count before returning the maximum.',
  },
  {
    id: 'empty-counts',
    kind: 'function',
    category: 'boundary',
    functionName: 'largestStock',
    args: [[]],
    expected: 0,
    feedback:
      'Handle empty input explicitly and inspect every nonnegative count before returning the maximum.',
  },
  {
    id: 'single-zero',
    kind: 'function',
    category: 'boundary',
    functionName: 'largestStock',
    args: [[0]],
    expected: 0,
    feedback:
      'Handle empty input explicitly and inspect every nonnegative count before returning the maximum.',
  },
  {
    id: 'last-maximum',
    kind: 'function',
    category: 'normal',
    functionName: 'largestStock',
    args: [[1, 1, 5]],
    expected: 5,
    feedback:
      'Handle empty input explicitly and inspect every nonnegative count before returning the maximum.',
  },
  {
    id: 'first-maximum',
    kind: 'function',
    category: 'normal',
    functionName: 'largestStock',
    args: [[9, 2, 2]],
    expected: 9,
    feedback:
      'Handle empty input explicitly and inspect every nonnegative count before returning the maximum.',
  },
];
