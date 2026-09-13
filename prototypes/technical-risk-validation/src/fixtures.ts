export const quest = {
  id: 'Q01', contentVersion: '1', assessmentVersion: '1',
  title: 'Send your first signal',
  objective: 'Print exactly Ready for CodeQuest. Run explores your code; Check evaluates the objective.',
  starter: 'console.log("Not ready");',
  hint: 'Change the text between the quotes, then compare the output with the objective.',
  expected: 'Ready for CodeQuest',
} as const;

export const recordFixture = {
  id: 'RECORDS', contentVersion: '1', assessmentVersion: '1',
  title: 'Supplied inventory preview',
  objective: 'Return the total quantity from summarize(records). The display plumbing is supplied.',
  starter: 'function summarize(records) {\n  let total = 0;\n  for (const record of records) total += record.quantity;\n  return total;\n}',
};
