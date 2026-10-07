export const cases = [
  {
    id: 'normal-note-ink',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.observation',
    property: 'color',
    expectedValue: 'navy',
    feedback: 'Set .observation color to navy.',
  },
  {
    id: 'boundary-note-surface',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '.observation',
    property: 'background-color',
    expectedValue: 'yellow',
    feedback: 'Set .observation background-color to yellow.',
  },
];
