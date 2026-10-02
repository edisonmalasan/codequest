export const cases = [
  {
    id: 'total-four',
    kind: 'function',
    category: 'normal',
    functionName: 'stepTotal',
    args: [4],
    expected: 10,
    feedback:
      'stepTotal must include each integer 1 through the limit, returning zero for limit zero.',
  },
  {
    id: 'total-zero',
    kind: 'function',
    category: 'boundary',
    functionName: 'stepTotal',
    args: [0],
    expected: 0,
    feedback:
      'stepTotal must include each integer 1 through the limit, returning zero for limit zero.',
  },
  {
    id: 'format-five',
    kind: 'function',
    category: 'normal',
    functionName: 'formatTotal',
    args: [5],
    expected: 'Total: 5',
    feedback:
      'formatTotal returns the exact prefix Total: followed by a space and the numeric value.',
  },
  {
    id: 'report-three',
    kind: 'function',
    category: 'normal',
    functionName: 'journeyReport',
    args: [3],
    expected: 'Total: 6',
    feedback: 'journeyReport must return the formatted inclusive step total.',
  },
  {
    id: 'report-zero',
    kind: 'function',
    category: 'boundary',
    functionName: 'journeyReport',
    args: [0],
    expected: 'Total: 0',
    feedback: 'journeyReport must return the formatted inclusive step total.',
  },
];
