# Library Loans

The loan rules for a small community library: when a book is due, and what a late return costs. Other programs at the library import these functions.

It needs Node.js 20 or newer and no packages.

```
npm test      run the tests
```

## The library's rules

- A loan lasts **14 days**.
- A late book costs **$0.50 per day**, up to a maximum of **$10**.
- A book returned **at any time on its due date** is on time.

## What's inside

```
library-loans/
├── issues/            the work waiting to be done
│   ├── 001-late-fee-on-due-date.md
│   └── 002-renew-a-loan.md
├── src/
│   ├── dates.js       small date helpers
│   └── loans.js       creating a loan, returning a book, the late fee
└── test/
    └── loans.test.js  the tests (they all pass today)
```

## Your job

Two issues are open in the `issues` folder: a bug report and a feature request. Chapter 20 of the Claude course takes each one from issue to pull request.
