import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePrice } from "../src/cart.js";
import { lineTotal, orderTotal } from "../src/pricing.js";

test("parsePrice reads a simple price", () => {
  assert.equal(parsePrice("$4.50"), 4.5);
});

test("one item costs its price", () => {
  assert.equal(lineTotal({ name: "Mug", price: 8, quantity: 1 }), 8);
});

test("two of an item get no discount", () => {
  assert.equal(lineTotal({ name: "Mug", price: 8, quantity: 2 }), 16);
});

test("three of an item get the bulk discount", () => {
  // 3 x 4.50 = 13.50, minus 10% = 12.15
  assert.equal(lineTotal({ name: "Notebook", price: 4.5, quantity: 3 }), 12.15);
});

test("ten of an item get the bulk discount", () => {
  // 10 x 1.20 = 12.00, minus 10% = 10.80
  assert.equal(lineTotal({ name: "Pen", price: 1.2, quantity: 10 }), 10.8);
});

test("orderTotal adds up every line", () => {
  const items = [
    { name: "Mug", price: 8, quantity: 1 },
    { name: "Pen", price: 1.2, quantity: 10 },
  ];
  assert.equal(orderTotal(items), 18.8);
});
