function scoreCategory(score) {
  if (score > 80) {
    return 'Gold';
  }
  if (score > 50) {
    return 'Silver';
  }
  return 'Practice';
}
