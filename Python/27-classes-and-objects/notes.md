# 27 Classes and Objects

## What is it?

A **class** is a blueprint for a new kind of value. It describes what information each value holds, and what it can do. An **object** is one value made from that blueprint.

For example, a `BankAccount` class can say: "every account has an owner and a balance, and you can deposit money into it and withdraw money from it." Maya's account and Leo's account are two objects made from that one class.

You've been using objects since [chapter 01](../01-getting-started/notes.md). Every string, list and date is one. In this chapter, you'll make your own kinds.

## Why does it matter?

In [chapter 26](../26-project-todo-app/notes.md), a task was a dictionary, and the functions that worked on tasks were separate from it:

```python
from typing import Any

Task = dict[str, Any]

task: Task = {"id": 1, "title": "Buy milk", "done": False, "due": "2026-10-08"}
print(task["title"])  # prints: Buy milk
print(task["titel"])
```

The second `print` crashes:

```
KeyError: 'titel'
```

The app worked, but this way of storing things has three weak spots:

1. **Typos only show up when the line runs.** mypy says `Success: no issues found` for the file above, because `dict[str, Any]` means "any string is a fine key". The mistake waits quietly until that exact line runs.
2. **Nothing makes sure every task has every key.** If one function builds a task and forgets the `"done"` key, something else crashes much later, far away from the real mistake.
3. **The data and its functions live apart.** `is_overdue(task, today)` was a loose function. Nothing tied it to tasks: you could pass it any dictionary at all. And someone looking at a task can't see what you're allowed to do with it.

A class fixes all three. You'll learn to write one in a moment, but here's a taste. Make the same typo with a `Task` object, and Python even suggests the fix:

```
AttributeError: 'Task' object has no attribute 'titel'. Did you mean: 'title'?
```

Better still, mypy spots it before you run anything, with the message `"Task" has no attribute "titel"; maybe "title"?`.

## Real-world example

Think about a blueprint for a house. An architect draws it once. A builder uses it to build ten houses along a street. Every house has the same rooms in the same places, but each one has its own family, its own furniture and its own colour of front door. Paint one door red, and the other nine stay as they were.

| Everyday thing | Python thing |
|---|---|
| The blueprint | A **class**, like `BankAccount` |
| One house built from it | An **object** (also called an **instance**), like `maya` |
| Building a new house from the blueprint | Creating an object: `BankAccount("Maya", 100)` |
| What every house has: a family name, a door colour | **Attributes**: `owner`, `balance` |
| What you can do with a house: lock the door, paint the walls | **Methods**: `deposit()`, `withdraw()` |
| Painting one house's door red | Changing one object's data leaves the other objects alone |

(A cookie cutter and its cookies work too: one cutter, lots of cookies, and each cookie can get its own icing.)

## How it works

### Your first class

Here's the smallest class you can make, and two objects made from it:

```python
class BankAccount:
    pass


maya_account = BankAccount()
maya_account.owner = "Maya"
maya_account.balance = 100

leo_account = BankAccount()
leo_account.owner = "Leo"
leo_account.balance = 20

print(maya_account.owner, maya_account.balance)  # prints: Maya 100
print(leo_account.owner, leo_account.balance)  # prints: Leo 20
```

Line by line:

- `class BankAccount:` makes a new class called `BankAccount`. Class names are written in **CapitalWords**: each word starts with a capital letter, with no underscores (the same CamelCase style as exception names in [chapter 18](../18-error-handling/notes.md)). That makes classes easy to tell apart from functions and variables, which use `snake_case`. The body is just `pass` for now, which means "nothing inside yet".
- `BankAccount()` creates a new object from the class. You **call** the class with brackets, just like a function. Every call builds a brand-new, separate object.
- `maya_account.owner = "Maya"` stores a value on that object, under the name `owner`. A named value stored on an object is called an **attribute**. You read it back with the same dot: `maya_account.owner`.

That dot should look familiar. In [chapter 24](../24-command-line-programs/notes.md), argparse gave you an object called `args`, and you read `args.name`. `args` was an object, and `name` was one of its attributes.

You'll hear two words for the same thing: `maya_account` is an **object**, and it's also an **instance** of `BankAccount`. "Instance" just stresses which class it was made from.

This version works, but it has the same weak spot as the dictionaries: nothing makes sure every account gets an owner and a balance. Forget one line, and that account simply has no balance. (mypy doesn't like it either. It reports errors like `"BankAccount" has no attribute "owner"` on every one of those lines, because the class itself never says that accounts have owners or balances.)

What you want is for the class to set up every new account the same way, every time, so you can't forget. That's the next step.

### `__init__`: setting up each new object

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance


maya_account = BankAccount("Maya", 100)
leo_account = BankAccount("Leo")

print(maya_account.owner, maya_account.balance)  # prints: Maya 100
print(leo_account.owner, leo_account.balance)  # prints: Leo 0
```

Inside the class, there's now a function called `__init__`. A function that's defined inside a class is called a **method**.

`__init__` is a special method. Its name has two underscores on each side, like `__name__` from [chapter 19](../19-modules-and-standard-library/notes.md). Python programmers say "dunder init" (dunder is short for "double underscore"). Python calls dunder methods for you at special moments, and it calls `__init__` every time a new object is created. ("init" is short for **initialize**, which means "set up at the start".) You'll meet lots more dunder methods in [chapter 29](../29-dunder-methods/notes.md).

Here's what happens, step by step, when Python runs `maya_account = BankAccount("Maya", 100)`:

1. Python makes a new, empty `BankAccount` object.
2. It calls `__init__`, and passes in three things: the new object, then `"Maya"`, then `100`. They land in the parameters `self`, `owner` and `balance`, in that order.
3. `self.owner = owner` stores `"Maya"` on the new object, as its `owner` attribute. `self.balance = balance` stores `100` as its `balance`.
4. `__init__` finishes, and Python hands back the finished object, which gets the name `maya_account`.

Compare step 3 with the first version. `self.owner = owner` inside the class does exactly what `maya_account.owner = "Maya"` did outside it. The difference is that now it happens for every account, automatically. And if you leave out the owner, Python refuses to make the account at all (you'll see the error in Common mistakes).

The rest is what you know about functions from [chapter 10](../10-functions/notes.md) and [chapter 25](../25-type-hints/notes.md). `balance: int = 0` is a parameter with a default, so `BankAccount("Leo")` starts with a balance of 0. The hints say what each parameter should be. And `-> None` is there because `__init__` doesn't return anything: Python hands back the new object by itself, and your `__init__` only sets it up.

> **Tip:** If you did the [JavaScript course](../../JavaScript/27-classes/notes.md), `__init__` is Python's `constructor`, and `self` is Python's `this`. Two differences: there's no `new` keyword (it's `BankAccount("Maya")`, not `new BankAccount("Maya")`), and `self` is written out as the first parameter of every method.

### What is `self`?

`self` confuses almost everyone at first, so let's go slowly.

You write a class once, but it's used for every account. When you write the code inside the blueprint, you don't know whose account it will be. You can't write "Maya's balance", because next time it's Leo's. You need a word that means "the account we're working on right now", whichever one that is. That word is `self`.

Think of a form at the doctor's: "Write **your** name here." The form is printed once, but every patient reads "your" as themselves. `self` is the "your" of a class.

You can check that `self` really is the new object. The built-in `id()` function from [chapter 16](../16-scope-and-mutability/notes.md) shows an object's identity number:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        print(f"Inside __init__, self has id {id(self)}")
        self.owner = owner
        self.balance = balance


maya_account = BankAccount("Maya", 100)
print(f"Outside, maya_account has id {id(maya_account)}")
```

You'll see something like this (your numbers will be different, but your two numbers will match each other):

```
Inside __init__, self has id 2135134660864
Outside, maya_account has id 2135134660864
```

Same number, same object. Inside `__init__` it's called `self`, and outside it's called `maya_account`. Remember the name tags from chapter 16? These are two name tags tied to one object.

Three things to remember about `self`:

- It's always the **first parameter** of a method.
- You **never pass it yourself**. Python fills it in for you.
- To store something on the object, or read something from it, put **`self.` in front**: `self.balance`. A plain `balance`, without `self.`, is just the parameter: a local variable that disappears when the method finishes (chapter 16).

So `self.owner = owner` reads: "store the `owner` parameter on this object, as its `owner` attribute." Using the same name for both is normal. Most Python code does exactly that.

> **Tip:** `self` isn't a special keyword. It's just a name, and Python would accept any name in that spot. But every Python programmer uses `self`, and the tools expect it, so always do the same. And `self` gets no type hint: the tools already know it's an object of this class.

### Methods: what an object can do

`__init__` is only the setup. Now add methods that do something. This is the `BankAccount` you'll use for the rest of the chapter. Save it as `bank.py`:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount

    def withdraw(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount


account = BankAccount("Maya", 100)
account.deposit(50)
account.withdraw(30)
print(account.balance)  # prints: 120

try:
    account.withdraw(500)
except ValueError as e:
    print(f"Sorry: {e}")  # prints: Sorry: not enough money

print(account.balance)  # prints: 120
```

`deposit` and `withdraw` look just like functions, with `self` as the first parameter. Inside, they read and change `self.balance`: the balance of whichever account they were called on. The checks at the top are the guard clauses from [chapter 18](../18-error-handling/notes.md). A bad request raises a `ValueError` before anything changes, so the failed withdrawal of 500 left the balance at 120.

To call a method, write the object, a dot, the method's name, and brackets: `account.deposit(50)`. It's the same pattern as `"hi".upper()` from [chapter 06](../06-strings/notes.md) and `shopping.append("milk")` from [chapter 11](../11-lists/notes.md). Notice that you pass **one** argument, `50`, even though `deposit` has two parameters. The next section explains why.

(The balances in this chapter are whole dollars, to keep the numbers small and easy to read. A real money app would keep whole cents, like [chapter 14](../14-project-shopping-cart/notes.md).)

### How `account.deposit(50)` really works

When you write `account.deposit(50)`, Python quietly turns it into something else:

```python
account = BankAccount("Maya", 100)
account.deposit(50)  # the normal way
BankAccount.deposit(account, 50)  # what Python really does
print(account.balance)  # prints: 200
```

Both lines do exactly the same thing, so the balance went up twice. Python finds `deposit` in the class, and passes the object in front of the dot as the first argument. That's how `self` gets its value: **the object before the dot becomes `self`**.

| You write | Python runs | Inside `deposit`, `self` is |
|---|---|---|
| `maya.deposit(50)` | `BankAccount.deposit(maya, 50)` | `maya` |
| `leo.deposit(50)` | `BankAccount.deposit(leo, 50)` | `leo` |

That's why a method's definition always has one more parameter than its calls. You'll never write the long form in real code, but knowing it's there makes one of the most common error messages make sense (see mistake 1 at the end).

### Each object has its own data

Every object keeps its own attributes. Changing one account doesn't touch another:

```python
maya = BankAccount("Maya", 100)
leo = BankAccount("Leo", 20)

maya.deposit(50)
print(maya.balance)  # prints: 150
print(leo.balance)  # prints: 20
```

The methods are written once, in the class, and every account shares them. The data belongs to each object:

```
BankAccount (the class)
   __init__, deposit, withdraw      <- written once, shared by every account

maya  ──►  owner: "Maya", balance: 150
leo   ──►  owner: "Leo",  balance: 20
```

> **Tip:** `vars(maya)` shows an object's attributes as a dictionary: `{'owner': 'Maya', 'balance': 150}`. Python really does keep each object's attributes in a little dictionary of its own. That's why objects can feel like dictionaries with dots. It's a handy thing to print when you're confused about what an object holds.

### Your class is a type: hints with classes

Methods get type hints just like functions, except for `self`. And attributes usually need no hints at all: mypy works them out from `__init__`. It sees `self.balance = balance`, where `balance` is an `int`, so it knows `self.balance` is an `int`.

Here's the nice part. Once you've made a class, its name works as a type hint, just like `int` or `str`. In `bank.py`, keep the class, and replace the test code below it with this:

```python
def transfer(source: BankAccount, target: BankAccount, amount: int) -> None:
    """Move money from one account to another."""
    source.withdraw(amount)
    target.deposit(amount)


def total_balance(accounts: list[BankAccount]) -> int:
    """Add up the balances of all the accounts."""
    total = 0
    for account in accounts:
        total += account.balance
    return total


maya = BankAccount("Maya", 100)
leo = BankAccount("Leo", 20)
accounts = [maya, leo]

transfer(maya, leo, 30)
print(maya.balance, leo.balance)  # prints: 70 50
print(total_balance(accounts))  # prints: 120

try:
    transfer(leo, maya, 500)
except ValueError as e:
    print(f"Transfer failed: {e}")  # prints: Transfer failed: not enough money
print(maya.balance, leo.balance)  # prints: 70 50
```

`source: BankAccount` reads "`source` should be a `BankAccount` object", and `list[BankAccount]` is "a list of `BankAccount` objects". Notice the failed transfer too: `withdraw` raised before `deposit` ran, so no money disappeared and none appeared from nowhere.

Now go back to the problem from the start of the chapter: typos. Put these two mistakes at the bottom of the file:

```python
print(maya.balanse)
transfer(maya, "Leo", 30)
```

Run it, and Python prints the earlier lines, then stops at the first mistake and even suggests the fix:

```
AttributeError: 'BankAccount' object has no attribute 'balanse'. Did you mean: 'balance'?
```

And `python -m mypy bank.py` finds both mistakes before you run anything (if your file is laid out a little differently, your line numbers will be too):

```
bank.py:46: error: "BankAccount" has no attribute "balanse"; maybe "balance"?  [attr-defined]
bank.py:47: error: Argument 2 to "transfer" has incompatible type "str"; expected "BankAccount"  [arg-type]
Found 2 errors in 1 file (checked 1 source file)
```

VS Code helps too. Type `maya.` and wait a moment: a list pops up with `balance`, `deposit`, `owner` and `withdraw`, because Pylance knows exactly what a `BankAccount` has. That's the dictionary problem from the start of the chapter, solved. Take the two broken lines out again before you go on.

### Everything is an object

Here's a secret you're now ready for. In [chapter 03](../03-data-types/notes.md), `type()` printed things like `<class 'int'>`, and you were told to ignore the word `class` for now. Here's what it meant:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance


print(type(5))  # prints: <class 'int'>
print(type("hi"))  # prints: <class 'str'>
print("hi".upper())  # prints: HI
print(str.upper("hi"))  # prints: HI

maya = BankAccount("Maya", 100)
print(type(maya))  # prints: <class '__main__.BankAccount'>
```

`int`, `str`, `list`, `dict` and `date` are all classes, and every value you've ever used is an object made from one of them:

- `"hi".upper()` calls the `upper` method of the `str` class. `str.upper("hi")` is the long form, exactly like `BankAccount.deposit(account, 50)`.
- `int("42")` and `list()` look like function calls because they're classes making new objects, just like `BankAccount("Maya")`.
- `date(2026, 10, 9)` from [chapter 22](../22-dates-and-times/notes.md) creates a `date` object, and `.weekday()` is one of its methods.

And `type(maya)` shows `<class '__main__.BankAccount'>`. The `__main__` part is the name of the file you ran (chapter 19). Your class is a brand-new type, every bit as real as `int` or `str`. In modern Python, "type" and "class" mean the same thing.

### Printing an object

Try printing an account:

```python
maya = BankAccount("Maya", 100)
print(maya)
```

You'll see something like this (your number will be different):

```
<__main__.BankAccount object at 0x000001ECDAE76900>
```

That's not very helpful. Python doesn't know how you'd like an account to look, so it shows the class name and where in the computer's memory the object lives (the number is the object's `id()`, written in **hexadecimal**, a way of writing numbers with the digits 0 to 9 and the letters A to F).

[Chapter 29](../29-dunder-methods/notes.md) shows how to teach your classes to print nicely. Until then, print the attributes you care about:

```python
print(f"{maya.owner}: ${maya.balance}")  # prints: Maya: $100
```

### Objects are references

In [chapter 16](../16-scope-and-mutability/notes.md), you learned that a variable is a name tag tied to an object, and that two name tags can be tied to the same list. Your own objects work exactly the same way:

```python
maya = BankAccount("Maya", 100)
joint = maya  # a second name tag on the same account
joint.deposit(50)
print(maya.balance)  # prints: 150
print(joint is maya)  # prints: True

twin = BankAccount("Maya", 150)  # a new account that looks the same
print(twin is maya)  # prints: False
print(twin == maya)  # prints: False
```

`joint = maya` doesn't copy the account. It ties a second name tag to it, like a joint account that two people share. A deposit through either name changes the one account.

`twin` is a separate account that just happens to hold the same values, so `is` says `False`. Notice that `==` says `False` too! For your own classes, `==` only says `True` for the very same object, unless you tell Python otherwise. ([Chapter 29](../29-dunder-methods/notes.md) shows how.)

This is also why `transfer` worked without returning anything. Its parameters `source` and `target` were extra name tags on your `maya` and `leo` objects, so changing them inside the function changed your accounts. The same is true for objects in a list: `accounts[0].deposit(10)` changes `maya` too.

### Class attributes: one value shared by every object

So far, every attribute has belonged to one object. You can also put an attribute on the class itself, outside any method. Then it's shared by every object:

```python
class BankAccount:
    bank_name = "Riverside Bank"  # a class attribute: one value for every account

    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner  # instance attributes: one value per account
        self.balance = balance


maya = BankAccount("Maya", 100)
leo = BankAccount("Leo", 20)

print(maya.bank_name)  # prints: Riverside Bank
print(leo.bank_name)  # prints: Riverside Bank
print(BankAccount.bank_name)  # prints: Riverside Bank
print(vars(maya))  # prints: {'owner': 'Maya', 'balance': 100}

BankAccount.bank_name = "Riverside Bank and Trust"
print(maya.bank_name)  # prints: Riverside Bank and Trust
print(leo.bank_name)  # prints: Riverside Bank and Trust
```

- A **class attribute**, like `bank_name`, is stored once, on the class. Every account sees the same value. Change it through the class (`BankAccount.bank_name = ...`), and every account sees the change.
- An **instance attribute**, like `owner` and `balance`, is stored on each object, usually in `__init__` with `self.`. Every account has its own.

Notice that `vars(maya)` doesn't include `bank_name`. So how did `maya.bank_name` work? When you read an attribute, Python looks in two places, in order:

1. On the object itself.
2. If it isn't there, on the object's class.

That's also how methods are found. `maya.deposit` isn't stored on `maya`, so Python finds it on the class. ([Chapter 28](../28-inheritance/notes.md) adds one more place to look.)

Class attributes are good for values that are the same for every object: a bank's name, a limit, or a fixed rate. If the value is a constant that never changes, write its name in `UPPER_CASE`, like the constants from [chapter 02](../02-variables/notes.md): `MAX_WITHDRAWAL = 500`.

> **Watch out:** Change a class attribute through the class, not through an object. `maya.bank_name = "Maya's Bank"` doesn't change the shared value. It makes a new attribute on `maya` only, which hides the class one, so `maya.bank_name` gives `"Maya's Bank"` while `leo.bank_name` still gives `"Riverside Bank"`. And never use a list or dictionary as a class attribute that your objects change. Mistake 6 at the end shows why.

### Keeping the balance safe: `_balance` and `@property`

There's still a hole in `BankAccount`. The rules live in `deposit` and `withdraw`, but nothing forces anyone to use them:

```python
maya = BankAccount("Maya", 100)
maya.balance = -5000  # nothing stops this
print(maya.balance)  # prints: -5000
```

Python has no locks on attributes. Instead, it relies on an agreement that every Python programmer knows: **a name that starts with one underscore, like `_balance`, is internal.** It's for the class's own code. Code outside the class shouldn't touch it.

Think of a "Staff only" sign on a door. The door isn't locked, but everyone knows they're not supposed to go in.

But outside code still needs to *read* the balance. That's what `@property` is for:

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


maya = BankAccount("Maya", 100)
maya.deposit(50)
print(maya.balance)  # prints: 150
```

Here's what changed:

- The real number now lives in `self._balance`. The methods inside the class use it freely.
- `@property` above `def balance(self)` turns that method into a **property**: something you read like an attribute, with no brackets, that runs a method behind the scenes. `maya.balance` calls the method, which hands back `self._balance`.
- A line that starts with `@` just above a `def` is called a **decorator**. It changes how the function below it works. You'll learn how decorators work, and write your own, in [chapter 32](../32-decorators/notes.md). For now, just copy the pattern.

The property only gives a way to *read* the balance, not to set it, so it's **read-only**:

```python
maya.balance = 1_000_000
```

```
AttributeError: property 'balance' of 'BankAccount' object has no setter
```

mypy catches it before you run anything, too: `Property "balance" defined in "BankAccount" is read-only`. Now the only way to change a balance is through `deposit` and `withdraw`, which check the rules.

Notice that code using the class didn't have to change at all. `maya.balance` worked when it was a plain attribute, and it still works now that it's a property. So you can always start with a plain attribute, and switch to a property later if you need to protect it.

Be honest with yourself about what the underscore does, though. `maya._balance = 1_000_000` still works. The underscore is a sign, not a lock: Python trusts you to respect it. (You may also see names with two underscores in front, like `__balance`. Python then changes the name behind the scenes, so it's harder to reach by accident. One underscore is the everyday choice. And a property can also have a "setter" that checks a new value before storing it, but read-only is all `BankAccount` needs.)

This version, with `_balance` and the read-only `balance` property, is the `BankAccount` that [chapter 28](../28-inheritance/notes.md) builds on.

### Putting it together: a task that knows when it's overdue

Here's the task from chapter 26 again, as a class. Its data and the functions that use it now travel together:

```python
from datetime import date


class Task:
    def __init__(self, task_id: int, title: str, due: date | None = None) -> None:
        self.id = task_id
        self.title = title
        self.due = due
        self.done = False

    def mark_done(self) -> None:
        if self.done:
            raise ValueError(f"task {self.id} is already done")
        self.done = True

    def is_overdue(self, today: date) -> bool:
        if self.done or self.due is None:
            return False
        return self.due < today


today = date(2026, 10, 9)
tasks = [
    Task(1, "Buy milk", due=date(2026, 10, 8)),
    Task(2, "Renew passport", due=date(2029, 3, 1)),
    Task(3, "Call grandma"),
]

for task in tasks:
    line = f"{task.id}  {task.title}"
    if task.is_overdue(today):
        line += "  (OVERDUE)"
    print(line)

tasks[0].mark_done()
print(tasks[0].is_overdue(today))  # prints: False

try:
    tasks[0].mark_done()
except ValueError as e:
    print(f"Error: {e}")  # prints: Error: task 1 is already done
```

You'll see:

```
1  Buy milk  (OVERDUE)
2  Renew passport
3  Call grandma
False
Error: task 1 is already done
```

A few things to notice:

- `is_overdue(task, today)` from chapter 26 became `task.is_overdue(today)`. The task is the object before the dot, so it arrives as `self`.
- `done` isn't a parameter. Every new task starts unfinished, so `__init__` sets `self.done = False` by itself. Attributes don't have to come from parameters.
- The due date is a real `date` object now, not text. Chapter 26 only used text because JSON can't store dates. (Turning objects into JSON and back takes a little extra work. [Chapter 30](../30-dataclasses-and-enums/notes.md) shows a neat way to do it.)
- The parameter is called `task_id`, not `id`, because `id` is already a built-in function (chapter 16), and a parameter called `id` would hide it inside `__init__`. The attribute can still be called `id`: attributes always come after a dot, so they can't hide anything.
- `today` is passed in, just like in chapter 26, so you can test with any date you like.

## Common mistakes

**1. Forgetting `self` in a method's definition**

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(amount):
        self.balance += amount


account = BankAccount("Maya", 100)
account.deposit(50)
```

```
TypeError: BankAccount.deposit() takes 1 positional argument but 2 were given
```

"But I only gave it one!" Remember that `account.deposit(50)` really runs `BankAccount.deposit(account, 50)`: two arguments. `deposit` only has room for one. Fix: make `self` the first parameter of every method: `def deposit(self, amount: int) -> None:`. mypy even guesses what happened, with the note `Looks like the first special argument in a method is not named "self", "cls", or "mcs", maybe it is missing?`

**2. Forgetting `self.` when storing an attribute**

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        owner = owner
        balance = balance


account = BankAccount("Maya", 100)
print(account.owner)
```

```
AttributeError: 'BankAccount' object has no attribute 'owner'
```

Without `self.`, `owner = owner` just sets the local variable `owner` to itself. Nothing is stored on the object, and the local variable disappears when `__init__` finishes. Fix: `self.owner = owner`. The same goes for every method: to change the object, write `self.` in front.

**3. Calling a method without brackets (or a property with them)**

With the `Task` class from above:

```python
task = Task(1, "Buy milk")
task.mark_done
print(task.done)  # prints: False
print(task.mark_done)
```

There's no error, but the task isn't done. The last line shows why (your number will be different):

```
<bound method Task.mark_done of <__main__.Task object at 0x000001EA350D6900>>
```

Without brackets, you only *mention* the method. You don't run it. Fix: `task.mark_done()`.

Properties are the other way round. You read them without brackets, so `maya.balance()` on the property version of `BankAccount` crashes:

```
TypeError: 'int' object is not callable
```

`maya.balance` already ran the property and gave you an `int`, and then the `()` tried to call that number.

**4. Forgetting the brackets when creating an object**

```python
account = BankAccount
account.deposit(50)
```

```
TypeError: BankAccount.deposit() missing 1 required positional argument: 'amount'
```

Without brackets, `account = BankAccount` doesn't make an account. It ties a second name tag to the **class** itself: the blueprint, not a house. Then `account.deposit(50)` is `BankAccount.deposit(50)`, so `50` became `self` and nothing was left for `amount`. Fix: call the class, with the arguments `__init__` needs: `account = BankAccount("Maya", 100)`.

Leaving out an argument that has no default gives a clearer message. `BankAccount()` says:

```
TypeError: BankAccount.__init__() missing 1 required positional argument: 'owner'
```

**5. Misspelling `__init__`**

```python
class BankAccount:
    def __int__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance


account = BankAccount("Maya", 100)
```

```
TypeError: BankAccount() takes no arguments
```

Python only calls a method that's named exactly `__init__`: two underscores, `init`, two underscores. Here it's `__int__` (missing the `i`), so Python sees a class with no setup method at all, which can't take any arguments. Single underscores, like `_init_`, give the same error. When you see "takes no arguments" for your own class, check the spelling of `__init__` first.

**6. A list as a class attribute**

Say you want every account to remember its deposits, and you write:

```python
class BankAccount:
    history: list[str] = []  # one list, shared by every account!

    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: int) -> None:
        self.balance += amount
        self.history.append(f"deposit {amount}")


maya = BankAccount("Maya", 100)
leo = BankAccount("Leo", 20)
maya.deposit(50)
print(leo.history)  # prints: ['deposit 50']
```

Leo never deposited anything, but Maya's deposit shows up in his history! `history` is a class attribute, so there's only one list, made once when Python read the class. `self.history.append(...)` doesn't find `history` on the object, so it uses the class's list, and every account appends to the same one. It's the same trap as the mutable default argument from [chapter 16](../16-scope-and-mutability/notes.md).

Fix: make a new list for each object, in `__init__`:

```python
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance
        self.history: list[str] = []  # a new list for each account
```

Now `maya.history` is `['deposit 50']` and `leo.history` is `[]`. The hint on the empty list is needed for the reason you saw in chapter 25: without it, mypy says `Need type annotation for "history"`.

## Quick recap

- A **class** is a blueprint, and an **object** (or **instance**) is one thing made from it: `maya = BankAccount("Maya", 100)`.
- `__init__` sets up every new object. `self` is the object a method is working on. Python passes it for you: `maya.deposit(50)` runs `BankAccount.deposit(maya, 50)`.
- **Attributes** like `self.balance` hold each object's own data. **Methods** are functions inside the class that use it. Inside the class, always write `self.` to reach them.
- Your class is a type. Use it in hints, like `list[BankAccount]`, and mypy and VS Code will catch misspelled attributes before you run anything.
- Objects work like the lists in chapter 16: two names can share one object, and a function can change the objects you pass to it.
- **Class attributes** are shared by every object. Never put a list there that your objects change.
- A leading underscore (`_balance`) means "internal, don't touch", and `@property` gives outside code a read-only way in.

---

**Next:** try the [exercises](exercises.md), then move on to [28 Inheritance](../28-inheritance/notes.md).
