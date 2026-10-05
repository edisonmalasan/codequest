export const cases = [
  {
    "id": "normal-title",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#guide-title",
    "tag": "h1",
    "expectedText": "River field guide",
    "expectedAttributes": [],
    "feedback": "Name the field guide."
  },
  {
    "id": "normal-main",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#guide-main",
    "tag": "main",
    "expectedAttributes": [],
    "feedback": "Use a main landmark."
  },
  {
    "id": "normal-link",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#route-link",
    "tag": "a",
    "expectedText": "Read the route",
    "expectedAttributes": [
      {
        "name": "href",
        "value": "#route"
      }
    ],
    "feedback": "Link to the route section."
  },
  {
    "id": "normal-route",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#route",
    "tag": "section",
    "expectedAttributes": [],
    "feedback": "Add the matching route section."
  },
  {
    "id": "boundary-heading",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#route-heading",
    "tag": "h2",
    "expectedText": "The route",
    "expectedAttributes": [],
    "feedback": "Name the route section."
  },
  {
    "id": "boundary-figure",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#guide-figure",
    "tag": "figure",
    "expectedAttributes": [],
    "feedback": "Group the illustration and caption."
  },
  {
    "id": "boundary-image",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#guide-image",
    "tag": "img",
    "expectedAttributes": [
      {
        "name": "alt",
        "value": "Map showing the river crossing"
      }
    ],
    "feedback": "Describe the supplied image."
  },
  {
    "id": "boundary-caption",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#guide-caption",
    "tag": "figcaption",
    "expectedText": "Crossing sketch",
    "expectedAttributes": [],
    "feedback": "Use a figure caption."
  },
  {
    "id": "boundary-label",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#note-label",
    "tag": "label",
    "expectedText": "Observation",
    "expectedAttributes": [
      {
        "name": "for",
        "value": "note-field"
      }
    ],
    "feedback": "Associate the observation label."
  },
  {
    "id": "boundary-field",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#note-field",
    "tag": "input",
    "expectedAttributes": [
      {
        "name": "name",
        "value": "observation"
      },
      {
        "name": "type",
        "value": "text"
      }
    ],
    "feedback": "Use the named text input."
  }
];
