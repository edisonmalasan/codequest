export const cases = [
  {
    "id": "normal-table",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#observations",
    "tag": "table",
    "expectedAttributes": [],
    "feedback": "Use a table for the comparison."
  },
  {
    "id": "normal-day",
    "category": "normal",
    "kind": "html-semantic",
    "selector": "#day-head",
    "tag": "th",
    "expectedText": "Day",
    "expectedAttributes": [],
    "feedback": "Mark Day as a column header."
  },
  {
    "id": "boundary-weather",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#weather-head",
    "tag": "th",
    "expectedText": "Weather",
    "expectedAttributes": [],
    "feedback": "Mark Weather as a column header."
  },
  {
    "id": "boundary-cell",
    "category": "boundary",
    "kind": "html-semantic",
    "selector": "#tuesday",
    "tag": "td",
    "expectedText": "Tuesday",
    "expectedAttributes": [],
    "feedback": "Put Tuesday in a data cell."
  }
];
