// The entry point: reads the command you typed and calls the right function.
import { addBook, finishBook, getStats } from "./books.js";
import { formatBook, formatStats } from "./format.js";
import { loadBooks, saveBooks } from "./store.js";

const HELP = `Bookshelf: a tiny reading list

Usage:
  node src/cli.js list                              show every book
  node src/cli.js add "<title>" "<author>" <pages>  add a book
  node src/cli.js finish <id>                       mark a book as finished
  node src/cli.js stats                             show your reading totals
`;

function main(args) {
  const [command, ...rest] = args;
  const books = loadBooks();

  switch (command) {
    case "list": {
      if (books.length === 0) {
        console.log("Your shelf is empty. Add a book first.");
        break;
      }
      for (const book of books) {
        console.log(formatBook(book));
      }
      break;
    }

    case "add": {
      const [title, author, pages] = rest;
      if (!title || !author || !pages) {
        console.error('Usage: add "<title>" "<author>" <pages>');
        process.exitCode = 1;
        break;
      }
      const updated = addBook(books, title, author, Number(pages));
      saveBooks(updated);
      console.log(`Added: ${formatBook(updated[updated.length - 1])}`);
      break;
    }

    case "finish": {
      const id = Number(rest[0]);
      try {
        const updated = finishBook(books, id);
        saveBooks(updated);
        console.log(`Nice! You finished book ${id}.`);
      } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
      }
      break;
    }

    case "stats": {
      console.log(formatStats(getStats(books)));
      break;
    }

    default: {
      console.log(HELP);
    }
  }
}

main(process.argv.slice(2));
