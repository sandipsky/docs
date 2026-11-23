// Prints a receipt for the cart in data/cart.json.
import { loadCart } from "./cart.js";
import { lineTotal, orderTotal } from "./pricing.js";

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function printReceipt(path) {
  const cart = loadCart(path);

  console.log(`Receipt for ${cart.customer}`);
  console.log("-".repeat(32));

  for (const item of cart.items) {
    const label = `${item.quantity} x ${item.name}`;
    console.log(`${label.padEnd(22)}${formatMoney(lineTotal(item)).padStart(10)}`);
  }

  console.log("-".repeat(32));
  console.log(`Total: ${formatMoney(orderTotal(cart.items))}`);
}

printReceipt("data/cart.json");
