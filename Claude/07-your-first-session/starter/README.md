# Bookshelf

A tiny reading list that runs in the terminal. It is the practice project for the Claude course: small enough to read in five minutes, big enough to change.

It has no packages to install. You only need Node.js 20 or newer.

## Try it

Run these from inside this folder:

```
node src/cli.js list
node src/cli.js add "The Martian" "Andy Weir" 369
node src/cli.js finish 2
node src/cli.js stats
```

## What's inside

```
bookshelf/
├── data/books.json   your books, saved as JSON
├── package.json      the project's name and settings
└── src/
    ├── cli.js        reads the command you typed and calls the right function
    ├── books.js      the rules: adding a book, finishing a book, counting
    ├── format.js     turns a book into a line of text
    └── store.js      reads and writes data/books.json
```

## Not finished on purpose

This app is a starting point. It has no tests, no way to remove a book, and it trusts whatever you type. You'll improve it with Claude as the course goes on.
