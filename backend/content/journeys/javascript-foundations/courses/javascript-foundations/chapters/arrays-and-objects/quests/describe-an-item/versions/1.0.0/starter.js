function restock(item, amount) {
  const result = { name: item.name, count: item.cout };
  result.count = amount;
  return result;
}
