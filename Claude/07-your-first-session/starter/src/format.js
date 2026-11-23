// Turns data into text for the terminal.

export function formatBook(book) {
  const mark = book.finished ? "[x]" : "[ ]";
  return `${mark} ${book.id}. ${book.title} by ${book.author} (${book.pages} pages)`;
}

export function formatStats(stats) {
  return [
    `Books on the shelf: ${stats.total}`,
    `Books finished:     ${stats.finished}`,
    `Pages read:         ${stats.pagesRead}`,
  ].join("\n");
}
