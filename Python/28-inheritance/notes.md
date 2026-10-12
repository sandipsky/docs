# 28 Inheritance

## What is it?

**Inheritance** lets you build a new class on top of an existing one. The new class automatically gets all the attributes and methods of the old one. Then it can add new ones, or change the ones that need to work differently.

`class SavingsAccount(BankAccount):` reads "a `SavingsAccount` is a kind of `BankAccount`". A savings account can do everything a bank account can, plus whatever extra you give it.

## Why does it matter?

The bank from [chapter 27](../27-classes-and-objects/notes.md) wants two new kinds of account:

- A **savings account** earns interest, and must always keep at least $10 in it.
- A **checking account** can go a little below zero (up to $100). That's called an **overdraft**.

Everything else is the same as a normal `BankAccount`: an owner, a balance, deposits and withdrawals. Without inheritance, you'd copy the whole class and change a few lines:

```python
class SavingsAccount:
    def __init__(self, owner: str, balance: int = 0, interest_rate: float = 0.02) -> None:
        self.owner = owner  # copied from BankAccount
        self._balance = balance  # copied from BankAccount
        self.interest_rate = interest_rate  # new

    # ... balance, deposit() and withdraw(), copied line for line, then add_interest() ...
```

And the same again for `CheckingAccount`. That causes two problems:

1. **Every fix has to be made three times.** Say the bank adds a new rule: deposits over $10,000 need extra checks. Now `deposit` must change in three classes. Miss one, and that kind of account quietly breaks the rule.
2. **Python doesn't know they're related.** The `transfer(source: BankAccount, target: BankAccount, amount: int)` function from chapter 27 should work for any account. But a copied `SavingsAccount` is a completely separate class, so passing one to `transfer` makes mypy complain: `Argument 1 to "transfer" has incompatible type "SavingsAccount"; expected "BankAccount"`.

Inheritance fixes both. The shared code lives in one place, and Python knows that a savings account really is a bank account.

## Real-world example

Think about how a bank describes its accounts. It doesn't repeat every rule for every account. It says: "All our accounts let you deposit and withdraw money. A savings account also earns interest, but you must keep at least $10 in it. A checking account lets you go up to $100 below zero."

That's inheritance: **a savings account is a bank account, with extra rules.**

| Everyday thing | Python thing |
|---|---|
| "Bank account", the general idea | The **parent class** (also called the **base class**): `BankAccount` |
| "Savings account", a special kind of bank account | A **child class** (also called a **subclass**): `class SavingsAccount(BankAccount):` |
| A savings account can do everything a bank account can | The child **inherits** the parent's attributes and methods |
| ...and it also earns interest | The child **adds** something new: `add_interest()` |
| ...but taking money out has a stricter rule | The child **overrides** a method: its own `withdraw()` |
| "Same as a normal account, plus one more check" | The child calls the parent's version with `super()` |

## How it works

### The starting point

Here's the `BankAccount` from the end of chapter 27, with the balance kept in `_balance` and a read-only `balance` property. Save it as `accounts.py`. The new classes in this chapter go below it in the same file, with test code at the bottom:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self._balance = balance

    @property
    def balance(self) -> int:
        """The current balance. Read it like an attribute, but you can't set it."""
        return self._balance

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if amount > self._balance:
            raise ValueError("not enough money")
        self._balance -= amount
```

### Your first child class

```python
class SavingsAccount(BankAccount):
    pass


savings = SavingsAccount("Maya", 100)
savings.deposit(50)
print(savings.owner, savings.balance)  # prints: Maya 150
```

The class in the brackets after the name is the **parent**. `SavingsAccount` has nothing of its own yet (just `pass`), but it already works. It **inherited** everything from `BankAccount`: `__init__`, the `balance` property, `deposit` and `withdraw`. You didn't copy a single line.

You'll hear several names for the two sides, and they all mean the same thing:

| `BankAccount` is the... | `SavingsAccount` is the... |
|---|---|
| parent class | child class |
| base class | subclass |
| superclass | derived class |

### Adding something new

A child class can have methods that the parent doesn't. Savings accounts earn interest, so give them a method for it:

```python
class SavingsAccount(BankAccount):
    interest_rate = 0.02  # a class attribute: 2% for every savings account

    def add_interest(self) -> int:
        """Add interest to the balance, and return how much was added."""
        interest = round(self.balance * self.interest_rate)
        if interest > 0:
            self.deposit(interest)
        return interest


savings = SavingsAccount("Maya", 1000)
print(savings.add_interest())  # prints: 20
print(savings.balance)  # prints: 1020
```

Notice how `add_interest` uses things it inherited: it reads `self.balance` and calls `self.deposit(...)`, as if they were written right there in `SavingsAccount`. It uses `round()` from [chapter 05](../05-numbers-and-math/notes.md) to keep the balance in whole dollars, and it skips the deposit if the interest rounds down to 0 (because `deposit` refuses amounts that aren't positive).

Inheritance only goes one way, though. Children get everything from the parent, but a parent never gets anything from its children:

```python
ordinary = BankAccount("Leo", 1000)
ordinary.add_interest()
```

```
AttributeError: 'BankAccount' object has no attribute 'add_interest'
```

### Giving the child its own `__init__`: `super()`

A class attribute gives every savings account the same rate. But what if each account should have its own rate? Then the rate must be set up in `__init__`. And here's the catch: if the child writes its own `__init__`, it **replaces** the parent's. So who sets up `owner` and `_balance`?

The answer is to ask the parent to do its part:

```python
class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: int = 0, interest_rate: float = 0.02) -> None:
        super().__init__(owner, balance)  # let BankAccount set up its part
        self.interest_rate = interest_rate  # then add the savings part

    def add_interest(self) -> int:
        """Add interest to the balance, and return how much was added."""
        interest = round(self.balance * self.interest_rate)
        if interest > 0:
            self.deposit(interest)
        return interest


savings = SavingsAccount("Maya", 1000, interest_rate=0.03)
print(vars(savings))  # prints: {'owner': 'Maya', '_balance': 1000, 'interest_rate': 0.03}
print(savings.add_interest())  # prints: 30
print(savings.balance)  # prints: 1030
```

`super()` means "my parent class". So `super().__init__(owner, balance)` runs `BankAccount`'s `__init__` on this same object. Step by step, `SavingsAccount("Maya", 1000, interest_rate=0.03)` does this:

1. Python makes a new, empty `SavingsAccount` object.
2. It calls `SavingsAccount.__init__`, the child's own version.
3. `super().__init__("Maya", 1000)` runs `BankAccount.__init__` with the same `self`. That sets `self.owner` and `self._balance`.
4. Back in the child's `__init__`, `self.interest_rate = 0.03` adds the savings part.

`vars(savings)` shows the result: one object, with attributes from both classes.

Why not just copy the two lines `self.owner = owner` and `self._balance = balance` into the child? Because then the setup lives in two places again, which is the very thing inheritance is for avoiding. If `BankAccount.__init__` gets a new attribute next year, every child that calls `super().__init__` gets it for free.

Notice that you don't pass `self` to `super().__init__(...)`. `super()` already knows which object it's working on, just like `account.deposit(50)` does.

### Overriding a method, and extending it with `super()`

Savings accounts must always keep at least $10. So `withdraw` needs one more rule. If a child class defines a method with the same name as one in the parent, the child's version is used instead. That's called **overriding** the method.

But you don't want to throw away the parent's rules (positive amounts only, not more than the balance). You want to *add* one. So the child checks its own rule, then calls the parent's version with `super()`:

```python
class SavingsAccount(BankAccount):
    MIN_BALANCE = 10

    def __init__(self, owner: str, balance: int = 0, interest_rate: float = 0.02) -> None:
        super().__init__(owner, balance)  # let BankAccount set up its part
        self.interest_rate = interest_rate  # then add the savings part

    def add_interest(self) -> int:
        """Add interest to the balance, and return how much was added."""
        interest = round(self.balance * self.interest_rate)
        if interest > 0:
            self.deposit(interest)
        return interest

    def withdraw(self, amount: int) -> None:
        if self.balance - amount < self.MIN_BALANCE:
            raise ValueError(f"a savings account must keep at least {self.MIN_BALANCE}")
        super().withdraw(amount)  # then the normal rules
```

This is the full `SavingsAccount`. Try it:

```python
savings = SavingsAccount("Maya", 100)
savings.withdraw(50)
print(savings.balance)  # prints: 50

for amount in [45, -5]:
    try:
        savings.withdraw(amount)
    except ValueError as e:
        print(f"Can't withdraw {amount}: {e}")
```

You'll see:

```
50
Can't withdraw 45: a savings account must keep at least 10
Can't withdraw -5: withdrawal must be positive
```

Taking out 45 would leave only 5, so the savings rule said no. Taking out -5 passed the savings rule, but then `super().withdraw(-5)` ran the parent's rules, and the parent said no. Both sets of rules are checked, and each one lives in exactly one place. This is called **extending** a method: the child's version does its own extra work, and uses `super()` to run the parent's version too.

### Replacing a method completely

A checking account works differently. It's allowed to go below zero, up to its overdraft limit. That's not an extra rule on top of the parent's: it *changes* the parent's "not enough money" rule. So this time the child writes the whole method itself, and doesn't call `super().withdraw()` at all:

```python
class CheckingAccount(BankAccount):
    def __init__(self, owner: str, balance: int = 0, overdraft_limit: int = 100) -> None:
        super().__init__(owner, balance)
        self.overdraft_limit = overdraft_limit

    def withdraw(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if amount > self.balance + self.overdraft_limit:
            raise ValueError(f"over the overdraft limit of {self.overdraft_limit}")
        self._balance -= amount


checking = CheckingAccount("Leo", 50)
checking.withdraw(120)
print(checking.balance)  # prints: -70

try:
    checking.withdraw(50)
except ValueError as e:
    print(f"Sorry: {e}")  # prints: Sorry: over the overdraft limit of 100
print(checking.balance)  # prints: -70
```

`CheckingAccount.withdraw` changes `self._balance` directly. Isn't that the "staff only" attribute from chapter 27? It is, but a child class counts as staff. In Python, a single underscore means "internal to this class and its children". Code *outside* the family still shouldn't touch it.

So there are two ways to override a method:

| | Extend it | Replace it |
|---|---|---|
| What the child's method does | Its own extra work, then `super().method(...)` | All the work itself |
| Use it when | The parent's version is right, but not enough | The parent's version is wrong for this child |
| Example | `SavingsAccount.withdraw` | `CheckingAccount.withdraw` |

Extending is more common, and safer: if the parent's rules ever get fixed or improved, the child gets the fix too.

### How Python finds a method

In chapter 27, you learned that Python looks for an attribute on the object first, then on its class. With inheritance, the search simply carries on up the family:

1. The object itself.
2. The object's class.
3. That class's parent, then the parent's parent, and so on.

The first match wins. Here's what happens for two calls on a savings account:

```
savings.deposit(50)
  1. On the savings object itself?   no
  2. In SavingsAccount?              no
  3. In BankAccount?                 yes, so BankAccount.deposit runs

savings.withdraw(50)
  1. On the savings object itself?   no
  2. In SavingsAccount?              yes, so SavingsAccount.withdraw runs (BankAccount's is never reached)
```

Python can show you the order it searches. Every class has a `__mro__` attribute, short for **method resolution order** ("resolution" here means "working out which one"):

```python
class BankAccount:
    pass


class SavingsAccount(BankAccount):
    pass


print(SavingsAccount.__mro__)
```

```
(<class '__main__.SavingsAccount'>, <class '__main__.BankAccount'>, <class 'object'>)
```

Child first, then parent, and then a class called `object`, which is the next section.

One more thing about the search: it always starts from the object's real class, even when the call happens inside a parent's code. The `transfer` function from chapter 27 calls `source.withdraw(amount)`. If `source` is a savings account, that runs `SavingsAccount.withdraw`, so the $10 rule applies, even though `transfer` has never heard of savings accounts.

### Every class inherits from `object`

`object` is the great-grandparent of every class in Python. Writing `class BankAccount:` is short for `class BankAccount(object):`, and you'll still see the long form in older code.

`object` gives every class some basic behaviour for free. Remember the ugly `<__main__.BankAccount object at 0x...>` from chapter 27? That comes from `object`. So does the way `==` only says `True` for the very same object. In [chapter 29](../29-dunder-methods/notes.md), you'll override those, using exactly what you've just learned.

### `isinstance()` and `issubclass()`

You met `isinstance()` in [chapter 17](../17-recursion/notes.md), to check whether something was a list. It knows about families too:

```python
savings = SavingsAccount("Maya", 100)
ordinary = BankAccount("Sam", 100)

print(isinstance(savings, SavingsAccount))  # prints: True
print(isinstance(savings, BankAccount))  # prints: True
print(isinstance(ordinary, SavingsAccount))  # prints: False
print(isinstance(savings, CheckingAccount))  # prints: False
print(isinstance(savings, object))  # prints: True

print(issubclass(SavingsAccount, BankAccount))  # prints: True
print(issubclass(BankAccount, SavingsAccount))  # prints: False
print(issubclass(bool, int))  # prints: True
```

- `isinstance(thing, SomeClass)` asks: "is this object a `SomeClass`, or a child of it?" A savings account **is** a bank account, so the second line is `True`. But a plain bank account isn't a savings account.
- `issubclass(Child, Parent)` asks the same question about two classes.

(The last line is a fun one: in Python, `bool` is a child class of `int`. That's why `True + True` is `2`.)

Type hints follow the same rule. A function that wants a `BankAccount` happily accepts a `SavingsAccount` or a `CheckingAccount`, and mypy agrees, because every child is a bank account. But a function that wants a `SavingsAccount` won't take a plain `BankAccount`:

```python
def pay_interest(account: SavingsAccount) -> None:
    print(f"Paid {account.add_interest()} interest to {account.owner}")


pay_interest(BankAccount("Sam", 100))
```

mypy says:

```
Argument 1 to "pay_interest" has incompatible type "BankAccount"; expected "SavingsAccount"  [arg-type]
```

(It starts with your file name and line number, as usual.) That's mypy saving you from the `AttributeError` you saw earlier: a plain account has no `add_interest`.

> **Watch out:** Python also allows a class to have more than one parent, like `class C(A, B):`. That's called **multiple inheritance**. It's real and it has its uses, but the rules for which parent's method wins get complicated quickly, and you won't need it in this course. One parent per class keeps things clear.

### Polymorphism: one call, many behaviours

**Polymorphism** is a big word for a simple idea. It comes from Greek and means "many shapes". In programming, it means: **the same method call does different things, depending on the kind of object it's called on.**

You've already built everything you need to see it. Here are three accounts of different kinds, each with $100, and each asked to withdraw $150:

```python
accounts: list[BankAccount] = [
    BankAccount("Sam", 100),
    SavingsAccount("Maya", 100),
    CheckingAccount("Leo", 100),
]

for account in accounts:
    try:
        account.withdraw(150)
        print(f"{account.owner}: took out 150, balance is now {account.balance}")
    except ValueError as e:
        print(f"{account.owner}: {e}")
```

You'll see:

```
Sam: not enough money
Maya: a savings account must keep at least 10
Leo: took out 150, balance is now -50
```

One line, `account.withdraw(150)`, and three different results. Each account follows its own rules. The loop doesn't know, or care, which kind of account it's holding.

That's the real power of polymorphism. Imagine the bank adds a `StudentAccount` next year, with its own `withdraw`. This loop doesn't change at all. Compare that with checking the kind of account yourself, with a chain of `if isinstance(account, SavingsAccount):` and `elif isinstance(account, CheckingAccount):`. Every new kind of account would mean finding and editing every chain like that, all over your program. With polymorphism, each class carries its own rules, and you just call the method.

> **Tip:** Python doesn't strictly need a shared parent for this. When the program runs, any object with a `withdraw` method would work in that loop. People call this **duck typing**: "if it walks like a duck and quacks like a duck, it's a duck." A shared parent class is still worth having, because it makes the family clear to people reading your code, and lets mypy check it.

### Exception hierarchies

In [chapter 18](../18-error-handling/notes.md), you made your own exception type by copying a pattern:

```python
class InsufficientFunds(Exception):
    pass
```

Now you can read it: `InsufficientFunds` is a child class of `Exception`. It inherits everything that makes an exception work (the message, being raised and caught, the traceback), and adds nothing.

Python's built-in exceptions are a family tree too. Here's a small part of it:

```
BaseException
 ├── KeyboardInterrupt          (Ctrl + C)
 └── Exception
      ├── ArithmeticError
      │    └── ZeroDivisionError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      └── ValueError
           └── json.JSONDecodeError
```

The tree explains some things you've seen before:

- In chapter 18, `except Exception` didn't catch `Ctrl + C`. Now you can see why: `KeyboardInterrupt` isn't a child of `Exception`.
- In [chapter 26](../26-project-todo-app/notes.md), `except ValueError` caught a broken JSON file. That worked because `json.JSONDecodeError` is a child of `ValueError`.

The big rule: **catching a parent catches all its children.** `except LookupError` catches both `KeyError` and `IndexError`:

```python
def first_item(order: dict[str, list[str]]) -> str:
    return order["items"][0]


orders: list[dict[str, list[str]]] = [{"items": ["pizza", "cola"]}, {"items": []}, {}]
for order in orders:
    try:
        print(first_item(order))
    except LookupError as e:
        print(f"Couldn't find it: {type(e)}")
```

```
pizza
Couldn't find it: <class 'IndexError'>
Couldn't find it: <class 'KeyError'>
```

The empty list gave an `IndexError`, and the missing `"items"` key gave a `KeyError`. One `except` caught both.

### Your own exception family

You can build the same kind of tree for your own program. Give it one parent exception, and a child for each kind of problem:

```python
class BankError(Exception):
    """Something went wrong at the bank. The parent of all our bank errors."""


class InsufficientFundsError(BankError):
    """A withdrawal was bigger than the balance."""

    def __init__(self, balance: int, amount: int) -> None:
        super().__init__(f"tried to take {amount}, but the balance is only {balance}")
        self.balance = balance
        self.amount = amount


class AccountFrozenError(BankError):
    """Someone tried to use a frozen account."""
```

A few things are new here:

- A class body can be just a docstring. That counts as "something inside", so you don't need `pass`.
- By tradition, exception names end in `Error`, like the built-in ones. (That's why this chapter says `InsufficientFundsError`, where chapter 18 kept it short.)
- `InsufficientFundsError` has its own `__init__`, with extra attributes for the balance and the amount. It works exactly like `SavingsAccount.__init__`: `super().__init__(message)` lets `Exception` store the message, and then the child adds its own part. Now the code that catches the error can use the numbers, not just read the message.

Here's an account that raises them. (It's cut down to keep it short: no `deposit`, and a `frozen` attribute that a bank worker can switch on.)

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self._balance = balance
        self.frozen = False

    @property
    def balance(self) -> int:
        return self._balance

    def withdraw(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if self.frozen:
            raise AccountFrozenError(f"{self.owner}'s account is frozen")
        if amount > self._balance:
            raise InsufficientFundsError(self._balance, amount)
        self._balance -= amount


maya = BankAccount("Maya", 100)
leo = BankAccount("Leo", 50)
leo.frozen = True

try:
    maya.withdraw(500)
except InsufficientFundsError as e:
    print(f"Sorry: {e}")
    print(f"You need {e.amount - e.balance} more.")

for account in [maya, leo, maya]:
    try:
        account.withdraw(80)
        print(f"{account.owner} took out 80")
    except BankError as e:
        print(f"Bank problem: {e}")
```

You'll see:

```
Sorry: tried to take 500, but the balance is only 100
You need 400 more.
Maya took out 80
Bank problem: Leo's account is frozen
Bank problem: tried to take 80, but the balance is only 20
```

The first `try` catches one specific child, and uses its extra attributes. The loop catches the parent, `BankError`, so it handles every kind of bank problem the same way. The code that catches gets to choose how picky to be.

And a negative amount is still a plain `ValueError`. That's on purpose: a negative withdrawal isn't a bank problem, it's a bad value, probably a bug in the calling code. `except BankError` won't hide it.

Big libraries do exactly this. The `requests` package that you'll use in [chapter 40](../40-working-with-apis/notes.md) has a parent called `RequestException`, with children like `ConnectionError` and `Timeout`.

> **Watch out:** Python checks `except` blocks from top to bottom, and runs the first one that matches. A parent matches all its children, so always put the **children first** and the parent last. Mistake 4 at the end shows what happens the other way round.

### Abstract base classes: a parent that's only an idea

A coffee shop wants to tell customers when their order is ready. Some customers want an email, some want a text message, and there's a big screen on the wall. Each of those is a different class with a `send(message)` method, and they all belong to one family: notifiers.

But what would a plain "notifier" do? Nothing: it's only an idea. Nobody should ever make one, and every real kind of notifier must have a `send` method. Python's `abc` module lets you say exactly that. (ABC stands for **abstract base class**. "Abstract" means it's an idea, not a real thing, like "furniture" compared with an actual chair.)

```python
from abc import ABC, abstractmethod


class Notifier(ABC):
    """Something that can send a message to a customer."""

    @abstractmethod
    def send(self, message: str) -> None:
        """Send the message. Every kind of notifier must write its own."""


class EmailNotifier(Notifier):
    def __init__(self, address: str) -> None:
        self.address = address

    def send(self, message: str) -> None:
        print(f"Email to {self.address}: {message}")


class SmsNotifier(Notifier):
    def __init__(self, phone: str) -> None:
        self.phone = phone

    def send(self, message: str) -> None:
        print(f"Text to {self.phone}: {message}")


class ScreenNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"On the big screen: {message.upper()}")


notifiers: list[Notifier] = [
    EmailNotifier("maya@example.com"),
    SmsNotifier("555-0142"),
    ScreenNotifier(),
]
for notifier in notifiers:
    notifier.send("Your coffee is ready")
```

You'll see:

```
Email to maya@example.com: Your coffee is ready
Text to 555-0142: Your coffee is ready
On the big screen: YOUR COFFEE IS READY
```

Polymorphism again: one call, three behaviours. Here's what's new:

- `class Notifier(ABC):` makes `Notifier` an abstract base class, by inheriting from `ABC`.
- `@abstractmethod` (another decorator, see [chapter 32](../32-decorators/notes.md)) marks `send` as a method that every child **must** write for itself. Its body is only a docstring, because the parent has no idea how to send anything.

Now Python enforces the rules. Try to make a plain `Notifier`:

```python
general = Notifier()
```

```
TypeError: Can't instantiate abstract class Notifier without an implementation for abstract method 'send'
```

("Instantiate" means "make an instance of".) And a child that forgets to write `send` can't be made either:

```python
class PigeonNotifier(Notifier):
    def fly(self, message: str) -> None:
        print(f"A pigeon flies off with: {message}")


pigeon = PigeonNotifier()
```

```
TypeError: Can't instantiate abstract class PigeonNotifier without an implementation for abstract method 'send'
```

The mistake shows up the moment you create the object, not weeks later when someone finally calls `send`. mypy finds it even earlier, without running anything: `Cannot instantiate abstract class "PigeonNotifier" with abstract attribute "send"`.

### Composition: "has a" instead of "is a"

Inheritance is for **"is a"** relationships. Before you write `class Child(Parent):`, say it out loud: "a child *is a* parent".

- "A savings account is a bank account." True, so inheritance fits.
- "A customer is a bank account." Nonsense! A customer **has** bank accounts.

When one thing **has** another, give it the other thing as an attribute instead. That's called **composition**: building a bigger object out of smaller ones, the way a car is built from an engine, wheels and seats, instead of a car being a kind of engine.

Here's a bank customer, built from the account classes and the notifier classes from earlier in this chapter:

```python
class Customer:
    def __init__(self, name: str, notifier: Notifier) -> None:
        self.name = name
        self.notifier = notifier  # a customer HAS a notifier
        self.accounts: list[BankAccount] = []  # ...and HAS accounts

    def open_account(self, account: BankAccount) -> None:
        self.accounts.append(account)

    def total_balance(self) -> int:
        return sum([account.balance for account in self.accounts])

    def send_statement(self) -> None:
        total = self.total_balance()
        self.notifier.send(f"Hi {self.name}, your total balance is {total}")


maya = Customer("Maya", SmsNotifier("555-0142"))
maya.open_account(SavingsAccount("Maya", 1000))
maya.open_account(CheckingAccount("Maya", 150))

leo = Customer("Leo", EmailNotifier("leo@example.com"))
leo.open_account(BankAccount("Leo", 40))

for customer in [maya, leo]:
    customer.send_statement()
```

You'll see:

```
Text to 555-0142: Hi Maya, your total balance is 1150
Email to leo@example.com: Hi Leo, your total balance is 40
```

Look at what composition gives you:

- Maya can have two accounts of different kinds. If `Customer` inherited from `BankAccount`, a customer could only ever *be* one account.
- Maya gets texts and Leo gets emails, but `Customer` doesn't care how. It just calls `self.notifier.send(...)`. You can swap in any kind of notifier, even one that doesn't exist yet, without changing `Customer` at all.

Inheritance ties a child to every detail of its parent, forever. Composition just plugs parts together, and parts are easy to swap. So the usual advice is: **when you're not sure, prefer composition.** Use inheritance for a clear "is a" relationship, and keep the family tree shallow (one or two levels).

## Common mistakes

**1. Forgetting `super().__init__(...)`**

```python
class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: int = 0, interest_rate: float = 0.02) -> None:
        self.interest_rate = interest_rate  # forgot super().__init__(...)


savings = SavingsAccount("Maya", 100)
print(savings.interest_rate)  # prints: 0.02
print(savings.balance)
```

```
AttributeError: 'SavingsAccount' object has no attribute '_balance'. Did you mean: 'balance'?
```

This one is confusing, because the error is about `_balance`, and Python's suggestion doesn't help. Here's what happened: the child's `__init__` replaced the parent's, and nobody asked the parent to run. So `owner` and `_balance` were never set. Then the `balance` property tried to read `self._balance`, which doesn't exist. Neither Python nor mypy warns you when you create the object, so the crash comes later. Fix: make `super().__init__(owner, balance)` the first line of the child's `__init__`.

**2. Giving `super().__init__` the wrong arguments**

```python
class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: int = 0, interest_rate: float = 0.02) -> None:
        super().__init__(self, owner, balance)
        self.interest_rate = interest_rate


savings = SavingsAccount("Maya", 100)
```

```
TypeError: BankAccount.__init__() takes from 2 to 3 positional arguments but 4 were given
```

`super()` already passes `self` for you, just like `account.deposit(50)` does. Passing it again makes four arguments where three is the most. (mypy catches this one: `Too many arguments for "__init__" of "BankAccount"`.) Fix: `super().__init__(owner, balance)`.

Forgetting an argument is sneakier. `super().__init__(owner)` runs without any error, but the parent uses its default, so every savings account starts with a balance of `0`, whatever you asked for. Pass along everything the parent needs.

**3. Inheriting just to reuse code**

```python
class Customer(BankAccount):
    pass


zoe = Customer("Zoe", 100)
zoe.withdraw(30)  # withdraw money from... a person?
print(isinstance(zoe, BankAccount))  # prints: True
```

It runs, and it saved some typing. But now a customer **is** a bank account. You can withdraw money from Zoe herself, `transfer()` will happily accept her as an account (mypy agrees, because the class says so), and she can never have a second account. The "is a" test fails: a customer *has* accounts. Fix: use composition, like the `Customer` class in the notes. Only inherit when the child really is a kind of the parent.

**4. Catching the parent exception before the child**

```python
maya = BankAccount("Maya", 100)
try:
    maya.withdraw(500)
except BankError:
    print("Something went wrong at the bank")
except InsufficientFundsError as e:
    print(f"You need {e.amount - e.balance} more.")
```

This prints `Something went wrong at the bank`, and there's no error at all, which makes it easy to miss. Python takes the first `except` that matches, and an `InsufficientFundsError` **is** a `BankError`, so the first block wins every time. The second block can never run. Fix: put the most specific exception first, and the parent last:

```python
except InsufficientFundsError as e:
    print(f"You need {e.amount - e.balance} more.")
except BankError:
    print("Something went wrong at the bank")
```

**5. Checking `type(x) == Parent` instead of using `isinstance`**

```python
savings = SavingsAccount("Maya", 100)
print(type(savings) == BankAccount)  # prints: False
print(isinstance(savings, BankAccount))  # prints: True
```

`type()` only tells you the exact class, and ignores the family. So a check like `if type(account) == BankAccount:` quietly turns away every savings and checking account, even though they *are* bank accounts. Use `isinstance()`, which understands inheritance. (And before you write any check at all, ask whether polymorphism can do the job instead: often the best check is no check, just calling the method.)

**6. Changing a method's parameters when you override it**

```python
class StudentAccount(BankAccount):
    def withdraw(self, amount: int, reason: str) -> None:
        print(f"Student withdrawal for {reason}")
        super().withdraw(amount)


accounts: list[BankAccount] = [BankAccount("Sam", 200), StudentAccount("Aisha", 200)]
for account in accounts:
    account.withdraw(50)
```

```
TypeError: StudentAccount.withdraw() missing 1 required positional argument: 'reason'
```

Sam's withdrawal works, then Aisha's crashes. The loop calls `withdraw(50)` the way every bank account expects, but the student version demands an extra argument. That breaks polymorphism: code that works with any `BankAccount` should work with every child. mypy spots it straight away with `Signature of "withdraw" incompatible with supertype "BankAccount"`, and shows both versions side by side. (A **signature** is a method's first line: its name, parameters and return type.) Fix: keep the parent's parameters when you override. If the child needs extra information, take it in `__init__` and store it as an attribute.

## Quick recap

- `class SavingsAccount(BankAccount):` makes a **child class** that **inherits** everything from its **parent**. The child can add new attributes and methods.
- A child that writes its own `__init__` should call `super().__init__(...)` first, so the parent can set up its part.
- **Overriding** means writing a method with the same name as the parent's. Extend the parent's version by calling `super().method(...)`, or replace it completely.
- Python looks for a method on the object, then its class, then up through the parents to `object`. `isinstance()` understands families; `type(x) == Parent` doesn't.
- **Polymorphism**: the same call (`account.withdraw(150)`) does the right thing for each kind of object, so your loops don't need to check types.
- Exceptions are a family tree. Catching a parent catches all its children, so put children first. Give your program one parent exception, like `BankError`.
- `ABC` and `@abstractmethod` make a parent that can't be created, and force every child to write certain methods.
- "Is a" means inheritance. "Has a" means **composition**. When you're not sure, prefer composition.

---

**Next:** try the [exercises](exercises.md), then move on to [29 Dunder Methods](../29-dunder-methods/notes.md).
