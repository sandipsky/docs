# 49 Performance

## What is it?

**Performance** is how fast your program does its job, and how much memory it needs while it does it. Making a program faster (or smaller) is called **optimising** it.

This chapter shows you how to optimise the way professionals do: **measure** where the time really goes, fix that one place, and measure again.

## Why does it matter?

Slow programs annoy people. A report that takes a minute every morning, a web page that hangs for three seconds, a script that runs all night: people notice, and they stop using it. Slow programs also cost money, because cloud servers are paid for by the hour, and a slow program needs a bigger one.

But here's the surprising part: **programmers are very bad at guessing what's slow.** Later in this chapter, Sandip's cafe report takes four seconds. He's sure the problem is reading the big CSV file, so he spends an afternoon trying to read it faster. Then he measures. Reading the file takes 0.14 seconds. 95% of the time is spent on one innocent-looking `in`, on one line. His afternoon was wasted.

Changing code to make it faster before you know where the time goes is called **premature optimisation**. The computer scientist Donald Knuth called it "the root of all evil", because it makes code harder to read without making it any faster. So the golden rule of this chapter is: **measure first.** (The [JavaScript course](../../JavaScript/48-performance/notes.md) has the same rule, for web pages.)

## Real-world example

Your commute to work has started taking 50 minutes, and you want it shorter. You could buy a faster car. Or you could first time each part of the trip, and find out that 20 of those minutes are spent queuing at one junction.

| Your commute | Your program |
|---|---|
| The whole trip takes 50 minutes | The program takes 4 seconds |
| Buying a faster car | Rewriting everything, or buying a faster computer |
| Timing each part of the trip | **Profiling**: measuring how long each part of the program takes |
| The 20-minute queue at one junction | The **bottleneck** (or **hot spot**): the one slow part that holds everything up |
| A different route that skips the junction | A better way of doing that one part, like a better data structure |
| Timing the trip again the next morning | Measuring again, to prove the fix worked |
| A faster car still waits in the same queue | Faster code elsewhere doesn't help while the bottleneck is still there |

## How it works

### Make it work, make it right, make it fast

There's an old saying among programmers (from Kent Beck, one of the people who made testing popular): **make it work, make it right, make it fast**. In that order.

1. **Make it work:** get the right answer, even slowly.
2. **Make it right:** clean it up, and write tests ([chapter 36](../36-testing-with-pytest/notes.md)) that prove the answer is right.
3. **Make it fast:** only now, and only if it's actually too slow.

The tests from step 2 are what make step 3 safe. Speed-ups often change how code works inside, and it's easy to make something fast *and wrong*. With tests, you'll know straight away.

Then optimising is a loop:

1. **Measure** how long it takes.
2. **Find** the slowest part.
3. **Change one thing.**
4. **Measure again**, and run your tests.
5. **Stop** as soon as it's fast enough. Fast enough is the goal, not as fast as possible.

### Timing a whole program: `perf_counter`

You've already met the tool for timing a whole program or one function: `time.perf_counter()`. [Chapter 22](../22-dates-and-times/notes.md) promised you'd use it here, [chapter 32](../32-decorators/notes.md) built a `@timer` decorator with it, and [chapter 33](../33-context-managers/notes.md) built a `Timer` you can use with `with`. The idea is always the same: read the clock before, read it after, subtract.

```python
import time

start = time.perf_counter()
total = sum(n * n for n in range(5_000_000))
elapsed = time.perf_counter() - start
print(f"Total {total:,} in {elapsed:.2f} seconds")
```

On the computer used to test this chapter, it printed this (your time will be different):

```
Total 41,666,654,166,667,500,000 in 0.46 seconds
```

`perf_counter` is the right clock for this. It's very precise, and it only ever moves forward. (Mistake 4 at the end shows what can go wrong with `time.time()`.)

That's perfect for anything that takes long enough to notice: a whole program, a report, a big function. But it has a weakness for tiny pieces of code, which is the next tool's job.

### Timing small pieces: `timeit`

How long does `sum(range(1000))` take? Far less than a thousandth of a second. Timing it once with `perf_counter` gives you mostly **noise**: random wobble from everything else your computer is doing at that moment (other programs, the antivirus, the browser). Run it twice and you'll get two different answers.

The `timeit` module from the standard library fixes that. It runs your code thousands of times, does that whole batch several times over, and reports the best batch. You can use it straight from the terminal:

```
python -m timeit "sum(range(1000))"
```

```
20000 loops, best of 5: 10.4 usec per loop
```

Read it from right to left: one `sum(range(1000))` took **10.4 microseconds**. To get that, timeit ran it 20,000 times in a row (it picks a number that takes a reasonable time), did that 5 times, and kept the fastest of the 5 batches.

| timeit says | Means | In seconds |
|---|---|---|
| `sec` | seconds | 1 |
| `msec` | milliseconds (a thousandth) | 0.001 |
| `usec` | microseconds (a millionth) | 0.000001 |
| `nsec` | nanoseconds (a billionth) | 0.000000001 |

Your numbers will be different, and they'll change a little every time you run it. That's normal.

Use `-s` for **setup** code: something that runs once, before the timing starts, so it isn't counted. Here's the difference between looking something up in a list and in a set ([chapter 12](../12-tuples-and-sets/notes.md) said sets are fast at `in`; now you can see how fast):

```
python -m timeit -s "names = [str(n) for n in range(10_000)]" "'9999' in names"
python -m timeit -s "names = {str(n) for n in range(10_000)}" "'9999' in names"
```

```
5000 loops, best of 5: 83.2 usec per loop
10000000 loops, best of 5: 20.6 nsec per loop
```

83.2 *micro*seconds against 20.6 *nano*seconds: the set was about 4,000 times faster. Hold on to that. It's the key to the slow report coming up.

You can use `timeit` inside a script too. Give it a function to call, often a `lambda` ([chapter 34](../34-functional-tools/notes.md)):

```python
import timeit

prices = list(range(100_000))

seconds = timeit.timeit(lambda: sum(prices), number=100)
print(f"100 runs took {seconds:.4f} seconds in total")

runs = timeit.repeat(lambda: sum(prices), number=100, repeat=5)
print([round(run, 4) for run in runs])
print(f"Best: {min(runs) / 100 * 1000:.3f} ms per call")
```

One run printed:

```
100 runs took 0.0490 seconds in total
[0.0641, 0.0533, 0.0657, 0.0561, 0.0535]
Best: 0.533 ms per call
```

- `timeit.timeit(func, number=100)` calls `func` 100 times and gives back the **total** time, in seconds.
- `timeit.repeat(..., repeat=5)` does that 5 times, and gives back a list of 5 totals.
- `min(runs) / 100` is the best time for **one** call, and `* 1000` turns seconds into milliseconds (`ms`).

Look at the 5 runs. Same code, same data, and yet one batch took 0.0657 seconds and another 0.0533. **Why take the best, not the average?** The code didn't get slower. Something else on the computer got in the way during the slow runs. The fastest run is the one with the least getting in the way, so it's the closest to what your code itself costs. (The official Python docs give exactly this advice.)

### Finding the slow part: `cProfile`

Timing tells you *how long*. It doesn't tell you *where*. For that, you need a **profiler**: a tool that watches your program run and writes down how many times each function was called and how long it took. Python comes with one, called `cProfile`.

Here's a realistic slow program to try it on. First, a script that makes a big, made-up sales file for Sandip's cafe. Make a folder for this chapter, and save this as `make_data.py`:

```python
"""Make a big, made-up sales file for Sandip's cafe, to practise on."""

import csv
import random

MENU = {
    "Latte": 350,
    "Tea": 225,
    "Hot chocolate": 375,
    "Croissant": 275,
    "Bagel": 290,
    "Banana bread": 320,
}

random.seed(49)  # the same "random" data every time you run this
customers = [f"C{n:05}" for n in range(1, 20_001)]  # C00001 to C20000
members = random.sample(customers, 5_000)  # 5,000 of them have a loyalty card

with open("members.txt", "w", encoding="utf-8") as f:
    for customer_id in members:
        f.write(f"{customer_id}\n")

with open("orders.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["order_id", "customer_id", "item", "quantity", "price_cents"])
    for order_id in range(1, 50_001):
        item = random.choice(list(MENU))
        quantity = random.randint(1, 4)
        customer_id = random.choice(customers)
        writer.writerow([order_id, customer_id, item, quantity, MENU[item]])

print("Wrote members.txt and orders.csv")
```

Run it once. It writes `orders.csv` (50,000 orders, like the cafe file in [chapter 44](../44-working-with-data/notes.md), but much bigger) and `members.txt` (the 5,000 loyalty-card members, one ID per line). `random.seed(49)` makes the random numbers come out the same every time, so your files match the ones used for this chapter.

Now the report itself. Save it as `report.py`:

```python
"""Monthly sales report for Sandip's cafe."""

import csv
import time
from collections import Counter


def load_members(path: str) -> list[str]:
    """Read the loyalty-card members, one customer ID per line."""
    with open(path, encoding="utf-8") as f:
        return [line.strip() for line in f]


def load_orders(path: str) -> list[dict[str, str]]:
    """Read every order from the CSV file."""
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def order_total(order: dict[str, str]) -> int:
    """Return what one order cost, in cents."""
    return int(order["quantity"]) * int(order["price_cents"])


def member_sales(orders: list[dict[str, str]], members: list[str]) -> int:
    """Add up the orders made by loyalty-card members."""
    total = 0
    for order in orders:
        if order["customer_id"] in members:
            total += order_total(order)
    return total


def best_sellers(orders: list[dict[str, str]], how_many: int) -> list[tuple[str, int]]:
    """Return the items that sold the most, with how many were sold."""
    counts: Counter[str] = Counter()
    for order in orders:
        counts[order["item"]] += int(order["quantity"])
    return counts.most_common(how_many)


def main() -> None:
    members = load_members("members.txt")
    orders = load_orders("orders.csv")
    total = sum(order_total(order) for order in orders)
    from_members = member_sales(orders, members)
    print(f"Orders: {len(orders):,}")
    print(f"Total sales: ${total / 100:,.2f}")
    print(f"From members: ${from_members / 100:,.2f} ({from_members / total:.0%})")
    print("Best sellers:")
    for item, quantity in best_sellers(orders, 3):
        print(f"  {item:<14}{quantity:>7,}")


if __name__ == "__main__":
    start = time.perf_counter()
    main()
    print(f"Took {time.perf_counter() - start:.2f} seconds")
```

Every part of it is something you know: a `Counter` from [chapter 19](../19-modules-and-standard-library/notes.md), `csv.DictReader` from [chapter 21](../21-json-and-csv/notes.md), and `{from_members / total:.0%}` shows a fraction as a percentage. Run `python report.py`:

```
Orders: 50,000
Total sales: $383,101.65
From members: $95,387.20 (25%)
Best sellers:
  Latte          21,175
  Hot chocolate  21,075
  Croissant      20,932
Took 4.14 seconds
```

The answers are right, but over four seconds for 50,000 rows is slow. (Your time will be different. On a slower laptop, it might be ten seconds or more.) Where does the time go? Don't guess. Run it under the profiler:

```
python -m cProfile -s cumulative report.py
```

`-m cProfile` runs your script with the profiler watching, and `-s cumulative` sorts the results (more on that in a moment). Your program prints its report as usual, and then the profiler adds a long table. Here are the top lines:

```
         419029 function calls (419017 primitive calls) in 4.138 seconds

   Ordered by: cumulative time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
      3/1    0.000    0.000    4.138    4.138 {built-in method builtins.exec}
        1    0.004    0.004    4.138    4.138 report.py:1(<module>)
        1    0.000    0.000    4.133    4.133 report.py:42(main)
        1    3.935    3.935    3.944    3.944 report.py:25(member_sales)
        1    0.009    0.009    0.139    0.139 report.py:14(load_orders)
    50001    0.077    0.000    0.129    0.000 csv.py:174(__next__)
        1    0.006    0.006    0.032    0.032 {built-in method builtins.sum}
    50002    0.030    0.000    0.030    0.000 {built-in method builtins.next}
    50001    0.011    0.000    0.026    0.000 report.py:45(<genexpr>)
    62475    0.024    0.000    0.024    0.000 report.py:20(order_total)
        1    0.015    0.015    0.016    0.016 report.py:34(best_sellers)
```

(The full table goes on for over a hundred more lines, mostly tiny bits of Python itself. You can ignore those.) Each row is one function. Here's what the columns mean:

| Column | Means |
|---|---|
| `ncalls` | How many times the function was called. |
| `tottime` | **Total time** spent in the function's own code, *not counting* the functions it called. |
| `percall` (the first one) | `tottime` divided by `ncalls`. |
| `cumtime` | **Cumulative time**: the function's own time *plus* everything it called. |
| `percall` (the second one) | `cumtime` divided by the number of calls. |
| `filename:lineno(function)` | Which function: its file, the line where it starts, and its name. |

How to read it, step by step:

1. **Skip the first few rows.** `builtins.exec` and `<module>` are Python running your file, and `main` calls everything else, so they always include the whole run.
2. **Find the first big `cumtime` that isn't a wrapper.** `member_sales`, at 3.944 of 4.138 seconds. That's 95% of the whole run!
3. **Compare its `tottime` with its `cumtime`.** Its `tottime` is 3.935, almost all of it. So the time isn't in some function that `member_sales` calls (`order_total` only took 0.024 seconds in total). It's in `member_sales`'s *own* lines.

And `member_sales` only has one interesting line: `if order["customer_id"] in members:`. `members` is a **list** of 5,000 IDs. For every one of the 50,000 orders, `in` walks through that list from the start, comparing IDs one by one, until it finds a match or reaches the end. That's up to 250 million comparisons.

Notice that `in` doesn't get a row of its own. It isn't a function call, so the profiler counts its time in the function where it happens. That's why `tottime` is so useful: a big `tottime` means "look inside this function itself".

Also look at what *isn't* slow: `load_orders`, reading all 50,000 rows of the CSV, took 0.139 seconds. That's the part Sandip was sure was the problem.

> **Tip:** `-s` chooses the column to sort by. `-s cumulative` shows the big picture from the top down. `-s tottime` puts the functions that do the actual slow work first. Try both.

### Saving a profile: `pstats`

For a big program, the table is long. You can save the results to a file with `-o`, and then explore them in Python with the `pstats` module (also in the standard library):

```
python -m cProfile -o report.prof report.py
```

Then save this as `read_profile.py`, and run it:

```python
import pstats

stats = pstats.Stats("report.prof")
stats.strip_dirs().sort_stats("tottime").print_stats(5)
```

```
Mon Oct 12 14:06:19 2026    report.prof

         419029 function calls (419017 primitive calls) in 3.882 seconds

   Ordered by: internal time
   List reduced from 154 to 5 due to restriction <5>

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    3.683    3.683    3.691    3.691 report.py:25(member_sales)
    50001    0.074    0.000    0.125    0.000 csv.py:174(__next__)
    50002    0.030    0.000    0.030    0.000 {built-in method builtins.next}
    62475    0.022    0.000    0.022    0.000 report.py:20(order_total)
        1    0.017    0.017    0.019    0.019 report.py:34(best_sellers)
```

`strip_dirs()` shortens long folder names to just the file name, `sort_stats("tottime")` picks the order ("internal time" is another name for `tottime`), and `print_stats(5)` shows only the top 5. Same story: `member_sales` is the bottleneck.

### Fixing it, and measuring again

You know the fix from the `timeit` test: a set is thousands of times faster at `in`. In `report.py`, change `load_members` to build a set, with curly brackets ([chapter 15](../15-comprehensions/notes.md)):

```python
def load_members(path: str) -> set[str]:
    """Read the loyalty-card members, one customer ID per line."""
    with open(path, encoding="utf-8") as f:
        return {line.strip() for line in f}
```

Run `python -m mypy report.py`, and it reminds you that one hint is now out of date:

```
report.py:46: error: Argument 2 to "member_sales" has incompatible type "set[str]"; expected "list[str]"  [arg-type]
```

So change the hint in `member_sales` to `members: set[str]` too. Nothing else changes: `in` works on sets exactly as it does on lists. Run the report again:

```
Orders: 50,000
Total sales: $383,101.65
From members: $95,387.20 (25%)
Best sellers:
  Latte          21,175
  Hot chocolate  21,075
  Croissant      20,932
Took 0.10 seconds
```

**Exactly the same answers**, about 40 times faster. Two changed lines. Profile it once more, and the top of the table has changed: `member_sales` now takes 0.010 seconds, and the biggest part is `load_orders`, at 0.135 of 0.201 seconds. Should you speed up reading the CSV too? No. The whole report takes a tenth of a second. That's fast enough, so **stop**.

> **Tip:** The profiler slows your program down a little, because it's writing notes about every function call. Under the profiler, the fixed report took 0.20 seconds instead of 0.10. So trust the profiler's *proportions* ("95% of the time is here"), and use a plain `perf_counter` timing for the real number.

### Big-O: how the work grows

Why was the list so slow, and the set so fast? It comes down to how the work **grows** when the data grows. Programmers describe that with **Big-O notation**. It sounds scary, but it's just a short way of saying "how much more work when there's more data":

| Big-O | Say it as | What happens with 10 times more data | Examples |
|---|---|---|---|
| O(1) | "constant" | About the same time | `in` on a set or dict, `d[key]`, `items[3]`, `append` |
| O(n) | "linear" | 10 times longer | `in` on a list, `sum()`, one loop over the data |
| O(n²) | "n squared" | 100 times longer | A loop inside a loop over the same data |

(`n` just means "the number of items". You'll also see O(n log n), which is how sorting grows: a bit more than linear. `sorted()` on a million items is still fast.)

Here's the list against the set, as the data grows. Each line times `-1 in items`, a number that isn't there, which is the worst case for a list: it has to check every single item.

```python
import timeit


def seconds_per_lookup(items: list[int] | set[int]) -> float:
    """Time `-1 in items`, and return the best time for one lookup."""
    runs = 100
    best = min(timeit.repeat(lambda: -1 in items, number=runs, repeat=5))
    return best / runs


print(f"{'items':>10} {'list':>12} {'set':>12}")
for size in [1_000, 10_000, 100_000, 1_000_000]:
    as_list = list(range(size))
    as_set = set(as_list)
    list_us = seconds_per_lookup(as_list) * 1_000_000  # in microseconds
    set_us = seconds_per_lookup(as_set) * 1_000_000
    print(f"{size:>10,} {list_us:>9.2f} us {set_us:>9.2f} us")
```

```
     items         list          set
     1,000      4.41 us      0.03 us
    10,000     57.21 us      0.04 us
   100,000    663.16 us      0.04 us
 1,000,000   9986.18 us      0.06 us
```

(`us` is short for microseconds, like timeit's `usec`.) Every time the data grows 10 times, the list takes about 10 times longer: that's O(n). The set barely moves: that's O(1). With a million items, one list lookup takes 10 milliseconds, and the set is over 100,000 times faster.

It's the same reason a dictionary finds "cat" without reading from page one ([chapter 13](../13-dictionaries/notes.md)). A set or dict works out *where* an item must be from its value (that's what **hashable** means, from chapter 12), and jumps straight there.

O(n²) is the one that really hurts, because it often hides. Here's a function that keeps each visitor once, in order. It looks innocent:

```python
import random
import time


def unique_visitors(visits: list[str]) -> list[str]:
    """Return each visitor once, in the order they first came."""
    unique: list[str] = []
    for visitor in visits:
        if visitor not in unique:  # a hidden loop over the whole list!
            unique.append(visitor)
    return unique


random.seed(49)
for size in [5_000, 10_000, 20_000, 40_000]:
    visits = [f"C{random.randint(1, size):05}" for _ in range(size)]
    start = time.perf_counter()
    unique_visitors(visits)
    print(f"{size:>6,} visits: {time.perf_counter() - start:.2f} seconds")
```

```
 5,000 visits: 0.09 seconds
10,000 visits: 0.37 seconds
20,000 visits: 2.00 seconds
40,000 visits: 7.50 seconds
```

Double the data, and it takes about **four times** as long (the steps aren't perfectly even, because of how your computer's memory works, but the trend is clear). That's O(n²): the `for` loop is one loop, and `not in unique` is a second loop hiding inside it. A program like this feels fine while you test it with 50 rows, then grinds to a halt with real data. The cafe report had the same shape: a loop over the orders, with `in` on a list inside it.

The fix is the same as before: keep a set for the "have I seen this one?" question, and a list for the order:

```python
def unique_visitors(visits: list[str]) -> list[str]:
    """Return each visitor once, in the order they first came."""
    seen: set[str] = set()  # for fast "have I seen this one?" checks
    unique: list[str] = []  # keeps the order
    for visitor in visits:
        if visitor not in seen:
            seen.add(visitor)
            unique.append(visitor)
    return unique
```

```
 5,000 visits: 0.0004 seconds
10,000 visits: 0.0012 seconds
20,000 visits: 0.0019 seconds
40,000 visits: 0.0036 seconds
```

Now doubling the data roughly doubles the time: O(n). 40,000 visits in under 4 milliseconds instead of 7.5 seconds.

> **Tip:** When a program is slow, look for a loop with an `in` on a list inside it, or a loop inside a loop. That one pattern causes more slow beginner programs than everything else in this chapter put together.

### The usual fixes

Most slow programs are slow for one of a handful of reasons. Here they are, each with a real before and after. They were all timed on the same computer. Your numbers will be different, but the gaps will be similar.

**1. Use the right data structure.** You've just seen it twice: a set (or a dict) instead of a list for "is this in here?". The same goes for finding things by an ID. If you keep searching a list of products for the one with a certain ID, build a dictionary once, `products_by_id = {product["id"]: product for product in products}`, and every lookup after that is O(1).

**2. Move work out of loops.** Anything that gives the same answer every time round the loop should happen once, before it. Here's a sneaky one: someone heard that sets are fast, and wrote this:

```python
import time

members = [f"C{n:05}" for n in range(1, 20_001, 4)]  # 5,000 loyalty members
visits = [f"C{n:05}" for n in range(1, 2_001)]  # 2,000 visits

start = time.perf_counter()
count = 0
for customer in visits:
    if customer in set(members):  # builds a brand-new set on every visit!
        count += 1
seconds = time.perf_counter() - start
print(f"Set inside the loop: {count} members, {seconds:.4f} seconds")

start = time.perf_counter()
member_ids = set(members)  # built once, before the loop
count = 0
for customer in visits:
    if customer in member_ids:
        count += 1
seconds = time.perf_counter() - start
print(f"Set before the loop: {count} members, {seconds:.4f} seconds")
```

```
Set inside the loop: 500 members, 0.6910 seconds
Set before the loop: 500 members, 0.0003 seconds
```

Building a set means going through all 5,000 members, so the first version did that 2,000 times. Same answer, over 2,000 times slower.

**3. Cache work you repeat.** The `@cache` decorator from [chapter 34](../34-functional-tools/notes.md) isn't just for recursion. Here, 100,000 sales have their dates as text, but there are only 31 different dates in the whole file, and `strptime` ([chapter 22](../22-dates-and-times/notes.md)) is fairly slow:

```python
import time
from datetime import date, datetime
from functools import cache

# 100,000 sales, but only 31 different days (all of October 2026)
days = [f"{day:02}/10/2026" for day in range(1, 32)] * 3_226


def parse_day(text: str) -> date:
    return datetime.strptime(text, "%d/%m/%Y").date()


@cache
def parse_day_cached(text: str) -> date:
    return datetime.strptime(text, "%d/%m/%Y").date()


start = time.perf_counter()
parsed = [parse_day(text) for text in days]
print(f"Without a cache: {time.perf_counter() - start:.3f} seconds")

start = time.perf_counter()
parsed_again = [parse_day_cached(text) for text in days]
print(f"With @cache:     {time.perf_counter() - start:.3f} seconds")

print(parsed == parsed_again)  # prints: True
print(parse_day_cached.cache_info())
```

```
Without a cache: 0.688 seconds
With @cache:     0.009 seconds
True
CacheInfo(hits=99975, misses=31, maxsize=None, currsize=31)
```

31 misses, one per different date. The other 99,975 calls got their answer from the notebook. A cache only pays off when the **same inputs come back again and again**, and only for functions that are safe to cache (chapter 34's rules). Mistake 5 shows what happens when they don't.

**4. Build big strings with `join`.** Adding to a string with `+=` in a loop makes a new, longer string each time round. `"".join()` ([chapter 06](../06-strings/notes.md)) works out the final size first and builds it once:

```python
import timeit

names = [f"Member {n}" for n in range(10_000)]


def with_plus() -> str:
    text = ""
    for name in names:
        text += name + "\n"
    return text


def with_join() -> str:
    return "\n".join(names) + "\n"


print(with_plus() == with_join())  # prints: True
for func in [with_plus, with_join]:
    best = min(timeit.repeat(func, number=100, repeat=5)) / 100
    print(f"{func.__name__}: {best * 1000:.3f} ms")
```

```
True
with_plus: 1.164 ms
with_join: 0.057 ms
```

To be honest: Python has a trick that often makes `+=` on strings less slow than it "should" be, so the gap isn't as dramatic as people say. But `join` was still about 20 times faster here, and it's shorter too.

**5. Let built-ins do the looping.** Built-in functions like `sum()`, `min()`, `max()` and `sorted()` are written in C, the fast language that Python itself is written in. A loop you write yourself runs one Python step at a time:

```python
import timeit

prices = list(range(100_000))


def total_loop() -> int:
    total = 0
    for price in prices:
        total += price
    return total


def total_builtin() -> int:
    return sum(prices)


for func in [total_loop, total_builtin]:
    best = min(timeit.repeat(func, number=20, repeat=5)) / 20
    print(f"{func.__name__:<14}{best * 1000:>6.2f} ms")
```

```
total_loop      1.92 ms
total_builtin   0.33 ms
```

`sum()` was nearly six times faster than the loop. Comprehensions ([chapter 15](../15-comprehensions/notes.md)) help a little too: in a similar test, `[price * 2 for price in prices]` took 3.10 ms, against 4.00 ms for a loop with `append`. Use comprehensions because they're clearer; the small speed-up is a bonus.

**6. Batch your database work.** Every `commit()` ([chapter 42](../42-databases/notes.md)) waits until the data is safely stored on the disk. That's slow, so don't do it once per row:

```python
import sqlite3
import time
from pathlib import Path

# 2,000 sales: (customer ID, quantity)
sales = [(f"C{n % 500:05}", n % 4 + 1) for n in range(2_000)]


def fresh_database(path: str) -> sqlite3.Connection:
    Path(path).unlink(missing_ok=True)  # start from an empty file each time
    con = sqlite3.connect(path)
    con.execute("CREATE TABLE sales (customer_id TEXT NOT NULL, quantity INTEGER)")
    return con


# Slow: one INSERT and one commit for every sale
con = fresh_database("slow.db")
start = time.perf_counter()
for customer_id, quantity in sales:
    con.execute("INSERT INTO sales VALUES (?, ?)", (customer_id, quantity))
    con.commit()
print(f"One by one:  {time.perf_counter() - start:.3f} seconds")
con.close()

# Fast: all of them in one executemany, in one transaction
con = fresh_database("fast.db")
start = time.perf_counter()
with con:
    con.executemany("INSERT INTO sales VALUES (?, ?)", sales)
print(f"executemany: {time.perf_counter() - start:.3f} seconds")
con.close()
```

```
One by one:  9.077 seconds
executemany: 0.006 seconds
```

Over a thousand times faster. Almost all of the difference is the 2,000 commits: a plain loop of `execute` with one commit at the end took 0.011 seconds. `executemany` inside `with con:` is the shortest way to say "all of these, as one transaction". (Delete `slow.db` and `fast.db` afterwards.)

Reading has its own classic trap, called the **N+1 queries** problem: one query to get a list of things, then one more query *for each thing*. With 20,000 sales, that's 20,001 queries, where one query with a `JOIN` ([PostgreSQL chapter 22](../../PostgreSQL/22-joins/notes.md)) would do. On SQLite, which runs inside your program, a test with 20,000 sales took 0.065 seconds with N+1 queries and 0.017 seconds with one `JOIN`. With a database server like PostgreSQL, every query is also a trip across the network, so the gap gets much bigger. If you see a query inside a loop, ask whether one bigger query could do the job.

**7. Waiting? Do the waiting at the same time.** Sometimes the profile's top rows aren't your code at all, but things like `{method 'read' of '_ssl._SSLSocket' objects}` or `{built-in method _socket.getaddrinfo}`. That means your program spends its time **waiting**: for a website, an API or a database to answer. Faster Python won't help, because Python isn't the slow part. What helps is doing the waiting for several things at once: with `async` ([chapter 47](../47-async-python/notes.md)), or with threads ([chapter 48](../48-threads-processes-and-the-gil/notes.md)). And if the work really is heavy calculation, chapter 48 also shows how to spread it over several CPU cores with processes.

**8. Lots of numbers? Use pandas or NumPy.** pandas ([chapter 44](../44-working-with-data/notes.md)) does maths on whole columns at once, in fast C code, instead of one Python step per row:

```python
import random
import time

import pandas as pd

random.seed(49)
quantities = [random.randint(1, 4) for _ in range(1_000_000)]
prices = [random.choice([225, 275, 290, 320, 350, 375]) for _ in range(1_000_000)]
sales = pd.DataFrame({"quantity": quantities, "price_cents": prices})

start = time.perf_counter()
total = 0
for quantity, price in zip(quantities, prices, strict=True):
    total += quantity * price
print(f"Python loop: {total:,} cents in {time.perf_counter() - start:.3f} seconds")

start = time.perf_counter()
total = int((sales["quantity"] * sales["price_cents"]).sum())
print(f"pandas:      {total:,} cents in {time.perf_counter() - start:.3f} seconds")
```

```
Python loop: 764,929,090 cents in 0.133 seconds
pandas:      764,929,090 cents in 0.012 seconds
```

About ten times faster, for a million rows. (`strict=True` makes `zip` stop with an error if the two lists aren't the same length; [chapter 50](../50-clean-code-and-style/notes.md) explains why that's a good habit.) The win is biggest when your data is already in a DataFrame, for example from `pd.read_csv`. Building a DataFrame takes time too, so for a few hundred rows, plain Python is fine. **NumPy**, the package pandas is built on, does the same trick for plain lists of numbers.

### Memory: `tracemalloc`

Speed isn't the only thing to measure. A program that holds too much in memory slows the whole computer down, and at worst crashes with a `MemoryError`.

In [chapter 31](../31-iterators-and-generators/notes.md), `sys.getsizeof()` showed that a list of a million squares takes about 8 MB, while a generator for the same squares takes 200 bytes. Chapter 31 also warned that `getsizeof` only measures the list itself, not the numbers stored inside it. To see *everything*, use `tracemalloc`, another standard library module. Once you start it, it keeps track of every bit of memory Python asks for, and which line asked:

```python
import tracemalloc

tracemalloc.start()  # from now on, keep track of all the memory Python asks for

squares = [n * n for n in range(1_000_000)]
labels = [f"Member {n}" for n in range(100_000)]
total = sum(n * n for n in range(1_000_000))  # a generator: keeps nothing

snapshot = tracemalloc.take_snapshot()
for stat in snapshot.statistics("lineno")[:3]:
    print(stat)

current, peak = tracemalloc.get_traced_memory()
print(f"In use now: {current / 1_000_000:.1f} MB, peak: {peak / 1_000_000:.1f} MB")
```

Save it as `memory_top.py` and run it. Each line starts with the full path to your file (shortened here):

```
C:\Users\Sandip\perf\memory_top.py:5: size=38.6 MiB, count=999985, average=40 B
C:\Users\Sandip\perf\memory_top.py:6: size=5947 KiB, count=100001, average=61 B
C:\Users\Sandip\perf\memory_top.py:7: size=36 B, count=1, average=36 B
In use now: 46.5 MB, peak: 46.5 MB
```

- `take_snapshot()` is a photo of all the memory in use right now. `statistics("lineno")` groups it by the line that asked for it, biggest first.
- Line 5, the list of squares, holds **38.6 MiB**: the list *and* the million numbers inside it, which `getsizeof` didn't count. (KiB and MiB are the computer's kilobytes and megabytes: 1 KiB is 1,024 bytes, and 1 MiB is 1,024 KiB.)
- Line 7, the generator, holds 36 bytes. It handed out a million values and kept none of them.
- `get_traced_memory()` gives two numbers in bytes: what's in use now, and the highest it got (the **peak**).

The peak is often the number that matters. Here's the cafe's total worked out two ways. Run it in the folder with `orders.csv`:

```python
import csv
import tracemalloc


def total_from_list(path: str) -> int:
    """Read every order into a list first, then add them up."""
    with open(path, newline="", encoding="utf-8") as f:
        orders = list(csv.DictReader(f))
    return sum(int(row["quantity"]) * int(row["price_cents"]) for row in orders)


def total_streaming(path: str) -> int:
    """Add the orders up one row at a time, as they're read."""
    with open(path, newline="", encoding="utf-8") as f:
        rows = csv.DictReader(f)
        return sum(int(row["quantity"]) * int(row["price_cents"]) for row in rows)


tracemalloc.start()
for func in [total_from_list, total_streaming]:
    tracemalloc.reset_peak()  # forget the peak from the last function
    total = func("orders.csv")
    peak = tracemalloc.get_traced_memory()[1]
    print(f"{func.__name__:<16} total {total:,}, peak memory {peak / 1_000_000:.2f} MB")
```

```
total_from_list  total 38,310,165, peak memory 18.96 MB
total_streaming  total 38,310,165, peak memory 0.07 MB
```

The same total, and the streaming version never held more than one row at a time. For a 50,000-row file, 19 MB doesn't matter. For a 50-million-row file, it's the difference between working and crashing. That's chapter 31's rule of thumb in action: if you only need the values once, in order, don't build a list.

> **Tip:** `tracemalloc` makes your program slower while it's tracking, so use it to investigate, then take it out again.

### Newer Pythons are faster

Here's the cheapest speed-up there is: upgrade Python. **Python 3.11** was a big jump. Its release notes say it's about 25% faster than 3.10 on average, and between 10% and 60% faster depending on the program. Each version since has added smaller improvements. Your code doesn't change at all.

You may also read about Python's new **JIT compiler** (JIT means "just in time": it turns your busiest code into machine instructions while the program runs). Be careful with the excitement online. Python 3.13 added it as an **experimental** feature that you had to build Python yourself to try. In 3.14, the official Windows and macOS installers include it, but switched off (setting the environment variable `PYTHON_JIT=1` turns it on). Python 3.15, released on 9 October 2026, upgraded it a lot, but still calls it experimental, and the gains depend very much on the program. So don't plan around it yet. This chapter was tested on Python 3.13, so none of this was tried here. If you're on a newer Python, its "What's New" page on <https://docs.python.org> has the current story.

Python 3.15 also added a new kind of profiler, a **sampling profiler**, in a new `profiling` package. Instead of noting every function call, it peeks at your program thousands of times a second, which slows it down much less, and it can even look at a program that's already running. It wasn't available to test for this chapter, so check the 3.15 docs if you want to try it. `cProfile` keeps working as before.

## Common mistakes

**1. Optimising without measuring**

This is the big one, and it's the story at the start of the chapter. Sandip was certain that reading the CSV was slow, because it's a big file and files feel slow. The profile said 0.14 seconds out of 4. Your guesses will be wrong too: everyone's are, even experts'. Measure before you change anything, and measure after, to prove the change helped. If it didn't help, undo it, because it probably made the code harder to read.

**2. Measuring once**

```python
import timeit

prices = list(range(100_000))
times = timeit.repeat(lambda: sum(prices), number=1, repeat=5)
for seconds in times:
    print(f"{seconds * 1000:.3f} ms")
```

```
0.437 ms
0.419 ms
0.408 ms
0.365 ms
0.420 ms
```

The same line of code, five times in a row, and the slowest run took 20% longer than the fastest. If you'd timed your "before" once on a slow run and your "after" once on a fast run, you'd believe in a 20% improvement that doesn't exist. Fix: repeat the measurement and take the best (`timeit.repeat` and `min`), and for whole programs, run each version a few times.

**3. Unreadable micro-optimisations**

A **micro-optimisation** is a tiny trick to save a few nanoseconds per step. The internet is full of them:

```python
import timeit
from functools import partial

prices = list(range(100_000))


def doubled_clear(prices: list[int]) -> list[int]:
    return [price * 2 for price in prices]


def doubled_tricky(prices: list[int]) -> list[int]:
    result: list[int] = []
    append = result.append  # save looking up .append every time
    for price in prices:
        append(price << 1)  # shifting the bits left by 1 doubles a number
    return result


print(doubled_clear(prices) == doubled_tricky(prices))  # prints: True
for func in [doubled_clear, doubled_tricky]:
    best = min(timeit.repeat(partial(func, prices), number=20, repeat=5)) / 20
    print(f"{func.__name__:<15}{best * 1000:.2f} ms")
```

```
True
doubled_clear  2.57 ms
doubled_tricky 4.42 ms
```

The "clever" version is harder to read, *and* it's slower. Tricks like these were sometimes worth it in old Pythons, but each new version makes ordinary, clear code faster. Fix: write the clear version. Only reach for a trick if the profiler points at that exact line, and `timeit` proves the trick helps on *your* Python. (`partial` is from chapter 34: `partial(func, prices)` is a function that calls `func(prices)`.)

**4. Timing with `time.time()`, or with prints inside the loop**

`time.time()` reads the computer's normal clock, the one that shows the date and time. That clock can be **adjusted** while your program runs, for example when Windows corrects it from the internet, so a timing can come out wrong, even negative. It also used to be rough on Windows. Here's a short timing run on Python 3.12, which was still installed on the test computer:

```python
import time

prices = list(range(100_000))
for _ in range(3):
    start = time.time()
    total = sum(prices)
    print(f"time.time():         {time.time() - start} seconds")
start = time.perf_counter()
total = sum(prices)
print(f"time.perf_counter(): {time.perf_counter() - start} seconds")
```

```
time.time():         0.0 seconds
time.time():         0.0009963512420654297 seconds
time.time():         0.0 seconds
time.perf_counter(): 0.00047380002797581255 seconds
```

On Python 3.12 for Windows, `time.time()` only moved forward in steps, so a sum that really took about half a millisecond came out as "0.0 seconds" twice, and as a whole millisecond once. Python 3.13 made `time.time()` much finer on Windows, but it can still be adjusted. `perf_counter` never jumps and is made for timing, so always use it.

The other trap is printing progress inside the code you're timing:

```python
import time

start = time.perf_counter()
total = 0
for n in range(20_000):
    total += n * n
print(f"Quiet loop:    {time.perf_counter() - start:.4f} seconds")

start = time.perf_counter()
total = 0
for n in range(20_000):
    total += n * n
    print(f"n is {n}, total so far {total}")
print(f"Chatty loop:   {time.perf_counter() - start:.4f} seconds")
```

The first and last lines it printed:

```
Quiet loop:    0.0020 seconds
...
Chatty loop:   0.1155 seconds
```

The same loop took over 50 times longer with the `print` in it, so the timing measured `print`, not your code. (How slow printing is depends on where the output goes. A terminal window is often slower still.) Fix: time the work quietly, and print once, after.

**5. An unbounded cache eating memory**

```python
import tracemalloc
from functools import cache


@cache
def receipt_text(order_id: int) -> str:
    return f"Receipt for order {order_id}. Thank you for visiting Sandip's cafe!"


tracemalloc.start()
for order_id in range(1, 200_001):
    receipt_text(order_id)
print(receipt_text.cache_info())
print(f"Memory held: {tracemalloc.get_traced_memory()[0] / 1_000_000:.1f} MB")
```

```
CacheInfo(hits=0, misses=200000, maxsize=None, currsize=200000)
Memory held: 37.6 MB
```

Every order ID is new, so the cache never helps (`hits=0`), but `@cache` never forgets anything, so it keeps all 200,000 receipts. In a server that runs for weeks, a cache like this grows until the computer runs out of memory. Fix: check `cache_info()`. If `hits` is low, the cache isn't helping: remove it. If it helps but the inputs keep changing, give it a limit with `@lru_cache(maxsize=1024)` (chapter 34), so it keeps only the most recently used answers.

**6. Profiling a tiny example instead of the real thing**

Change `make_data.py` to write 500 orders instead of 50,000 (and 50 members instead of 5,000), make the files again, and profile the slow report with `-s tottime`:

```
         5378 function calls (5366 primitive calls) in 0.005 seconds

   Ordered by: internal time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
      501    0.001    0.000    0.001    0.000 csv.py:174(__next__)
        2    0.000    0.000    0.000    0.000 {built-in method _io.open}
        1    0.000    0.000    0.000    0.000 report.py:25(member_sales)
```

Now reading the CSV looks like the slowest part, and `member_sales` looks harmless! O(n²) problems only show up when n is big. A profile of the small test file would send you off to fix the wrong thing, exactly like Sandip's guess. Fix: profile with data that's as big as the real thing. If the real data is private, make realistic fake data with a script like `make_data.py`.

## Quick recap

- **Measure first.** Make it work, make it right (with tests), and only then make it fast. Change one thing at a time, measure again, and stop when it's fast enough.
- `time.perf_counter()` times whole programs. `timeit` (`python -m timeit`, or `timeit.repeat` in a script) times small pieces many times over: take the **best** run, not the average.
- `python -m cProfile -s cumulative script.py` shows where the time goes. A big `tottime` means the slow part is inside that function's own lines. `-o` and `pstats` save and sort a profile.
- Big-O describes how the work grows: O(1) for `in` on a set or dict, O(n) for `in` on a list, O(n²) for a loop inside a loop (including a hidden one, like `in` on a list inside a `for`).
- The usual fixes: the right data structure, work moved out of loops, `@cache` for repeated inputs, `"".join`, built-ins and comprehensions, batched database work (`executemany`, one `JOIN` instead of N+1 queries), async or threads for waiting (chapters 47 and 48), and pandas or NumPy for lots of numbers.
- `tracemalloc` shows which lines hold memory, and the peak. Generators keep memory flat. A cache without a limit can grow forever.

---

**Next:** try the [exercises](exercises.md), then move on to [50 Clean Code and Style](../50-clean-code-and-style/notes.md).
