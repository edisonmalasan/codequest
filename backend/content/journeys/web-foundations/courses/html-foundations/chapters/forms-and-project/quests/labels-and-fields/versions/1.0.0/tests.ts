export const cases = [
  {
    "id": "normal-label",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#email-label",
    "tag": "label",
    "expectedText": "Email address",
    "expectedAttributes": [
      {
        "name": "for",
        "value": "email-field"
      }
    ],
    "feedback": "Connect the visible label to email-field."
  },
  {
    "id": "boundary-field",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#email-field",
    "tag": "input",
    "expectedAttributes": [
      {
        "name": "name",
        "value": "email"
      },
      {
        "name": "type",
        "value": "email"
      }
    ],
    "feedback": "Use an email input with the declared field name."
  }
];
