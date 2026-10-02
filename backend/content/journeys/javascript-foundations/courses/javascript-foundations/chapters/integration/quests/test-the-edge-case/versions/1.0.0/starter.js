function largestStock(counts) {
  let largest = counts[0];
  for (let i = 1; i < counts.length; i = i + 1) {
    if (counts[i] > largest) {
      largest = counts[i];
    }
  }
  return largest;
}
