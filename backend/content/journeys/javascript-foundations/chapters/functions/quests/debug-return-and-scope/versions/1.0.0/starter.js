let total = 0;
function sumSteps(limit) {
  for (let n = 1; n <= limit; n = n + 1) {
    total = total + n;
  }
}
function repeatTotals(limit) {
  return sumSteps(limit) + sumSteps(limit);
}
