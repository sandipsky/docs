# 29 Dunder Methods

## What is it?

A **dunder method** is a method whose name starts and ends with two underscores, like `__init__`. ("Dunder" is short for "double underscore", as you saw with `__name__` in [chapter 19](../19-modules-and-standard-library/notes.md).) They're also called **special methods**, because you hardly ever call them yourself. Python calls them for you, when you use one of its built-in features.

`print(x)` calls `x.__str__()`. `a == b` calls `a.__eq__(b)`. `len(x)` calls `x.__len__()`. Give your class the right dunder methods, and your objects work with `print`, `==`, `len`, `in`, `+` and `sorted`, just like Python's own types.

## Why does it matter?

In [chapter 27](../27-classes-and-objects/notes.md), you made your own types, and you met two loose ends: printing an account shows something unhelpful, and `==` says `False` for two accounts that look the same. Your objects don't fit in with the rest of Python yet. Here's a bank account and a music playlist:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance


class Playlist:
    def __init__(self, name: str, songs: list[str]) -> None:
        self.name = name
        self.songs = songs


account = BankAccount("Maya", 100)
print(account)
print(account == BankAccount("Maya", 100))

road_trip = Playlist("Road trip", ["Africa", "Yellow", "Dancing Queen"])
print(len(road_trip))
```

You'll see:

```
<__main__.BankAccount object at 0x000001F80BC16900>
False
Traceback (most recent call last):
  ...
TypeError: object of type 'Playlist' has no len()
```

Three problems:

1. **`print` is useless.** It only tells you the class name and a memory address (yours will be a different number). You can't see whose account it is, or how much is in it.
2. **`==` says `False`** for two accounts that look exactly the same.
3. **`len()` crashes**, even though a playlist obviously has a length: the number of songs in it.

Compare that with a list. `print([1, 2])` shows the items, `[1, 2] == [1, 2]` is `True`, and `len([1, 2])` is `2`. Python's own types work with all of Python's tools. By the end of this chapter, yours will too.

## Real-world example

Think about the plugs and sockets in your home. The socket in the wall doesn't know or care what you plug into it: a lamp, a kettle, a phone charger. As long as the device has the standard plug, it works. A device with an odd plug doesn't fit, however good it is.

| Plugs and sockets | Python |
|---|---|
| A wall socket | One of Python's built-in features: `print()`, `len()`, `==`, `+`, `in`, `sorted()` |
| The standard plug shape that everyone agrees on | A dunder method with an agreed name, like `__len__` |
| A lamp, a kettle, a phone charger | Your classes: `BankAccount`, `Playlist`, `Money` |
| The socket doesn't care what's on the other end | `len()` works with any object that has a `__len__` method |
| A device with the wrong plug | An object without the dunder method: you get a `TypeError` |

## How it works

### You've been using dunders all along

You've already written one dunder method: `__init__`. You never call it yourself. You write `BankAccount("Maya", 100)`, and Python calls `__init__` for you.

Python's own types work the same way. When you call `len("hello")`, Python asks the string for its length by calling its `__len__` method. When you write `3 + 4`, Python calls the `__add__` method of `3`. You can even call them by hand, to watch it happen:

```python
print(len("hello"))       # prints: 5
print("hello".__len__())  # prints: 5
print(3 + 4)              # prints: 7
print((3).__add__(4))     # prints: 7
```

(The brackets around the `3` are needed, because `3.` on its own looks like the start of a decimal number.)

You'll never write `"hello".__len__()` in real code. `len("hello")` is shorter and clearer. But it shows the secret: **Python's built-in features are calls to dunder methods.** So if your class has a method with the right name, Python will call yours too.

Where did the ugly print and the strict `==` come from, then? From `object`, the class that every class inherits from ([chapter 28](../28-inheritance/notes.md)). `object` has its own `__repr__`, which gives `<__main__.BankAccount object at 0x...>`, and its own `__eq__`, which only matches the very same object. When you write a dunder method in your class, you **override** `object`'s version, exactly like overriding a parent's method in chapter 28.

> **Tip:** In chapter 19, you skipped the odd names at the start of `dir()`'s list. Try `dir("hello")` in the REPL. Names like `'__add__'`, `'__contains__'` and `'__len__'` are the string's dunder methods: they're why `+`, `in` and `len()` work on strings.

### `__str__`: what `print` shows

The fix for the ugly print is a method called `__str__`. It takes only `self`, and **returns** a string: the text you'd like people to see.

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def __str__(self) -> str:
        return f"{self.owner}'s account: ${self.balance}"

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount


account = BankAccount("Maya", 100)
print(account)  # prints: Maya's account: $100
account.deposit(50)
print(account)  # prints: Maya's account: $150
print(f"Statement for {account}")  # prints: Statement for Maya's account: $150
text = str(account)
print(text.upper())  # prints: MAYA'S ACCOUNT: $150
```

(`withdraw` is left out to keep the examples short. It works exactly as in chapter 27.)

Python uses `__str__` whenever it needs your object as text for a person to read: `print(account)`, an f-string like `f"{account}"`, and `str(account)` all call it. The balance is always up to date, because `__str__` builds the text fresh every time it's called.

Two rules:

- `__str__` must **return** a string. It doesn't print anything itself: `print` does the printing. (Common mistakes shows what happens if you mix them up.)
- It takes no arguments apart from `self`.

> **Tip:** Put dunder methods straight after `__init__`. It's a common habit, and it lets anyone reading your class see at a glance how it plugs into Python.

### `__repr__`: what programmers see

`__str__` fixed `print(account)`. Now try printing a list of accounts:

```python
accounts = [account, BankAccount("Leo", 75)]
print(accounts)
```

```
[<__main__.BankAccount object at 0x000001F80BC16900>, <__main__.BankAccount object at 0x000001F80BF64A50>]
```

The ugly text is back! That's because Python has **two** ways to turn an object into text:

- **`__str__`** is the friendly version, for the people using your program: `Maya's account: $150`.
- **`__repr__`** (say "repper", short for "representation") is the exact version, for programmers: what is this object, precisely?

A list uses `__repr__` for the things inside it. So does the REPL when it shows you a value, and so does the built-in `repr()`, which you used in [chapter 20](../20-files-and-folders/notes.md) to see the hidden `\n` characters in some text.

The usual style for `__repr__` is to make it look like the code that would create the object:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self.balance!r})"

    def __str__(self) -> str:
        return f"{self.owner}'s account: ${self.balance}"


account = BankAccount("Maya", 150)
print(account)
print(repr(account))
print(f"{account!r}")
print([account, BankAccount("Leo", 75)])
```

You'll see:

```
Maya's account: $150
BankAccount(owner='Maya', balance=150)
BankAccount(owner='Maya', balance=150)
[BankAccount(owner='Maya', balance=150), BankAccount(owner='Leo', balance=75)]
```

What's that `!r`? Inside an f-string, `!r` after a name means "use `repr()` here, instead of `str()`". For numbers it makes no difference, but strings get quotes around them:

```python
name = "Maya"
print(f"{name}")    # prints: Maya
print(f"{name!r}")  # prints: 'Maya'
```

Why do the quotes matter? `BankAccount(owner='Maya', balance=150)` is real Python code: you could copy it into a file and get the same account back. Without `!r`, you'd get `BankAccount(owner=Maya, balance=150)`, which isn't. The quotes also show you exactly where a string starts and ends, which is a lifesaver when you're hunting a bug. Spot the problem here:

```python
typed = "Maya "
print(f"Hello, {typed}!")  # prints: Hello, Maya !
print(f"{typed!r}")        # prints: 'Maya '
```

A stray space at the end of a name is easy to miss. With `!r`, you can't miss it.

So which one does Python use when?

| You write | Python calls |
|---|---|
| `print(x)`, `str(x)`, `f"{x}"` | `x.__str__()` |
| `repr(x)`, `f"{x!r}"` | `x.__repr__()` |
| `print([x, y])`: a list, tuple, set or dictionary holding your objects | `__repr__` of each object inside |
| Typing `x` at the `>>>` prompt in the REPL | `x.__repr__()` |

There's a handy fallback, too. If your class has `__repr__` but no `__str__`, Python uses `__repr__` for `print` as well. Delete the `__str__` method from the class above and run it again: `print(account)` now shows `BankAccount(owner='Maya', balance=150)`. It doesn't work the other way round, though: if you only write `__str__`, lists still show the ugly default, as you saw.

So a good rule is: **always write `__repr__`, and add `__str__` too when you want a friendlier version for your users.**

You can try your classes in the REPL, too. Save the class (without the test lines at the bottom) as `bank.py`. Then `python -i bank.py` runs the file and leaves you at the `>>>` prompt with everything in it ready to use (`-i` stands for "interactive"):

```
python -i bank.py
>>> account = BankAccount("Maya", 150)
>>> account
BankAccount(owner='Maya', balance=150)
>>> print(account)
Maya's account: $150
>>> exit()
```

### `__eq__`: when are two objects equal?

Back to the second problem. Two accounts with the same owner and balance aren't equal:

```python
a = BankAccount("Maya", 150)
b = BankAccount("Maya", 150)
print(a == b)  # prints: False
print(a == a)  # prints: True
```

Unless you say otherwise, `==` on your objects does the same as `is` from [chapter 16](../16-scope-and-mutability/notes.md): it's only `True` when both names point at the very same object. Remember the two cars of the same model and colour? `a` and `b` are two separate cars.

For bank accounts, that's actually right. If Maya opens two accounts with $150 in each, they're still two different accounts: money paid into one doesn't appear in the other. So `BankAccount` should keep the default.

But for some things, only the value matters. A $5 note in your wallet and a $5 note in mine are worth exactly the same. Here's a small class for an amount of money, kept in whole cents like in [chapter 25](../25-type-hints/notes.md), with the two methods you know already:

```python
class Money:
    """An amount of money, kept in whole cents."""

    def __init__(self, cents: int) -> None:
        self.cents = cents

    def __repr__(self) -> str:
        return f"Money({self.cents})"

    def __str__(self) -> str:
        return f"${self.cents / 100:.2f}"


price = Money(350)
print(price)  # prints: $3.50
print(repr(price))  # prints: Money(350)
print(Money(350) == Money(350))  # prints: False
```

`$3.50` is the friendly version, for a receipt. `Money(350)` is the exact one, for programmers. (`{self.cents / 100:.2f}` turns cents into dollars with two decimal places, the f-string trick from [chapter 06](../06-strings/notes.md).)

And `Money(350) == Money(350)` is `False`. Let's fix that by adding `__eq__` to the class:

```python
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return self.cents == other.cents
```

When Python sees `a == b`, it calls `a.__eq__(b)`. So `self` is the object on the left of `==`, and `other` is the one on the right. Line by line:

- **`other: object`**: the right-hand side could be anything at all: another `Money`, a number, a string, `None`. `object` is the hint for "any value", because every value in Python is an object (chapter 27).
- **`if not isinstance(other, Money):`** checks whether `other` is a `Money`, with `isinstance()` from [chapter 17](../17-recursion/notes.md).
- **`return NotImplemented`**: if it isn't a `Money`, we don't know how to compare. `NotImplemented` is a special built-in value that says exactly that: "I don't know how to do this with that type." Python then asks the object on the other side instead, and if that one doesn't know either, `==` falls back to `is`, which gives `False`. No crash.
- **`return self.cents == other.cents`**: two `Money` objects are equal when they hold the same number of cents.

Now:

```python
print(Money(350) == Money(350))  # prints: True
print(Money(350) == Money(275))  # prints: False
print(Money(350) != Money(275))  # prints: True
print(Money(350) == 350)  # prints: False
print(Money(350) in [Money(100), Money(350)])  # prints: True
```

Two bonuses come for free. `!=` works, because Python simply flips the answer from `__eq__`. And `in` on a list works, because a list checks each item with `==`. (So do the list methods `.count()`, `.index()` and `.remove()`.)

`Money(350) == 350` is `False` on purpose. Is that 350 cents, or 350 dollars? "Not equal" is safer than a guess.

Why `object`, and not `Money`, for `other`? If you hint it as a `Money` (written `other: "Money"`, in quotes, for a reason you'll see in the `__add__` section), mypy complains, and then suggests the exact pattern above:

```
money.py:13: error: Argument 1 of "__eq__" is incompatible with supertype "builtins.object"; supertype defines the argument type as "object"  [override]
money.py:13: note: This violates the Liskov substitution principle
money.py:13: note: See https://mypy.readthedocs.io/en/stable/common_issues.html#incompatible-overrides
money.py:13: note: It is recommended for "__eq__" to work with arbitrary objects, for example:
money.py:13: note:     def __eq__(self, other: object) -> bool:
money.py:13: note:         if not isinstance(other, Money):
money.py:13: note:             return NotImplemented
money.py:13: note:         return <logic to compare two Money instances>
```

(Don't worry about the long words in the first few lines. In short: `==` promises to work with any value at all, so your `__eq__` has to accept any value too.)

> **Watch out:** `NotImplemented` and `NotImplementedError` are different things. `NotImplemented` is a value you **return** from a dunder method, meaning "I can't do this with that type, ask the other side". `NotImplementedError` is an exception you **raise**, meaning "this part hasn't been written yet". Don't mix them up.

### `__hash__`: putting equal objects in a set

Now try to put some prices in a set:

```python
prices = {Money(350), Money(275), Money(350)}
```

```
TypeError: unhashable type: 'Money'
```

Before you wrote `__eq__`, this worked. What changed?

Remember from [chapter 12](../12-tuples-and-sets/notes.md) how a set works: it files each item away based on a number worked out from its value, called its **hash**, so it can find it again in an instant. (The built-in `hash()` function shows you an object's hash.) For that to work, there's one golden rule: **objects that are equal must have the same hash.** Otherwise, a set would file two equal prices in two different places, and keep both.

Your class used to get a hash based on each object's identity, which matched the old `==` (also based on identity). Once you write your own `__eq__`, that old hash would break the golden rule, and Python can't guess a new one that matches. So it switches hashing off, and your objects can't go in sets or be dictionary keys any more.

The fix is to write `__hash__` yourself. Base it on the same attributes that `__eq__` compares, and let the built-in `hash()` do the maths:

```python
    def __hash__(self) -> int:
        return hash(self.cents)
```

Now:

```python
prices = {Money(350), Money(275), Money(350)}
print(prices)  # prints: {Money(275), Money(350)}
print(len(prices))  # prints: 2
print(Money(275) in prices)  # prints: True
```

The second `Money(350)` was dropped, because the set could see it was equal to one it already had. If your `__eq__` compares several attributes, hash a tuple of them: `return hash((self.row, self.number))`.

**Only do this for objects that never change.** Look what happens if an object changes after it went into a set:

```python
tip = Money(500)
tips = {tip}
tip.cents = 1000
print(tip in tips)  # prints: False
```

`tip` is right there in the set! But the set filed it under the hash of `500`, and now it looks under the hash of `1000`, which is the wrong place. It's exactly why lists can't go in sets: they can change.

So treat a `Money` as fixed: never change its `cents` after you make it. When you need a different amount, make a new `Money` (which is what `+` will do, further down). [Chapter 30](../30-dataclasses-and-enums/notes.md) shows how to make Python refuse such changes, with a "frozen" dataclass.

| If your class... | Write `__eq__`? | Write `__hash__`? |
|---|---|---|
| is a "thing" with its own identity that changes over time, like a `BankAccount` | No, keep the default | No, keep the default |
| is a value that never changes, like `Money` | Yes | Yes, using the same attributes as `__eq__` |
| is a value that can change | Yes | No: it stays unhashable, like a list |

### `__lt__`: sorting your objects

Try sorting the prices on a cafe menu:

```python
menu_prices = [Money(450), Money(275), Money(1200), Money(350)]
print(sorted(menu_prices))
```

```
TypeError: '<' not supported between instances of 'Money' and 'Money'
```

To sort, `sorted()` compares pairs of items with `<`, and so do `min()` and `max()`. Python has no idea whether one `Money` is less than another until you write `__lt__` (short for "less than"). mypy spots this one before you run anything, by the way, with a rather long way of saying "these can't be compared, so they can't be sorted":

```
money.py:23: error: Value of type variable "SupportsRichComparisonT" of "sorted" cannot be "Money"  [type-var]
```

Here's `__lt__`. It has the same shape as `__eq__`:

```python
    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return self.cents < other.cents
```

Now:

```python
print(sorted(menu_prices))  # prints: [Money(275), Money(350), Money(450), Money(1200)]
print(min(menu_prices))  # prints: $2.75
print(max(menu_prices))  # prints: $12.00
print(Money(275) < Money(350))  # prints: True
print(Money(275) > Money(350))  # prints: False
```

`>` works too, even though you didn't write it. When Python can't work out `a > b` directly, it turns it around and asks `b < a` instead. But `<=` and `>=` still don't work:

```python
print(Money(275) <= Money(350))
```

```
TypeError: '<=' not supported between instances of 'Money' and 'Money'
```

You could write `__le__`, `__gt__` and `__ge__` as well, but the standard library has a shortcut. Import it with `from functools import total_ordering` at the top of the file, and put `@total_ordering` on the line just above `class Money:`. It looks at your `__eq__` and `__lt__`, and writes the other comparisons for you. Then `Money(275) <= Money(350)` is `True`. You'll see it in the whole class at the end of this section.

The `@` line is a **decorator**, the same kind of line as `@property` in chapter 27. [Chapter 32](../32-decorators/notes.md) shows how decorators work. For now, you only need to know where it goes.

> **Tip:** Only give a class `__lt__` when it has one natural order, like amounts of money or dates. Bank accounts don't: by owner? by balance? by account number? When you want to sort by something different each time, `sorted()` with a `key=` ([chapter 34](../34-functional-tools/notes.md)) is the better tool.

### Making your own container: `__len__`, `__contains__` and `__getitem__`

Now the playlist. A **container** is an object that holds other things, like a list, a dictionary or a set. Three dunder methods make your own class work like one:

```python
class Playlist:
    """A named list of songs."""

    def __init__(self, name: str, songs: list[str]) -> None:
        self.name = name
        self.songs = songs

    def __repr__(self) -> str:
        return f"Playlist({self.name!r}, {self.songs!r})"

    def __len__(self) -> int:
        return len(self.songs)

    def __contains__(self, song: str) -> bool:
        return song in self.songs

    def __getitem__(self, index: int) -> str:
        return self.songs[index]


road_trip = Playlist("Road trip", ["Africa", "Yellow", "Dancing Queen", "Wonderwall"])
print(len(road_trip))  # prints: 4
print("Yellow" in road_trip)  # prints: True
print("Hello" in road_trip)  # prints: False
print("Hello" not in road_trip)  # prints: True
print(road_trip[0])  # prints: Africa
print(road_trip[-1])  # prints: Wonderwall
```

| You write | Python calls |
|---|---|
| `len(road_trip)` | `road_trip.__len__()` |
| `"Yellow" in road_trip` | `road_trip.__contains__("Yellow")` |
| `road_trip[0]` | `road_trip.__getitem__(0)` |

Notice that each method just hands the job to the list inside. That's called **delegating**: the playlist doesn't count its songs itself, it asks its list to. Most container classes you write will look like this. And because the list does the real work, you get its behaviour for free: negative indexes like `road_trip[-1]`, `not in`, and a helpful error when an index is too big:

```python
print(road_trip[10])
```

```
IndexError: list index out of range
```

`__getitem__` gets whatever is inside the square brackets, so it doesn't have to be a number. A `Menu` class could look up prices by name, like `menu["latte"]`, by passing the key on to a dictionary. You'll build one in the exercises.

> **Tip:** Try `for song in road_trip:`. Surprise: it works! When a class has no proper way to loop over it, Python falls back to calling `__getitem__` with 0, 1, 2 and so on, until it gets an `IndexError`. It's an old leftover, and mypy doesn't accept it (`"Playlist" has no attribute "__iter__" (not iterable)`). The proper way to make your objects work in a `for` loop is `__iter__`, in [chapter 31](../31-iterators-and-generators/notes.md).

### `__bool__`: is it truthy?

In [chapter 08](../08-conditionals/notes.md), you learned that some values are falsy: `0`, `""`, `None`, and empty collections like `[]`. What about your own objects?

By default, every object you make is truthy. But if your class has `__len__`, Python uses it: a length of `0` means falsy. So an empty playlist is falsy, just like an empty list:

```python
empty = Playlist("New playlist", [])
if not empty:
    print("Nothing to play yet")  # prints: Nothing to play yet
print(bool(road_trip))  # prints: True
```

For objects that don't have a length, you decide with `__bool__`, which returns `True` or `False`. Zero dollars should be falsy, like the number `0`. Add this to `Money`:

```python
    def __bool__(self) -> bool:
        return self.cents != 0
```

```python
discount = Money(0)
if not discount:
    print("No discount today")  # prints: No discount today
```

When Python needs to know whether an object is truthy, it tries `__bool__` first, then `__len__`. If the class has neither, the answer is `True`.

### `__add__` and `__radd__`: adding with `+`

Adding up prices is the most useful thing you can do with money. Here's `__add__`:

```python
    def __add__(self, other: object) -> "Money":
        if not isinstance(other, Money):
            return NotImplemented
        return Money(self.cents + other.cents)
```

The same shape again, with one difference: it returns a **new** `Money`. `+` never changes either side (`3 + 4` doesn't change the `3`), and that keeps our `Money` objects fixed, just as the hash needs.

Why the quotes around `"Money"` in the hint? While Python is still reading the class, the class isn't finished, so the name `Money` doesn't exist yet. A plain `-> Money` crashes as soon as you run the file:

```
NameError: name 'Money' is not defined. Did you mean: 'None'?
```

It's the same problem as using a type alias before you've made it, in [chapter 25](../25-type-hints/notes.md). The quotes turn the hint into text, which mypy and VS Code read later, once the class exists. (Python 3.14 reads hints later by itself, so there you can leave the quotes off. They still work, though.)

Now:

```python
coffee = Money(350)
cake = Money(425)
print(coffee + cake)  # prints: $7.75
print(coffee + cake + Money(100))  # prints: $8.75
print(coffee)  # prints: $3.50
```

`coffee` is still `$3.50`. `+=` works too: `total += coffee` builds a new `Money`, and moves the name `total` to it.

Adding a plain number is refused, with the error you know from strings and numbers, because `__add__` returned `NotImplemented`:

```python
print(coffee + 100)
```

```
TypeError: unsupported operand type(s) for +: 'Money' and 'int'
```

Is that 100 cents, or 100 dollars? Again, refusing is safer than guessing.

**Making `sum()` work.** Here's a whole order:

```python
order = [Money(350), Money(425), Money(275)]
print(sum(order))
```

```
TypeError: unsupported operand type(s) for +: 'int' and 'Money'
```

`'int' and 'Money'`? There's no `int` in the list! The secret is that `sum()` starts counting from `0`. Its very first step is `0 + Money(350)`, and that's what fails.

Here's what Python really does with `a + b`:

1. It tries `a.__add__(b)`.
2. If that returns `NotImplemented` (or `a` has no `__add__`), it tries the **reflected** method of the right-hand side: `b.__radd__(a)`. The "r" stands for "right": it's called when your object is on the right of the `+`.
3. If that also returns `NotImplemented`, you get the `TypeError`.

So for `0 + Money(350)`, Python tries the `int`'s `__add__` first, which has never heard of `Money`. Then it tries `Money(350).__radd__(0)`. Let's write that method:

```python
    def __radd__(self, other: object) -> "Money":
        if other == 0:  # sum() starts from 0
            return self
        return NotImplemented
```

Adding 0 changes nothing, so it gives back the same money. Anything else is still refused. (When both sides are `Money`, `__add__` already handles it, so `__radd__` only needs to deal with that `0`.) Now:

```python
print(sum(order))  # prints: $10.50
```

> **Tip:** `sum()` can also take a starting value. `sum(order, Money(0))` works even without `__radd__`, because it starts from `Money(0)` instead of `0`. That's handy when the class isn't yours to change.

The other maths operators work the same way: `-` calls `__sub__`, `*` calls `__mul__`, and `/` calls `__truediv__`, and each one has an "r" version too.

### The whole `Money` class

Here's everything together, with `@total_ordering` on top. Save it as `money.py`:

```python
from functools import total_ordering


@total_ordering
class Money:
    """An amount of money in whole cents. Never change .cents after creating it."""

    def __init__(self, cents: int) -> None:
        self.cents = cents

    def __repr__(self) -> str:
        return f"Money({self.cents})"

    def __str__(self) -> str:
        return f"${self.cents / 100:.2f}"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return self.cents == other.cents

    def __hash__(self) -> int:
        return hash(self.cents)

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return self.cents < other.cents

    def __bool__(self) -> bool:
        return self.cents != 0

    def __add__(self, other: object) -> "Money":
        if not isinstance(other, Money):
            return NotImplemented
        return Money(self.cents + other.cents)

    def __radd__(self, other: object) -> "Money":
        if other == 0:  # sum() starts from 0
            return self
        return NotImplemented


order = [Money(350), Money(425), Money(275)]
total = sum(order)
print(f"Items: {order}")
print(f"Total: {total}")
print(f"Most expensive: {max(order)}")
print(f"Cheapest first: {sorted(order)}")
print(f"Different prices: {len(set(order))}")
print(Money(275) <= Money(350))
discount = Money(0)
if not discount:
    print("No discount today")
```

You'll see:

```
Items: [Money(350), Money(425), Money(275)]
Total: $10.50
Most expensive: $4.25
Cheapest first: [Money(275), Money(350), Money(425)]
Different prices: 3
True
No discount today
```

Every line uses a different dunder method: `__repr__` for the list, `__radd__` and `__add__` for `sum()`, `__str__` for the f-strings, `__lt__` for `max()` and `sorted()`, `__hash__` and `__eq__` for the set, `@total_ordering` for `<=`, and `__bool__` for the `if`. And `python -m mypy money.py` says `Success: no issues found in 1 source file`.

That's a lot of methods for one small class. You'll write classes like this sometimes, but for classes that mainly hold data, [chapter 30](../30-dataclasses-and-enums/notes.md) shows how Python can write several of these methods for you.

### A cheat sheet

Here are the most common dunder methods, and what makes Python call them:

| You write | Python calls |
|---|---|
| `BankAccount("Maya", 100)` | `__init__` (chapter 27) |
| `print(x)`, `str(x)`, `f"{x}"` | `x.__str__()`, or `__repr__` if there's no `__str__` |
| `repr(x)`, `f"{x!r}"`, the REPL, `x` inside a list | `x.__repr__()` |
| `x == y`, `x != y` | `x.__eq__(y)` |
| `hash(x)`, `x` in a set, `x` as a dictionary key | `x.__hash__()` |
| `x < y`, `x > y` | `x.__lt__(y)`, `x.__gt__(y)` (or `y < x` turned around) |
| `x <= y`, `x >= y` | `x.__le__(y)`, `x.__ge__(y)` (or let `@total_ordering` write them) |
| `len(x)` | `x.__len__()` |
| `item in x` | `x.__contains__(item)` |
| `x[key]` | `x.__getitem__(key)` |
| `x[key] = value` | `x.__setitem__(key, value)` |
| `if x:`, `bool(x)` | `x.__bool__()`, or `__len__` if there's no `__bool__` |
| `x + y` | `x.__add__(y)`, then `y.__radd__(x)` |
| `x - y`, `x * y`, `x / y` | `__sub__`, `__mul__`, `__truediv__` (and their "r" versions) |
| `for item in x:` | `x.__iter__()` ([chapter 31](../31-iterators-and-generators/notes.md)) |
| `with x:` | `x.__enter__()` and `x.__exit__(...)` ([chapter 33](../33-context-managers/notes.md)) |

There are many more. The official Python documentation lists them all on a page called "Data model". You don't need to learn them by heart: when you want your objects to work with some built-in feature, look up which dunder it calls.

> **If you did the JavaScript course:** `__str__` is a lot like JavaScript's `toString()`, and `__iter__` is Python's version of `[Symbol.iterator]()`. Python goes further, though. In JavaScript, `===` on two objects only checks whether they're the very same object, and you can't change that. In Python, `__eq__` lets you decide what "equal" means.

## Common mistakes

**1. `__str__` that doesn't return a string**

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def __str__(self) -> str:
        return self.balance


print(BankAccount("Maya", 150))
```

```
TypeError: __str__ returned non-string (type int)
```

`__str__` (and `__repr__`) must return a string, even if all you want to show is a number. Fix: `return f"${self.balance}"`. Your hints catch this before you run anything: mypy says `error: Incompatible return value type (got "int", expected "str")`.

**2. Printing inside `__str__` instead of returning**

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def __str__(self) -> str:
        print(f"{self.owner}'s account: ${self.balance}")


print(BankAccount("Maya", 150))
```

```
Maya's account: $150
Traceback (most recent call last):
  ...
TypeError: __str__ returned non-string (type NoneType)
```

The text appears, and *then* it crashes. `__str__` printed the text itself, and returned nothing, so `print` got `None` back (a function with no `return` gives `None`, from [chapter 10](../10-functions/notes.md)). `__str__` should build the text and `return` it. Leave the printing to `print`. (mypy catches this one too: `error: Missing return statement`.)

**3. Writing `__eq__`, and losing the hash**

A cinema books seats, and two `Seat` objects with the same row and number are the same seat:

```python
class Seat:
    def __init__(self, row: str, number: int) -> None:
        self.row = row
        self.number = number

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Seat):
            return NotImplemented
        return self.row == other.row and self.number == other.number


booked = {Seat("F", 7), Seat("F", 8)}
```

```
TypeError: unhashable type: 'Seat'
```

Writing `__eq__` switched hashing off, so seats can't go in a set any more. mypy doesn't spot this one: you find out when it runs. If seats never change after they're made, add a `__hash__` that uses the same attributes as `__eq__`:

```python
    def __hash__(self) -> int:
        return hash((self.row, self.number))
```

**4. Crashing when compared with a different type**

```python
class Money:
    def __init__(self, cents: int) -> None:
        self.cents = cents

    def __eq__(self, other):
        return self.cents == other.cents


print(Money(350) == Money(350))  # prints: True
print(Money(350) == 350)
```

```
AttributeError: 'int' object has no attribute 'cents'
```

It works as long as a `Money` only ever meets another `Money`. But `==` can meet anything, and so can `in`: `Money(350) in [5, Money(350)]` crashes in the same way. Fix: check with `isinstance()` first, and `return NotImplemented` for other types. If you'd written the hint `other: object`, mypy would have warned you: `error: "object" has no attribute "cents"`.

**5. Calling dunder methods yourself**

```python
print(len(road_trip))  # prints: 4
print(road_trip.__len__())  # prints: 4  (it works, but don't)

print(Money(500).__add__(5))  # prints: NotImplemented
print(Money(500) + 5)
```

```
TypeError: unsupported operand type(s) for +: 'Money' and 'int'
```

Python's built-in features do more than just call your method. `+` tries the other side's `__radd__`, and raises a clear error when both sides say no. Call `__add__` yourself, and you get a quiet `NotImplemented` back instead, which your program will happily carry on with. `len()` checks the answer too: if `__len__` returns `-1`, `len()` raises `ValueError: __len__() should return >= 0`, but calling `__len__()` yourself just hands you the `-1`. The rule: **you write dunder methods, and Python calls them.** You use `len(x)`, `x + y` and `str(x)`.

**6. A typo in a dunder method's name**

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def __srt__(self) -> str:
        return f"{self.owner}'s account: ${self.balance}"


print(BankAccount("Maya", 150))
```

```
<__main__.BankAccount object at 0x0000017B22C56900>
```

No error at all, and mypy says `Success` too. It's like the misspelled `__init__` from chapter 27, only quieter: `__srt__` is a perfectly good name for a method, it's just one that Python never calls. The same thing happens with one underscore on each side (`_str_`). If a dunder method seems to be ignored, check the spelling first: two underscores on each side, and the exact name.

## Quick recap

- **Dunder methods** (special methods) have two underscores on each side of their name. You write them, and Python calls them: `print` calls `__str__`, `==` calls `__eq__`, `len()` calls `__len__`.
- `__repr__` is the exact view for programmers (lists, the REPL, `!r`). `__str__` is the friendly view for `print` and f-strings. Always write `__repr__`, and add `__str__` when you want something friendlier.
- By default, `==` means `is`. For value objects like `Money`, write `__eq__` with `other: object`, an `isinstance()` check, and `return NotImplemented` for other types.
- Writing `__eq__` switches hashing off. Add `__hash__` (based on the same attributes) only for objects that never change.
- `__lt__` makes `sorted()`, `min()` and `max()` work, and `@total_ordering` fills in `<=`, `>` and `>=`.
- `__len__`, `__contains__` and `__getitem__` turn a class into a container. `__bool__` (or `__len__`) decides whether it's truthy.
- `__add__` returns a new object. `__radd__` handles a value on the left, like the `0` that `sum()` starts from.

---

**Next:** try the [exercises](exercises.md), then move on to [30 Dataclasses and Enums](../30-dataclasses-and-enums/notes.md).
