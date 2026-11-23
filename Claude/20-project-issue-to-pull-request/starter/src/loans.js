// The library's loan rules.
import { addDays } from "./dates.js";

export const LOAN_DAYS = 14;
export const FEE_PER_DAY = 0.5;
export const MAX_FEE = 10;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Starts a loan. borrowedOn is a date like "2026-03-02".
export function createLoan(memberId, bookId, borrowedOn) {
  return {
    memberId,
    bookId,
    borrowedOn,
    dueOn: addDays(borrowedOn, LOAN_DAYS),
    returnedAt: null,
    fee: 0,
  };
}

// Works out the fee for a book that comes back at returnedAt.
// returnedAt is an exact moment, like "2026-03-16T15:30:00Z".
export function lateFee(loan, returnedAt) {
  const msLate = new Date(returnedAt) - new Date(loan.dueOn);
  if (msLate <= 0) {
    return 0;
  }
  const daysLate = Math.ceil(msLate / MS_PER_DAY);
  return Math.min(daysLate * FEE_PER_DAY, MAX_FEE);
}

// Marks a loan as returned and records the fee.
export function returnBook(loan, returnedAt) {
  if (loan.returnedAt !== null) {
    throw new Error("This book has already been returned.");
  }
  return { ...loan, returnedAt, fee: lateFee(loan, returnedAt) };
}
