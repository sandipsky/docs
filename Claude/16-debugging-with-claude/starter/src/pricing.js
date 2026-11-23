// The shop's pricing rules.

const BULK_QUANTITY = 3; // buy this many or more of one item...
const BULK_DISCOUNT = 0.1; // ...and that line gets 10% off

// Money should never have more than two decimals.
export function roundToCents(amount) {
  return Math.round(amount * 100) / 100;
}

// The price of one line of the cart, after any bulk discount.
export function lineTotal(item) {
  const full = item.price * item.quantity;
  if (item.quantity > BULK_QUANTITY) {
    return roundToCents(full * (1 - BULK_DISCOUNT));
  }
  return roundToCents(full);
}

export function orderTotal(items) {
  const sum = items.reduce((total, item) => total + lineTotal(item), 0);
  return roundToCents(sum);
}
