export const cases = [
  {
    "id": "normal-kit",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#kit",
    "tag": "ul",
    "expectedAttributes": [],
    "feedback": "Use an unordered list for the kit."
  },
  {
    "id": "normal-item",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#water",
    "tag": "li",
    "expectedText": "Water bottle",
    "expectedAttributes": [],
    "feedback": "Add the water item."
  },
  {
    "id": "boundary-route",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#steps",
    "tag": "ol",
    "expectedAttributes": [],
    "feedback": "Route steps need an ordered list."
  },
  {
    "id": "boundary-first",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#first-step",
    "tag": "li",
    "expectedText": "Read the map",
    "expectedAttributes": [],
    "feedback": "Name the first route step."
  }
];
