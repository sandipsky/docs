// Reads and writes the file where the books are saved.
import { readFileSync, writeFileSync } from "node:fs";

// The data file sits next to the src folder, wherever the project is copied to.
const DATA_FILE = new URL("../data/books.json", import.meta.url);

export function loadBooks() {
  return JSON.parse(readFileSync(DATA_FILE, "utf8"));
}

export function saveBooks(books) {
  writeFileSync(DATA_FILE, JSON.stringify(books, null, 2) + "\n");
}
