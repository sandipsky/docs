# 16 Scope and Mutability

## What is it?

This chapter is about two ideas that work together:

- **Scope** is where in your code a variable can be seen and used. A variable made inside a function can only be used inside that function.
- **Mutability** is whether a value can be changed after it's made. A list can be changed in place (it's **mutable**). A string can't (it's **immutable**).

## Why does it matter?

Here are two short programs. Both surprise almost every beginner.

The first one tries to count visits to a website:

```python
visits = 0

def record_visit():
    visits = visits + 1

record_visit()
# UnboundLocalError: cannot access local variable 'visits' where it is not associated with a value
```

`visits` clearly exists. It's right there on the first line. So why can't the function use it?

The second one tries to make a backup of a shopping list:

```python
shopping = ["milk", "eggs"]
backup = shopping
shopping.append("bread")
print(backup)  # prints: ['milk', 'eggs', 'bread']
```

Bread was added to `shopping`, but the "backup" changed too.

Neither of these is a bug in Python. They follow simple rules, and once you know the rules, they stop being mysterious. They're also behind some of the most common bugs in real programs: a cart total that changes by itself, an "undo" that doesn't undo, a function that quietly scrambles the list you gave it.

This chapter also finishes two stories from earlier: the short note about local variables in [chapter 10](../10-functions/notes.md), and the "two names, one list" surprise from [chapter 11](../11-lists/notes.md).

## Real-world example

**Scope is like a house.** There's a family notice board in the hallway, and everyone has a notepad in their own bedroom.

| In the house | In Python |
|---|---|
| The notice board in the hallway | A **global** variable, made at the top level of your file |
| Anyone in any room can walk out and read the notice board | Any function can read a global variable |
| The notepad on your desk, in your room | A **local** variable, made inside a function |
| Nobody outside your room can see your notepad | Code outside the function can't see its local variables |
| Writing "Dinner at 7" on your notepad doesn't change the notice board | Assigning a variable inside a function makes a new local one, even if a global has the same name |

**Mutability is like a shared online document.** If you email someone a PDF, they get their own copy, and scribbling on it doesn't touch yours. But if you send someone a *link* to a shared document, you're both looking at the same document. When they type in it, you see the change.

| | Sending a copy | Sending a link |
|---|---|---|
| It's like... | Emailing a PDF | Sharing a link to one online document |
| If they change it | Your original is untouched | Everyone with the link sees the change |
| In Python | `backup = shopping.copy()` | `backup = shopping` |

## How it works

### Part 1: Scope

First, the question of *where* a variable can be used.

### Local variables

A variable you create inside a function is **local** to that function. It's made when the function runs, and it disappears when the function finishes.

```python
def greet():
    message = "Hello from inside"
    print(message)

greet()          # prints: Hello from inside
print(message)
# NameError: name 'message' is not defined
```

`message` only lives inside `greet`. Out in the main part of the file, there's no such name. Parameters are local too: the `price` in `def add_tax(price):` only exists inside `add_tax`.

Every call to a function gets a fresh set of local variables. Nothing is left over from the last call. That's a good thing: it means a function can't be confused by leftovers from last time.

### Global variables

A variable you create at the top level of your file, outside any function, is **global**. Any function in the file can read it:

```python
shop_name = "Corner Grocery"

def print_header():
    print(f"Welcome to {shop_name}")

print_header()  # prints: Welcome to Corner Grocery
```

`print_header` has no local variable called `shop_name`, so Python looks outside the function, finds the global one, and uses it.

Reading globals like this is fine, especially for values that never change. That's exactly what `UPPER_CASE` names from [chapter 02](../02-variables/notes.md) are for:

```python
TAX_RATE = 0.1

def add_tax(price):
    return price + price * TAX_RATE

print(add_tax(20))  # prints: 22.0
```

### Assigning inside a function makes a local variable

Here's where it gets interesting. What if a function *assigns* to a name that a global already uses?

```python
discount = 10

def apply_sale():
    discount = 25
    print(f"Inside: {discount}")

apply_sale()                 # prints: Inside: 25
print(f"Outside: {discount}")  # prints: Outside: 10
```

The global `discount` didn't change. When a function assigns to a name (with `=`), Python makes a brand-new **local** variable with that name. The function's `discount` and the global `discount` are two different variables that happen to share a name, like two different people who are both called Sam.

This is a safety feature. It means a function can use any names it likes inside, without worrying about breaking a variable somewhere else in your file.

### `UnboundLocalError`

Now the mystery from the start of the chapter makes sense:

```python
visits = 0

def record_visit():
    visits = visits + 1

record_visit()
# UnboundLocalError: cannot access local variable 'visits' where it is not associated with a value
```

Before a function runs, Python reads the whole function and makes a list of every name that gets assigned inside it. Those names are local, for the **whole** function, from the first line to the last.

`record_visit` assigns to `visits`, so `visits` is local everywhere in that function. Then `visits + 1` tries to read the local `visits`... which doesn't have a value yet. That's what **unbound** means: the name exists, but it isn't attached to a value. Python won't quietly use the global instead, because that would be a guess.

So the rule is:

- A function that only **reads** a name can see the global one.
- A function that **assigns** to a name gets its own local one, for the whole function.

### The `global` keyword, and why to avoid it

If you really want a function to change a global variable, you can say so with the `global` keyword:

```python
visits = 0

def record_visit():
    global visits  # "I mean the global visits, not a new local one"
    visits = visits + 1

record_visit()
record_visit()
print(visits)  # prints: 2
```

It works. But most Python programmers avoid `global`, and you should too. When any function can change a global, then any function might be the one that broke it. In a file with twenty functions, finding which one set `visits` to the wrong number is like finding out who wrote on the notice board in the hallway: it could have been anyone.

The better way is to **pass values in and return them out**:

```python
def record_visit(visits):
    return visits + 1

visits = 0
visits = record_visit(visits)
visits = record_visit(visits)
print(visits)  # prints: 2
```

Now the function only works with what it's given, and only changes what it hands back. You can see every change to `visits` right there in the main code. Functions like this are easier to read, easier to test, and easier to reuse.

> **Tip:** reading global *constants* like `TAX_RATE` is fine. It's *changing* globals from inside functions that causes trouble.

### Where Python looks for a name: LEGB

When your code uses a name, Python searches for it in four places, in this order. The first letters spell **LEGB**:

1. **L**ocal: inside the current function.
2. **E**nclosing: inside any function that this function sits inside.
3. **G**lobal: the top level of your file.
4. **B**uilt-in: the names Python gives you for free, like `print`, `len` and `sum`.

Python stops at the first place it finds the name. If it isn't in any of them, you get a `NameError`.

"Enclosing" only matters when you write a function *inside* another function. You won't do that often yet, but here's what it looks like:

```python
greeting = "Hello"  # global

def outer():
    name = "Sandip"  # local to outer, "enclosing" for inner

    def inner():
        punctuation = "!"  # local to inner
        print(f"{greeting}, {name}{punctuation}")

    inner()

outer()  # prints: Hello, Sandip!
```

Inside `inner`, Python finds `punctuation` in **L** (inner's own variables), `name` in **E** (outer's variables), `greeting` in **G** (the file), and `print` in **B** (the built-ins).

The search order also explains why a local name "wins" over a global one with the same name: Local comes first, so Python finds it there and never looks any further.

That's also why you should never name a variable after a built-in, like `sum`, `list` or `max`. Your global `sum` would be found first (G comes before B), and the real `sum()` function would be hidden. You'll see what that looks like in Common mistakes.

### Part 2: Mutability

Now the second big idea: what happens to the *values* your variables point to.

### Names are labels, not boxes

In [chapter 02](../02-variables/notes.md), a variable was a labeled box. That picture got you a long way, but here's a more accurate one: **a variable is a name tag, and the value is a thing the tag is tied to.**

```python
shopping = ["milk", "eggs"]
```

This line makes a list, and ties the name tag `shopping` to it. The name isn't the list. It's a way of finding the list.

Most of the time the two pictures give the same answer. But one thing only makes sense with name tags: **you can tie two tags to the same thing.**

### Mutable and immutable types

Some kinds of values can be changed after they're made, and some can't.

| Immutable (can't be changed in place) | Mutable (can be changed in place) |
|---|---|
| `int`, `float`, `bool`, `None` | `list` |
| `str` | `dict` |
| `tuple`, `frozenset` | `set` |

You've already seen that strings are immutable ([chapter 06](../06-strings/notes.md)). String methods never change the string. They give you back a new one:

```python
name = "sandip"
name.upper()
print(name)  # prints: sandip

name = name.upper()  # tie the name to the new string
print(name)  # prints: SANDIP
```

Lists are mutable. Methods like `append` change the list itself:

```python
cart = ["milk"]
cart.append("eggs")
print(cart)  # prints: ['milk', 'eggs']
```

Changing a value in place like this is called **mutating** it. You can mutate lists, dictionaries and sets. You can never mutate a number, a string or a tuple: Python always makes a new one instead.

### Two names, one list

Here's the backup puzzle from the start of the chapter again:

```python
shopping = ["milk", "eggs"]
backup = shopping
shopping.append("bread")
print(backup)  # prints: ['milk', 'eggs', 'bread']
```

`backup = shopping` does **not** copy the list. It ties a second name tag to the same list. There's only one list here, with two names:

```
shopping ──┐
           ├──►  ['milk', 'eggs', 'bread']
backup   ──┘
```

So it doesn't matter which name you use to change the list. Both names lead to the same list, so both "see" the change. Having two names for one object is called **aliasing**. (An alias is another name for the same person, like a nickname.)

Dictionaries and sets work exactly the same way:

```python
account = {"owner": "Maya", "balance": 100}
same_account = account

same_account["balance"] = 0
print(account["balance"])  # prints: 0
```

Numbers and strings can be shared like this too, but it never causes surprises, because nobody can change them in place:

```python
score = 10
bonus_score = score  # both names tied to the same 10
bonus_score += 5     # makes a NEW number, 15, and moves bonus_score to it
print(score)         # prints: 10
print(bonus_score)   # prints: 15
```

### Changing the object vs. pointing the name somewhere new

There are two very different things you can do with a name:

- **Mutate** the object: change the thing itself, like `cart.append("tea")` or `account["balance"] = 0`. Every name tied to it sees the change.
- **Reassign** the name: use `=` to tie the name to a different object. Only that one name moves. The old object is left alone.

```python
a = [1, 2]
b = a        # both names tied to one list
b = [99]     # b is moved to a brand-new list

print(a)  # prints: [1, 2]
print(b)  # prints: [99]
```

Reassigning `b` didn't touch the list that `a` is tied to.

> **Watch out:** for lists, `b += [3]` is *not* the same as `b = b + [3]`. The `+=` version changes the list in place (so `a` sees it too), while `b = b + [3]` builds a new list and moves `b` to it. If you want to be sure you're not changing a shared list, use the long form, or make a copy first.

### `is` vs `==`

You've used `==` since [chapter 04](../04-operators/notes.md). It asks: **do these two have the same value?** Python has a second question, `is`, which asks: **are these the very same object?**

```python
a = [1, 2, 3]
b = a          # the same list, two names
c = [1, 2, 3]  # a different list that happens to look the same

print(a == c)  # prints: True   (same contents)
print(a is c)  # prints: False  (two separate lists)
print(a is b)  # prints: True   (one list, two names)
```

Think of two cars of the same model and colour. They're `==` (they look the same), but they're not the same car: if you scratch one, the other one is fine. `is` is only `True` when both names point at one single car.

Every object has an **identity**: a number that's unique to it while your program runs. The built-in `id()` function shows it, and `is` simply compares identities:

```python
a = [1, 2]
print(id(a))  # prints a big number, like 2573015933056 (yours will be different)

b = a
print(id(a) == id(b))  # prints: True
```

You'll rarely need `id()` in real code, but it's a handy way to check "are these the same object?" when you're confused.

So when should you use `is`? Almost always, only for one thing: checking for `None`.

```python
result = None
print(result is None)  # prints: True
```

There's only ever one `None` in a program, so asking "is this *the* `None`?" is the natural question. For everything else, like numbers, strings, lists and dictionaries, compare with `==`. (Common mistakes shows what happens if you don't.)

### Making a real copy

When you want a separate copy that you can change without touching the original, ask for one. For a list, use `.copy()` or a full slice, `[:]`:

```python
original = ["milk", "eggs"]
backup = original.copy()  # or: backup = original[:]

original.append("bread")
print(original)  # prints: ['milk', 'eggs', 'bread']
print(backup)    # prints: ['milk', 'eggs']
print(original is backup)  # prints: False
```

A slice always builds a new list (you met slicing in chapter 11), so `[:]`, "from the start to the end", is a copy of the whole thing. `.copy()` does the same job and is easier to read.

Dictionaries have a `.copy()` method too:

```python
account = {"owner": "Maya", "balance": 100}
snapshot = account.copy()

account["balance"] = 0
print(snapshot["balance"])  # prints: 100
```

A comprehension from [chapter 15](../15-comprehensions/notes.md) also always builds a new list or dictionary, so `[price * 2 for price in prices]` never touches `prices`.

### Shallow copies and nested data

`.copy()` and `[:]` make a **shallow copy**: only the outer list or dictionary is new. Anything *inside* it, like a list inside a dictionary, is still shared, because the copy only copied the name tags, not the things they're tied to.

```python
trip = {"destination": "Rome", "travelers": ["Ana", "Ben"]}
trip_copy = trip.copy()

trip_copy["destination"] = "Paris"     # outer level: separate
trip_copy["travelers"].append("Cleo")  # inner list: shared!

print(trip["destination"])  # prints: Rome
print(trip["travelers"])    # prints: ['Ana', 'Ben', 'Cleo']
```

Here's what's going on. There are two dictionaries, but only one `travelers` list:

```
trip      ──► {'destination': 'Rome',  'travelers': ──┐ }
                                                      ├──► ['Ana', 'Ben', 'Cleo']
trip_copy ──► {'destination': 'Paris', 'travelers': ──┘ }
```

It's like photocopying a recipe card that says "see page 42 of the cookbook". Now there are two cards, but they both point at the same cookbook.

### Deep copies with `copy.deepcopy()`

A **deep copy** copies every level, all the way down, so nothing is shared. Python has a ready-made tool for it in the `copy` module. A **module** is a toolbox of extra code that comes with Python, and `import` means "bring in that toolbox", just like `import math` in [chapter 05](../05-numbers-and-math/notes.md). (Modules get their own chapter, [chapter 19](../19-modules-and-standard-library/notes.md).)

```python
import copy

trip = {"destination": "Rome", "travelers": ["Ana", "Ben"]}
trip_copy = copy.deepcopy(trip)

trip_copy["travelers"].append("Cleo")
print(trip["travelers"])       # prints: ['Ana', 'Ben']
print(trip_copy["travelers"])  # prints: ['Ana', 'Ben', 'Cleo']
```

> **Watch out:** if you name a variable `copy` (as in `copy = original`), it hides the `copy` module, because your name is found first. Pick a different name, like `backup`.

Do you need deep copies often? Not really. Use `.copy()` for a flat list or dictionary (one with only numbers and strings inside), and `copy.deepcopy()` when it holds lists or dictionaries of its own.

### Passing a list into a function

When you pass a list or dictionary into a function, the function's parameter becomes one more name tag on **your** object. No copy is made. So if the function mutates it, you see the change:

```python
def add_free_gift(cart):
    cart.append("free tote bag")

order = ["shoes"]
add_free_gift(order)
print(order)  # prints: ['shoes', 'free tote bag']
```

Sometimes that's exactly what you want: the function's whole job is to change your list. But it can also happen by accident. This function only wants to *find* the top score, but `sort()` from chapter 11 changes the list it's called on:

```python
def top_score(scores):
    scores.sort(reverse=True)  # sort() changes the list it was given!
    return scores[0]

exam_scores = [70, 95, 80]
print(top_score(exam_scores))  # prints: 95
print(exam_scores)             # prints: [95, 80, 70]
```

The right answer came back, but the original order of `exam_scores` is gone. The fix is to use something that doesn't mutate, like `max(scores)`, or `sorted(scores)`, which gives you a new sorted list and leaves the original alone:

```python
def top_score(scores):
    return max(scores)

exam_scores = [70, 95, 80]
print(top_score(exam_scores))  # prints: 95
print(exam_scores)             # prints: [70, 95, 80]
```

Numbers and strings are safe, because they can't be mutated. A function can only reassign its own local name:

```python
def add_bonus(points):
    points = points + 50  # moves the local name to a new number
    return points

my_points = 100
add_bonus(my_points)
print(my_points)  # prints: 100

my_points = add_bonus(my_points)  # store what comes back
print(my_points)  # prints: 150
```

### Return a new value instead of changing the input

A good habit: **a function that receives a list or dictionary should build and return a new one, not change the one it was given**, unless changing it is the function's clearly named job (like `add_free_gift`).

```python
def with_item(cart, item):
    return cart + [item]  # + builds a new list

cart = ["shoes"]
new_cart = with_item(cart, "socks")
print(cart)      # prints: ['shoes']
print(new_cart)  # prints: ['shoes', 'socks']
```

Comprehensions are perfect for this, because they always build something new:

```python
def apply_discount(prices):
    return {item: price - 5 for item, price in prices.items()}

menu_prices = {"soup": 20, "pie": 15}
sale_prices = apply_discount(menu_prices)
print(sale_prices)  # prints: {'soup': 15, 'pie': 10}
print(menu_prices)  # prints: {'soup': 20, 'pie': 15}
```

> **Tip:** mutation isn't evil. Building up a list you just made yourself, inside one function, is perfectly normal. The danger is changing data that *other* code is also holding on to.

### The mutable default argument trap

This one catches out even experienced programmers. You learned about default parameter values in [chapter 10](../10-functions/notes.md). Here's a function that adds a guest to a party list, and starts a new empty list if you don't give it one:

```python
def add_guest(name, guests=[]):
    guests.append(name)
    return guests

print(add_guest("Ana"))  # prints: ['Ana']
print(add_guest("Ben"))  # prints: ['Ana', 'Ben']
```

Ben was supposed to get a brand-new party, but Ana is already on his list!

Here's why. The default value `[]` is made **once**, when Python first reads the `def` line, not every time you call the function. So every call that uses the default gets the *same* list, and it keeps growing.

The fix is to use `None` as the default, and make the new list inside the function:

```python
def add_guest(name, guests=None):
    if guests is None:
        guests = []  # a brand-new list on every call
    guests.append(name)
    return guests

print(add_guest("Ana"))          # prints: ['Ana']
print(add_guest("Ben"))          # prints: ['Ben']
print(add_guest("Cleo", ["Dev"]))  # prints: ['Dev', 'Cleo']
```

The rule: **never use a mutable value (a list, dictionary or set) as a default.** Use `None`, and check for it with `is None`. Numbers, strings, `True`/`False` and `None` are all fine as defaults, because they can't be mutated.

> **If you did the JavaScript course:** this is the same idea as values and references in [JavaScript chapter 16](../../JavaScript/16-values-vs-references/notes.md). The big difference is that in Python, *everything* is a name tied to an object, even numbers. Numbers and strings just can't be mutated, so sharing them is harmless.

## Common mistakes

**1. Expecting a function to change your number**

```python
def add_points(score):
    score = score + 10

score = 0
add_points(score)
print(score)  # prints: 0
```

The function's `score` is a local name. Moving it to a new number doesn't affect the `score` outside. (And reaching for `global` would only swap this problem for a worse one.) Fix: return the new value, and store it: `return score + 10` inside the function, and `score = add_points(score)` outside.

**2. Thinking `=` makes a copy**

```python
draft = {"title": "Holiday plans", "theme": "light"}
saved = draft
draft["theme"] = "dark"
print(saved["theme"])  # prints: dark
```

`saved` was meant to be a snapshot, but it's just a second name for the same dictionary. Fix: make a real copy, `saved = draft.copy()`, or `copy.deepcopy(draft)` if it holds lists or dictionaries inside.

**3. Storing the result of a method that changes things in place**

```python
scores = [70, 95, 80]
scores = scores.sort()
print(scores)  # prints: None
```

Methods that mutate a list, like `sort()`, `append()` and `reverse()`, change the list and give back `None`. So `scores = scores.sort()` sorts the list, then throws it away and ties `scores` to `None`. Fix: either call it on its own line, `scores.sort()`, or use the version that builds a new list: `scores = sorted(scores)`.

**4. Expecting `.copy()` to protect nested data**

```python
seats = [["free", "free"], ["free", "free"]]
plan = seats.copy()
plan[0][1] = "taken"
print(seats)  # prints: [['free', 'taken'], ['free', 'free']]
```

A cinema's seating plan is a list of rows, and each row is a list. `.copy()` made a new outer list, but the rows inside are still shared, so booking a seat in the "plan" booked it in the real seating too. Fix: `plan = copy.deepcopy(seats)` (after `import copy`).

**5. Naming a variable after a built-in**

```python
sum = 0
for price in [4, 5]:
    sum = sum + price
print(sum)  # prints: 9

print(sum([1, 2, 3]))
# TypeError: 'int' object is not callable
```

Remember LEGB: your global `sum` is found before the built-in `sum()`, so `sum` is now just the number 9, and you can't call a number. **Callable** means "something you can call with brackets", like a function. Fix: pick a name that isn't already taken, like `total`. Watch out for `sum`, `list`, `dict`, `max`, `min`, `input`, `id` and `copy`.

**6. Using `is` to compare values**

```python
answer = input("Continue? ")
if answer is "yes":
    print("Carrying on")
else:
    print("Stopping")
```

Type `yes`, and you'll see:

```
C:\...\16-scope-and-mutability\ex.py:2: SyntaxWarning: "is" with 'str' literal. Did you mean "=="?
  if answer is "yes":
Continue? yes
Stopping
```

(The file path is shortened here; yours will show where your file lives.) `is` asks "is this the very same object?", and the `"yes"` you typed is a different string object from the `"yes"` in your code, even though they look the same. Python even warns you. Fix: compare values with `==`: `if answer == "yes":`. Save `is` for `is None`.

## Quick recap

- A variable made inside a function is **local**: it only exists inside that function. A variable made at the top level of the file is **global**, and any function can read it.
- Assigning to a name inside a function makes it local for the whole function. Reading it before it has a value gives `UnboundLocalError`.
- Avoid `global`. Pass values in as arguments and hand results back with `return`.
- Python looks up names in the order **L**ocal, **E**nclosing, **G**lobal, **B**uilt-in. Don't name your variables after built-ins like `sum` or `list`.
- Lists, dictionaries and sets are **mutable**. Numbers, strings and tuples are **immutable**.
- `b = a` gives one object two names. Use `.copy()` or `[:]` for a shallow copy, and `copy.deepcopy()` for nested data.
- `==` compares values. `is` checks for the very same object, and is mainly for `is None`.
- A function can change a list you pass in. Never use a list or dictionary as a default value: use `None` instead.

---

**Next:** try the [exercises](exercises.md), then move on to [17 Recursion](../17-recursion/notes.md).
