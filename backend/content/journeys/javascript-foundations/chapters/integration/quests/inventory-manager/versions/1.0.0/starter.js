// Choose your own names and quantities while retaining the declared record shape.
const myInventory = [
  { id: 'rope', name: 'rope', quantity: 2 },
  { id: 'map', name: 'map', quantity: 0 },
  { id: 'lamp', name: 'lamp', quantity: 3 },
];

function totalQuantity(items) {
  // Return the total units, including the empty collection.
}
function availableNames(items) {
  // Return names with positive quantity, in input order.
}
function adjustQuantity(items, id, change) {
  // Return records with only the matching quantity changed, clamped at zero.
}
function inventoryReport(items, id, change) {
  // Combine your helpers into { items, total, available }.
}

// Injected debugging task: this works for ordinary nonempty data but fails empty input.
function largestQuantity(items) {
  let largest = items[0].quantity;
  for (let i = 1; i < items.length; i++) {
    if (items[i].quantity > largest) largest = items[i].quantity;
  }
  return largest;
}

function lowStockNames(items, threshold) {
  // Fresh transfer requirement: include quantity <= threshold, including zero.
}

// Supplied console presentation. Run displays your project; Check invokes functions.
console.log('My inventory', myInventory);
console.log('Updated report', inventoryReport(myInventory, 'map', 4));
console.log('Largest quantity', largestQuantity(myInventory));
console.log('Low stock', lowStockNames(myInventory, 2));
