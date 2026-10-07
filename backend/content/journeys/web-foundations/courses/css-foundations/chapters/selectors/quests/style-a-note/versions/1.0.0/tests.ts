export const cases = [
  {
    id: 'normal-note-color',
    category: 'normal',
    kind: 'css-declaration',
    selector: '.field-note',
    property: 'color',
    expectedValue: 'navy',
    feedback: 'Set the field-note text color to navy.',
  },
  {
    id: 'boundary-note-background',
    category: 'boundary',
    kind: 'css-declaration',
    selector: '.field-note',
    property: 'background-color',
    expectedValue: '#f2e9d8',
    feedback: 'Set the field-note background color to #f2e9d8.',
  },
];
