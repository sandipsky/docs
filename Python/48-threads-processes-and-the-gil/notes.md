# 48 Threads, Processes and the GIL

## What is it?

A **thread** is a separate line of work inside one running program. A program can have several threads running side by side, and they all share the same memory: the same variables, lists and objects.

A **process** is a whole running program, with its own memory. Your program can start extra processes to help it, and each one runs on its own.

The **GIL** (Global Interpreter Lock) is a rule inside the standard version of Python: only one thread at a time may run Python code. It's the reason Python needs both threads *and* processes to do more than one thing at once.

## Why does it matter?

[Chapter 47](../47-async-python/notes.md) made the weather program five times faster with `async` and `await`. But async has two limits:

1. **It needs async-aware libraries.** To make the weather program async, you had to swap `requests` for httpx's `AsyncClient`. Lots of useful code only works the ordinary, blocking way: `requests`, `sqlite3`, many company and cloud libraries. Rewriting all of it isn't always possible.
2. **It's still one cook.** Async speeds up *waiting*. Common mistake 6 in chapter 47 showed it can't speed up *calculating*: counting primes took just as long with `gather`.

Threads fix the first problem: the `requests` version of the weather program, completely unchanged, runs in about a second in six threads. Processes fix the second: on the computer used for these notes, counting the primes below a million went from 3.65 seconds to 1.98, by putting four CPU cores to work instead of one. Meanwhile, the GIL explains why you can't just use threads for both.

## Real-world example

In chapter 47, one cook juggled lots of pots. Now picture more cooks.

**Threads are several cooks sharing one kitchen.** They use the same fridge and the same counters, so they can all reach the same ingredients. But this kitchen has a strange rule: there's only **one special knife**, and nobody may chop without it. That's the GIL.

- When most of the work is **waiting** (for ovens, for deliveries), that's fine. One cook chops while the others wait for their ovens, and they hand the knife around. Lots gets done.
- When everyone needs to **chop**, it's useless. Four cooks stand in a queue for one knife, and the work takes as long as it would for one cook (a bit longer, actually, with all that handing over).

**Processes are separate kitchens.** Each has its own knife, so four kitchens really can chop at the same moment. But each kitchen needs its own copy of the ingredients (sending data between processes means copying it), and setting up a new kitchen takes time.

| In the kitchen | In Python |
|---|---|
| One cook juggling pots (chapter 47) | async: one thread, an event loop |
| Several cooks in one kitchen | Several **threads** in one process |
| A shared fridge and counters | Shared memory: threads see the same variables |
| The one special knife | The **GIL** |
| Waiting for an oven | **I/O-bound** work (explained next) |
| Chopping | **CPU-bound** work |
| Separate kitchens, each with its own knife | **Processes** |
| Copying ingredients over to another kitchen | **Pickling** the data you send to a process |
| A head chef handing out jobs to a team | An **executor** (a pool of workers) |
| Two cooks grabbing the same pot at once | A **race condition** |
| A "one at a time" sign on the pot | A **lock** |

## How it works

### Waiting or working? I/O-bound and CPU-bound

Before you pick a tool, ask: is my program mostly **waiting**, or mostly **working**?

- **I/O-bound** work spends most of its time waiting for **I/O** (input and output: the network, the disk, a database). The CPU sits idle. Downloading pages, calling APIs, reading files, querying a database.
- **CPU-bound** work keeps the CPU busy the whole time. Calculations, resizing photos, compressing files, crunching numbers in loops.

| I/O-bound (waiting) | CPU-bound (working) |
|---|---|
| Fetching the weather for 50 cities | Counting the primes below 10 million |
| Downloading 100 web pages | Resizing 1,000 photos |
| Running 20 database queries | Simulating a million card games |
| Copying files to a network drive | Compressing a big folder into a zip |
| Faster with: async (chapter 47) or threads | Faster with: processes |

You can measure which one you have. `time.perf_counter()` (from [chapter 32](../32-decorators/notes.md)) measures time on the clock. Its cousin `time.process_time()` only counts the time the CPU actually spent working on your program. Here's a stopwatch that shows both, as a context manager from [chapter 33](../33-context-managers/notes.md):

```python
import time
from collections.abc import Iterator
from contextlib import contextmanager

import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CITIES = {
    "Kathmandu": (27.70169, 85.3206),
    "Pokhara": (28.26689, 83.96851),
    "London": (51.50853, -0.12574),
    "Tokyo": (35.6895, 139.69171),
    "Sydney": (-33.86785, 151.20732),
    "New York": (40.71427, -74.00597),
}


@contextmanager
def stopwatch(label: str) -> Iterator[None]:
    """Time the with block on the clock, and count how long the CPU was busy."""
    clock_start = time.perf_counter()
    cpu_start = time.process_time()
    yield
    clock = time.perf_counter() - clock_start
    cpu = time.process_time() - cpu_start
    print(f"{label}: {clock:.2f} s on the clock, CPU busy for {cpu:.2f} s")


def count_primes(limit: int) -> int:
    """Count the prime numbers below limit, the slow way (on purpose)."""
    count = 0
    for number in range(2, limit):
        if all(number % d != 0 for d in range(2, int(number**0.5) + 1)):
            count += 1
    return count


with stopwatch("Weather for 6 cities"):
    with requests.Session() as session:
        for latitude, longitude in CITIES.values():
            params: dict[str, str | float] = {
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m",
            }
            session.get(FORECAST_URL, params=params, timeout=10).raise_for_status()

with stopwatch("Primes below 300,000"):
    count_primes(300_000)
```

One run printed (your numbers will be different):

```
Weather for 6 cities: 2.30 s on the clock, CPU busy for 0.28 s
Primes below 300,000: 0.86 s on the clock, CPU busy for 0.86 s
```

The weather took 2.3 seconds, but the CPU only worked for about a quarter of a second of it: the rest was waiting. That's I/O-bound. For the primes, the two numbers match: the CPU was busy every moment. That's CPU-bound.

### Threads the easy way: `ThreadPoolExecutor`

The standard library's `concurrent.futures` module has the friendliest way to use threads: an **executor**. Think of it as a head chef with a team of helper cooks (a **pool** of threads). You hand over jobs, and the head chef shares them out among the team.

Here's the weather program from chapter 47, with `requests`. The `get_temperature` function is exactly the same blocking one as before. Only the bottom part is new:

```python
"""Get the temperature in six cities with requests, in six threads."""

import time
from concurrent.futures import ThreadPoolExecutor

import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CITIES = {
    "Kathmandu": (27.70169, 85.3206),
    "Pokhara": (28.26689, 83.96851),
    "London": (51.50853, -0.12574),
    "Tokyo": (35.6895, 139.69171),
    "Sydney": (-33.86785, 151.20732),
    "New York": (40.71427, -74.00597),
}


def get_temperature(latitude: float, longitude: float) -> float:
    """Ask Open-Meteo for the temperature at one place right now."""
    params: dict[str, str | float] = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m",
    }
    response = requests.get(FORECAST_URL, params=params, timeout=10)
    response.raise_for_status()
    temperature: float = response.json()["current"]["temperature_2m"]
    return temperature


def temperature_for(city: str) -> float:
    latitude, longitude = CITIES[city]
    return get_temperature(latitude, longitude)


start = time.perf_counter()
with ThreadPoolExecutor(max_workers=6) as executor:
    temperatures = executor.map(temperature_for, CITIES)
    for city, temperature in zip(CITIES, temperatures):
        print(f"{city}: {temperature}°C")
print(f"Took {time.perf_counter() - start:.2f} seconds")
```

One run (live weather, so yours will be different):

```
Kathmandu: 22.1°C
Pokhara: 25.0°C
London: 14.9°C
Tokyo: 21.1°C
Sydney: 29.2°C
New York: 12.0°C
Took 1.01 seconds
```

The one-after-another version took 4.49 seconds a moment earlier. Here's what's going on:

- `ThreadPoolExecutor(max_workers=6)` makes a team of up to six threads. The `with` block ([chapter 33](../33-context-managers/notes.md)) waits for every job to finish at the end, and then shuts the team down.
- `executor.map(temperature_for, CITIES)` works like the built-in `map` from [chapter 34](../34-functional-tools/notes.md): it calls `temperature_for` once for each city. The difference is that the calls run **in the threads, at the same time**. Looping over a dictionary gives its keys, so each call gets a city name.
- Like `gather` in chapter 47, the results come back in the order you gave the inputs, not the order they finished. So `zip` can pair each city with its temperature.
- `temperature_for` is a small helper, because `map` hands each call one item. It looks up the city's coordinates and calls the old function.

Why does this work, if only one thread can run Python code at a time? Because almost all of each job is waiting for Open-Meteo, and **a thread that's waiting lets go of the GIL**. While one thread waits for its answer, the others can send their requests, read their answers, and so on. It's the cooks handing round the knife while their ovens do the real work.

**How many workers?** If you leave out `max_workers`, Python picks the number of CPU cores plus 4, up to a maximum of 32. For waiting on websites, more threads means more requests at the same time, so choose a number that's polite to the site ([chapter 41](../41-web-scraping/notes.md)): the same idea as the semaphore in chapter 47.

### `submit`, futures and `as_completed`

`map` is great when you want every result, in order. For more control, hand jobs over one at a time with `executor.submit(function, arguments...)`. It returns straight away with a **Future**: an object that stands for a result that isn't ready yet, like the ticket you get when you order at a busy counter. Later, `future.result()` waits for that job and gives you its result.

And here's the important part: **if the job raised an exception in its thread, `future.result()` raises that same exception** in your code, so you can catch it as usual. Let's ask about a place that can't exist:

```python
"""Weather with submit and as_completed: results as they arrive, errors included."""

from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CITIES = {
    "Kathmandu": (27.70169, 85.3206),
    "Pokhara": (28.26689, 83.96851),
    "Atlantis": (999.0, 0.0),  # no such place: Open-Meteo will say 400
    "London": (51.50853, -0.12574),
    "Tokyo": (35.6895, 139.69171),
}


def get_temperature(latitude: float, longitude: float) -> float:
    """Ask Open-Meteo for the temperature at one place right now."""
    params: dict[str, str | float] = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m",
    }
    response = requests.get(FORECAST_URL, params=params, timeout=10)
    response.raise_for_status()
    temperature: float = response.json()["current"]["temperature_2m"]
    return temperature


with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(get_temperature, lat, lon): city
        for city, (lat, lon) in CITIES.items()
    }
    for future in as_completed(futures):
        city = futures[future]
        try:
            print(f"{city}: {future.result()}°C")
        except requests.RequestException as e:
            print(f"{city}: failed ({e})")
```

One run printed:

```
London: 15.3°C
Kathmandu: 21.8°C
Tokyo: 21.4°C
Atlantis: failed (400 Client Error: Bad Request for url: https://api.open-meteo.com/v1/forecast?latitude=999.0&longitude=0.0&current=temperature_2m)
Pokhara: 25.1°C
```

- `futures` is a dictionary from each Future to its city, so you can find out which city a finished job belongs to.
- `as_completed(futures)` hands you the futures **in the order they finish**, as soon as each one is done. Run it twice, and the order will probably change. That's handy for showing progress, or for acting on the fastest answers first.
- The `HTTPError` happened inside a thread, but it came out of `future.result()`, where an ordinary `try`/`except` from [chapter 18](../18-error-handling/notes.md) caught it. The other four cities weren't affected.

### Threads by hand: `threading.Thread`

Underneath the executor is the `threading` module. You can make a thread yourself, `start()` it, and `join()` it, which means "wait here until that thread has finished":

```python
import threading
import time


def cook(dish: str, seconds: float) -> None:
    time.sleep(seconds)  # blocking is fine: this thread is the only one waiting
    print(f"{dish} ready")


pasta = threading.Thread(target=cook, args=("pasta", 2))
tea = threading.Thread(target=cook, args=("tea", 1))
start = time.perf_counter()
pasta.start()
tea.start()
print("Both are cooking")
pasta.join()  # wait here until the pasta thread has finished
tea.join()
print(f"Dinner is served after {time.perf_counter() - start:.2f} seconds")
```

```
Both are cooking
tea ready
pasta ready
Dinner is served after 2.00 seconds
```

Notice `target=cook`, not `target=cook()`. You're handing over the function itself, as a value ([chapter 32](../32-decorators/notes.md)), plus its arguments in a tuple. The thread calls it.

This works, but a plain `Thread` has awkward gaps. It can't hand back a return value. You make one thread per job, even for a thousand jobs. And if the function raises an exception, Python prints a traceback that starts `Exception in thread Thread-1 (cook):`, and then the main program **carries on as if nothing happened**, with no way to catch the error. An executor gives you return values, a sensible number of threads, and exceptions through `result()`. **Prefer executors**, and keep `threading.Thread` for the rare times you need a thread that lives for the whole program.

### Threads you've already met

You've been using threads for a while without writing any:

- **FastAPI** runs every plain `def` endpoint in a thread from its own pool ([chapter 43](../43-building-a-web-api-with-fastapi/notes.md)). That's why a blocking call like `time.sleep()` or `requests.get()` in a plain `def` endpoint only holds up one helper cook, not the whole server, as chapter 47's `/plain` endpoint showed.
- That's also why the expense API in [chapter 46](../46-project-expense-tracker-api/notes.md) needed `check_same_thread=False`. FastAPI might open the connection in one thread (in `get_db`) and use it in another (in your endpoint). sqlite3 refuses that by default, because two threads using one connection *at the same moment* can go badly wrong (you're about to see why). In that app, each request gets its own connection, and only one piece of code uses it at a time, so it's safe to switch the check off.
- `asyncio.to_thread()` in chapter 47 ran a blocking function in a thread, so the event loop didn't have to wait.

### Race conditions: when threads share data

Sharing memory is what makes threads handy, and also what makes them dangerous. Ten cashiers in Sandip's shop each pay 500 cents into the shop's account at the same moment. This uses a `BankAccount` like the one from [chapter 27](../27-classes-and-objects/notes.md), with balances in whole cents:

```python
import time
from concurrent.futures import ThreadPoolExecutor


class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance  # in cents

    def deposit(self, amount: int) -> None:
        current = self.balance  # 1. read the balance
        time.sleep(0.01)  # 2. a short pause, like checking with the bank
        self.balance = current + amount  # 3. write the new balance


till = BankAccount("Sandip's shop", 10_000)
with ThreadPoolExecutor(max_workers=10) as executor:
    for _ in range(10):
        executor.submit(till.deposit, 500)  # ten cashiers, one deposit each

print(f"Expected: {10_000 + 10 * 500} cents")
print(f"Balance:  {till.balance} cents")
```

```
Expected: 15000 cents
Balance:  10500 cents
```

Nine deposits vanished. (You might see a different wrong number, but it's almost certainly wrong.) Here's what happened, one step at a time:

| Moment | Cashier 1 | Cashier 2 | `till.balance` |
|---|---|---|---|
| 1 | reads 10000 | | 10000 |
| 2 | (pausing) | reads 10000 | 10000 |
| 3 | writes 10000 + 500 | (pausing) | 10500 |
| 4 | | writes 10000 + 500 | 10500 |

Cashier 2 read the balance before cashier 1 had written the new one, so cashier 2 worked from an out-of-date number, and its write wiped out cashier 1's deposit. With ten cashiers, all ten read 10000, and all ten wrote 10500.

This is a **race condition**: the result depends on which thread happens to get there first. The pause makes it happen every time here, but in real code, the "pause" is anything that lets another thread in between the read and the write: a database call, a log line, or Python simply switching threads. Without the pause, this little program happened to give the right answer every time on the computer used for these notes. That's the scary part: a race condition can hide through all your testing, and then lose real money on a busy day.

### The fix: `threading.Lock`

A **lock** is the "one at a time" sign on the pot. Only one thread can hold it. Any other thread that asks for it waits until it's free. Use it with `with`, so it's always released, even if something inside raises an exception:

```python
import threading
import time
from concurrent.futures import ThreadPoolExecutor


class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance  # in cents
        self._lock = threading.Lock()

    def deposit(self, amount: int) -> None:
        with self._lock:  # only one thread at a time past this point
            current = self.balance
            time.sleep(0.01)
            self.balance = current + amount


till = BankAccount("Sandip's shop", 10_000)
start = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as executor:
    for _ in range(10):
        executor.submit(till.deposit, 500)

print(f"Expected: {10_000 + 10 * 500} cents")
print(f"Balance:  {till.balance} cents")
print(f"Took {time.perf_counter() - start:.2f} seconds")
```

```
Expected: 15000 cents
Balance:  15000 cents
Took 0.11 seconds
```

Every cent is there. The read, the pause and the write now happen as one unbroken step, because no other thread can get past `with self._lock:` until this one leaves the block. The price: the ten deposits now take turns, so it took ten pauses (0.1 seconds) instead of one. So keep the locked part as small as you can: just the lines that read and change the shared data. (The underscore in `_lock` means "for this class's own use", the convention from chapter 27.)

### Passing work between threads: `queue.Queue`

Often the safest way for threads to work together is not to share data at all, but to **pass messages**. `queue.Queue` is a waiting line that's safe for threads: one thread `put()`s items in, another `get()`s them out in the same order, and the queue handles all the locking inside. If the queue is empty, `get()` simply waits until something arrives. Here, people send documents to an office printer, which prints them one at a time:

```python
import queue
import threading
import time

print_jobs: queue.Queue[str | None] = queue.Queue()


def printer() -> None:
    """Take jobs off the queue, one at a time, until told to stop."""
    while True:
        job = print_jobs.get()  # waits here until there's a job
        if job is None:  # None means "no more jobs: switch off"
            break
        time.sleep(0.5)  # printing takes a while
        print(f"Printed {job}")


worker = threading.Thread(target=printer)
worker.start()
for document in ["Maya's invoice", "Leo's ticket", "Zoe's report"]:
    print_jobs.put(document)
    print(f"Sent {document}")
print_jobs.put(None)
worker.join()
print("Printer switched off")
```

```
Sent Maya's invoice
Sent Leo's ticket
Sent Zoe's report
Printed Maya's invoice
Printed Leo's ticket
Printed Zoe's report
Printer switched off
```

Sending was instant. Nobody had to wait for the printer. And sending `None` at the end is a common trick to tell a worker "that's everything, you can stop".

### The GIL

Now the catch. The standard Python you download from python.org is called **CPython** (it's written in the C language). CPython has a **Global Interpreter Lock**: one big lock, and a thread must hold it to run Python code. So within one process, **only one thread runs Python code at any moment**, however many CPU cores your computer has.

**Why does it exist?** Python keeps track of every object for you: how many names and lists refer to it, so it can free the memory when nobody needs it any more ([chapter 16](../16-scope-and-mutability/notes.md) showed several names pointing at one list). If two threads updated that count at the same moment, you'd get exactly the race condition from the bank account, inside Python itself, and the program could crash. One big lock was a simple fix back in the 1990s, when almost every computer had a single CPU. It also keeps ordinary single-threaded programs fast, because they don't pay for lots of little locks everywhere.

**What does it mean for you?**

- **Waiting threads let go of the GIL.** Network calls, reading files, `time.sleep()` and database calls all release it while they wait. That's why threads work so well for I/O-bound jobs.
- **Working threads take turns.** CPU-bound threads keep passing the GIL back and forth, so only one of them is ever really working. No speed-up at all.

Here's the proof. This counts the primes below a million, split into four chunks: one by one, then in four threads, then in four **processes**:

```python
"""Count the primes below a million in four chunks, three different ways."""

import os
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def count_primes_between(start: int, stop: int) -> int:
    """Count the prime numbers from start up to (not including) stop, the slow way."""
    count = 0
    for number in range(max(start, 2), stop):
        if all(number % d != 0 for d in range(2, int(number**0.5) + 1)):
            count += 1
    return count


STARTS = [0, 250_000, 500_000, 750_000]
STOPS = [250_000, 500_000, 750_000, 1_000_000]


def main() -> None:
    print(f"This computer has {os.cpu_count()} CPU cores")

    start = time.perf_counter()
    total = sum(map(count_primes_between, STARTS, STOPS))
    print(f"One by one:  {total} primes in {time.perf_counter() - start:.2f} seconds")

    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as executor:
        total = sum(executor.map(count_primes_between, STARTS, STOPS))
    print(f"4 threads:   {total} primes in {time.perf_counter() - start:.2f} seconds")

    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        total = sum(executor.map(count_primes_between, STARTS, STOPS))
    print(f"4 processes: {total} primes in {time.perf_counter() - start:.2f} seconds")


if __name__ == "__main__":
    main()
```

Save it as `primes.py`. One run printed:

```
This computer has 14 CPU cores
One by one:  78498 primes in 3.65 seconds
4 threads:   78498 primes in 4.63 seconds
4 processes: 78498 primes in 1.98 seconds
```

(Your times will be different, and so might your number of cores. `os.cpu_count()` tells you how many yours has.) `map` with two lists calls `count_primes_between(STARTS[0], STOPS[0])`, then the second pair, and so on, both for the built-in `map` and for `executor.map`.

The four threads were **slower** than doing it one by one: the same amount of work, plus all the handing over of the GIL. The four processes were nearly twice as fast. Why not four times? The chunks aren't equal (checking big numbers takes longer, so the last chunk on its own takes about 1.6 seconds, and everyone waits for it), starting the processes takes time, and many computers slow their cores down a little when lots of them are busy at once.

### Processes: `ProcessPoolExecutor`

`ProcessPoolExecutor` has exactly the same `map`, `submit` and `with` as `ThreadPoolExecutor`. Swap the class name, and your jobs run in separate processes, each with its own Python and its own GIL. Real parallel chopping, in separate kitchens. But separate kitchens come with four rules.

**1. Protect the start of your program with `if __name__ == "__main__":`.** On Windows (and macOS), each worker process starts a fresh Python, which **imports your file** to find the function it should run. Remember from [chapter 19](../19-modules-and-standard-library/notes.md) that importing a file runs its top-level code? Without the guard, each worker would try to start its own pool of workers, and so on. Python stops that with an error (it's Common mistake 1 below). So put everything that starts the work inside `main()`, and call it under the guard, like `primes.py` does.

**2. Everything you send is pickled.** Processes don't share memory. To send a function's arguments to a worker, and the result back, Python turns them into bytes, sends the bytes, and rebuilds them on the other side. That's called **pickling** (as in preserving food to take it somewhere else), with the standard library's `pickle` module:

```python
import pickle

order = {"customer": "Maya", "items": ["latte", "croissant"], "total_cents": 625}
data = pickle.dumps(order)
print(data[:30])
print(len(data), "bytes")
copy = pickle.loads(data)
print(copy)
print(copy == order, copy is order)
```

```
b'\x80\x04\x95H\x00\x00\x00\x00\x00\x00\x00}\x94(\x8c\x08customer\x94\x8c\x04May'
83 bytes
{'customer': 'Maya', 'items': ['latte', 'croissant'], 'total_cents': 625}
True False
```

The copy is equal to the original, but it's a different object (`is` from chapter 16 says `False`). Numbers, strings, lists, dictionaries, dataclasses and ordinary functions all pickle fine. A function is pickled **by its name**: the worker gets a note saying "call `count_primes_between` from `primes.py`", and looks it up itself. So a `lambda` ([chapter 34](../34-functional-tools/notes.md)), which has no name to look up, can't be sent (Common mistake 4). Big data is slow to send, too: every argument is copied, so send small inputs (like the numbers `0` and `250_000`) and let the worker do the heavy lifting.

> **Watch out:** `pickle.loads()` can run code hidden in the bytes, so only ever unpickle data you made yourself. Never unpickle something a stranger sent you. [Chapter 52](../52-security-basics/notes.md) comes back to this.

**3. Global variables aren't shared.** Each process has its own copy of every variable. A change in a worker stays in the worker:

```python
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

orders: list[str] = []


def take_order(customer: str) -> None:
    orders.append(customer)


def main() -> None:
    customers = ["Maya", "Leo", "Zoe"]

    with ThreadPoolExecutor() as executor:
        executor.map(take_order, customers)
    print(f"After threads:   {len(orders)} orders in the list")

    orders.clear()
    with ProcessPoolExecutor() as executor:
        executor.map(take_order, customers)
    print(f"After processes: {len(orders)} orders in the list")


if __name__ == "__main__":
    main()
```

```
After threads:   3 orders in the list
After processes: 0 orders in the list
```

The threads all appended to the one shared list. The processes each appended to their **own copy** of `orders`, in their own kitchen, and those copies disappeared when the workers shut down. With processes, get results back the proper way: `return` them.

**4. Starting a process takes time.** A new process means a new Python starting up and importing your file. For tiny jobs, that costs far more than it saves:

```python
import time
from concurrent.futures import ProcessPoolExecutor


def add_tax(cents: int) -> int:
    return cents * 113 // 100


def main() -> None:
    prices = list(range(100, 1100))  # 1,000 prices in cents

    start = time.perf_counter()
    with_tax = [add_tax(cents) for cents in prices]
    print(f"In this process: {time.perf_counter() - start:.4f} seconds")

    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        with_tax = list(executor.map(add_tax, prices))
    print(f"4 processes:     {time.perf_counter() - start:.4f} seconds")
    print(with_tax[:3])


if __name__ == "__main__":
    main()
```

```
In this process: 0.0001 seconds
4 processes:     0.5060 seconds
[113, 114, 115]
```

Five thousand times slower! (`cents * 113 // 100` adds 13% tax in whole cents, with `//` from [chapter 04](../04-operators/notes.md).) Processes pay off for jobs that take a good fraction of a second each, or more. For quick little jobs, just use a loop.

### Free-threaded Python: the GIL is becoming optional

For years, people have asked for a Python without the GIL, and it's finally happening, carefully:

- **Python 3.13** (2024) added an *experimental* **free-threaded** build: a separate version of Python, often called "3.13t", with the GIL switched off. Threads in it really can run Python code on several cores at once.
- **Python 3.14** (2025) made the free-threaded build *officially supported*, but still optional and not the default. (The plan was agreed in a proposal called PEP 779.)
- **Python 3.15** came out on 9 October 2026, a few days before these notes were written. Its documentation still describes the free-threaded build as a separate, optional build, and the normal download still has the GIL.

So for now, and for this course: the Python you have has a GIL. You can check:

```python
import sys
import sysconfig

print(sys.version)
print(sysconfig.get_config_var("Py_GIL_DISABLED"))  # 1 on a free-threaded build
print(sys._is_gil_enabled())  # is the GIL switched on right now?
```

On the Python 3.13 used for these notes:

```
3.13.15 (tags/v3.13.15:4061bc4, Aug  5 2026, 13:05:39) [MSC v.1944 64 bit (AMD64)]
0
True
```

(The leading underscore in `_is_gil_enabled` means it's meant for curious people and experts, not everyday code. It needs Python 3.13 or newer.) Honest notes: the free-threaded build couldn't be tried for these notes. Its single-threaded code runs a little slower, some packages don't support it yet, and the details are changing from one version to the next. If you're curious, the official installers for Windows and macOS let you add it as an option, and python.org's "Python support for free threading" page has the current state. Even without a GIL, the race condition and the lock above work exactly the same. Free threading makes locks *more* important, not less.

### Which tool when?

| | async (chapter 47) | Threads | Processes |
|---|---|---|---|
| Best for | Lots of waiting: thousands of web requests, a busy web server | Some waiting, with ordinary blocking libraries like `requests` and `sqlite3` | Heavy calculations (CPU-bound) |
| How many at once | Thousands, cheaply | Dozens, maybe a few hundred | About one per CPU core |
| Shares memory? | Yes (it's all one thread) | Yes: protect shared data with a lock | No: arguments and results are pickled |
| Needs | Async libraries (httpx, not requests), `async`/`await` everywhere | Nothing special | `if __name__ == "__main__":`, picklable functions and data |
| Kitchen | One cook juggling pots | Several cooks, one knife | Separate kitchens |
| Standard library tool | `asyncio` | `ThreadPoolExecutor` | `ProcessPoolExecutor` |

A few rules of thumb:

- First check whether your program is waiting or working (the stopwatch above).
- Waiting, with blocking code you already have: threads, with `ThreadPoolExecutor`. Usually the smallest change.
- Waiting, starting fresh, or a huge number of connections: async.
- Working: processes, with `ProcessPoolExecutor`. And look at [chapter 49](../49-performance/notes.md) first: a better algorithm, or a library like NumPy ([chapter 44](../44-working-with-data/notes.md) used pandas, which is built on it), often beats adding cores.

## Common mistakes

**1. No `if __name__ == "__main__":` guard with processes**

```python
from concurrent.futures import ProcessPoolExecutor


def square(number: int) -> int:
    return number * number


print("Starting...")
with ProcessPoolExecutor(max_workers=2) as executor:
    print(list(executor.map(square, [1, 2, 3])))
```

On Windows, you get a screenful of errors. `Starting...` is printed three times (once by your program and once by each worker, as it imports the file), and the workers each say (shortened):

```
RuntimeError:
        An attempt has been made to start a new process before the
        current process has finished its bootstrapping phase.

        This probably means that you are not using fork to start your
        child processes and you have forgotten to use the proper idiom
        in the main module:

            if __name__ == '__main__':
                freeze_support()
                ...
```

and the main program ends with:

```
concurrent.futures.process.BrokenProcessPool: A process in the process pool was terminated abruptly while the future was running or pending.
```

The message even tells you the fix. Put the work in `main()`, and call it under `if __name__ == "__main__":`. (The `freeze_support()` line is only for turning your program into a `.exe` file, and you can leave it out.) On Linux, processes have traditionally been started a different way, so the same code may seem to work there. Write the guard anyway: your program should work everywhere.

**2. Expecting threads to speed up CPU work**

You saw it in `primes.py`: four threads took 4.63 seconds, against 3.65 for one by one. Threads only help when the work is waiting. For calculations, use processes, and measure before and after.

**3. Sharing data between threads without a lock**

The bank account lost 4,500 cents, without a single error message. The rule: if more than one thread **changes** the same data, every read-and-change of that data goes inside a `with lock:`. Even better, don't share: give each job its own data, and `return` the results (an executor collects them for you), or pass messages with a `queue.Queue`. And remember that "it worked when I tested it" proves nothing with threads.

**4. Sending something that can't be pickled to a process**

```python
def main() -> None:
    prices = [1299, 450, 799]
    with ProcessPoolExecutor() as executor:
        with_tax = list(executor.map(lambda cents: cents * 113 // 100, prices))
    print(with_tax)
```

```
AttributeError: Can't get local object 'main.<locals>.<lambda>'
```

The worker process has to look the function up by name, and a lambda written inside `main` can't be found from outside. (The same goes for a function defined inside another function.) Fix: write a normal `def add_tax(cents: int) -> int:` at the top level of the file. Open files, database connections and locks can't be pickled either, so open those inside the worker instead of passing them in.

**5. Far too many workers**

More workers isn't always faster. Here's `primes.py`'s function, with the work split into 40 smaller chunks, and three different team sizes:

```python
import os
import time
from concurrent.futures import ProcessPoolExecutor

from primes import count_primes_between


def main() -> None:
    starts = list(range(0, 1_000_000, 25_000))  # 40 small chunks
    stops = [start + 25_000 for start in starts]
    for workers in [4, os.cpu_count() or 1, 60]:
        start = time.perf_counter()
        with ProcessPoolExecutor(max_workers=workers) as executor:
            total = sum(executor.map(count_primes_between, starts, stops))
        seconds = time.perf_counter() - start
        print(f"{workers} processes: {total} primes in {seconds:.2f} s")


if __name__ == "__main__":
    main()
```

```
4 processes: 78498 primes in 1.30 s
14 processes: 78498 primes in 1.08 s
60 processes: 78498 primes in 1.60 s
```

Sixty processes on fourteen cores is like sixty cooks in fourteen kitchens: they spend their time starting up and waiting for a turn. For processes, use about one per core (which is what you get if you leave out `max_workers`). On Windows, more than 61 isn't even allowed: `ValueError: max_workers must be <= 61`. For threads that talk to a website, a thousand workers means a thousand requests at once: that's how you get blocked ([chapter 41](../41-web-scraping/notes.md)). Pick a small, polite number.

**6. Jumbled `print` output**

```python
from concurrent.futures import ThreadPoolExecutor


def report(cashier: str) -> None:
    for sale in range(1, 4):
        print(cashier, "sold item", sale)


with ThreadPoolExecutor(max_workers=4) as executor:
    executor.map(report, ["Maya", "Leo", "Zoe", "Sam"])
```

Sometimes this prints twelve tidy lines. Other times you get a mess like this (one run with `python -u`, which writes out each piece of text the moment it's printed):

```
Maya sold itemLeo  Zoe1sold item  1
sold item
SamMaya sold item 2
Maya sold item 3
  Leosold item 1
```

(and so on). One `print()` writes several separate pieces (each word, the spaces, the newline at the end), and another thread can sneak in between any two of them. Even a single f-string isn't safe, because the newline is written separately. Two fixes: return the results and print them from the main thread, or use `logging` ([chapter 37](../37-debugging-and-logging/notes.md)), which writes each message as one whole line. Logging can even show which thread wrote what, with `%(threadName)s` in the format:

```python
import logging
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO, format="%(threadName)s: %(message)s")
logger = logging.getLogger(__name__)


def report(cashier: str) -> None:
    for sale in range(1, 4):
        logger.info("%s sold item %s", cashier, sale)


with ThreadPoolExecutor(max_workers=4) as executor:
    executor.map(report, ["Maya", "Leo", "Zoe", "Sam"])
```

```
ThreadPoolExecutor-0_0: Maya sold item 1
ThreadPoolExecutor-0_0: Maya sold item 2
ThreadPoolExecutor-0_1: Leo sold item 1
ThreadPoolExecutor-0_0: Maya sold item 3
ThreadPoolExecutor-0_1: Leo sold item 2
ThreadPoolExecutor-0_2: Zoe sold item 1
ThreadPoolExecutor-0_0: Sam sold item 1
...
```

The lines still arrive in a mixed-up order (that's threads for you), but each one is whole. Notice that thread `0_0` did Maya's report and then Sam's: a pool reuses its threads.

**7. Changing the working directory from threads**

[Chapter 33](../33-context-managers/notes.md) warned about this one. `contextlib.chdir()` changes the working directory for the **whole program**, and every thread shares it:

```python
import contextlib
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path.cwd()


def save_report(name: str) -> None:
    folder = HERE / name
    folder.mkdir(exist_ok=True)
    with contextlib.chdir(folder):
        time.sleep(0.1)  # pretend to work out the report
        Path("report.txt").write_text(f"Sales report for {name}\n")


with ThreadPoolExecutor() as executor:
    list(executor.map(save_report, ["maya", "leo"]))

for name in ["maya", "leo"]:
    report = HERE / name / "report.txt"
    if report.exists():
        print(f"{name}/report.txt says: {report.read_text().strip()}")
    else:
        print(f"{name}/report.txt is missing!")
```

```
maya/report.txt is missing!
leo/report.txt says: Sales report for maya
```

Maya's thread moved into `maya`, then Leo's thread moved the whole program into `leo`. Both reports were written into `leo`, and Maya's (written last) replaced Leo's. Nothing crashed. Fix: don't change directory in threaded code. Build full paths instead, like `(folder / "report.txt").write_text(...)` ([chapter 20](../20-files-and-folders/notes.md)).

## Quick recap

- **I/O-bound** work waits (network, disk, database). **CPU-bound** work calculates. Compare `perf_counter()` with `process_time()` to tell which you have.
- **Threads** share one process's memory. `ThreadPoolExecutor` runs ordinary blocking code (like `requests`) at the same time: `map` for results in order, `submit` plus `as_completed` for results as they finish. Exceptions come back through `future.result()`.
- Threads that change shared data need a **lock** (`with lock:`), or a race condition will quietly give wrong answers. A `queue.Queue` passes work between threads safely.
- The **GIL** lets only one thread run Python code at a time. Waiting threads release it, so threads help with waiting, but never with calculating.
- **Processes** (`ProcessPoolExecutor`) really run in parallel, one per CPU core. They need `if __name__ == "__main__":`, everything sent is pickled (no lambdas), globals aren't shared, and starting them takes time.
- Free-threaded Python (no GIL) is officially supported since 3.14, but it's still an optional, separate build.
- Waiting: async or threads. Working: processes. Not sure: measure first.

---

**Next:** try the [exercises](exercises.md), then move on to [49 Performance](../49-performance/notes.md).
