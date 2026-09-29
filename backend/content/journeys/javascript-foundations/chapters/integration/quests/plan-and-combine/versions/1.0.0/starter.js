function stockTotal(items) {
  return items.length;
}
function availableCount(items) {
  return items.length;
}
function inventorySummary(items) {
  return { total: stockTotal(items), available: availableCount(items) };
}
