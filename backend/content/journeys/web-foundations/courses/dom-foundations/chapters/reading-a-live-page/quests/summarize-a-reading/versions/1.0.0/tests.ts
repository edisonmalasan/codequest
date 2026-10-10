export const cases = [
  {
    "id": "normal-summary",
    "category": "normal",
    "kind": "interactive-text",
    "selector": "#summary",
    "events": [],
    "expectedText": "Current reading: 18 degrees",
    "feedback": "Copy the reading into the summary."
  },
  {
    "id": "boundary-original",
    "category": "boundary",
    "kind": "interactive-text",
    "selector": "#reading",
    "events": [],
    "expectedText": "18 degrees",
    "feedback": "Keep the source reading intact."
  }
];
