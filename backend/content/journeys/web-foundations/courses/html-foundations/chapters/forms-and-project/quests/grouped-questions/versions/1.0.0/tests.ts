export const cases = [
  {
    "id": "normal-group",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#route-group",
    "tag": "fieldset",
    "expectedAttributes": [],
    "feedback": "Group the related field in fieldset."
  },
  {
    "id": "normal-legend",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#route-legend",
    "tag": "legend",
    "expectedText": "Choose a trail",
    "expectedAttributes": [],
    "feedback": "Name the group with legend."
  },
  {
    "id": "boundary-label",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#trail-label",
    "tag": "label",
    "expectedText": "Trail name",
    "expectedAttributes": [
      {
        "name": "for",
        "value": "trail-field"
      }
    ],
    "feedback": "Associate the visible label with trail-field."
  },
  {
    "id": "boundary-input",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#trail-field",
    "tag": "input",
    "expectedAttributes": [
      {
        "name": "name",
        "value": "trail"
      },
      {
        "name": "type",
        "value": "text"
      }
    ],
    "feedback": "Use a named text field."
  }
];
