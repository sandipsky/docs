# 47 Async Python

## What is it?

**Async** programming (short for **asynchronous**, "not happening in step") is a way for one program to juggle many slow jobs at once. While one job waits for something, like a website's answer, the program gets on with another job instead of sitting idle.

Python builds this into the language with two keywords, `async` and `await`, and a standard-library module called **asyncio** that runs it all. FastAPI, which you used in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md) and [chapter 46](../46-project-expense-tracker-api/notes.md), is built on top of it.

## Why does it matter?

Most programs spend most of their time **waiting**: for a website to answer, for a file to arrive from the disk, for a database to reply. Here's the weather tool idea from [chapter 40](../40-working-with-apis/notes.md), getting the temperature in six cities, one after another:

```python
"""Get the temperature in six cities, one after another, with requests."""

import time

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


start = time.perf_counter()
for city, (latitude, longitude) in CITIES.items():
    print(f"{city}: {get_temperature(latitude, longitude)}°C")
print(f"Took {time.perf_counter() - start:.2f} seconds")
```

(The coordinates came from Open-Meteo's geocoding search, like in chapter 40. Saving them in a dictionary skips that step.) One run printed this. It's live weather and a real network, so your numbers and your time will be different:

```
Kathmandu: 21.5°C
Pokhara: 25.1°C
London: 14.9°C
Tokyo: 21.8°C
Sydney: 29.8°C
New York: 12.0°C
Took 4.64 seconds
```

About three quarters of a second per city. And in each of those, your computer did almost nothing: the request travelled to Open-Meteo, their servers looked up the weather, and the answer travelled back. Your program just waited. Then it sent the next request, and waited again.

The six requests don't depend on each other. There's no reason to wait for Kathmandu before asking about London. A hundred cities would take more than a minute this way. By the end of this chapter, the same six cities take about one second.

## Real-world example

Think of a good cook making dinner on her own. She puts the pasta water on to boil. She doesn't stand there staring at the pot: while it heats, she puts the garlic bread in the oven, and while *that* bakes, she makes the tea. When the oven timer rings, she takes the bread out. One person, three dishes on the go, and she's never standing still waiting for something she could ignore.

| In the kitchen | In async Python |
|---|---|
| The cook | The **event loop**: one worker that runs everything |
| A recipe, like "boil the pasta" | A **coroutine**: a function written with `async def` |
| "Put the water on, and come back when it boils" | `await`: pause this job here, and let the cook do something else |
| The dishes on the go | **Tasks**: coroutines the event loop is juggling |
| Starting all the dishes at once | `asyncio.gather()` or a `TaskGroup` |
| Standing and staring at the pot | A **blocking** call, like `time.sleep()` or `requests.get()` |
| Chopping onions | Real work for the cook's own hands (the CPU) |

That last row matters. Async helps when jobs are mostly **waiting** (water boiling, an oven baking, a website answering). It doesn't help with chopping. There's still only one cook, and she can only chop one onion at a time.

**Concurrency or parallelism?** These two words sound alike, but they're different tricks:

- **Concurrency** is one cook juggling several dishes, switching between them while each one waits. Only one thing is really happening at any moment. That's async.
- **Parallelism** is several cooks, really working at the same moment. That's [chapter 48](../48-threads-processes-and-the-gil/notes.md).

## How it works

### Your first coroutine

asyncio is part of the standard library, so there's nothing to install yet. Make a folder for this chapter's practice, for example `kitchen`, and save each example there as its own `.py` file.

Put `async` in front of `def`, and you get a **coroutine function**:

```python
import asyncio


async def make_tea() -> str:
    print("Kettle on")
    await asyncio.sleep(3)
    print("Tea is ready")
    return "tea"


coro = make_tea()
print(coro)
print(type(coro))
result = asyncio.run(coro)
print(result)
```

You'll see (your number after `at` will be different):

```
<coroutine object make_tea at 0x000001BC3A0FA680>
<class 'coroutine'>
Kettle on
Tea is ready
tea
```

Look at the first line. **Calling `make_tea()` didn't run its body.** "Kettle on" wasn't printed. Instead, you got back a **coroutine object**: the recipe, written down and ready to cook, but not started. That's exactly how generators behaved in [chapter 31](../31-iterators-and-generators/notes.md): calling a generator function gave you a generator object, and nothing ran until you asked for the first value.

`asyncio.run(coro)` is what actually cooks it. It runs the coroutine from start to finish, and gives back whatever it returned: here, `"tea"`.

Normally you don't keep the coroutine in a variable. Every async program has the same shape: an `async def main()` that does the work, and one line at the bottom, `asyncio.run(main())`, to start it.

### `await`: wait here, and let the cook do something else

`await` means "pause **this** coroutine until the thing after me is finished". Coroutines pause, just like a generator paused at `yield`, and carry on later from exactly the same spot, with all their variables in place.

`await asyncio.sleep(3)` pauses for three seconds. It looks like `time.sleep(3)` from [chapter 19](../19-modules-and-standard-library/notes.md), but there's a big difference:

- `time.sleep(3)`: the cook stands still for three seconds. Nothing else in the program can happen.
- `await asyncio.sleep(3)`: this dish waits three seconds, but the cook is free to work on other dishes in the meantime.

With only one dish, you can't see the difference. You'll see it in a moment.

Two rules about `await`:

- You can only use it **inside an `async def`**. Anywhere else, it's a `SyntaxError` (see Common mistakes).
- You can only await things that are built for it, called **awaitables**: coroutines, tasks (soon), and things like `asyncio.sleep()`.

> **Tip:** In this chapter, `await asyncio.sleep(...)` stands in for "waiting for something slow", like a website or a database. It's predictable, so the timings in the examples come out the same every time. Real network examples come later.

### The event loop

`asyncio.run()` starts the **event loop**: the cook. It keeps a list of jobs, and follows simple rules:

1. Take a job that's ready, and run it.
2. Keep running it until it reaches an `await` on something that isn't ready yet (a timer, a reply from a website).
3. Put that job aside, and go back to step 1 with another job.
4. When the thing a job was waiting for is ready (the timer rings, the reply arrives), that job becomes ready again.

When there are no jobs left, `asyncio.run()` closes the loop and hands you the result.

Notice that the cook only switches jobs **at an `await`**. Between two `await`s, a coroutine has the cook all to itself. That's why it's called **cooperative**: each job has to politely say "I'm waiting now, go and do something else". A job that never awaits never lets go.

> **Tip:** If you did the JavaScript course, this is the same idea as the event loop in [JavaScript chapter 40](../../JavaScript/40-event-loop/notes.md), and `async`/`await` work much like they do in [JavaScript chapter 32](../../JavaScript/32-async-await/notes.md). The biggest difference: a browser or Node starts the event loop for you, but in Python you start it yourself, with `asyncio.run()`.

### One after another is still one after another

Here's dinner, with a `cook` coroutine that takes a dish and how long it needs (one second stands in for one "minute"):

```python
import asyncio
import time


async def cook(dish: str, seconds: int) -> str:
    print(f"Start {dish}")
    await asyncio.sleep(seconds)  # wait, but let the cook do other things
    print(f"{dish} ready")
    return dish


async def main() -> None:
    await cook("pasta", 3)
    await cook("garlic bread", 2)
    await cook("tea", 1)


start = time.perf_counter()
asyncio.run(main())
print(f"Dinner took {time.perf_counter() - start:.2f} seconds")
```

```
Start pasta
pasta ready
Start garlic bread
garlic bread ready
Start tea
tea ready
Dinner took 6.03 seconds
```

Six seconds: 3 + 2 + 1. No faster than plain functions with `time.sleep()`. Why? `await cook("pasta", 3)` means "wait for the pasta to be finished, *then* carry on". `main` doesn't even start the garlic bread until the pasta is done. The cook was free during each wait, but nobody gave her anything else to do.

`await` on its own doesn't make anything happen at the same time. To do that, you have to hand the cook several jobs at once.

### Doing things together: `asyncio.gather`

`asyncio.gather()` takes several awaitables, runs them all at the same time, and waits until every one is finished. Keep `cook` and the three timing lines at the bottom exactly as they were, and change only `main`:

```python
async def main() -> None:
    dishes = await asyncio.gather(
        cook("pasta", 3),
        cook("garlic bread", 2),
        cook("tea", 1),
    )
    print(dishes)
```

```
Start pasta
Start garlic bread
Start tea
tea ready
garlic bread ready
pasta ready
['pasta', 'garlic bread', 'tea']
Dinner took 3.02 seconds
```

Three seconds instead of six: as long as the slowest dish, not the total of all three. Read the output from the top:

- All three dishes started straight away. Each one ran until its `await asyncio.sleep(...)`, and then the cook moved on to the next.
- They finished in order of speed: the tea first, the pasta last.
- But the list of results is in the order **you passed them in**, not the order they finished. So `dishes[0]` is always the pasta's result. That makes `gather` easy to use: results line up with what you asked for.

### Tasks: start now, collect later

Sometimes you want to start something, do other things, and only pick up the result later. `asyncio.create_task()` turns a coroutine into a **task**: a job that's on the event loop's list, and will run whenever the cook is free. It's putting the pot on the stove. Same `cook`, new `main`:

```python
async def main() -> None:
    pasta = asyncio.create_task(cook("pasta", 3))  # on the stove
    bread = asyncio.create_task(cook("garlic bread", 2))  # in the oven
    print("Both are on. Setting the table...")
    await asyncio.sleep(1)
    print("Table set")
    print(await pasta, "and", await bread)
```

```
Both are on. Setting the table...
Start pasta
Start garlic bread
Table set
garlic bread ready
pasta ready
pasta and garlic bread
Dinner took 3.00 seconds
```

Notice when "Start pasta" appears: *after* "Both are on". Creating a task doesn't run it on the spot. It goes on the list, and starts the first time `main` lets go of the cook, at `await asyncio.sleep(1)`. While `main` set the table, both dishes were cooking. `await pasta` then waits for that task to finish and gives you its result.

### `asyncio.TaskGroup`: the modern way

Python 3.11 added a tidier way to run a bunch of tasks together, and it's the one to prefer in new code: a **TaskGroup**. Same `cook` again:

```python
async def main() -> None:
    async with asyncio.TaskGroup() as tg:
        pasta = tg.create_task(cook("pasta", 3))
        bread = tg.create_task(cook("garlic bread", 2))
        tea = tg.create_task(cook("tea", 1))
        print("All three are on")
    # Down here, every task in the group has finished.
    print(pasta.result(), bread.result(), tea.result())
```

```
All three are on
Start pasta
Start garlic bread
Start tea
tea ready
garlic bread ready
pasta ready
pasta garlic bread tea
Dinner took 3.01 seconds
```

`async with` is a `with` block ([chapter 33](../33-context-managers/notes.md)) for async code: you'll see more of it later in this chapter. The rule of a TaskGroup is simple: **the block doesn't end until every task in it has finished.** So after the block, `.result()` gives each task's result, with no `await` needed.

Why prefer it? A TaskGroup never forgets a task (you'll see in Common mistakes how easily that happens with `create_task`), and if one task fails, it cleans up the others for you (you'll see that soon too).

| Tool | Use it when |
|---|---|
| `await asyncio.gather(a(), b(), c())` | You have a list of jobs and want all their results back, in order |
| `async with asyncio.TaskGroup() as tg:` | Most new code: start several tasks, and be sure they're all done (or all cleaned up) when the block ends |
| `asyncio.create_task(...)` on its own | You want to start something now, do other work, and await it later in the same function |

### Timeouts: `asyncio.timeout`

A website that never answers would make your program wait forever. In chapter 40, you passed `timeout=10` to `requests.get()`. Async code has a general version that works on anything you await: `asyncio.timeout()` (Python 3.11 or newer).

```python
import asyncio


async def cook(dish: str, seconds: int) -> str:
    print(f"Start {dish}")
    await asyncio.sleep(seconds)
    print(f"{dish} ready")
    return dish


async def main() -> None:
    try:
        async with asyncio.timeout(2):
            await cook("roast chicken", 5)
    except TimeoutError:
        print("Too slow! Ordering pizza instead.")


asyncio.run(main())
```

```
Start roast chicken
Too slow! Ordering pizza instead.
```

After two seconds, the chicken was **cancelled** (stopped at its `await`, so "roast chicken ready" never printed), and the block raised `TimeoutError`, which you catch like any exception from [chapter 18](../18-error-handling/notes.md). In older code, you'll see the same idea written as `await asyncio.wait_for(cook("roast chicken", 5), timeout=2)`.

### Real example: the weather in six cities at once

Time for the real thing. `requests` can't take part in async code: `requests.get()` blocks, like `time.sleep()`. You need an HTTP library that knows how to `await`. Chapter 40 mentioned one: **httpx**. Install it in this chapter's virtual environment ([chapter 23](../23-pip-and-virtual-environments/notes.md)):

```
python -m pip install httpx
```

These notes were written with httpx 0.28. Its `AsyncClient` is the async version of a `requests.Session`: it keeps connections open, and its `get()` is a coroutine you await. Here's the program from the start of the chapter, made async:

```python
"""Get the temperature in six cities at once, with httpx and asyncio."""

import asyncio
import time

import httpx

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CITIES = {
    "Kathmandu": (27.70169, 85.3206),
    "Pokhara": (28.26689, 83.96851),
    "London": (51.50853, -0.12574),
    "Tokyo": (35.6895, 139.69171),
    "Sydney": (-33.86785, 151.20732),
    "New York": (40.71427, -74.00597),
}


async def get_temperature(
    client: httpx.AsyncClient, latitude: float, longitude: float
) -> float:
    """Ask Open-Meteo for the temperature at one place right now."""
    params: dict[str, str | float] = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m",
    }
    response = await client.get(FORECAST_URL, params=params)
    response.raise_for_status()
    temperature: float = response.json()["current"]["temperature_2m"]
    return temperature


async def main() -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        async with asyncio.TaskGroup() as tg:
            tasks = {
                city: tg.create_task(get_temperature(client, lat, lon))
                for city, (lat, lon) in CITIES.items()
            }
    for city, task in tasks.items():
        print(f"{city}: {task.result()}°C")


start = time.perf_counter()
asyncio.run(main())
print(f"Took {time.perf_counter() - start:.2f} seconds")
```

One run, a minute after the slow version:

```
Kathmandu: 21.5°C
Pokhara: 25.1°C
London: 14.9°C
Tokyo: 21.8°C
Sydney: 29.8°C
New York: 12.0°C
Took 1.00 seconds
```

The same answers, in about a fifth of the time. (Your times will be different, but the async version should win easily.) What changed:

- `get_temperature` is an `async def`, and `await client.get(...)` is where it hands the cook back while the answer is on its way. Everything else in it is the same as before.
- `async with httpx.AsyncClient(timeout=10) as client:` opens one client for all the requests, and closes it at the end. Unlike requests, httpx gives up after 5 seconds by default. `timeout=10` matches what you used in chapter 40.
- The TaskGroup starts all six requests at once. The dictionary comprehension ([chapter 15](../15-comprehensions/notes.md)) remembers which task belongs to which city.
- The dictionary keeps the cities in the order you wrote them, so the output is in that order too, whichever answer arrived first.

> **Tip:** You may also come across **httpx2**, a newer continuation of httpx, now looked after by the team behind Pydantic. It's the package chapter 43 installed for `TestClient`. For the code in this chapter, it works the same way: `import httpx2` and `httpx2.AsyncClient`. Either is fine for learning.

### Being polite: `asyncio.Semaphore`

Async makes it easy to start a thousand requests at once. That's exactly the kind of thing [chapter 41](../41-web-scraping/notes.md) asked you not to do to someone's website. A good habit is to cap how many requests are in flight at the same time.

An `asyncio.Semaphore` does that. Think of a small restaurant with three tables. A fourth group waits at the door until a table is free. `Semaphore(3)` is a restaurant with three tables, and `async with limit:` is "wait for a table, and give it back when you leave".

```python
import asyncio
import time

START = time.perf_counter()


def seconds_so_far() -> str:
    return f"{time.perf_counter() - START:.0f}s"


async def download(page: int, limit: asyncio.Semaphore) -> None:
    async with limit:  # wait here until one of the 3 places is free
        print(f"{seconds_so_far()}: start page {page}")
        await asyncio.sleep(1)  # pretend to download it


async def main() -> None:
    limit = asyncio.Semaphore(3)  # at most 3 downloads at once
    async with asyncio.TaskGroup() as tg:
        for page in range(1, 8):
            tg.create_task(download(page, limit))
    print(f"{seconds_so_far()}: all done")


asyncio.run(main())
```

```
0s: start page 1
0s: start page 2
0s: start page 3
1s: start page 4
1s: start page 5
1s: start page 6
2s: start page 7
3s: all done
```

Seven pages, three at a time: three batches, three seconds. In the weather program, you'd make one `asyncio.Semaphore(3)` in `main`, pass it to `get_temperature`, and wrap the request in it:

```python
    async with limit:
        response = await client.get(FORECAST_URL, params=params)
```

With six cities, that's two batches of three. On the computer used for these notes, the polite version usually took a few tenths of a second longer: a tiny price for being a good neighbour. Pick the number from the site's rules, if it has any. For a small site, keep it low.

### When something goes wrong

Say you're comparing the price of a book at three shops' websites, and one of them isn't answering:

```python
import asyncio


async def get_price(shop: str, seconds: float) -> int:
    """Pretend to ask a shop's website for the price of a book, in cents."""
    await asyncio.sleep(seconds)
    if shop == "Leo's Books":
        raise ConnectionError(f"{shop} isn't answering")
    print(f"Got a price from {shop}")
    return 1299


async def main() -> None:
    try:
        prices = await asyncio.gather(
            get_price("Maya's Books", 2),
            get_price("Leo's Books", 1),
            get_price("Zoe's Books", 2),
        )
        print(prices)
    except ConnectionError as e:
        print(f"Problem: {e}")


asyncio.run(main())
```

```
Problem: Leo's Books isn't answering
```

With `gather`, the first exception comes straight out of the `await`, after one second. You get the error, but you lose the two prices that were on their way. Often you'd rather have the good results *and* the errors. Add `return_exceptions=True`, and `gather` puts each exception into the results list, in its place, instead of raising it:

```python
async def main() -> None:
    results = await asyncio.gather(
        get_price("Maya's Books", 2),
        get_price("Leo's Books", 1),
        get_price("Zoe's Books", 2),
        return_exceptions=True,
    )
    print(results)
```

```
Got a price from Maya's Books
Got a price from Zoe's Books
[1299, ConnectionError("Leo's Books isn't answering"), 1299]
```

Now it's your job to check each result with `isinstance(result, Exception)` before you use it.

**A TaskGroup is stricter.** It works on the idea "all or nothing": if one task fails, it **cancels** all the others, waits for them to stop, and then raises. Here's the same thing with a TaskGroup and no `try`:

```python
async def main() -> None:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(get_price("Maya's Books", 2))
        tg.create_task(get_price("Leo's Books", 1))
        tg.create_task(get_price("Zoe's Books", 2))
    print("This line never runs")
```

The traceback looks different from the ones in chapter 18 (shortened here, and the paths on your computer will be different):

```
  + Exception Group Traceback (most recent call last):
  |   File "C:\code\kitchen\prices.py", line 21, in <module>
  |     asyncio.run(main())
  |     ~~~~~~~~~~~^^^^^^^^
  ...
  | ExceptionGroup: unhandled errors in a TaskGroup (1 sub-exception)
  +-+---------------- 1 ----------------
    | Traceback (most recent call last):
    |   File "C:\code\kitchen\prices.py", line 8, in get_price
    |     raise ConnectionError(f"{shop} isn't answering")
    | ConnectionError: Leo's Books isn't answering
    +------------------------------------
```

Two things happened. First, "Got a price from Maya's Books" never printed: when Leo's task failed after one second, the group cancelled Maya's and Zoe's tasks. Second, the error is an **ExceptionGroup**: a bundle that can hold several exceptions at once, because several tasks might fail at the same moment. The real error is inside the box, numbered `1`.

To catch exceptions from inside a group, Python 3.11 added **`except*`** (say "except star"). It means "if the group contains any `ConnectionError`s, handle those". `group.exceptions` is a tuple of the matching ones:

```python
async def main() -> None:
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(get_price("Maya's Books", 2))
            tg.create_task(get_price("Leo's Books", 1))
            tg.create_task(get_price("Tom's Books", 1))
    except* ConnectionError as group:
        for error in group.exceptions:
            print(f"Problem: {error}")
```

With Tom's shop broken too (change the `if` in `get_price` to `if shop in ("Leo's Books", "Tom's Books"):`), you'll see:

```
Problem: Leo's Books isn't answering
Problem: Tom's Books isn't answering
```

So which should you use? If one failure means the whole job is pointless (you need every piece to build a report), a TaskGroup is right. If you want "as many results as possible", use `gather(..., return_exceptions=True)`, or catch the error inside each coroutine and return something like `None`.

### Blocking code in async programs: `asyncio.to_thread`

Not every library has an async version. Maybe you have a working function built on `requests`, or a package that only does things the blocking way. You can still run several of them at once from async code, with `asyncio.to_thread()`. It runs an ordinary function in a separate helper, called a **thread**, and gives you something you can await:

```python
async def main() -> None:
    jobs = [
        asyncio.to_thread(get_temperature, lat, lon) for lat, lon in CITIES.values()
    ]
    temperatures = await asyncio.gather(*jobs)
    for city, temperature in zip(CITIES, temperatures):
        print(f"{city}: {temperature}°C")
```

Here, `get_temperature` is the **blocking, `requests` version** from the start of the chapter, unchanged. Notice you pass the function and its arguments separately (`get_temperature, lat, lon`), not `get_temperature(lat, lon)`: `to_thread` calls it for you, over in the thread. `*jobs` unpacks the list into separate arguments for `gather` ([chapter 32](../32-decorators/notes.md)). One run took 1.18 seconds, almost as fast as httpx.

Threads are like extra helpers in the kitchen, and they have their own chapter next: [chapter 48](../48-threads-processes-and-the-gil/notes.md). For now, remember: **if you must call blocking code from async code, wrap it in `asyncio.to_thread()`.**

### `async with` and `async for`

You've already used `async with` four times: with `httpx.AsyncClient`, `TaskGroup`, `Semaphore` and `timeout`. It's a `with` block whose setup and clean-up might need to wait. Opening a client is quick, but closing it properly means politely hanging up each open connection, which involves the network. So the clean-up has to be awaited, and that needs `async with`. (Under the hood, the object has `__aenter__` and `__aexit__` methods, the async versions of the `__enter__` and `__exit__` from chapter 33.)

`async for` is the same idea for loops: it loops over something where getting the next item might need waiting. The easy way to make one is an **async generator**: an `async def` with `yield` inside. Here's chapter 31's ticket machine, now with a slow printer:

```python
import asyncio
from collections.abc import AsyncIterator


async def ticket_machine(count: int) -> AsyncIterator[int]:
    for number in range(1, count + 1):
        await asyncio.sleep(0.5)  # printing a ticket takes a moment
        yield number


async def main() -> None:
    async for ticket in ticket_machine(3):
        print(f"Now serving number {ticket}")


asyncio.run(main())
```

```
Now serving number 1
Now serving number 2
Now serving number 3
```

The hint is `AsyncIterator[int]`, the async cousin of `Iterator[int]`. Use a plain `for` by mistake, and Python says `TypeError: 'async_generator' object is not iterable`. You'll mostly meet `async for` in libraries, for example to read a big download from httpx piece by piece as it arrives.

### Type hints for async functions

The return hint of an `async def` is what you get **after awaiting it**, not the coroutine object. Save this as `shelves.py`:

```python
import asyncio


async def count_books(shelf: str) -> int:
    await asyncio.sleep(0.1)  # pretend to ask a database
    return 42


async def main() -> None:
    total = await count_books("fiction")
    reveal_type(total)


asyncio.run(main())
```

`python -m mypy shelves.py` says:

```
shelves.py:11: note: Revealed type is "int"
Success: no issues found in 1 source file
```

(`reveal_type` is a mypy helper that asks "what type do you think this is?". Delete it when you're done: it's only for mypy.) mypy knows that awaiting `count_books(...)` gives an `int`. And it knows that **not** awaiting it gives something else. Change `main` to this:

```python
async def main() -> None:
    count_books("fiction")
    total = count_books("fiction") + 1
    print(total)
```

```
shelves.py:10: error: Value of type "Coroutine[Any, Any, int]" must be used  [unused-coroutine]
shelves.py:10: note: Are you missing an await?
shelves.py:11: error: Unsupported operand types for + ("Coroutine[Any, Any, int]" and "int")  [operator]
shelves.py:11: note: Maybe you forgot to use "await"?
Found 2 errors in 1 file (checked 1 source file)
```

Without `await`, you have a `Coroutine[...]`: the recipe, not the dish. mypy spots the most common async bug before you even run the program. (Running it would crash with `TypeError: unsupported operand type(s) for +: 'coroutine' and 'int'`.)

### Async in FastAPI

Back in chapter 43, you learned that endpoints can be written with `async def`, and you were told to stick with plain `def` until now. Here's what really happens with each kind:

- An **`async def` endpoint** runs directly on the event loop: the one cook. That's very efficient, as long as the endpoint only ever waits with `await`.
- A **plain `def` endpoint** is sent to a **thread pool**: a team of helper threads (the "helper" from chapter 43, and the reason for `check_same_thread=False` in chapter 46). There, a blocking call only holds up its own helper, not the whole server.

You can watch the difference. Make a folder called `async-api`, set up a venv with `"fastapi[standard]"` and httpx, and save this as `main.py`:

```python
import asyncio
import time

from fastapi import FastAPI

app = FastAPI()


@app.get("/plain")
def plain() -> dict[str, str]:
    time.sleep(1)  # blocking, but FastAPI runs a plain def in a thread
    return {"cook": "plain def"}


@app.get("/good-async")
async def good_async() -> dict[str, str]:
    await asyncio.sleep(1)  # waits, and lets the event loop serve others
    return {"cook": "async def with await"}


@app.get("/bad-async")
async def bad_async() -> dict[str, str]:
    time.sleep(1)  # blocks the event loop: everyone waits!
    return {"cook": "async def with time.sleep"}
```

Start it with `fastapi dev main.py`. Then, in a second terminal (with the venv active), run this `rush_hour.py`. It sends five requests to each endpoint at the same moment, like five customers walking in together:

```python
"""Send 5 requests to each endpoint at the same moment, and time them."""

import asyncio
import time

import httpx

BASE_URL = "http://127.0.0.1:8000"


async def rush_hour(client: httpx.AsyncClient, path: str) -> None:
    start = time.perf_counter()
    await asyncio.gather(*(client.get(f"{BASE_URL}{path}") for _ in range(5)))
    print(f"{path}: 5 requests took {time.perf_counter() - start:.2f} seconds")


async def main() -> None:
    async with httpx.AsyncClient(timeout=30) as client:
        for path in ["/plain", "/good-async", "/bad-async"]:
            await rush_hour(client, path)


asyncio.run(main())
```

One run printed:

```
/plain: 5 requests took 1.26 seconds
/good-async: 5 requests took 1.03 seconds
/bad-async: 5 requests took 5.04 seconds
```

The first two served all five customers in about one second. The last one served them **one at a time**: `time.sleep(1)` inside an `async def` froze the event loop, so nothing else could happen. And it's not just that endpoint. In another run, a `/good-async` request sent at the same moment as three `/bad-async` ones took 4.04 seconds to answer, instead of 1. While the cook stands staring at a pot, **the whole server** is stuck.

That's the rule from chapter 43, now with the reason behind it: **never call blocking things like `requests.get()` or `time.sleep()` inside an `async def` endpoint.**

**An endpoint that calls another API.** This is where `async def` shines: your endpoint waits for someone else's server, and while it waits, your server keeps serving other people. Add this to `main.py` (the imports go at the top):

```python
import httpx
from fastapi import HTTPException
from pydantic import BaseModel

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CITIES = {
    "Kathmandu": (27.70169, 85.3206),
    "Pokhara": (28.26689, 83.96851),
    "London": (51.50853, -0.12574),
    "Tokyo": (35.6895, 139.69171),
    "Sydney": (-33.86785, 151.20732),
    "New York": (40.71427, -74.00597),
}


class CityWeather(BaseModel):
    city: str
    temperature: float


@app.get("/weather/{city}")
async def weather(city: str) -> CityWeather:
    if city not in CITIES:
        raise HTTPException(status_code=404, detail=f"Unknown city: {city}")
    latitude, longitude = CITIES[city]
    params: dict[str, str | float] = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(FORECAST_URL, params=params)
            response.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(
            status_code=502, detail="The weather service didn't answer"
        )
    temperature = response.json()["current"]["temperature_2m"]
    return CityWeather(city=city, temperature=temperature)
```

`http://127.0.0.1:8000/weather/Kathmandu` answers (with today's weather, of course):

```
{"city":"Kathmandu","temperature":21.5}
```

and `/weather/Paris` answers `404` with `{"detail":"Unknown city: Paris"}`. `httpx.HTTPError` is the parent of all of httpx's errors, like `requests.RequestException` in chapter 40. If Open-Meteo is down, your API answers **502 Bad Gateway**, the status code for "a server I depend on let me down", instead of crashing with a 500.

> **Tip:** This endpoint opens a new `AsyncClient` for every request. That's fine for learning. A busy app would open one client when the server starts and share it. FastAPI's documentation shows how, under "Lifespan Events".

**So which should you write?**

| What the endpoint does | Use |
|---|---|
| Only awaits async things: `httpx.AsyncClient`, `asyncio.sleep`, an async database library | `async def` |
| Calls blocking things: `requests`, `sqlite3`, `time.sleep`, psycopg's normal connection, most older libraries | plain `def` |
| You're not sure | plain `def` |

Plain `def` is the safe default: at worst, it's a little less efficient. A blocking call in an `async def` is the one combination that really hurts. Your expense API in chapter 46 talks to SQLite with `sqlite3`, which blocks, so plain `def` was exactly right there.

> **Tip:** To test an async function with pytest ([chapter 36](../36-testing-with-pytest/notes.md)), the simplest way is a normal test function that calls `asyncio.run()`: `assert asyncio.run(cook("tea", 0.1)) == "tea"`. For bigger projects there are plugins that let test functions be `async def` themselves, like the `anyio` plugin that came with FastAPI (you saw it in chapter 43's pytest output), or the popular `pytest-asyncio`. And FastAPI's `TestClient` handles `async def` endpoints for you, exactly like plain ones.

## Common mistakes

**1. Forgetting `await`**

```python
async def main() -> None:
    drink = make_tea()  # forgot await
    print(f"Enjoy your {drink}")


asyncio.run(main())
```

```
Enjoy your <coroutine object make_tea at 0x0000028BAE4CA680>
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\Lib\asyncio\events.py:89: RuntimeWarning: coroutine 'make_tea' was never awaited
  self._context.run(self._callback, *self._args)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
```

Without `await`, `make_tea()` just made the coroutine object (the recipe) and never ran it: no "Kettle on", and a drink that's a coroutine. Python notices that a coroutine was thrown away without ever running, and warns you. Whenever you see **"was never awaited"**, look for a missing `await`. Even better, run mypy: it catches this before you run anything (see "Type hints for async functions").

**2. A blocking call inside async code**

```python
async def cook(dish: str, seconds: int) -> str:
    print(f"Start {dish}")
    time.sleep(seconds)  # oops: time.sleep, not asyncio.sleep
    print(f"{dish} ready")
    return dish


async def main() -> None:
    await asyncio.gather(cook("pasta", 3), cook("garlic bread", 2), cook("tea", 1))
```

```
Start pasta
pasta ready
Start garlic bread
garlic bread ready
Start tea
tea ready
Dinner took 6.01 seconds
```

No error, no warning, just slow: six seconds instead of three. `time.sleep()` never says "I'm waiting, go and do something else", so the cook stands still, and `gather` can't help. The same goes for `requests.get()`, `sqlite3` and any other blocking call. Inside `async def`, use the async version (`asyncio.sleep`, httpx's `AsyncClient`), or wrap the blocking call in `asyncio.to_thread()`.

**3. Calling an async function from normal code**

With `make_tea` from the start of the chapter, try calling it like an ordinary function, at the bottom of the file:

```python
make_tea()
print("Done")
```

```
C:\code\kitchen\tea.py:11: RuntimeWarning: coroutine 'make_tea' was never awaited
  make_tea()
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
Done
```

The tea never gets made. Outside `async def`, there's no event loop to run it. Try `await make_tea()` at the top of the file instead, and Python refuses to start at all:

```
SyntaxError: 'await' outside function
```

The way in from normal code is always `asyncio.run()`: `asyncio.run(make_tea())`, or better, one `asyncio.run(main())` at the bottom of your program.

**4. `asyncio.run()` inside code that's already async**

```python
async def main() -> None:
    dish = asyncio.run(cook("tea", 1))  # already inside asyncio.run!
    print(dish)


asyncio.run(main())
```

```
RuntimeError: asyncio.run() cannot be called from a running event loop
```

`asyncio.run()` starts a new event loop, and you can't start a second cook while the first is still working. Inside an `async def`, just `await cook("tea", 1)`. You'll also meet this error in **Jupyter notebooks**, which already run an event loop for you: there, type `await main()` in a cell instead. (Python's own async-friendly REPL works the same way: start it with `python -m asyncio`, and it greets you with `Use "await" directly instead of "asyncio.run()".`)

**5. A task that's never awaited or kept**

```python
import asyncio


async def send_receipt(customer: str) -> None:
    await asyncio.sleep(1)  # pretend to send an email
    print(f"Receipt sent to {customer}")


async def main() -> None:
    asyncio.create_task(send_receipt("Maya"))
    print("Order placed!")


asyncio.run(main())
```

```
Order placed!
```

No error, no warning, and no receipt. `main` finished straight away, and when `main` is done, `asyncio.run()` cancels any tasks still running. Maya's receipt was never sent. Two fixes: `await` the task before `main` ends, or (better) start it in a `TaskGroup`, which always waits for its tasks. Also, always **keep** the task `create_task` gives you, in a variable or a list. Python's documentation warns that the event loop only holds on to tasks loosely, so a task nobody keeps can disappear halfway through.

**6. Using async for CPU-heavy work**

```python
def count_primes(limit: int) -> int:
    """Count the prime numbers below limit, the slow way (on purpose)."""
    count = 0
    for number in range(2, limit):
        if all(number % d != 0 for d in range(2, int(number**0.5) + 1)):
            count += 1
    return count


async def count_primes_async(limit: int) -> int:
    return count_primes(limit)  # no await inside: the cook never lets go
```

Run two of them one after another, then together with `gather`:

```
25997 25997
One after another: 1.67 seconds
[25997, 25997]
With gather:       1.78 seconds
```

(Your times will be different.) No faster at all. Counting primes isn't waiting, it's chopping: the cook's own hands are busy the whole time, and there's nothing to switch to. Worse, while it runs, nothing else in the program can happen, so in a FastAPI app the whole server would freeze. Async is for **waiting**. For heavy calculations, you need more than one cook working at the same moment, and that's [chapter 48](../48-threads-processes-and-the-gil/notes.md).

## Quick recap

- Async lets one program juggle many **waiting** jobs: while one waits for a website or a database, another runs. It's **concurrency** (one cook juggling), not parallelism (several cooks).
- `async def` makes a coroutine function. Calling it gives a coroutine object that hasn't started. `await` runs it and pauses until it's done, letting the event loop work on other things. `asyncio.run(main())` starts the event loop from normal code.
- `await` alone still goes one after another. To run things together, use `asyncio.gather()`, `asyncio.create_task()`, or (in new code) `asyncio.TaskGroup`. Add `asyncio.timeout()` for a time limit and `asyncio.Semaphore` to stay polite.
- Errors: `gather` raises the first one (or returns them with `return_exceptions=True`). A TaskGroup cancels the other tasks and raises an `ExceptionGroup`, which you catch with `except*`.
- Never block inside async code: use `asyncio.sleep` and `httpx.AsyncClient`, not `time.sleep` and `requests`. If you must call blocking code, use `asyncio.to_thread()`.
- In FastAPI, `async def` endpoints run on the event loop and must only await. Plain `def` endpoints run in threads, and are the safe choice for blocking libraries like `sqlite3` and `requests`.
- Async speeds up waiting, not calculating. For heavy number-crunching, see chapter 48.

---

**Next:** try the [exercises](exercises.md), then move on to [48 Threads, Processes and the GIL](../48-threads-processes-and-the-gil/notes.md).
