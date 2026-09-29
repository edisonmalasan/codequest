function availableNames(items) {
  const selected = [];
  for (let i = 0; i < items.length; i = i + 1) {
    if (items[i].quantity >= 0) {
      selected.push(items[i].name);
    }
  }
  return selected;
}
