// Small date helpers. Dates are text like "2026-03-02" (year-month-day).

// Adds a number of days to a date and returns it in the same format.
// addDays("2026-03-02", 14) -> "2026-03-16"
export function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
