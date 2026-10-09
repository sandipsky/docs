# 17 Recursion

## What is it?

**Recursion** is when a function calls itself.

Each call works on a smaller piece of the problem. The calls stop when the piece is so small that the function can answer it straight away, without calling itself again.

## Why does it matter?

Some problems are shaped like "a thing that contains smaller things of the same kind":

- Folders that contain files and more folders, which contain more files and folders...
- Comments with replies, and replies to those replies.
- A shop menu with categories, subcategories and sub-subcategories.

A loop is great for walking along a flat list. But with nested data like this, you often don't know how many levels deep it goes. You can't write "a loop inside a loop inside a loop" when you don't know how many loops you'd need. A recursive function can handle any depth, because it treats every level the same way: by calling itself again.

Recursion also helps you understand the **call stack**, which is what Python is showing you in those `File ... line ...` lines whenever an error crashes your program.

> Recursion feels strange to almost everyone at first. That's normal. Go slowly, and trace the small examples on paper. It clicks with practice.

## Real-world example

Think of **Russian nesting dolls**. To find the tiniest doll, you open the big doll. There's a smaller doll inside, so you do the same thing again: open it. You keep going until you reach a solid little doll that doesn't open. Then you stop.

| Nesting dolls | Recursion |
|---|---|
| Open a doll and find a smaller doll inside | The function calls itself with a smaller problem |
| Do the same thing to each smaller doll | Each call runs the same function again |
| The tiny solid doll that doesn't open | The **base case**: where the calls stop |
| Putting the dolls back together, smallest first | The answers coming back, from the innermost call outward |

Now picture standing between two mirrors: a reflection inside a reflection inside a reflection, on and on forever. That's recursion *without* a stopping point. Later in this chapter you'll see what happens when a program tries that.

## How it works

### A first example: countdown

In [chapter 09](../09-loops/notes.md) you wrote countdowns with loops. Here's a countdown written with recursion instead:

```python
def countdown(n):
    if n == 0:
        print("Liftoff!")
        return  # stop here: no more calls
    print(n)
    countdown(n - 1)  # call itself with a smaller number


countdown(3)
```

You'll see:

```
3
2
1
Liftoff!
```

Let's walk through it slowly:

1. `countdown(3)` runs. `n` is 3, not 0, so it prints `3` and calls `countdown(2)`.
2. `countdown(2)` runs. It prints `2` and calls `countdown(1)`.
3. `countdown(1)` runs. It prints `1` and calls `countdown(0)`.
4. `countdown(0)` runs. This time `n` is 0, so it prints `Liftoff!` and returns. No more calls.

Here's the same thing as a **call trace**, where each call is indented under the call that started it:

```
countdown(3)   → prints 3, then calls countdown(2)
  countdown(2)   → prints 2, then calls countdown(1)
    countdown(1)   → prints 1, then calls countdown(0)
      countdown(0)   → prints "Liftoff!" and stops
```

Each call is a separate run of the same function, with its own `n`. Remember from [chapter 16](../16-scope-and-mutability/notes.md) that every call to a function gets a fresh set of local variables. So there are four different `n`s here, one per call: 3, 2, 1 and 0. They don't get in each other's way.

### The two parts every recursive function needs

1. A **base case**: the situation where the function stops and answers directly, without calling itself. In `countdown`, that's when `n == 0`.
2. A **recursive case**: the function calls itself with a *smaller* problem, one step closer to the base case. In `countdown`, that's `countdown(n - 1)`.

Before you run any recursive function, check two things:

- Is there a base case?
- Does every call get closer to it?

If either answer is "no", the calls never stop. You'll see what happens then in a moment.

### Getting a value back: factorial

`countdown` only prints. Most recursive functions **return** a value, and that's where recursion gets really useful.

The **factorial** of a number is that number multiplied by every whole number below it, down to 1. It's written with an exclamation mark:

```
4! = 4 × 3 × 2 × 1 = 24
```

In real life, 4! is the number of different ways you can arrange 4 books on a shelf.

Now look at this pattern:

```
4! = 4 × 3 × 2 × 1  =  4 × 3!
3! = 3 × 2 × 1      =  3 × 2!
2! = 2 × 1          =  2 × 1!
1! = 1
```

A factorial is "the number, times the factorial of the number below it". The problem contains a smaller copy of itself. That's the sign that recursion is a good fit.

```python
def factorial(n):
    if n <= 1:
        return 1  # base case (it also covers 0, because 0! is 1 too)
    return n * factorial(n - 1)  # recursive case


print(factorial(4))  # prints: 24
```

But how does `factorial(4)` actually work it out? Imagine a line of people, and you ask the first one: "What's 4!?"

- Person 1: "I don't know yet. But it's 4 × 3!, so I'll ask the next person for 3! and wait."
- Person 2: "3! is 3 × 2!. I'll ask the next person and wait."
- Person 3: "2! is 2 × 1!. I'll ask the next person and wait."
- Person 4: "1! is 1. I know that one!" (That's the base case.)

Now the answers travel back up the line:

- Person 3: "Then 2! is 2 × 1 = 2."
- Person 2: "Then 3! is 3 × 2 = 6."
- Person 1: "Then 4! is 4 × 6 = 24."

Here's the same story as a trace. Going down, each call waits. Coming back up, each call finishes its multiplication:

```
factorial(4)
= 4 * factorial(3)
      = 3 * factorial(2)
            = 2 * factorial(1)
                  = 1            ← base case: no more calls
            = 2 * 1 = 2
      = 3 * 2 = 6
= 4 * 6 = 24
```

This is the most important idea in the chapter: **each call waits for the answer from the smaller call it made, and the work finishes on the way back up.**

### Watch it happen

You can make Python print that trace for you. This version has a second parameter, `depth`, which is only there to indent the messages. `"  " * depth` repeats two spaces once per level (string repetition from [chapter 04](../04-operators/notes.md)):

```python
def factorial(n, depth=0):
    indent = "  " * depth
    print(f"{indent}factorial({n}) called")

    if n <= 1:
        print(f"{indent}factorial({n}) returns 1")
        return 1

    result = n * factorial(n - 1, depth + 1)
    print(f"{indent}factorial({n}) returns {result}")
    return result


factorial(4)
```

You'll see:

```
factorial(4) called
  factorial(3) called
    factorial(2) called
      factorial(1) called
      factorial(1) returns 1
    factorial(2) returns 2
  factorial(3) returns 6
factorial(4) returns 24
```

Read it from top to bottom: four calls go *in*, deeper and deeper. Then four answers come back *out*, in the reverse order. Whenever a recursive function confuses you, add prints like these and watch what it does.

### The call stack: a stack of plates

How does Python keep track of all those calls that are waiting? It uses the **call stack**: a list of every function call that has started but hasn't finished yet.

Think of a stack of plates. Each time a function is called, a new plate goes on **top** of the stack. Only the top plate is being worked on. When that function returns, its plate is taken off, and the plate underneath carries on from where it was waiting.

Here's the stack while `factorial(3)` runs, at five moments in time:

```
                              factorial(1)
               factorial(2)   factorial(2)   factorial(2)
factorial(3)   factorial(3)   factorial(3)   factorial(3)   factorial(3)
────────────   ────────────   ────────────   ────────────   ────────────
    (1)            (2)            (3)            (4)            (5)
```

1. `factorial(3)` is called, and its plate goes on the stack.
2. It needs `factorial(2)`, so a new plate goes on top. `factorial(3)` waits underneath.
3. `factorial(2)` needs `factorial(1)`, so another plate goes on top. That's the base case, so it can answer straight away.
4. `factorial(1)` returns `1`, and its plate comes off. `factorial(2)` is on top again, and finishes: `2 * 1 = 2`.
5. `factorial(2)` returns `2`, and its plate comes off. Now `factorial(3)` finishes: `3 * 2 = 6`. It returns `6`, and the stack is empty.

Each plate holds that call's own local variables, like its own `n`. That's how four calls can each have a different `n` at the same time.

You've actually seen the call stack already. When an error crashes your program, Python prints a **traceback**: the list of `File ... line ...` lines above the error message. That list is the call stack at the moment things went wrong. [Chapter 18](../18-error-handling/notes.md) shows you how to read it properly.

### When the calls never stop

What if there's no base case? Like the two mirrors, the calls go on and on. But a computer can't go on forever, so Python puts a limit on how tall the stack of plates can get.

```python
def countdown(n):
    print(n)
    countdown(n - 1)  # no base case: nothing ever stops it


countdown(3)
```

This prints 3, 2, 1, 0, -1, -2, and keeps going for about a thousand numbers. Then it crashes. You'll see something like this (the middle of the numbers is cut out, and the file paths are shortened):

```
3
2
1
0
-1
...
-994
Traceback (most recent call last):
  File "C:\...\17-recursion\countdown.py", line 6, in <module>
    countdown(3)
    ~~~~~~~~~^^^
  File "C:\...\17-recursion\countdown.py", line 3, in countdown
    countdown(n - 1)  # no base case: nothing ever stops it
    ~~~~~~~~~^^^^^^^
  File "C:\...\17-recursion\countdown.py", line 3, in countdown
    countdown(n - 1)  # no base case: nothing ever stops it
    ~~~~~~~~~^^^^^^^
  File "C:\...\17-recursion\countdown.py", line 3, in countdown
    countdown(n - 1)  # no base case: nothing ever stops it
    ~~~~~~~~~^^^^^^^
  [Previous line repeated 995 more times]
  File "C:\...\17-recursion\countdown.py", line 2, in countdown
    print(n)
    ~~~~~^^^
RecursionError: maximum recursion depth exceeded
```

The last line is the one to read first: `RecursionError: maximum recursion depth exceeded`. The stack of plates got too tall, and Python stopped it on purpose. Above it, the traceback shows the same line, `countdown(n - 1)`, again and again: that's the same function calling itself, plate after plate. Python even sums it up for you: "Previous line repeated 995 more times".

How tall can the stack get? You can ask Python. It's kept in the `sys` module, Python's toolbox for facts about Python itself. (`import` means "bring in that toolbox", like `import math` in chapter 05.)

```python
import sys

print(sys.getrecursionlimit())  # prints: 1000
```

The limit is 1000 calls by default. That's plenty for normal recursive code, and it stops a runaway function before it can eat up all your computer's memory.

> **Watch out:** there's also a `sys.setrecursionlimit()` to raise the limit. It's almost never the right fix. If you hit the limit, the problem is nearly always a missing base case, or a job that a loop would do better.

The fix is always one of the two checks from earlier: add a base case, or make sure every call really moves closer to it.

### Adding up a list

Recursion works on lists too. Here's the idea in plain words: **the total of a list is the first number, plus the total of the rest.** And the total of an empty list is 0. That's the base case.

```python
def total(numbers):
    if len(numbers) == 0:
        return 0  # base case: an empty list adds up to 0
    return numbers[0] + total(numbers[1:])


print(total([5, 10, 20]))  # prints: 35
```

`numbers[0]` is the first item, and `numbers[1:]` is a slice of everything after it ([chapter 11](../11-lists/notes.md)). Each call gets a shorter list, so the calls always reach the empty list in the end:

```
total([5, 10, 20])
= 5 + total([10, 20])
      = 10 + total([20])
             = 20 + total([])
                    = 0          ← base case
             = 20 + 0 = 20
      = 10 + 20 = 30
= 5 + 30 = 35
```

### Reversing a string

Strings work the same way. **The reverse of a word is the reverse of everything after the first letter, followed by the first letter.** A word with one letter (or none) is already its own reverse.

```python
def reverse(text):
    if len(text) <= 1:
        return text  # base case: "a" backwards is still "a"
    return reverse(text[1:]) + text[0]


print(reverse("cat"))       # prints: tac
print(reverse("stressed"))  # prints: desserts
```

Here's the trace for `"cat"`:

```
reverse("cat")
= reverse("at") + "c"
  = (reverse("t") + "a") + "c"
  = ("t" + "a") + "c"
  = "tac"
```

### Recursion vs. loops

To be honest, `total` and `reverse` are here because they're small, clear examples, not because recursion is the best way to do them. Python already has `sum([5, 10, 20])` and the slice `"cat"[::-1]` from [chapter 06](../06-strings/notes.md), and a plain loop would do either job too.

Anything you can do with recursion, you can also do with a loop, and the other way round. So which should you choose?

| Use a loop when... | Use recursion when... |
|---|---|
| The data is a flat list (numbers, names, orders) | The data is nested like a tree (folders, comments, menus) |
| The list could be long, like 10,000 items (a loop has no depth limit) | You don't know how deep the nesting goes, but it isn't hundreds of levels deep |
| The loop version is short and clear | The recursive version is much simpler to read |

Most everyday Python uses loops and comprehensions. Reach for recursion when your data is shaped like a tree.

### Counting files in a folder of folders

This is where recursion shines. Picture a folder on your computer. It holds files, and it can also hold other folders, which hold more files and folders. Let's say a folder is a list, a file is a string, and a folder inside a folder is a list inside the list:

```python
folder = [
    "notes.txt",
    ["photo1.jpg", "photo2.jpg", ["old.jpg"]],  # a "photos" folder, with an "archive" folder inside
    "todo.md",
]
```

How many files are there, at any depth? You can't write a fixed number of nested loops, because next week someone might add a folder inside `old.jpg`'s folder. But recursion handles any depth.

To tell a file from a folder, you need one new built-in, `isinstance()`. It answers `True` or `False`: "is this value of this type?"

```python
print(isinstance(["a", "b"], list))  # prints: True
print(isinstance("notes.txt", list))  # prints: False
```

(It's a tidier way to write `type(value) == list`, which you could already do with `type()` from [chapter 03](../03-data-types/notes.md).)

Now the counting function:

```python
def count_files(folder):
    count = 0
    for item in folder:
        if isinstance(item, list):
            count = count + count_files(item)  # a folder: count what's inside it
        else:
            count = count + 1  # a file: count it
    return count


print(count_files(folder))  # prints: 5
```

The five files are `notes.txt`, `photo1.jpg`, `photo2.jpg`, `old.jpg` and `todo.md`.

Where's the base case? It's hiding in the `else`. A file is the simplest thing there is: it counts as 1, with no more calls. A folder hands each folder inside it to `count_files`, and adds up the answers it gets back. And an empty folder, `[]`, is a base case too: the loop runs zero times, and it returns 0.

Here's the trace. Notice how the calls follow the shape of the folders:

```
count_files(folder)
  "notes.txt"         → a file: 1
  count_files([...])  → a folder: ask inside
    "photo1.jpg"        → 1
    "photo2.jpg"        → 1
    count_files([...])  → a folder: ask inside
      "old.jpg"           → 1
    = 1
  = 3
  "todo.md"           → 1
= 5
```

### Walking a folder tree

Real folders have names, so here's a richer version, using dictionaries from [chapter 13](../13-dictionaries/notes.md). Every item has a `"name"`, and folders also have a `"children"` list, which can hold files *and* more folders:

```python
project = {
    "name": "my-site",
    "children": [
        {"name": "index.html"},
        {"name": "css", "children": [{"name": "style.css"}]},
        {
            "name": "scripts",
            "children": [
                {"name": "app.py"},
                {"name": "utils", "children": [{"name": "maths.py"}]},
            ],
        },
    ],
}


def print_tree(item, depth=0):
    print("  " * depth + item["name"])
    if "children" in item:
        for child in item["children"]:
            print_tree(child, depth + 1)  # the same job, one level deeper


print_tree(project)
```

You'll see:

```
my-site
  index.html
  css
    style.css
  scripts
    app.py
    utils
      maths.py
```

A file has no `"children"`, so `print_tree` prints its name and stops: that's the base case. A folder prints its own name, then hands each of its children to `print_tree`, one level deeper. The same pattern works for nested comments (replies to replies) and shop menus (categories inside categories). You'll try both in the exercises.

### Fibonacci, and why the simple version is slow

The **Fibonacci numbers** are a famous sequence. The first two are 0 and 1, and every number after that is the sum of the two before it:

```
0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
```

They turn up in nature, in the spirals of sunflower seeds and pine cones. And the definition is already recursive: "the nth Fibonacci number is the one before it plus the one before that". So it translates almost word for word into Python:

```python
def fib(n):
    if n < 2:
        return n  # base cases: fib(0) is 0, fib(1) is 1
    return fib(n - 1) + fib(n - 2)


print([fib(n) for n in range(10)])  # prints: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

Short and correct. But try `fib(35)` and you'll wait a second or two. Try `fib(40)` and you'll wait much longer. Why?

Every call that isn't a base case makes **two** more calls. Here's the call tree for `fib(4)`:

```
fib(4)
├── fib(3)
│   ├── fib(2)
│   │   ├── fib(1)
│   │   └── fib(0)
│   └── fib(1)
└── fib(2)
    ├── fib(1)
    └── fib(0)
```

Look closely: `fib(2)` gets worked out twice, from scratch, and `fib(1)` three times. Nobody remembers an answer once it's found, so the same work is done again and again. As `n` grows, the repeats explode. Let's count the calls (using `global` from chapter 16, which is fine for a quick experiment like this one):

```python
calls = 0

def fib(n):
    global calls  # only for this experiment: count every call
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)


for n in [5, 10, 20, 30]:
    calls = 0
    result = fib(n)
    print(f"fib({n}) = {result:,} took {calls:,} calls")
```

You'll see:

```
fib(5) = 5 took 15 calls
fib(10) = 55 took 177 calls
fib(20) = 6,765 took 21,891 calls
fib(30) = 832,040 took 2,692,537 calls
```

Over two and a half million calls to get one number! Each step up in `n` makes the work about 1.6 times bigger. On the computer used to test this chapter, `fib(35)` took about one and a half seconds, so `fib(40)` would take around 11 times longer. Your times will be different, but the pattern won't.

A loop that walks forward, keeping just the last two numbers, does the same job in a blink:

```python
def fib_loop(n):
    a, b = 0, 1
    for step in range(n):
        a, b = b, a + b  # the swap trick from chapter 02
    return a


print(fib_loop(30))  # prints: 832040
```

There's also a way to keep the recursive version and make it fast, by letting Python remember answers it has already worked out. It's called `functools.lru_cache`, and you'll meet it in [chapter 34](../34-functional-tools/notes.md).

The lesson: recursion that makes **one** call per step (like `factorial`) is fine. Recursion that makes **two or more** calls per step on overlapping problems (like `fib`) can get slow very fast. Walking a folder tree makes several calls per step too, but each call looks at a *different* folder, so nothing is repeated.

### How to write your own recursive function

When you write one yourself, go through these steps:

1. **Find the smallest version of the problem**, the one you can answer right away: an empty list, the number 1, a single letter, a file (not a folder). That's your base case.
2. **Trust that the function already works for a smaller input.** Don't try to follow every call in your head. When you write `total(numbers[1:])`, assume it gives you the right total for the rest.
3. **Use that smaller answer to build the full answer**: "the first number, plus the total of the rest".
4. **Check that every call gets closer to the base case.**

Step 2 feels strange at first. Think back to the line of people working out the factorial: each person only does their own small part, and trusts the next person to do theirs.

## Common mistakes

**1. Never getting closer to the base case**

```python
def countdown(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n)  # oops: should be n - 1


countdown(3)
# prints 3 about a thousand times, then: RecursionError: maximum recursion depth exceeded
```

There *is* a base case, but every call passes the same `n` along, so it's never reached. Fix: make the problem smaller each time: `countdown(n - 1)`.

**2. Stepping over the base case**

```python
def countdown(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 2)  # counting down in twos


countdown(3)
# prints 3, 1, -1, -3, ... then: RecursionError: maximum recursion depth exceeded
```

Counting down in twos from 3 goes 3, 1, -1, and jumps right over 0. Fix: make the base case catch everything at or below the stopping point: `if n <= 0:`.

**3. Forgetting to `return` the recursive call**

```python
def total(numbers):
    if len(numbers) == 0:
        return 0
    numbers[0] + total(numbers[1:])  # oops: no return


print(total([1, 2, 3]))
# TypeError: unsupported operand type(s) for +: 'int' and 'NoneType'
```

The line works out a sum, then throws it away. A function with no `return` gives back `None` ([chapter 10](../10-functions/notes.md)), so one level up, Python tries to work out `2 + None`, and crashes. Fix: `return numbers[0] + total(numbers[1:])`. When a recursive function gives you `None` or a `NoneType` error, check that **every** path through it ends in a `return`.

**4. Using recursion on something very big**

```python
def countdown(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)


countdown(5000)
# prints 5000, 4999, ... down to about 4000, then: RecursionError: maximum recursion depth exceeded
```

The function is correct, but it would need 5,000 plates on the call stack, and the limit is 1,000. Fix: for long, flat jobs like this, use a loop. Loops don't use up the call stack.

**5. Using a list as a default value to collect results**

```python
def collect(items, found=[]):
    for item in items:
        if isinstance(item, list):
            collect(item, found)
        else:
            found.append(item)
    return found


print(collect([1, [2, 3]]))  # prints: [1, 2, 3]
print(collect([4, 5]))       # prints: [1, 2, 3, 4, 5]
```

The first call works. The second call still has the first call's items in it! This is the mutable default trap from [chapter 16](../16-scope-and-mutability/notes.md): the default list is made once and shared by every call. It's an easy trap in recursion, because passing one list down through the calls is a handy trick. Fix: use `found=None`, and start a new list with `if found is None: found = []`.

## Quick recap

- **Recursion** is a function calling itself, each time on a smaller piece of the problem.
- Every recursive function needs a **base case** (stop and answer directly) and a **recursive case** (call itself, one step closer to the base case).
- Each waiting call sits on the **call stack**, like a stack of plates, until the smaller call it made returns. The answers come back in reverse order.
- Python allows about 1,000 calls deep (`sys.getrecursionlimit()`). A missing base case, or calls that never reach it, cause `RecursionError: maximum recursion depth exceeded`.
- Loops are best for flat lists and long jobs. Recursion shines with nested, tree-shaped data like folders, comments and menus.
- Recursion that repeats the same work, like the simple `fib`, can be very slow. A loop (or the caching tool in chapter 34) fixes it.
- Stuck? Trace a tiny example on paper, or add indented `print` lines and watch the calls.

---

**Next:** try the [exercises](exercises.md), then move on to [18 Error Handling](../18-error-handling/notes.md).
