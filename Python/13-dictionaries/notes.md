# 13 Dictionaries

## What is it?

A **dictionary** (or **dict** for short) stores values under names, so you can look them up by name instead of by position.

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
```

Each entry is a **key-value pair**. The **key** is the name you look things up by (like `"tea"`). The **value** is what's stored under it (like `250`).

## Why does it matter?

Say you're keeping your friends' phone numbers. With the lists from [chapter 11](../11-lists/notes.md), you'd need two lists that match up by position:

```python
names = ["Maya", "Tom", "Lena"]
phones = ["555-0142", "555-0199", "555-0123"]

position = names.index("Lena")
print(phones[position])  # prints: 555-0123
```

It works, but it's fragile. Add a name and forget the phone number, or sort one list but not the other, and every number after that belongs to the wrong person. Nothing warns you.

A dictionary keeps each name and number together, and finds the number in one step:

```python
phone_book = {"Maya": "555-0142", "Tom": "555-0199", "Lena": "555-0123"}
print(phone_book["Lena"])  # prints: 555-0123
```

No searching and no matching up positions: you ask with the key, and you get the value. Dictionaries are everywhere in real programs: a product's details, a user's settings, word counts, a cafe's price list. After lists, they're the collection you'll use most.

## Real-world example

A Python dictionary works just like a real dictionary, or the contacts app on your phone:

| Real dictionary | Python dictionary |
|---|---|
| A word you look up, like "cat" | A key |
| The definition next to it | The value |
| Word plus definition | A key-value pair |
| Looking a word up | `the_dict["cat"]` |
| Each word appears once | Each key appears once |
| Two words can have the same definition | Two keys can have the same value |

You never read a dictionary from page one to find "cat". You jump straight to it. Python does the same, which is why looking something up in a dict is very fast, even with millions of entries (just like `in` on a set in [chapter 12](../12-tuples-and-sets/notes.md)).

## How it works

### Creating a dictionary

Write the pairs inside curly braces `{ }`. Each pair is `key: value`, with commas between the pairs:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
print(menu)        # prints: {'coffee': 350, 'tea': 250, 'muffin': 300}
print(type(menu))  # prints: <class 'dict'>
print(len(menu))   # prints: 3
```

`len()` counts the pairs. (The prices are in cents, the safe way to store money from [chapter 05](../05-numbers-and-math/notes.md).)

When a dictionary gets longer, put one pair on each line. It's much easier to read:

```python
person = {
    "name": "Sandip",
    "age": 25,
    "city": "Kathmandu",
}
```

Values can be anything: strings, numbers, booleans, lists, even other dictionaries. Keys are usually strings.

An empty dictionary is `{}`. (That's why the empty *set* had to be `set()` in chapter 12. Dictionaries got `{}` first.)

> If you did the [JavaScript course](../../JavaScript/11-objects/notes.md): a dict looks a lot like a JavaScript object. Two differences: keys need quotes (`{"name": "Maya"}`, not `{name: "Maya"}`), and you read values with brackets (`person["name"]`), never with a dot.

### Reading a value with `[ ]`

Put the key in square brackets:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
print(menu["tea"])  # prints: 250

item = "muffin"     # imagine the customer chose this
print(menu[item])   # prints: 300
```

The key can be in a variable, like `item` here. Python looks inside `item`, finds `"muffin"`, and reads `menu["muffin"]`.

If the key isn't there, Python stops with a `KeyError`:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
print(menu["cake"])
# KeyError: 'cake'
```

Keys are case-sensitive, so `menu["Coffee"]` is a `KeyError` too.

### `.get()`: reading safely, with a default

When a key might be missing, use `.get()`. Instead of crashing, it gives you `None`, or a **default** value you choose:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
print(menu.get("tea"))        # prints: 250
print(menu.get("cake"))       # prints: None
print(menu.get("cake", 0))    # prints: 0
print(menu.get("tea", 0))     # prints: 250
```

The default is only used when the key is missing. When it's there, you get the real value.

| | `menu["cake"]` | `menu.get("cake", 0)` |
|---|---|---|
| Key is there | the value | the value |
| Key is missing | `KeyError` crash | the default (`0` here) |
| Use it when | the key **should** be there, and a crash points to a real bug | missing is normal, and you have a sensible default |

### Adding and changing

Adding and changing look exactly the same: `the_dict[key] = value`.

```python
menu = {"coffee": 350, "tea": 250}

menu["muffin"] = 300   # add: this key didn't exist yet
menu["coffee"] = 375   # change: this key already exists
print(menu)  # prints: {'coffee': 375, 'tea': 250, 'muffin': 300}
```

If the key is new, the pair gets added. If the key is already there, its value gets replaced. A key can only appear once, so there's never a second `"coffee"`.

Dictionaries are **mutable**, like lists: you can change them after they're made.

### Removing: `del` and `.pop()`

These work like they do on lists, but with a key instead of an index:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}

del menu["tea"]
print(menu)  # prints: {'coffee': 350, 'muffin': 300}

price = menu.pop("muffin")   # removes it AND gives you the value
print(price)  # prints: 300
print(menu)   # prints: {'coffee': 350}
```

Both stop with `KeyError: 'cake'` if the key isn't there. `.pop()` has a safe version: give it a default, and it uses that instead of crashing. `menu.pop("cake", None)` gives `None` and carries on.

### `in` checks the keys

`in` asks "is this a key in the dictionary?":

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
print("tea" in menu)         # prints: True
print("cake" in menu)        # prints: False
print("cake" not in menu)    # prints: True
print(250 in menu)           # prints: False
print(250 in menu.values())  # prints: True
```

Look at the last two lines. `250 in menu` is `False`, even though 250 is in there. That's because `in` only looks at the **keys**. To search the values, ask `.values()` (more on that in a moment).

`in` is the classic check before reading with `[ ]`:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
order = "cake"

if order in menu:
    print(f"That's {menu[order]} cents, please.")
else:
    print(f"Sorry, we don't sell {order}.")
# prints: Sorry, we don't sell cake.
```

### Looping over a dictionary

A plain `for` loop gives you the **keys**, one at a time:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}

for item in menu:
    print(f"{item}: {menu[item]}")
```

You'll see:

```
coffee: 350
tea: 250
muffin: 300
```

Three methods give you different views of the dictionary:

| Method | Gives you | Example result |
|---|---|---|
| `.keys()` | just the keys | `dict_keys(['coffee', 'tea', 'muffin'])` |
| `.values()` | just the values | `dict_values([350, 250, 300])` |
| `.items()` | each pair as a tuple | `dict_items([('coffee', 350), ('tea', 250), ('muffin', 300)])` |

Those `dict_keys(...)` names look odd when printed, but you can loop over them like a list, or turn them into one with `list()`. You'll rarely need `.keys()`, because looping over the dict already gives you the keys.

`.values()` is handy when you don't care about the keys:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
print(sum(menu.values()))  # prints: 900
print(max(menu.values()))  # prints: 350
```

`.items()` is the one you'll use most. Each pair comes as a tuple, so you can unpack it straight away, just like in chapter 12:

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}

for item, price in menu.items():
    print(f"{item:<8}{price:>5}")
```

You'll see:

```
coffee    350
tea       250
muffin    300
```

`for key, value in the_dict.items():` is one of the most common lines in all of Python. Learn its shape by heart.

To loop in alphabetical order, sort the keys: `for item in sorted(menu):` gives you `coffee`, `muffin`, `tea`.

### Dictionaries remember their order

A dictionary keeps its pairs in the order you added them. Changing a value doesn't move it:

```python
scores = {}
scores["Cara"] = 82
scores["Ana"] = 90
scores["Ben"] = 75
print(scores)  # prints: {'Cara': 82, 'Ana': 90, 'Ben': 75}

scores["Ana"] = 95
print(scores)  # prints: {'Cara': 82, 'Ana': 95, 'Ben': 75}
```

This has been guaranteed since Python 3.7 (2018). Very old tutorials may tell you dictionaries have no order. That used to be true, but it isn't any more. Even so, you still can't use an index like `scores[0]`. Dictionaries are for looking things up by key.

### `.update()`: merging in several pairs

`.update()` adds or changes several pairs at once, from another dictionary:

```python
settings = {"theme": "light", "font_size": 14}
settings.update({"theme": "dark", "language": "English"})
print(settings)
# prints: {'theme': 'dark', 'font_size': 14, 'language': 'English'}
```

`"theme"` already existed, so it changed. `"language"` was new, so it was added at the end. `"font_size"` wasn't mentioned, so it stayed as it was. It's like filling in a form where you only change the boxes you need to.

### The counting pattern

Counting things is one of the best jobs for a dictionary. Say your friends voted on where to eat. Each food is a key, and its value is how many votes it got:

```python
votes = ["pizza", "sushi", "pizza", "tacos", "sushi", "pizza"]
counts = {}

for vote in votes:
    counts[vote] = counts.get(vote, 0) + 1

print(counts)  # prints: {'pizza': 3, 'sushi': 2, 'tacos': 1}
```

The magic is in one line: `counts[vote] = counts.get(vote, 0) + 1`. Read it right side first:

1. `counts.get(vote, 0)`: "how many votes does this food have so far?" The first time we see `"pizza"`, it isn't a key yet, so `.get()` gives the default, `0`.
2. `+ 1`: add this vote.
3. `counts[vote] = ...`: store the new count under that food.

Without `.get()`, the first vote for anything would crash, because `counts["pizza"]` doesn't exist yet:

```python
votes = ["pizza", "sushi"]
counts = {}
for vote in votes:
    counts[vote] = counts[vote] + 1
# KeyError: 'pizza'
```

You can also write it with `in`, which some people find clearer when they're starting out. It does exactly the same job:

```python
votes = ["pizza", "sushi", "pizza", "tacos", "sushi", "pizza"]
counts = {}

for vote in votes:
    if vote in counts:
        counts[vote] += 1
    else:
        counts[vote] = 1

print(counts)  # prints: {'pizza': 3, 'sushi': 2, 'tacos': 1}
```

Counting words works the same way. `split()` from chapter 11 gives you the words:

```python
sentence = "the cat and the dog and the bird"
word_counts = {}
for word in sentence.split():
    word_counts[word] = word_counts.get(word, 0) + 1

for word, count in word_counts.items():
    print(f"{word}: {count}")
```

You'll see:

```
the: 3
cat: 1
and: 2
dog: 1
bird: 1
```

### Lookup tables: goodbye, long `if` chains

A dictionary can replace a long `if`/`elif` chain from [chapter 08](../08-conditionals/notes.md). Compare:

```python
ticket_type = "child"

if ticket_type == "adult":
    price = 1200
elif ticket_type == "child":
    price = 700
elif ticket_type == "senior":
    price = 800
```

```python
TICKET_PRICES = {"adult": 1200, "child": 700, "senior": 800}
ticket_type = "child"
price = TICKET_PRICES[ticket_type]
print(price)  # prints: 700
```

Both give 700. But the dictionary version is shorter, and adding a "student" ticket means adding one pair, not two more lines of `elif`. A dictionary used like this is called a **lookup table**: you ask with a key and get back the matching value.

### Dictionaries inside dictionaries

A value can be another dictionary. That's called a **nested** dictionary, and it's how most real data is shaped:

```python
contact = {
    "name": "Maya Patel",
    "phone": "555-0142",
    "address": {"city": "Leeds", "postcode": "LS1 4AP"},
}

print(contact["address"]["city"])  # prints: Leeds
contact["address"]["city"] = "York"
print(contact["address"])  # prints: {'city': 'York', 'postcode': 'LS1 4AP'}
```

Read `contact["address"]["city"]` from left to right, one step at a time: the contact, then their address, then its city. It's just like `board[0][2]` for lists of lists in chapter 11.

### Lists of dictionaries: a table of records

This is one of the most common shapes of data in all of programming: a list where every item is a dictionary with the same keys. Each dictionary is one **record** (one row of a table), and the keys are the column names.

Here's a tiny library catalog:

```python
books = [
    {"title": "Dune", "author": "Frank Herbert", "year": 1965},
    {"title": "Matilda", "author": "Roald Dahl", "year": 1988},
    {"title": "Holes", "author": "Louis Sachar", "year": 1998},
]

print(books[1]["title"])  # prints: Matilda

for book in books:
    print(f"{book['title']} by {book['author']} ({book['year']})")
```

You'll see:

```
Matilda
Dune by Frank Herbert (1965)
Matilda by Roald Dahl (1988)
Holes by Louis Sachar (1998)
```

`books[1]` is a whole dictionary, so `books[1]["title"]` gets its title. Inside the loop, `book` is one whole dictionary each time around. (Notice the single quotes in `book['title']` inside the f-string. The f-string itself uses double quotes, so the keys inside need single ones.)

| Table | Python |
|---|---|
| The whole table | the list, `books` |
| One row | one dictionary, like `books[0]` |
| A column name | a key, like `"title"` |
| One cell | `books[0]["title"]` |

Finding one record by a field is a job you'll do all the time, so it's worth a function:

```python
def find_book(books, title):
    """Return the book with this title, or None if there isn't one."""
    for book in books:
        if book["title"] == title:
            return book   # found it: stop looking and hand it back
    return None           # checked every book, and none matched

print(find_book(books, "Holes"))
# prints: {'title': 'Holes', 'author': 'Louis Sachar', 'year': 1998}
print(find_book(books, "Emma"))  # prints: None
```

You'll use this exact pattern in the [shopping cart project](../14-project-shopping-cart/notes.md) to look up products.

And the "building a new list" pattern from chapter 11 works here too:

```python
newer = []
for book in books:
    if book["year"] > 1980:
        newer.append(book["title"])
print(newer)  # prints: ['Matilda', 'Holes']
```

### Dictionaries of lists

Flip it around, and a dictionary's values can be lists. That's perfect when each key has *several* things. Here's a gym's class timetable:

```python
classes = {
    "Mon": ["yoga", "spin"],
    "Wed": ["swim"],
}

classes["Wed"].append("boxing")   # add to an existing list
classes["Fri"] = ["yoga"]         # a new day, with a new list

for day, sessions in classes.items():
    print(f"{day}: {', '.join(sessions)}")
```

You'll see:

```
Mon: yoga, spin
Wed: swim, boxing
Fri: yoga
```

`classes["Wed"]` is a list, so you can use every list method on it, like `append`.

A common job is **grouping**: sorting things into piles. Here, pupils are grouped by their team color. If a team doesn't have a list yet, make an empty one first, then append:

```python
pupils = [("Ana", "red"), ("Ben", "blue"), ("Cara", "red"), ("Dev", "green")]
teams = {}

for name, team in pupils:
    if team not in teams:
        teams[team] = []      # first pupil in this team: start an empty list
    teams[team].append(name)

print(teams)
# prints: {'red': ['Ana', 'Cara'], 'blue': ['Ben'], 'green': ['Dev']}
```

It's the counting pattern's cousin: instead of adding 1, you append a name.

### What can be a key?

Keys must be **immutable** (unchangeable): strings, numbers, booleans and tuples are all fine. Lists, sets and dictionaries can't be keys:

```python
prices = {["apple", "pear"]: 100}
# TypeError: unhashable type: 'list'
```

It's the same rule as for the items in a set (chapter 12). A dict files each pair away based on its key, so it can find it again in an instant. If a key could change after it was filed, the dict would look in the wrong place.

Tuples make great keys when one key needs two parts, like the distance between two towns:

```python
distances = {
    ("Kathmandu", "Pokhara"): 200,
    ("Kathmandu", "Chitwan"): 150,
}
print(distances[("Kathmandu", "Pokhara")])  # prints: 200
```

Values have no such rule. A value can be anything at all.

> **Watch out:** `1` and `"1"` are different keys. `{1: "one", "1": "the text one"}` has two pairs. This matters a lot when keys come from `input()`, which always gives you text (chapter 07). You'll meet this in the [shopping cart project](../14-project-shopping-cart/notes.md).

### Dictionaries and functions

Dictionaries are mutable, so they behave like lists when you pass them into a function: the function gets the **same** dictionary, and its changes stick.

```python
def restock(stock, item, amount):
    """Add some of an item to the stock, even if it's a new item."""
    stock[item] = stock.get(item, 0) + amount

shelf = {"apples": 4}
restock(shelf, "apples", 6)
restock(shelf, "pears", 3)
print(shelf)  # prints: {'apples': 10, 'pears': 3}
```

That's often exactly what you want, like here. [Chapter 16](../16-scope-and-mutability/notes.md) covers the times when it isn't, and how to make a copy.

## Common mistakes

**1. Reading a key that isn't there**

```python
menu = {"coffee": 350, "tea": 250}
print(menu["cake"])
# KeyError: 'cake'
```

Check first with `if "cake" in menu:`, or use `menu.get("cake", 0)` when a default makes sense. And remember keys are case-sensitive: `menu["Tea"]` is a `KeyError` too.

**2. Using `in` to look for a value**

```python
menu = {"coffee": 350, "tea": 250}
print(250 in menu)  # prints: False
```

No error, just the wrong answer. `in` only checks keys. To search the values, write `250 in menu.values()`.

**3. Forgetting `.items()` in a loop**

```python
menu = {"coffee": 350, "tea": 250}
for item, price in menu:
    print(item, price)
# ValueError: too many values to unpack (expected 2)
```

Looping over a dict gives you only the keys. Python tries to unpack the string `"coffee"` into two names, letter by letter, and there are too many letters. Fix: `for item, price in menu.items():`.

**4. Adding or removing keys while looping over the dict**

```python
stock = {"apples": 0, "pears": 5, "plums": 0}
for fruit in stock:
    if stock[fruit] == 0:
        del stock[fruit]
# RuntimeError: dictionary changed size during iteration
```

Python refuses to let a dictionary grow or shrink while a loop walks through it. Fix: first collect the keys to remove in a list, then remove them in a second loop:

```python
stock = {"apples": 0, "pears": 5, "plums": 0}
sold_out = []
for fruit in stock:
    if stock[fruit] == 0:
        sold_out.append(fruit)
for fruit in sold_out:
    del stock[fruit]
print(stock)  # prints: {'pears': 5}
```

(Changing a *value* during the loop, like `stock[fruit] = 10`, is fine. Only adding and removing keys is a problem.)

**5. Mixing up `1` and `"1"`**

```python
products = {1: "Apples", 2: "Bread"}
choice = "2"   # what input() would give you
print(products[choice])
# KeyError: '2'
```

The quotes in the error are the clue: Python looked for the **text** `'2'`, but the key is the **number** `2`. Fix: convert first, `products[int(choice)]` (after checking `choice.isdigit()`, as in chapter 08).

**6. Using a list as a key**

```python
seats = {["F", 7]: "Sandip"}
# TypeError: unhashable type: 'list'
```

Keys must be unchangeable. Use a tuple instead: `{("F", 7): "Sandip"}`.

## Quick recap

- A dictionary stores key-value pairs: `menu = {"coffee": 350, "tea": 250}`. Look values up by key, not by position.
- `menu["tea"]` reads a value and gives a `KeyError` if it's missing. `menu.get("cake", 0)` gives a default instead.
- `menu[key] = value` adds or changes a pair. `del menu[key]` and `menu.pop(key)` remove one. `.update()` merges in several.
- `in` checks the keys. Loop with `for key, value in menu.items():`, or use `.keys()` and `.values()`.
- The counting pattern: `counts[thing] = counts.get(thing, 0) + 1`.
- Lists of dicts make a table of records. Dicts of lists group several things under each key. Dicts can nest.
- Keys must be immutable (strings, numbers, tuples). Dictionaries keep the order you added things in.

---

**Next:** try the [exercises](exercises.md), then move on to [14 Project: Shopping Cart](../14-project-shopping-cart/notes.md).
