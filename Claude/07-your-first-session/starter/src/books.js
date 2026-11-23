// The rules of the app. Every function here takes the list of books and
// returns a NEW list. None of them read or write files.

// The next free id: one more than the highest id in use.
export function nextId(books) {
  const highest = books.reduce((max, book) => Math.max(max, book.id), 0);
  return highest + 1;
}

export function addBook(books, title, author, pages) {
  const book = { id: nextId(books), title, author, pages, finished: false };
  return [...books, book];
}

export function finishBook(books, id) {
  const exists = books.some((book) => book.id === id);
  if (!exists) {
    throw new Error(`No book with id ${id}. Run "list" to see the ids.`);
  }
  return books.map((book) => (book.id === id ? { ...book, finished: true } : book));
}

export function getStats(books) {
  const finished = books.filter((book) => book.finished);
  return {
    total: books.length,
    finished: finished.length,
    pagesRead: finished.reduce((sum, book) => sum + book.pages, 0),
  };
}
