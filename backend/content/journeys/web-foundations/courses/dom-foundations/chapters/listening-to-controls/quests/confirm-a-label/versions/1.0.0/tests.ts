export const cases = [
  {
    "id": "normal-confirm",
    "category": "normal",
    "kind": "interactive-text",
    "selector": "#confirmation",
    "events": [
      {
        "type": "change",
        "targetId": "plot-label",
        "value": "east plot"
      }
    ],
    "expectedText": "Confirmed: east plot",
    "feedback": "Confirm a changed label."
  },
  {
    "id": "boundary-empty-confirm",
    "category": "boundary",
    "kind": "interactive-text",
    "selector": "#confirmation",
    "events": [
      {
        "type": "change",
        "targetId": "plot-label",
        "value": ""
      }
    ],
    "expectedText": "No label confirmed",
    "feedback": "Keep useful empty feedback."
  }
];
