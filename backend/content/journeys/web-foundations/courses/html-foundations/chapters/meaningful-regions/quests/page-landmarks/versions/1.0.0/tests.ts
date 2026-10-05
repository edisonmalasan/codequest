export const cases = [
  {
    "id": "normal-header",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#journal-head",
    "tag": "header",
    "expectedAttributes": [],
    "feedback": "Use a page header."
  },
  {
    "id": "normal-main",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#journal-main",
    "tag": "main",
    "expectedAttributes": [],
    "feedback": "Central content belongs in main."
  },
  {
    "id": "boundary-footer",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#journal-foot",
    "tag": "footer",
    "expectedAttributes": [],
    "feedback": "Add a footer landmark."
  },
  {
    "id": "boundary-title",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#journal-title",
    "tag": "h1",
    "expectedText": "Field journal",
    "expectedAttributes": [],
    "feedback": "Keep the page title in an h1."
  }
];
