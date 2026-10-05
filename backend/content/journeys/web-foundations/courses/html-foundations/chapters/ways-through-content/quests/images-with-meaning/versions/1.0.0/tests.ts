export const cases = [
  {
    "id": "normal-image",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#route-map",
    "tag": "img",
    "expectedAttributes": [
      {
        "name": "alt",
        "value": "Map showing the river crossing"
      }
    ],
    "feedback": "Provide a meaningful alt for the supplied map."
  },
  {
    "id": "boundary-note",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#map-note",
    "tag": "p",
    "expectedText": "Cross at the stone bridge.",
    "expectedAttributes": [],
    "feedback": "Add the crossing instruction as text."
  }
];
