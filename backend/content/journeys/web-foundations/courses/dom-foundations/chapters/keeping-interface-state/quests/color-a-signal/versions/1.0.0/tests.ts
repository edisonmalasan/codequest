export const cases = [
  {
    "id": "normal-ready-text",
    "category": "normal",
    "kind": "interactive-text",
    "selector": "#signal-status",
    "events": [
      {
        "type": "click",
        "targetId": "signal-button"
      }
    ],
    "expectedText": "Signal ready",
    "feedback": "Name the ready state."
  },
  {
    "id": "boundary-idle-text",
    "category": "boundary",
    "kind": "interactive-text",
    "selector": "#signal-status",
    "events": [],
    "expectedText": "Signal idle",
    "feedback": "Keep the initial idle state."
  }
];
