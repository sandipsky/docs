// Loads a cart file and turns its price text into numbers.
import { readFile } from "node:fs/promises";

// "$4.50" -> 4.5
export function parsePrice(text) {
  return parseFloat(text.replace("$", ""));
}

// Reads the cart file and returns { customer, items }, where every item
// has a numeric price.
export async function loadCart(path) {
  const cart = JSON.parse(await readFile(path, "utf8"));
  return {
    customer: cart.customer,
    items: cart.items.map((item) => ({ ...item, price: parsePrice(item.price) })),
  };
}
