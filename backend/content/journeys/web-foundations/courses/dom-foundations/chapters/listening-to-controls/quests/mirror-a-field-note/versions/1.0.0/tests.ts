export const cases = [
  {
    "id": "normal-note",
    "category": "normal",
    "kind": "interactive-text",
    "selector": "#note-preview",
    "events": [
      {
        "type": "input",
        "targetId": "note",
        "value": "mint"
      }
    ],
    "expectedText": "Note: mint",
    "feedback": "Mirror the entered note."
  },
  {
    "id": "boundary-empty-note",
    "category": "boundary",
    "kind": "interactive-text",
    "selector": "#note-preview",
    "events": [
      {
        "type": "input",
        "targetId": "note",
        "value": ""
      }
    ],
    "expectedText": "No note yet",
    "feedback": "Show the empty-state message."
  }
];
