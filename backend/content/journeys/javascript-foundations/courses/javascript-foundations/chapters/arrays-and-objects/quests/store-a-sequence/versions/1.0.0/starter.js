function pack(first) {
  const items = [first, 'food', 'water'];
  items[0] = 'lamp';
  return [items.length, items[0], items[1], items[2]];
}
