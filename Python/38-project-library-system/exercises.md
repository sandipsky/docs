# 38 Project: Library System: Exercises

**How to do these:**

- These are stretch goals: extra features for your finished library app. Finish all nine milestones in the [notes](notes.md) first.
- Before you start, copy your finished `.py` files and the `tests` folder into a new folder called `finished`, so you always have a working version to go back to. Then add the stretch goals to `my-library`, one after another.
- Before each exercise, reset the sample data from the starter folder, just like in the milestones: `Copy-Item ..\starter\library.json .`
- The outputs below were made with `--today 2026-10-12`, like in the notes. Add it to any command that shows dates or fines.
- Keep type hints on every new function and method. Write at least one test for each exercise, and finish each one with `python -m pytest` all green and `python -m mypy .` saying `Success`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Renewing a loan

Leo hasn't finished *Emma* yet, and it's due on Thursday. Add a `renew` sub-command (help: `give a member 14 more days`) that takes a `book_id` (help: `the book's ID, like B001`) and moves the loan's due date `LOAN_DAYS` days later than it was. The house rules for renewing:

- Only a book that's on loan can be renewed.
- An overdue book can't be renewed. (Bring it back and pay the fine first.)
- Each loan can be renewed only once.

Make a new error class, `CannotRenewError`, for the last two rules. Then try:

```
python main.py --today 2026-10-12 renew B006
Renewed Emma by Jane Austen for Leo. Now due back 2026-10-29.

python main.py --today 2026-10-12 renew B006
Error: Emma by Jane Austen has already been renewed once

python main.py --today 2026-10-12 renew B004
Error: Coraline by Neil Gaiman is overdue, so it can't be renewed

python main.py --today 2026-10-12 renew B001
Error: Dune by Frank Herbert isn't on loan
```

To remember that a loan was renewed, give `Loan` a new field, `renewed`, which starts as `False`. After the first renewal, Emma's loan in `library.json` looks like this:

```
{
  "book_id": "B006",
  "member_id": "M003",
  "borrowed": "2026-10-01",
  "due": "2026-10-29",
  "returned": null,
  "renewed": true
}
```

Here's the tricky part: the loans in the starter's `library.json` were saved **before** renewing existed, so they have no `"renewed"` key at all. Your app must still load them, without you editing the file by hand. (Once the app saves, every loan gets the key.)

<details>
<summary>Hint 1</summary>

A field with a default value has to come after the fields without one, so `renewed: bool = False` goes at the end, after `returned`. `to_dict` needs no change, because `asdict` picks up the new field by itself. But `from_dict` will crash with a `KeyError` on old loans. Which dictionary method reads a key, and gives a default when it's missing ([chapter 13](../13-dictionaries/notes.md))?

</details>

<details>
<summary>Hint 2</summary>

Write a `renew(self, book_id: str, today: date) -> Loan` method in `Library`, shaped like `return_book`: find the book, then its current loan, then check the rules one by one with guard clauses. `loan.due += timedelta(days=LOAN_DAYS)` moves the date.

</details>

<details>
<summary>Hint 3</summary>

A good test: lend a book in your fixture's library, renew it once and check the new due date, then check that a second `renew` raises `CannotRenewError` (with `match="already"`).

</details>

---

## Exercise 2 (Easy): A member's history

Maya wants to see every book she has ever borrowed. Add a `history` sub-command (help: `show every loan of one member`) that takes a `member_id` (help: `the member's ID, like M001`) and shows all of that member's loans, past and present, newest first:

```
python main.py --today 2026-10-12 history M002
History for Maya (M002)
Borrowed    Book                               Status
2026-10-06  Holes by Louis Sachar              on loan, due 2026-10-20
2026-09-10  Matilda by Roald Dahl              returned 2026-09-29, 5 days late ($1.25)
2 loans, $1.25 in fines

python main.py --today 2026-10-12 history M004
History for Zoe (M004)
Borrowed    Book                               Status
2026-09-01  Dune by Frank Herbert              returned 2026-09-14, on time
2026-08-20  Wonder by R.J. Palacio             returned 2026-09-05, 2 days late ($0.50)
2 loans, $0.50 in fines

python main.py --today 2026-10-12 history M001
History for Sandip (M001)
Borrowed    Book                               Status
2026-09-18  The Hobbit by J.R.R. Tolkien       on loan, due 2026-10-02 (OVERDUE)
2026-08-03  Matilda by Roald Dahl              returned 2026-08-15, on time
2 loans, $2.50 in fines

python main.py --today 2026-10-12 history M009
Error: there's no member with ID M009
```

The fines in the summary include the fine so far on books that are still out and late, like Sandip's *Hobbit*. A member with no loans at all (add one with `add-member` to try it) gets `No loans yet.` under the first line.

<details>
<summary>Hint 1</summary>

Add a `history(self, member_id: str) -> list[Loan]` method to `Library`. It starts with `get_member`, so bad IDs are handled for free. Then `sorted()` with `key=lambda loan: loan.borrowed` and `reverse=True` puts the newest loan first ([chapter 34](../34-functional-tools/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

The status column has three cases, so give it its own function, like `book_status` from milestone 5: `loan_status(loan: Loan, today: date) -> str`. Start with the "still out" case (`loan.returned is None`), then use `days_late` to tell "on time" from "late".

</details>

---

## Exercise 3 (Medium): Export to CSV

The library's manager, Aisha, wants the book list in a spreadsheet. Add an `export` sub-command (help: `save the book list as a CSV file`) that takes a `filename` (help: `the CSV file to write, like books.csv`):

```
python main.py export books.csv
Exported 8 books to books.csv
```

Open `books.csv` in VS Code. It should look exactly like this, sorted by title, with the due date only for books that are out:

```
id,title,author,genre,on_loan,due
B004,Coraline,Neil Gaiman,fantasy,yes,2026-10-09
B001,Dune,Frank Herbert,scifi,no,
B006,Emma,Jane Austen,classic,yes,2026-10-15
B003,Holes,Louis Sachar,children,yes,2026-10-20
B002,Matilda,Roald Dahl,children,no,
B008,The Big Sleep,Raymond Chandler,mystery,yes,2026-10-24
B005,The Hobbit,J.R.R. Tolkien,fantasy,yes,2026-10-02
B007,Wonder,R.J. Palacio,children,no,
```

**Rules:** write it with `csv.DictWriter` ([chapter 21](../21-json-and-csv/notes.md)), and save it with your own `safe_write`, so a crash halfway can't leave Aisha half a spreadsheet. The file goes wherever the filename says, measured from the terminal's folder (that's what people expect from an export, unlike `library.json`).

<details>
<summary>Hint 1</summary>

Put an `export_books(library: Library, path: Path) -> int` function in `storage.py`, since it's about files. Build one dictionary per book (the keys are the column names), write them all, and return how many there were. `library.current_loan(book.id)` tells you whether each book is out.

</details>

<details>
<summary>Hint 2</summary>

Does your file have an empty line between every row? Remember the CSV rule from chapter 21: CSV files need `newline=""` when you open them. But `safe_write` does the opening. Give `safe_write` a second parameter, `newline: str | None = None`, and pass it on to `open()`. `None` is what `open()` uses when you don't say anything, so `save_library` keeps working unchanged.

</details>

<details>
<summary>Hint 3</summary>

To test it, export into `tmp_path`, then read the file back with `path.read_text(encoding="utf-8").splitlines()` and check the first two lines. With the fixture's library, the first book row is Coraline's.

</details>

---

## Exercise 4 (Medium): Library stats

At the end of the month, the library committee wants some numbers. Add a `stats` sub-command (help: `show some numbers about the library`) with no arguments:

```
python main.py stats
Books: 8 (children 3, fantasy 2, scifi 1, classic 1, mystery 1)
Loans so far: 9 (5 still out)
Most borrowed: Matilda by Roald Dahl (2 times)
Busiest member: Leo (3 loans)
Fines from returned books: $1.75
```

- The genres come most common first. Genres with the same count stay in the order they first appear in the library.
- "Loans so far" counts every loan ever, returned or not.
- "Fines from returned books" only adds up loans that have come back: that's money the library has actually been paid. (Matilda was 5 days late for Maya, and Wonder 2 days late for Zoe.)

With no `library.json` at all (rename it for a moment), there's nothing to rank, so the two "Most" lines are left out:

```
python main.py stats
Books: 0
Loans so far: 0 (0 still out)
Fines from returned books: $0.00
```

<details>
<summary>Hint 1</summary>

This is a job for `Counter` from [chapter 19](../19-modules-and-standard-library/notes.md). `Counter(book.genre.value for book in library.books.values())` counts the genres in one line, and `.most_common()` gives `(genre, count)` pairs in exactly the order you need.

</details>

<details>
<summary>Hint 2</summary>

`.most_common(1)` gives a list with one pair in it, like `[("B002", 2)]`, so `.most_common(1)[0]` is the pair itself. Count the loans by `loan.book_id` for the most borrowed book, and by `loan.member_id` for the busiest member.

</details>

<details>
<summary>Hint 3</summary>

For the fines, `sum()` with a generator expression and an `if` inside it adds up only the loans whose `returned` is not `None`. And `", ".join(...)` glues the genre parts together with commas.

</details>

---

## Exercise 5 (Challenge): Reservations

Zoe wants *Holes*, but Maya has it. Add a waiting list. A new `reserve` sub-command (help: `join the queue for a book`) takes a `book_id` and a `member_id`, with the same help texts as `lend`. Here are the rules:

- Only a book that's on loan can be reserved. A book on the shelf can just be borrowed.
- You can't reserve a book you've got, or one you've already reserved.
- When a reserved book comes back, `return` adds a line saying who to keep it for.
- While a book has a queue, only the first member in it can borrow it. Borrowing it takes them off the queue.

Reset the sample data, then try this whole story:

```
python main.py reserve B003 M004
Zoe is number 1 in the queue for Holes by Louis Sachar.

python main.py reserve B003 M001
Sandip is number 2 in the queue for Holes by Louis Sachar.

python main.py reserve B003 M004
Error: Zoe has already reserved Holes by Louis Sachar

python main.py reserve B003 M002
Error: Maya already has Holes by Louis Sachar

python main.py reserve B001 M004
Error: Dune by Frank Herbert is on the shelf, so just borrow it

python main.py --today 2026-10-12 return B003
Maya returned Holes by Louis Sachar on time.
Keep it for Zoe (reserved).

python main.py --today 2026-10-12 lend B003 M001
Error: Holes by Louis Sachar is being held for Zoe

python main.py --today 2026-10-12 lend B003 M004
Lent Holes by Louis Sachar to Zoe. Due back 2026-10-26.
```

The queue lives in `library.json`, in a fourth list at the end. After that story, only Sandip is still waiting:

```
  "reservations": [
    {
      "book_id": "B003",
      "member_id": "M001"
    }
  ]
```

And the starter's `library.json`, which has no `"reservations"` list at all, must still load.

You'll need a new dataclass, `Reservation`, with `to_dict` and `from_dict`; a new error class, `ReservationError`; a `reservations` list in the `Library`; changes to `lend`, `load_library` and `save_library`; and at least three new tests, one for each rule you think is most likely to break.

<details>
<summary>Hint 1</summary>

Keep all the reservations in one list, in the order they were made. A small `queue_for(self, book_id: str) -> list[Reservation]` method that picks out one book's reservations gives you the queue, already in order: `queue[0]` is next in line, and `len(...)` after adding one is the new member's number.

</details>

<details>
<summary>Hint 2</summary>

In `lend`, add the new check after the "already on loan" check: if the book's queue isn't empty and the first member in it isn't the borrower, raise `ReservationError`. After the loan is made, if there was a queue, `self.reservations.remove(queue[0])`. Dataclasses compare by their fields, so `remove` finds the right one.

</details>

<details>
<summary>Hint 3</summary>

"Has this member already reserved it?" is a yes-or-no question about a list, which is exactly what `any()` with a generator expression answers ([chapter 34](../34-functional-tools/notes.md)). And for the old file, `data.get("reservations", [])` gives an empty list when the key is missing.

</details>

---

## Before you move on

Look at what you've built: five modules, a folder of tests, a data file, a log file, and one awkward rule: everything only works when you run it from inside `my-library`. Try `python -m pytest` from any other folder and the tests can't even find your code. Real projects solve that with a proper layout and a small settings file, so that anyone can install the project and run it as a command from anywhere.

That's where Level 4 begins. [Chapter 39](../39-project-structure-and-packaging/notes.md) shows how to lay out a project like this one and package it, and its challenge exercise does exactly that to your library system.
