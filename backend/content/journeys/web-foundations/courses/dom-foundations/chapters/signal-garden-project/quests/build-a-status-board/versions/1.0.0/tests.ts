export const cases = [
  {
    id: 'normal-first-save',
    category: 'normal',
    kind: 'interactive-text',
    selector: '#board-status',
    events: [
      {
        type: 'input',
        targetId: 'plot-input',
        value: 'orchard',
      },
      {
        type: 'click',
        targetId: 'save-button',
      },
    ],
    expectedText: 'Saved plot: orchard',
    feedback: 'Save the entered plot.',
  },
  {
    id: 'boundary-empty-save',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#board-status',
    events: [
      {
        type: 'click',
        targetId: 'save-button',
      },
    ],
    expectedText: 'Enter a plot name',
    feedback: 'Explain the missing name.',
  },
  {
    id: 'boundary-latest-save',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#board-status',
    events: [
      {
        type: 'input',
        targetId: 'plot-input',
        value: 'orchard',
      },
      {
        type: 'click',
        targetId: 'save-button',
      },
      {
        type: 'input',
        targetId: 'plot-input',
        value: 'grove',
      },
      {
        type: 'click',
        targetId: 'save-button',
      },
    ],
    expectedText: 'Saved plot: grove',
    feedback: 'Use the latest name on repeated saves.',
  },
  {
    id: 'boundary-initial',
    category: 'boundary',
    kind: 'interactive-text',
    selector: '#board-status',
    events: [],
    expectedText: 'No plot saved',
    feedback: 'Keep the initial message.',
  },
];
