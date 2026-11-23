import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays } from "../src/dates.js";
import { createLoan, lateFee, returnBook } from "../src/loans.js";

test("addDays moves a date forward", () => {
  assert.equal(addDays("2026-03-02", 14), "2026-03-16");
});

test("addDays crosses the end of a month", () => {
  assert.equal(addDays("2026-01-25", 14), "2026-02-08");
});

test("a new loan is due 14 days later", () => {
  const loan = createLoan("maya", "dune", "2026-03-02");
  assert.equal(loan.dueOn, "2026-03-16");
  assert.equal(loan.returnedAt, null);
});

test("no fee when the book comes back early", () => {
  const loan = createLoan("maya", "dune", "2026-03-02");
  assert.equal(lateFee(loan, "2026-03-10T00:00:00Z"), 0);
});

test("no fee when the book comes back on the due date", () => {
  const loan = createLoan("maya", "dune", "2026-03-02");
  assert.equal(lateFee(loan, "2026-03-16T00:00:00Z"), 0);
});

test("two days late costs one dollar", () => {
  const loan = createLoan("maya", "dune", "2026-03-02");
  assert.equal(lateFee(loan, "2026-03-18T00:00:00Z"), 1);
});

test("the fee never goes above the maximum", () => {
  const loan = createLoan("maya", "dune", "2026-03-02");
  assert.equal(lateFee(loan, "2026-06-01T00:00:00Z"), 10);
});

test("returning a book records the time and the fee", () => {
  const loan = createLoan("maya", "dune", "2026-03-02");
  const returned = returnBook(loan, "2026-03-18T00:00:00Z");
  assert.equal(returned.returnedAt, "2026-03-18T00:00:00Z");
  assert.equal(returned.fee, 1);
});

test("a book cannot be returned twice", () => {
  const loan = createLoan("maya", "dune", "2026-03-02");
  const returned = returnBook(loan, "2026-03-10T00:00:00Z");
  assert.throws(() => returnBook(returned, "2026-03-11T00:00:00Z"), /already been returned/);
});
