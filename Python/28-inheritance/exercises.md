# 28 Inheritance: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every method (not on `self`), and check each file with `python -m mypy ex1.py` from your virtual environment, like in [chapter 25](../25-type-hints/notes.md).
- Each exercise gives you test code to put at the bottom of your file. Your output should match the expected output exactly.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cinema tickets

A cinema sells three kinds of ticket. A normal ticket costs $12.00, a child ticket costs $7.00, and a VIP ticket costs $20.00 and comes with a snack. Start `ex1.py` with this:

```python
def format_money(cents: int) -> str:
    return f"${cents / 100:.2f}"


class Ticket:
    def __init__(self, film: str, seat: str) -> None:
        self.film = film
        self.seat = seat

    def price_cents(self) -> int:
        return 1200

    def describe(self) -> str:
        return f"{self.film}, seat {self.seat}: {format_money(self.price_cents())}"
```

Add two child classes of `Ticket`:

- `ChildTicket`, which only changes the price.
- `VipTicket`, which changes the price, and also takes a third argument, `snack`, and stores it as an attribute.

Don't change `Ticket`, and don't write a `describe` method in either child.

Test code:

```python
tickets: list[Ticket] = [
    Ticket("Dune", "F7"),
    ChildTicket("Dune", "F8"),
    VipTicket("Dune", "A1", "popcorn"),
]
for ticket in tickets:
    print(ticket.describe())

total = sum([ticket.price_cents() for ticket in tickets])
print(f"Total: {format_money(total)}")

vip = VipTicket("Dune", "A2", "nachos")
print(f"Seat {vip.seat} gets {vip.snack}")
print(isinstance(vip, Ticket), isinstance(tickets[0], VipTicket))
```

Expected output:

```
Dune, seat F7: $12.00
Dune, seat F8: $7.00
Dune, seat A1: $20.00
Total: $39.00
Seat A2 gets nachos
True False
```

Then answer this in a comment: `describe` is only written in `Ticket`, and `Ticket` says the price is 1200. So how did the child ticket's line come out as $7.00?

<details>
<summary>Hint 1</summary>

`ChildTicket` only needs one method: its own `price_cents`. That's overriding. `VipTicket` also needs its own `__init__` for the snack. Let `Ticket` set up the film and the seat with `super().__init__(film, seat)`, then store the snack.

</details>

<details>
<summary>Hint 2</summary>

For the question, look at "How Python finds a method" in the notes. Inside `describe`, what is `self` when it's called on a child ticket? Where does the search for `self.price_cents` start?

</details>

---

## Exercise 2 (Easy): A shop's exception family

A small shop keeps its stock in a dictionary:

```python
STOCK = {"apple": 10, "bread": 2, "milk": 0}
```

Write three exception classes:

- `ShopError`, the parent of every shop problem.
- `UnknownItemError`, a child of `ShopError`, for things the shop doesn't sell.
- `OutOfStockError`, a child of `ShopError`, for when there aren't enough. It takes three arguments, `item`, `wanted` and `available`, and stores all three as attributes. Its message looks like `not enough bread: you wanted 5, we have 2`.

Then write `buy(item: str, quantity: int) -> None`. It raises `UnknownItemError("we don't sell pizza")` (with the real item) for something that isn't in `STOCK`, or an `OutOfStockError` when the quantity is more than what's in stock. Otherwise it takes the quantity off the stock, and prints a line like `Bought 3 x apple`.

Test code:

```python
orders = [("apple", 3), ("pizza", 1), ("bread", 5), ("milk", 1), ("bread", 2)]
for item, quantity in orders:
    try:
        buy(item, quantity)
    except OutOfStockError as e:
        print(f"Sorry, {e}")
        if e.available > 0:
            print(f"  Would you like {e.available} instead?")
    except ShopError as e:
        print(f"Problem: {e}")

print(STOCK)
print(issubclass(OutOfStockError, ShopError))
print(issubclass(ShopError, OutOfStockError))
print(isinstance(UnknownItemError("x"), Exception))
```

**Before you run it**, write down what you think the last three lines will print. Then check. Expected output:

```
Bought 3 x apple
Problem: we don't sell pizza
Sorry, not enough bread: you wanted 5, we have 2
  Would you like 2 instead?
Sorry, not enough milk: you wanted 1, we have 0
Bought 2 x bread
{'apple': 7, 'bread': 0, 'milk': 0}
True
False
True
```

Finally, swap the two `except` blocks, so `except ShopError` comes first, and run it again. Write a comment that says what changed in the output, and why. Then swap them back.

<details>
<summary>Hint 1</summary>

`ShopError` and `UnknownItemError` don't need anything inside: a docstring is enough for the class body. `OutOfStockError` needs its own `__init__`, just like `InsufficientFundsError` in the notes: build the message with an f-string and pass it to `super().__init__(message)` (that's what makes `print(e)` show it), then store the three attributes with `self.`.

</details>

---

## Exercise 3 (Medium): Tidy up the bookshop

An online bookshop sells printed books, e-books and audiobooks. Someone wrote three separate classes, copying a lot of code. Copy it into `ex3.py`, exactly as it is, and run it:

```python
def format_money(cents: int) -> str:
    return f"${cents / 100:.2f}"


class PrintedBook:
    def __init__(
        self, title: str, author: str, price_cents: int, weight_grams: int
    ) -> None:
        self.title = title
        self.author = author
        self.price_cents = price_cents
        self.weight_grams = weight_grams

    def describe(self) -> str:
        return f"{self.title} by {self.author}, {format_money(self.price_cents)}"

    def delivery_cents(self) -> int:
        """Postage: 300 cents, plus 100 for every full 500 grams."""
        return 300 + (self.weight_grams // 500) * 100


class EBook:
    def __init__(self, title: str, author: str, price_cents: int, size_mb: float) -> None:
        self.title = title
        self.author = author
        self.price_cents = price_cents
        self.size_mb = size_mb

    def describe(self) -> str:
        text = f"{self.title} by {self.author}, {format_money(self.price_cents)}"
        return f"{text} ({self.size_mb} MB download)"

    def delivery_cents(self) -> int:
        return 0


class AudioBook:
    def __init__(
        self, title: str, author: str, price_cents: int, minutes: int, narrator: str
    ) -> None:
        self.title = title
        self.author = author
        self.price_cents = price_cents
        self.minutes = minutes
        self.narrator = narrator

    def describe(self) -> str:
        text = f"{self.title} by {self.author}, {format_money(self.price_cents)}"
        hours, mins = divmod(self.minutes, 60)
        return f"{text} (read by {self.narrator}, {hours}h {mins}m)"

    def delivery_cents(self) -> int:
        return 0


basket = [
    PrintedBook("Dune", "Frank Herbert", 1099, 1200),
    EBook("Emma", "Jane Austen", 299, 2.5),
    AudioBook("Matilda", "Roald Dahl", 1499, 265, "Aisha Rahman"),
]
for book in basket:
    print(f"{book.describe()}  + delivery {format_money(book.delivery_cents())}")

total = sum([book.price_cents + book.delivery_cents() for book in basket])
print(f"Order total: {format_money(total)}")
```

It works, and prints the four lines at the end of this exercise. But run `python -m mypy ex3.py` too. It reports four errors like `"object" has no attribute "describe"`. As far as mypy knows, the three classes have nothing in common, so the only thing it can say about the items in `basket` is that they're objects.

Your job is to **refactor** the code. That means changing how it's built without changing what it does: the output must stay exactly the same.

1. Write a parent class `Book` with everything the three classes share: `title`, `author` and `price_cents`, a `describe()` that returns the `Dune by Frank Herbert, $10.99` part, and a `delivery_cents()` that returns `0`.
2. Make `PrintedBook`, `EBook` and `AudioBook` children of `Book`. Each one calls `super().__init__(...)` and then stores only its own extra attributes.
3. `PrintedBook` overrides only `delivery_cents`. `EBook` and `AudioBook` **extend** `describe` with `super().describe()`, and don't need their own `delivery_cents` at all.
4. Change the test code's first line to `basket: list[Book] = [`.

When you're done, mypy says `Success`, no line of shared code appears twice, and the output is exactly the same as before:

```
Dune by Frank Herbert, $10.99  + delivery $5.00
Emma by Jane Austen, $2.99 (2.5 MB download)  + delivery $0.00
Matilda by Roald Dahl, $14.99 (read by Aisha Rahman, 4h 25m)  + delivery $0.00
Order total: $33.97
```

<details>
<summary>Hint 1</summary>

Why does `Book.delivery_cents` return 0? Two of the three kinds of book have free delivery, so 0 is a sensible default. Only the one that's different needs to override it.

</details>

<details>
<summary>Hint 2</summary>

`EBook.describe` can be a single line: `return f"{super().describe()} (... MB download)"`, with the size filled in. `super().describe()` gives you the parent's part of the text.

</details>

<details>
<summary>Hint 3</summary>

Change one class at a time, and run the program after each one. If the output changes, you know exactly which class broke it.

</details>

---

## Exercise 4 (Medium): Planning a garden

Leo is planning his garden. He has beds of different shapes, and wants to know how big each one is, and how many packets of seed to buy. One packet covers 2 square metres, and you can't buy half a packet.

Write these classes (you'll need `import math` and `from abc import ABC, abstractmethod`):

- `Bed`, an abstract base class. `__init__(name)` stores the bed's name. It has an abstract method `area(self) -> float`, and a normal method `seed_packets(self) -> int` that works out the packets from `self.area()`.
- `RectangleBed(Bed)`, made with a name, a `width` and a `length` (in metres).
- `SquareBed(RectangleBed)`, made with a name and one `side`. A square is a rectangle whose width and length are the same, so this class should be very short.
- `CircleBed(Bed)`, made with a name and a `radius`. Its area is π × radius × radius.

Test code:

```python
beds: list[Bed] = [
    RectangleBed("Vegetables", 4, 1.5),
    SquareBed("Herbs", 2),
    CircleBed("Roses", 1.2),
]
for bed in beds:
    print(f"{bed.name:<12}{bed.area():>6.2f} sq m   {bed.seed_packets()} packets")

total_area = sum([bed.area() for bed in beds])
total_packets = sum([bed.seed_packets() for bed in beds])
print(f"Total: {total_area:.2f} sq m, {total_packets} packets")

herbs = beds[1]
print(isinstance(herbs, SquareBed), isinstance(herbs, RectangleBed), isinstance(herbs, Bed))

try:
    mystery = Bed("Mystery")
except TypeError as e:
    print(f"Error: {e}")
```

Expected output:

```
Vegetables    6.00 sq m   3 packets
Herbs         4.00 sq m   2 packets
Roses         4.52 sq m   3 packets
Total: 14.52 sq m, 8 packets
True True True
Error: Can't instantiate abstract class Bed without an implementation for abstract method 'area'
```

mypy should report exactly one error, on the `Bed("Mystery")` line: `Cannot instantiate abstract class "Bed" with abstract attribute "area"`. That's the test code checking that your `Bed` really is abstract.

<details>
<summary>Hint 1</summary>

`seed_packets` is written once, in `Bed`, but it calls `self.area()`, which each child writes for itself. That's the same trick as `describe` and `price_cents` in exercise 1. `math.ceil()` and `math.pi` are from [chapter 05](../05-numbers-and-math/notes.md).

</details>

<details>
<summary>Hint 2</summary>

`RectangleBed` and `CircleBed` each need their own `__init__` with `super().__init__(name)`, so that `Bed` can store the name. `SquareBed` needs only an `__init__`, and its body is one line: it calls the parent's `__init__` and passes the side twice. It inherits `area` from `RectangleBed`.

</details>

---

## Exercise 5 (Challenge): Running the bank

Time to put the whole chapter together: inheritance, overriding, polymorphism, an exception family and composition. You'll also need dictionaries ([chapter 13](../13-dictionaries/notes.md)), f-string alignment ([chapter 06](../06-strings/notes.md)) and raising errors ([chapter 18](../18-error-handling/notes.md)).

Start `ex5.py` by copying `BankAccount`, the full `SavingsAccount` (with `MIN_BALANCE` and `withdraw`) and `CheckingAccount` from the notes. Then:

**Step 1: a kind for every account.** Give each class a class attribute `KIND`: `"Basic"` for `BankAccount`, `"Savings"` for `SavingsAccount` and `"Checking"` for `CheckingAccount`. (Yes, class attributes are inherited and overridden too.)

**Step 2: month end.** Every account gets a method `month_end(self) -> str` that does the monthly job and returns a short note about it:

- A basic account does nothing, and returns `"nothing to do"`.
- A savings account adds interest, and returns something like `"added 19 interest"`.
- A checking account that's below zero pays an overdraft fee of 5 (make it a class attribute, `OVERDRAFT_FEE`), and returns `"charged a 5 overdraft fee"`. If it isn't below zero, it does what a basic account does.

**Step 3: an exception family.** `BankError(Exception)` is the parent. `AccountNotFoundError(BankError)` takes the account number, stores it as a `number` attribute, and has the message `there's no account 1009` (with the real number). `TransferError(BankError)` needs nothing extra.

**Step 4: the bank.** A `Bank` **has** accounts, so it uses composition. It has:

| Method | What it does |
|---|---|
| `__init__(self, name: str) -> None` | Stores the name, an empty dictionary `_accounts` (account number to account), and `_next_number`, starting at 1001. |
| `open_account(self, account: BankAccount) -> int` | Stores the account under the next number, and returns that number. |
| `get(self, number: int) -> BankAccount` | Returns the account, or raises `AccountNotFoundError`. |
| `transfer(self, from_number: int, to_number: int, amount: int) -> None` | Moves money between two accounts. If the withdrawal is refused, it raises `TransferError("transfer from 1001 failed: ...")`, with the real number and the account's own message. |
| `month_end(self) -> None` | Runs `month_end()` on every account, and prints each account's number and note. |
| `print_statement(self) -> None` | Prints the bank's name, one line per account (number, two spaces, owner padded to 6, kind padded to 10, balance lined up on the right in 6), and the total of all balances. |

**Rule:** a transfer to or from an account that doesn't exist must not move any money at all.

Test code:

```python
bank = Bank("Riverside Bank")
maya_savings = bank.open_account(SavingsAccount("Maya", 1000))
maya_checking = bank.open_account(CheckingAccount("Maya", 50))
leo_basic = bank.open_account(BankAccount("Leo", 300))
print(f"Opened accounts {maya_savings}, {maya_checking} and {leo_basic}")

bank.transfer(maya_checking, leo_basic, 120)
bank.transfer(maya_savings, maya_checking, 40)

problems = [(maya_savings, leo_basic, 995), (leo_basic, 1009, 10), (1009, leo_basic, 10)]
for source, target, amount in problems:
    try:
        bank.transfer(source, target, amount)
    except AccountNotFoundError as e:
        print(f"Unknown account: {e.number}")
    except BankError as e:
        print(f"Bank problem: {e}")

bank.print_statement()
bank.month_end()
bank.print_statement()
```

Expected output:

```
Opened accounts 1001, 1002 and 1003
Bank problem: transfer from 1001 failed: a savings account must keep at least 10
Unknown account: 1009
Unknown account: 1009
Riverside Bank
1001  Maya  Savings      960
1002  Maya  Checking     -30
1003  Leo   Basic        420
Total: 1350
1001: added 19 interest
1002: charged a 5 overdraft fee
1003: nothing to do
Riverside Bank
1001  Maya  Savings      979
1002  Maya  Checking     -35
1003  Leo   Basic        420
Total: 1364
```

Leo still has 420 after the failed transfer to account 1009, so no money vanished. Finish with `python -m mypy ex5.py` saying `Success`.

<details>
<summary>Hint 1</summary>

`Bank.month_end` is where polymorphism pays off: it just calls `account.month_end()` on every account, and each kind does its own job. There's no `isinstance` anywhere. For the checking account, a balance that isn't below zero can simply `return super().month_end()`.

</details>

<details>
<summary>Hint 2</summary>

In `transfer`, look up **both** accounts with `self.get(...)` before you take any money out. Then put only the `withdraw` inside a `try`. In the `except ValueError as e:` block, raise a `TransferError` with your own message that includes `e`, just like `parse_due` did in [chapter 26](../26-project-todo-app/notes.md).

</details>

<details>
<summary>Hint 3</summary>

The dictionary of accounts starts empty, so it needs a hint: `self._accounts: dict[int, BankAccount] = {}`. That one hint lets it hold savings and checking accounts too, because they're bank accounts. In `print_statement`, `account.KIND` finds the right kind through the normal lookup: object, class, parent.

</details>

---

## Before you move on

Your classes can now inherit, override and work together. But they still have rough edges. Try `print(bank.get(1001))`, and you'll get the same ugly `<__main__.SavingsAccount object at 0x...>` as before. `==` only says `True` for the very same object, and `len()` doesn't work on your classes at all.

All of that behaviour comes from special methods that every class inherits from `object`. In [chapter 29](../29-dunder-methods/notes.md), you'll override them, and make your own objects work with `print`, `==`, `len`, `in` and `+`, just like Python's built-in types.
