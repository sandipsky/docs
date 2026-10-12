# 51 Design Patterns

## What is it?

A **design pattern** is a named, proven shape for solving a problem that keeps coming up in programming. It isn't a piece of code you copy. It's an idea you adapt to your own program, like "keep each way of doing a job in its own function, and let the caller pick one".

If you did the [JavaScript course](../../JavaScript/44-design-patterns/notes.md), you've met several of these already. This chapter shows them the Python way, which is often much shorter than you'd expect.

## Why does it matter?

By now you've written enough code to have felt some of these problems:

- An `if`/`elif` chain that grows every time the shop adds a delivery option or a discount.
- Code all over the program deciding which class to make: `if kind == "email": ... elif kind == "sms": ...`.
- One function that has to call five others when something happens: "an order was placed, so tell the kitchen, add loyalty points, email a receipt...".
- Code that's hard to test, because it opens the real database or sends real emails all by itself.

Programmers have hit these same problems for decades, and a few answers kept working. Those answers got names. Knowing them gives you two things:

1. **Ready-made answers.** When you meet a familiar problem, a good shape is already waiting.
2. **A shared vocabulary.** "Let's use a strategy here" says a paragraph's worth of design in four words, whether you're in a code review or asking Claude for help.

Many of the names come from a famous 1994 book, *Design Patterns*, by four authors nicknamed the "Gang of Four". Their examples were in C++, and the patterns spread through Java. Python has three features that make many of them much simpler: functions are values ([chapter 32](../32-decorators/notes.md)), a module is already one shared object ([chapter 19](../19-modules-and-standard-library/notes.md)), and duck typing ([chapter 28](../28-inheritance/notes.md)) means you rarely need a family tree of classes. A pattern that fills two pages of a Java book is often a dictionary of functions in Python.

One warning before you start: a pattern is a tool, not a goal. Using one where you don't need it makes code harder to read, not better. The end of the chapter comes back to that.

## Real-world example

Think of a knitting pattern. Years ago, someone worked out how to knit a beanie that fits well and doesn't unravel. They wrote it down and gave it a name. Knitters all over the world follow it, but each one adapts it: their own wool, their own colours, a bigger size. And when one knitter says "do a rib stitch for the brim", another knows exactly what to do, without a long explanation.

Design patterns are the knitting patterns of programming. Here are the ones in this chapter:

| Pattern | Everyday version | The problem it solves |
|---|---|---|
| **Strategy** | Choosing standard, express or pickup at the checkout | Swap one way of doing a job for another |
| **Factory** | A pizza counter: say "margherita", and the kitchen knows how to make it | Make the right kind of object from a name |
| **Singleton** | The one thermostat the whole house shares | There should be exactly one of something |
| **Observer** | Signing up for a newsletter | Tell everyone who's interested when something happens |
| **Adapter** | A travel plug adapter | Make something with the wrong shape fit |
| **Repository** | A library's front desk: you ask for a book, and never see the shelves | Hide where the data is kept |
| **Dependency injection** | A chef who's handed a tray of ingredients, instead of going shopping | Let the caller choose the parts, so they're easy to swap |

## How it works

Each pattern below follows the same order: the problem, the Python way, and when *not* to use it. First, though, one idea that almost every pattern relies on.

### Duck typing and `Protocol`

In chapter 28, a tip said that Python doesn't really need a shared parent class for polymorphism. When the program runs, any object with the right method will do. That's **duck typing**: "if it walks like a duck and quacks like a duck, it's a duck."

But what type hint do you give a function that takes "anything that can send a message"? Chapter 28's answer was an ABC: a parent class `Notifier` that every kind of notifier had to inherit from. That works for classes you write yourself. But inheritance ties the classes together, and you can't add a parent to a class that comes from someone else's package.

What you really mean is "anything with a `send(message)` method". The `typing` module has a way to say exactly that: a **`Protocol`**. Save this as `senders.py`:

```python
from typing import Protocol


class Sender(Protocol):
    """Anything with a send(message) method."""

    def send(self, message: str) -> None: ...


class EmailSender:
    def __init__(self, address: str) -> None:
        self.address = address

    def send(self, message: str) -> None:
        print(f"Email to {self.address}: {message}")


class SmsSender:
    def __init__(self, phone: str) -> None:
        self.phone = phone

    def send(self, message: str) -> None:
        print(f"Text to {self.phone}: {message}")


def announce(senders: list[Sender], message: str) -> None:
    for sender in senders:
        sender.send(message)


if __name__ == "__main__":
    team: list[Sender] = [EmailSender("maya@example.com"), SmsSender("555-0142")]
    announce(team, "Your coffee is ready")
```

You'll see:

```
Email to maya@example.com: Your coffee is ready
Text to 555-0142: Your coffee is ready
```

And `python -m mypy senders.py` says `Success: no issues found in 1 source file`. Here's what's new:

- `class Sender(Protocol):` describes a **shape**: the methods something must have. Its method has no real body, just `...` (the Ellipsis from [chapter 20](../20-files-and-folders/notes.md)), which here means "nothing here on purpose". A protocol never does anything itself. It's only a description.
- `EmailSender` and `SmsSender` **don't inherit from `Sender`**. They never even mention it. mypy looks at what methods they have, sees a `send` that takes a `str` and returns `None`, and agrees that they fit.
- `list[Sender]` now reads "a list of things that can send". Any class with the right `send` method, even one written next year, fits without any change to `announce`.
- The test code sits under `if __name__ == "__main__":` ([chapter 19](../19-modules-and-standard-library/notes.md)), so the rest of this chapter can `import` from `senders.py` without sending anything.

Matching by shape like this is called **structural typing**. Matching by family, like the ABC in chapter 28, is the other kind.

Now add a class that *can't* send. Put this above the `if __name__` line, and add `PigeonPost()` to the end of the `team` list:

```python
class PigeonPost:
    def fly(self, message: str) -> None:
        print(f"A pigeon flies off with: {message}")
```

Python sends the email and the text, then crashes on the pigeon:

```
AttributeError: 'PigeonPost' object has no attribute 'send'
```

mypy finds it without running anything:

```
senders.py:37: error: List item 2 has incompatible type "PigeonPost"; expected "Sender"  [list-item]
Found 1 error in 1 file (checked 1 source file)
```

That's the point of a protocol: duck typing's freedom, plus mypy's safety net. Here's how it compares with chapter 28's ABC:

| | ABC ([chapter 28](../28-inheritance/notes.md)) | `Protocol` |
|---|---|---|
| Classes must inherit from it | Yes: `class EmailNotifier(Notifier):` | No: having the right methods is enough |
| Who checks | Python (when you create an object) and mypy | mypy and Pylance only |
| Can give its children shared code | Yes | Not usually |
| Works with classes you didn't write | Only if they inherit from it | Yes |
| Think of it as | A membership card: "I'm one of the family" | A job description: "can do this" |

Most of this chapter only cares whether something *can do* a job, so it uses protocols. Reach for an ABC when you own the whole family of classes and want them to share code, or want Python itself to refuse an incomplete class.

### 1. Strategy: swap how a job gets done

**The problem.** The shop from [chapter 14](../14-project-shopping-cart/notes.md) charged $4.99 for delivery, or nothing on orders of $40.00 or more. Then customers asked for express delivery, and for collecting from the shop. The delivery function grows:

```python
def delivery_cost(method: str, order_cents: int) -> int:
    """How much delivery costs, in cents, for an order of order_cents."""
    if method == "standard":
        return 0 if order_cents >= 4000 else 499
    elif method == "express":
        return 999
    elif method == "pickup":
        return 0
    else:
        raise ValueError(f"unknown delivery method: {method}")
```

It works. But every new option means opening this function and adding a branch, and every branch makes it longer and riskier to change. Next month there's same-day delivery, then a member discount on express...

**The Python way.** Make each rule its own small function, with the same parameters and return type. A rule you can swap like this is called a **strategy**. Then keep them in a dictionary, exactly like `price_rules` in chapter 32. Save this as `delivery.py`:

```python
from collections.abc import Callable

DeliveryRule = Callable[[int], int]  # order total in cents -> delivery cost in cents


def standard(order_cents: int) -> int:
    return 0 if order_cents >= 4000 else 499  # free from $40.00, like chapter 14


def express(order_cents: int) -> int:
    return 999  # next day, always $9.99


def pickup(order_cents: int) -> int:
    return 0  # collect it from the shop yourself


DELIVERY_RULES: dict[str, DeliveryRule] = {
    "standard": standard,
    "express": express,
    "pickup": pickup,
}


def checkout_total(order_cents: int, delivery: DeliveryRule) -> int:
    """The order plus delivery. It doesn't know or care which rule it gets."""
    return order_cents + delivery(order_cents)


print(checkout_total(2500, standard))  # prints: 2999
print(checkout_total(4500, standard))  # prints: 4500
choice = "express"  # the customer's choice, from a menu
print(checkout_total(2500, DELIVERY_RULES[choice]))  # prints: 3499
```

`checkout_total` takes the rule as a parameter and just calls it. It has no `if` at all. Adding same-day delivery means writing one new function and adding one line to the dictionary. Nothing that already works has to change, and a test can pass in any rule it likes.

`sorted(..., key=...)` from [chapter 34](../34-functional-tools/notes.md) works the same way: `key` is a strategy for "what to sort by".

**Strategies with settings: classes and a protocol.** Sometimes each strategy needs its own settings. Discount codes are like that: one code is 10% off, another is 15% off, and a third is $5.00 off orders of $30.00 or more. That's data plus behaviour, which is what a class is for. Describe the shape with a protocol, and write one small class per kind of discount:

```python
from dataclasses import dataclass
from typing import Protocol


class Discount(Protocol):
    def amount_off(self, subtotal_cents: int) -> int: ...


@dataclass(frozen=True)
class PercentOff:
    percent: int

    def amount_off(self, subtotal_cents: int) -> int:
        return round(subtotal_cents * self.percent / 100)


@dataclass(frozen=True)
class AmountOff:
    cents: int
    minimum_cents: int = 0  # only for orders of at least this much

    def amount_off(self, subtotal_cents: int) -> int:
        if subtotal_cents < self.minimum_cents:
            return 0
        return min(self.cents, subtotal_cents)


class NoDiscount:
    def amount_off(self, subtotal_cents: int) -> int:
        return 0


def price_after(subtotal_cents: int, discount: Discount) -> int:
    return subtotal_cents - discount.amount_off(subtotal_cents)


CODES: dict[str, Discount] = {
    "SAVE10": PercentOff(10),
    "WELCOME15": PercentOff(15),
    "FIVER": AmountOff(500, minimum_cents=3000),
}

for code in ["SAVE10", "FIVER", "HALFOFF"]:
    discount = CODES.get(code, NoDiscount())
    print(code, price_after(4639, discount))
```

```
SAVE10 4175
FIVER 4139
HALFOFF 4639
```

(The $46.39 cart and the SAVE10 result of $41.75 are the same as in chapter 14.) `NoDiscount` is a small trick worth knowing: instead of `None` and an `if discount is None:` check everywhere, an unknown code gets a discount that does nothing. `price_after` never needs a special case.

So which do you use? **A plain function** when the strategy is one job with no settings, like the delivery rules. **A class** when it needs settings, or more than one method, like the discounts.

**When not to use it:** if there are two options and there will never be a third, a plain `if` is clearer. Strategy pays off when the list of options keeps growing, or when someone else (a setting, a customer, a test) needs to choose.

### 2. Factory: let one place decide which class to make

**The problem.** Customers choose how they'd like to hear that their order is ready: email, text message, or the screen above the counter. Their choice arrives as a word, from a form or a settings file. If every part of the program turns that word into an object with its own `if kind == "email": ... elif kind == "sms": ...`, then adding a new kind means finding and fixing every one of those chains.

**The Python way.** A **factory** is one function (or method) whose job is to make objects, and to decide which class to use. Keep the choices in a dictionary, called a **registry**. Classes are callable, just like functions (`EmailSender("maya@example.com")` makes an object), so a class can go straight into the dictionary. Save this as `factory.py`, next to `senders.py`:

```python
from collections.abc import Callable

from senders import EmailSender, Sender, SmsSender


class ScreenSender:
    def __init__(self, screen: str) -> None:
        self.screen = screen

    def send(self, message: str) -> None:
        print(f"On the {self.screen} screen: {message.upper()}")


# The registry: each word, and the class (or function) that makes that kind
SENDER_KINDS: dict[str, Callable[[str], Sender]] = {
    "email": EmailSender,
    "sms": SmsSender,
    "screen": ScreenSender,
}


def make_sender(kind: str, address: str) -> Sender:
    """The factory: make the right kind of sender from a word like "email"."""
    if kind not in SENDER_KINDS:
        choices = ", ".join(SENDER_KINDS)
        raise ValueError(f"unknown sender {kind!r} (choose from {choices})")
    return SENDER_KINDS[kind](address)


make_sender("sms", "555-0142").send("Hi Maya, your order is ready")
make_sender("screen", "counter").send("Order 42")
make_sender("pigeon", "the roof")
```

```
Text to 555-0142: Hi Maya, your order is ready
On the counter screen: ORDER 42
```

and then the last line stops with a clear message:

```
ValueError: unknown sender 'pigeon' (choose from email, sms, screen)
```

- `Callable[[str], Sender]` reads "something you call with one string, that gives back a `Sender`". Each class fits, because its `__init__` takes one string and the objects it makes have a `send` method.
- `SENDER_KINDS[kind](address)` looks up the class, then calls it. It's the same two steps as `rule = price_rules["student"]` and `rule(1000)` in chapter 32.
- The rest of the program only ever calls `make_sender`. A new kind of sender is one new class and one new line in the registry, and the error message lists it automatically.

You've already written factories. `Book.from_dict(data)` from [chapter 30](../30-dataclasses-and-enums/notes.md) is a `@classmethod` factory: one place that knows how to build a `Book` from a dictionary. `date.fromisoformat()` is one too.

> **Tip:** Some libraries fill their registry with a decorator. `@app.get("/books")` in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md) does exactly that: it adds your function to FastAPI's registry of paths, so FastAPI can look up which function to call for each request.

**When not to use it:** if there's only one class, just call it. A factory earns its place when there are several classes to choose from, and the choice arrives as data.

### 3. Singleton: one of something? Use a module

**The problem.** A program has one set of settings: the shop's name, the tax rate, the free-delivery limit. Every part of the program needs them, and there should only be one copy, so that they never disagree.

The classic answer, from Java books, is a **singleton**: a class that refuses to make a second object. In Python, it means overriding `__new__` (the dunder method that makes a new object, before `__init__` sets it up) so that `Settings()` always hands back the same object. You'll meet it in older code. The trouble is what it does to the people reading it: `first = Settings()` and `second = Settings()` look like two separate objects, but they're secretly one, so changing `second.tax_percent` quietly changes `first.tax_percent` too. And a test can never get a fresh one.

**The Python way: a module.** Remember from chapter 19 that Python runs a module's code **once**, the first time it's imported. Every later `import` hands back that same module object. So a module already *is* a singleton. Make a file called `config.py`:

```python
"""The shop's settings. Every module that imports this shares one copy."""

SHOP_NAME = "Corner Cafe"
TAX_PERCENT = 5
FREE_DELIVERY_CENTS = 4000
```

Then any module can use it. Here's `receipts.py`:

```python
import config


def header() -> str:
    return f"*** {config.SHOP_NAME} ***"


def tax(cents: int) -> int:
    return round(cents * config.TAX_PERCENT / 100)
```

And `main.py`:

```python
import config
import receipts

print(receipts.header())  # prints: *** Corner Cafe ***
print(receipts.tax(4175))  # prints: 209
print(receipts.config is config)  # prints: True
```

The last line proves it: the `config` inside `receipts` and the one in `main` are the very same object. No special class, no `__new__`. You've used this idea already: `logging.getLogger("shop")` gives back the same logger every time you ask for that name ([chapter 37](../37-debugging-and-logging/notes.md)).

A settings module works best for values that are **read, not changed**: the UPPER_CASE names say "constant" ([chapter 02](../02-variables/notes.md)). [Chapter 52](../52-security-basics/notes.md) builds a settings module like this one that reads secrets from environment variables.

**When not to use it:** for anything that changes while the program runs, like a shopping cart or a database connection. One shared, changing object is a **global variable** in disguise: any code anywhere can change it, and tests can't each get a fresh one (mistake 3 at the end shows this happening). Instead, make the object once in `main()` and pass it to whatever needs it. That's dependency injection, coming up in section 7.

### 4. Observer: tell everyone who's interested

**The problem.** When a cafe order is placed, lots of things should happen: the kitchen prints a ticket, the customer gets loyalty points, and a receipt is emailed. The obvious code calls them all, one after another, from inside `place_order`. Then `place_order` has to know about every one of those jobs, and it grows every time someone thinks of a new one ("and update the sales chart!"). You can't even test it without the kitchen printer.

**The Python way.** Let interested code **subscribe**, and let `place_order` simply **publish** the news: "an order was placed". Whoever subscribed gets called. The ones who listen are called **observers** (or listeners), and the thing that keeps the list is often called an **event bus**. A function you hand over for someone else to call later is a **callback**: you've passed lots of them already, like `key=` functions and FastAPI endpoints. Save this as `events.py`:

```python
from collections.abc import Callable
from dataclasses import dataclass


@dataclass
class Order:
    id: int
    customer: str
    items: list[str]
    total_cents: int


Listener = Callable[[Order], None]  # a function that gets told about an order


class EventBus:
    """Remembers who wants to hear about each event, and tells them."""

    def __init__(self) -> None:
        self._listeners: dict[str, list[Listener]] = {}

    def subscribe(self, event: str, listener: Listener) -> None:
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(listener)

    def publish(self, event: str, order: Order) -> None:
        for listener in self._listeners.get(event, []):
            listener(order)


# The listeners: each one does one job, and knows nothing about the others
def print_kitchen_ticket(order: Order) -> None:
    print(f"KITCHEN: order {order.id}: {', '.join(order.items)}")


def add_loyalty_points(order: Order) -> None:
    print(f"POINTS: {order.customer} earns {order.total_cents // 100}")


def email_receipt(order: Order) -> None:
    print(f"EMAIL: receipt for order {order.id} sent to {order.customer}")


# The shop: it only knows about the bus
bus = EventBus()


def place_order(order: Order) -> None:
    print(f"Order {order.id} saved")
    bus.publish("order_placed", order)


bus.subscribe("order_placed", print_kitchen_ticket)
bus.subscribe("order_placed", add_loyalty_points)
bus.subscribe("order_placed", email_receipt)

place_order(Order(1, "Maya", ["latte", "croissant"], 625))
place_order(Order(2, "Maya", ["tea"], 225))
```

```
Order 1 saved
KITCHEN: order 1: latte, croissant
POINTS: Maya earns 6
EMAIL: receipt for order 1 sent to Maya
Order 2 saved
KITCHEN: order 2: tea
POINTS: Maya earns 2
EMAIL: receipt for order 2 sent to Maya
```

`place_order` is back to two lines, and it doesn't know who's listening. Adding a sales chart is one new function and one `subscribe` line, somewhere else entirely. Notice that `subscribe` gets each function **without brackets**: you're handing over the function itself, for the bus to call later (chapter 32).

If you did the JavaScript or React courses, this is `addEventListener("click", handler)` and `onClick={handleClick}`: the button publishes "I was clicked", and your function is the listener.

**When not to use it:** when the steps depend on each other, or their order matters. "Take the payment, *then* print the ticket, and only if the payment worked" should be plain calls, one after another, where you can see them. Observers are for "tell whoever's interested". They have a cost, too: reading `place_order` no longer tells you everything that happens when an order is placed.

> **Watch out:** if one listener raises an exception, `publish` stops, and the listeners after it never hear the news. A real event bus often catches errors from each listener, logs them with `logger.exception(...)` ([chapter 37](../37-debugging-and-logging/notes.md)), and carries on with the next.

### 5. Adapter: make the wrong shape fit

**The problem.** Your app needs one thing from the weather: "how warm is it in this city?" In [chapter 40](../40-working-with-apis/notes.md) you got it from Open-Meteo, which wants a latitude and longitude, not a city name, and puts the temperature under `["current"]["temperature_2m"]`. Now you'd like a second service as a backup: wttr.in. It takes a city's name directly, and answers with something like `{"current_condition": [{"temp_C": "23", ...}]}`, with the temperature as **text**. Two services, two different shapes, and your app shouldn't have to care.

**The Python way.** Decide the shape *your* program wants, as a protocol. Then write one small class per service, called an **adapter**, that turns the service's shape into yours. Save this as `adapters.py`:

```python
"""Two weather services, one way to ask them."""

from typing import Any, Protocol

import requests

TIMEOUT = 10  # seconds


class WeatherSource(Protocol):
    def get_temperature(self, city: str) -> float: ...


def get_json(url: str, params: dict[str, str | float]) -> Any:
    response = requests.get(url, params=params, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()


class OpenMeteoAdapter:
    """Open-Meteo wants coordinates, so look the city up first (chapter 40)."""

    def get_temperature(self, city: str) -> float:
        found = get_json(
            "https://geocoding-api.open-meteo.com/v1/search", {"name": city, "count": 1}
        )
        if not found.get("results"):
            raise LookupError(f"no place called {city!r}")
        place = found["results"][0]
        data = get_json(
            "https://api.open-meteo.com/v1/forecast",
            {
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "current": "temperature_2m",
            },
        )
        return float(data["current"]["temperature_2m"])


class WttrAdapter:
    """wttr.in takes the city's name, and sends the temperature as text."""

    def get_temperature(self, city: str) -> float:
        data = get_json(f"https://wttr.in/{city}", {"format": "j1"})
        return float(data["current_condition"][0]["temp_C"])


def weather_report(source: WeatherSource, cities: list[str]) -> None:
    for city in cities:
        print(f"  {city}: {source.get_temperature(city):.1f} degrees")


sources: list[WeatherSource] = [OpenMeteoAdapter(), WttrAdapter()]
for source in sources:
    print(type(source).__name__)
    weather_report(source, ["Kathmandu", "London"])
```

One real run (yours will show today's weather, of course):

```
OpenMeteoAdapter
  Kathmandu: 21.5 degrees
  London: 14.7 degrees
WttrAdapter
  Kathmandu: 23.0 degrees
  London: 14.0 degrees
```

All the differences live inside the adapters: one makes two requests, the other one; one reads a number, the other turns text into a `float`. `weather_report` only knows `get_temperature(city)`, so it works with either, and with any service you add later. (The two services disagree by a degree or so. They use different weather stations and update at different times, and wttr.in rounds to whole degrees.)

> **Tip:** Notice the hint on `sources`. Without it, mypy sees a list holding two unrelated classes, decides it's a `list[object]`, and then complains that an `object` isn't a `WeatherSource`. The hint tells it what you mean.

There's a bonus, too: a test can pass `weather_report` a pretend weather source, with a `get_temperature` that just looks the city up in a dictionary. No internet needed, and the same answers every time. You'll see that trick properly in the next two sections.

**When not to use it:** if you only ever use one service, don't wrap it "just in case". Turning its JSON into a dataclass as soon as it arrives (chapter 40's `from_dict`) is enough.

### 6. Repository: hide where the data lives

**The problem.** In [chapter 26](../26-project-todo-app/notes.md), `storage.py` hid the JSON file from the rest of the to-do app, with the promise: "If you ever want to save tasks somewhere else, like a database, only `storage.py` has to change." [Chapter 42](../42-databases/notes.md) kept that promise. But you had to *replace* the file to switch, and there was no way for a test to use something quick and temporary instead.

**The Python way.** A **repository** is an object that stores and finds one kind of thing, and hides *how*. Describe what it can do with a protocol, and write one class for each place the data can live. Save this as `tasks.py`:

```python
"""Tasks, and the places to keep them."""

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Protocol


@dataclass
class Task:
    id: int
    title: str
    done: bool = False


class TaskRepository(Protocol):
    """Anywhere tasks can be kept. The rest of the program only knows this."""

    def add(self, title: str) -> Task: ...

    def list_all(self) -> list[Task]: ...

    def mark_done(self, task_id: int) -> bool: ...


class JsonTaskRepository:
    """Keeps the tasks in a JSON file, like chapter 26."""

    def __init__(self, path: Path) -> None:
        self.path = path

    def _load(self) -> list[Task]:
        if not self.path.exists():
            return []
        data = json.loads(self.path.read_text(encoding="utf-8"))
        return [Task(**item) for item in data]

    def _save(self, tasks: list[Task]) -> None:
        text = json.dumps([asdict(task) for task in tasks], indent=2)
        self.path.write_text(text, encoding="utf-8")

    def add(self, title: str) -> Task:
        tasks = self._load()
        task = Task(id=max([t.id for t in tasks], default=0) + 1, title=title)
        tasks.append(task)
        self._save(tasks)
        return task

    def list_all(self) -> list[Task]:
        return self._load()

    def mark_done(self, task_id: int) -> bool:
        tasks = self._load()
        for task in tasks:
            if task.id == task_id and not task.done:
                task.done = True
                self._save(tasks)
                return True
        return False


class InMemoryTaskRepository:
    """Keeps the tasks in a dictionary. Gone when the program ends: ideal for tests."""

    def __init__(self) -> None:
        self._tasks: dict[int, Task] = {}

    def add(self, title: str) -> Task:
        task = Task(id=len(self._tasks) + 1, title=title)
        self._tasks[task.id] = task
        return task

    def list_all(self) -> list[Task]:
        return list(self._tasks.values())

    def mark_done(self, task_id: int) -> bool:
        task = self._tasks.get(task_id)
        if task is None or task.done:
            return False
        task.done = True
        return True


def summary(repo: TaskRepository) -> str:
    """Like "2 to do, 1 done". Works with any repository."""
    tasks = repo.list_all()
    done = len([task for task in tasks if task.done])
    return f"{len(tasks) - done} to do, {done} done"
```

Every piece is something you've written before: chapter 26's JSON file, chapter 30's dataclasses, and a dictionary from ID to item, like the `books` in chapter 43. What's new is the arrangement: two completely different ways of keeping tasks, with one shape. (`Task(**item)` unpacks a dictionary like `{"id": 1, "title": "Buy milk", "done": True}` into keyword arguments, as in chapter 32. The methods starting with `_` are internal helpers, like `_balance` in chapter 27.)

Now code written against `TaskRepository` works with either. Save this as `try_repos.py`, next to `tasks.py`:

```python
from pathlib import Path

from tasks import InMemoryTaskRepository, JsonTaskRepository, TaskRepository, summary

repos: list[TaskRepository] = [
    JsonTaskRepository(Path("tasks.json")),
    InMemoryTaskRepository(),
]
for repo in repos:
    repo.add("Buy milk")
    repo.add("Renew passport")
    repo.add("Call grandma")
    repo.mark_done(1)
    print(f"{type(repo).__name__}: {summary(repo)}")
```

```
JsonTaskRepository: 2 to do, 1 done
InMemoryTaskRepository: 2 to do, 1 done
```

Same calls, same answers. Open `tasks.json`, and the three tasks are there. Run it again, and the JSON one says `5 to do, 1 done` (three more tasks, and task 1 was already done), while the in-memory one starts from nothing again. A file remembers; a dictionary doesn't. (Delete `tasks.json` to start again.)

Moving the app into a database is now one new class, `SqliteTaskRepository`, with the same three methods and chapter 42's SQL inside. Then switching is one line: which class you make. You'll write it in the exercises. And the in-memory one is a **fake**: a pretend version of something real, made for tests. It's instant, it never leaves files behind, and every test can have a fresh one. That's the next section.

**When not to use it:** a short script that reads one CSV file and prints a report doesn't need a repository. It earns its place when an app stores and looks things up in many places, or when you want to test the app's logic without real files or databases.

### 7. Dependency injection: pass the parts in

**The problem.** Say you want a small program that emails you a reminder for every unfinished task. The obvious version makes everything it needs, inside itself: `repo = JsonTaskRepository(Path("tasks.json"))` and `sender = EmailSender("sandip@example.com")`, right at the top of the function. It works, but how would you test it? Every test would read your real tasks and send you real emails. The function has welded its parts on.

**The Python way.** Don't let the function make its parts. **Pass them in** as parameters. The parts are called **dependencies** (the things a function depends on), and handing them in from outside is called **dependency injection**. It sounds grand, but it's just parameters. Save this as `reminders.py`, next to `tasks.py` and `senders.py`:

```python
from pathlib import Path

from senders import EmailSender, Sender
from tasks import JsonTaskRepository, TaskRepository


def send_reminders(repo: TaskRepository, sender: Sender) -> int:
    """Send one reminder for each unfinished task. Return how many were sent."""
    count = 0
    for task in repo.list_all():
        if not task.done:
            sender.send(f"Don't forget: {task.title}")
            count += 1
    return count


def main() -> None:
    # The one place that picks the real parts and plugs them together
    repo = JsonTaskRepository(Path("tasks.json"))
    sender = EmailSender("sandip@example.com")
    sent = send_reminders(repo, sender)
    print(f"Sent {sent} reminders")


if __name__ == "__main__":
    main()
```

With the `tasks.json` from running `try_repos.py` once, `python reminders.py` prints:

```
Email to sandip@example.com: Don't forget: Renew passport
Email to sandip@example.com: Don't forget: Call grandma
Sent 2 reminders
```

`send_reminders` only knows two protocols. `main()` is the one place that chooses the real parts. And a test can plug in fakes. Save this as `test_reminders.py`:

```python
from reminders import send_reminders
from tasks import InMemoryTaskRepository, summary


class FakeSender:
    """Pretends to send. It just remembers every message, so a test can check."""

    def __init__(self) -> None:
        self.sent: list[str] = []

    def send(self, message: str) -> None:
        self.sent.append(message)


def make_repo() -> InMemoryTaskRepository:
    repo = InMemoryTaskRepository()
    repo.add("Buy milk")
    repo.add("Call grandma")
    repo.mark_done(1)
    return repo


def test_summary() -> None:
    assert summary(make_repo()) == "1 to do, 1 done"


def test_reminders_only_for_unfinished_tasks() -> None:
    sender = FakeSender()
    count = send_reminders(make_repo(), sender)
    assert count == 1
    assert sender.sent == ["Don't forget: Call grandma"]
```

`python -m pytest -q` (quiet mode, from chapter 36) shows:

```
..                                                                       [100%]
2 passed in 0.01s
```

No tasks file, no email, and the tests know exactly what was "sent". `FakeSender` never mentions `Sender`, but it has the right `send` method, so mypy accepts it. That's the protocol paying off again.

You've been doing dependency injection for a while without the name:

- **Passing `today` in.** Since [chapter 26](../26-project-todo-app/notes.md), functions like `is_overdue(task, today)` took the date as a parameter instead of reading the clock, so a test can pick any date it likes. The clock is a dependency.
- **FastAPI's `Depends`.** In [chapter 46](../46-project-expense-tracker-api/notes.md), endpoints said what they needed, with `con: Db`, where `Db = Annotated[sqlite3.Connection, Depends(database.get_db)]`. FastAPI made the connection and injected it. And the tests swapped it with `app.dependency_overrides[database.get_db] = get_test_db`, without changing a single endpoint. That's this section, done by a framework.

**When not to use it:** you don't need to pass in things that never change and are easy to test, like `math.sqrt` or `round`. Inject the things that reach **outside** your program: databases, files, the network, email, the clock, random numbers.

### Patterns Python built in

Some famous patterns are so useful that Python made them part of the language. You've used all of these:

| Pattern | What it means | In Python |
|---|---|---|
| **Iterator** | Hand out the items of a collection one at a time | `for` loops, `__iter__`, generators ([chapter 31](../31-iterators-and-generators/notes.md)) |
| **Context manager** | Set something up, and always clean it up afterwards | `with` blocks, `@contextmanager` ([chapter 33](../33-context-managers/notes.md)) |
| **Decorator** | Wrap something to add behaviour, without changing it | `@` decorators for functions ([chapter 32](../32-decorators/notes.md)) |
| **Strategy** | Pass the "how" in | `key=` in `sorted`, `min` and `max` ([chapter 34](../34-functional-tools/notes.md)) |

The **Decorator pattern** deserves one more look, because the names are confusing. In the Gang of Four book, a decorator is an *object* that wraps another object with the same methods, and adds something on the way through. Python's `@decorator` does the same thing for *functions*, with special syntax. The object version still comes in handy. Here's a sender that wraps any other sender and numbers its messages:

```python
from senders import Sender, SmsSender


class CountingSender:
    """Wraps any sender. Counts the messages, then hands each one on."""

    def __init__(self, inner: Sender) -> None:
        self.inner = inner
        self.count = 0

    def send(self, message: str) -> None:
        self.count += 1
        self.inner.send(f"[{self.count}] {message}")


sender = CountingSender(SmsSender("555-0142"))
sender.send("Your coffee is ready")
sender.send("Your muffin is ready")
print(sender.count)  # prints: 2
```

```
Text to 555-0142: [1] Your coffee is ready
Text to 555-0142: [2] Your muffin is ready
2
```

`CountingSender` is itself a `Sender`, so it can go anywhere a sender can, even around another wrapper. It's gift wrapping again (chapter 32), with objects instead of functions.

### YAGNI: you aren't gonna need it

Patterns are exciting once you know them, and the temptation is to use them everywhere. Programmers have a name for the cure: **YAGNI**, "You Aren't Gonna Need It". Don't build something for a problem you *might* have one day. Build it when the problem is really there.

Here's a greeting, built with a protocol, a strategy class, a registry and a factory:

```python
from typing import Protocol


class GreetingStrategy(Protocol):
    def greet(self, name: str) -> str: ...


class FriendlyGreeting:
    def greet(self, name: str) -> str:
        return f"Hello, {name}!"


GREETINGS: dict[str, type[FriendlyGreeting]] = {"friendly": FriendlyGreeting}


def make_greeting(kind: str) -> GreetingStrategy:
    return GREETINGS[kind]()


print(make_greeting("friendly").greet("Maya"))  # prints: Hello, Maya!
```

And here's the same program, without patterns:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"


print(greet("Maya"))  # prints: Hello, Maya!
```

The second one is better in every way. If a second kind of greeting ever really turns up, *then* turn `greet` into a strategy. That change takes five minutes, and you'll know exactly what shape you need, instead of guessing.

A good test: **a pattern should remove a pain you already feel**. The `if`/`elif` chain you've edited three times, the test you couldn't write, the class you've copied for the third time. No pain, no pattern. Your tests ([chapter 36](../36-testing-with-pytest/notes.md)) make the later change safe.

## Common mistakes

**1. Using patterns for their own sake**

The greeting factory above is the classic example. Every extra class, protocol and registry is one more thing for the next reader to understand. If you can't name the problem a pattern solves in *your* code, take it out. Start with plain functions, and let the patterns arrive when the code asks for them.

**2. Java-style getters and setters**

```python
class Book:
    def __init__(self, title: str) -> None:
        self._title = title

    def get_title(self) -> str:
        return self._title

    def set_title(self, title: str) -> None:
        self._title = title
```

Java programmers write methods like these for every attribute, "in case" they need to add a check later. In Python, that's three times the code for nothing. Use a plain attribute: `self.title = title`, read as `book.title`. If you need a rule later, turn it into a `@property` ([chapter 27](../27-classes-and-objects/notes.md)), and code that reads `book.title` doesn't have to change at all. That's exactly why Python doesn't need getters and setters.

**3. A singleton (or module variable) that tests share**

`shop.py` keeps one cart for everyone:

```python
cart: list[str] = []  # one cart, shared by everything that imports shop


def add_item(item: str) -> None:
    cart.append(item)
```

And `test_shop.py` tests it:

```python
from shop import add_item, cart


def test_add_tea() -> None:
    add_item("tea")
    assert cart == ["tea"]


def test_add_cake() -> None:
    add_item("cake")
    assert cart == ["cake"]
```

Each test looks right on its own, and the first one passes. The second fails:

```
E       AssertionError: assert ['tea', 'cake'] == ['cake']
```

The first test's tea is still in the cart, because there's only one cart, and it lives as long as the program does. Run `test_add_cake` on its own and it passes, which makes this bug maddening to track down. Fix: make `Cart` a class, and give each test a fresh one from a fixture ([chapter 36](../36-testing-with-pytest/notes.md)). In the real program, make one cart in `main()` and pass it to whatever needs it.

**4. Deep inheritance trees**

```
Notifier
 └── EmailNotifier
      └── HtmlEmailNotifier
           └── LoggedHtmlEmailNotifier
                └── RetryingLoggedHtmlEmailNotifier
```

Every new combination ("retrying, but not logged") needs another class, and a change near the top can break everything below it. This is the "is a" trap from [chapter 28](../28-inheritance/notes.md). Fix: composition. Small wrappers like `CountingSender` can be stacked in any combination: `RetryingSender(LoggingSender(HtmlEmailSender(...)))`, with one short class per job.

**5. An interface with only one implementation, "just in case"**

A `TaxCalculator` protocol, with one class that follows it, `FivePercentTax`, and no other class in sight. The protocol is just one more thing to read. A plain function, `def tax(cents: int) -> int:`, says the same thing. Add the protocol when a second version really turns up. (A fake for your tests counts as a second version. That's often the moment a protocol starts to pay for itself.)

**6. A typo in a method that's meant to fit a protocol**

```python
class SmsSender:
    def __init__(self, phone: str) -> None:
        self.phone = phone

    def sned(self, message: str) -> None:
        print(f"Text to {self.phone}: {message}")
```

Nothing complains when you write the class, because a class never says which protocol it's meant to follow. mypy only notices where the object is *used* as a `Sender`, for example `announce([maya], "Your coffee is ready")`:

```
typo.py:22: error: List item 0 has incompatible type "SmsSender"; expected "Sender"  [list-item]
```

And if nothing uses it that way yet, nothing notices at all. If you want the check right where the class is written, you can list the protocol as a parent: `class SmsSender(Sender):`. Then mypy reports the missing method as soon as you create one: `Cannot instantiate abstract class "SmsSender" with abstract attribute "send"`. Either way, the same tip as always: run mypy often.

## Quick recap

- A **design pattern** is a named, proven shape for a common problem. Learn the names: they're a shared vocabulary.
- A **`Protocol`** describes a shape ("anything with a `send` method"). Classes fit it just by having the methods, and mypy checks them. Duck typing, with a safety net.
- **Strategy**: pass the "how" in, as a function or a small class. **Factory**: one function and a registry dictionary decide which class to make. **Singleton**: in Python, just use a module, and keep it read-only.
- **Observer**: `subscribe` callbacks, then `publish` the news. **Adapter**: a small class that turns someone else's shape into yours.
- **Repository**: hide where the data lives behind a protocol, with an in-memory fake for tests. **Dependency injection**: pass the parts in as parameters, and choose the real ones in `main()`. FastAPI's `Depends` is DI.
- Iterators, context managers and decorators are patterns Python built in.
- **YAGNI**: a pattern should remove a pain you already have. Plain functions first.

---

**Next:** try the [exercises](exercises.md), then move on to [52 Security Basics](../52-security-basics/notes.md).
