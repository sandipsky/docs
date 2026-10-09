# 22 Dates and Times

## What is it?

Python's `datetime` module gives you real date and time values that you can do maths with: today's date, a birthday, a due date, how long a shift lasted, the time in another country.

It has three main tools:

- a **`date`** is a day on the calendar, like 9 October 2026,
- a **`datetime`** is a day plus a time on the clock, like 9 October 2026 at 14:30,
- a **`timedelta`** is a length of time, like "14 days" or "90 minutes".

## Why does it matter?

Almost every program deals with dates. Library books have due dates. To-do items become overdue. Gym memberships run out. Log files record when things happened. Your expenses in [chapter 21](../21-json-and-csv/notes.md) all had dates.

But in chapter 21, those dates were just strings, and strings can't do date maths:

```python
due = "2026-10-15"
today = "2026-10-09"
print(due - today)
# TypeError: unsupported operand type(s) for -: 'str' and 'str'
```

You could try to do it by hand: split the string, subtract the days... but then what about the end of the month? Months have 28, 29, 30 or 31 days. Leap years add 29 February every four years (mostly). Time zones move the clock forwards and backwards. Getting all that right yourself is a famous source of bugs.

The `datetime` module already knows every one of those rules. You ask "what's the date 14 days after 25 October?", and it simply answers `2026-11-08`.

## Real-world example

Think of a wall calendar and a clock in a kitchen.

| In the kitchen | In Python |
|---|---|
| A day circled on the calendar | a `date` |
| A day on the calendar plus the time on the clock: "Friday, 2:30 PM" | a `datetime` |
| "Two weeks" or "an hour and a half": an amount of time, not a moment | a `timedelta` |
| Counting the squares between two circled days | subtracting two dates |
| Writing the date your way: "9 October 2026" or "09/10/2026" | `strftime` (formatting) |
| Reading a date someone scribbled on a note | `strptime` (parsing) |
| A note under the clock saying "this is Kathmandu time" | a time zone |

## How it works

### Importing the tools

The usual way to start is to import the three tools by name, with `from` (chapter 19):

```python
from datetime import date, datetime, timedelta
```

Watch the names carefully. The **module** is called `datetime`, and one of the tools inside it is **also** called `datetime`. With this import line, `datetime` means the tool. (Mistake 1 at the end of the chapter shows what happens if you mix them up.)

### Today and now

```python
from datetime import date, datetime

today = date.today()
print(today)  # prints: 2026-10-09

now = datetime.now()
print(now)  # prints something like: 2026-10-09 14:05:09.482371
```

**Your output will be different**, because it depends on the day (and the second) you run it. This chapter pretends that today is **Friday 9 October 2026**, so that's what the examples show.

`date.today()` gives just the date. `datetime.now()` gives the date and the time, right down to millionths of a second (the `.482371` part, called **microseconds**). You'll learn to show it more tidily soon.

Python prints dates as **year-month-day**: `2026-10-09`. This is the **ISO format**, an international standard. Biggest part first, so nobody has to guess whether `09/10` means 9 October or 10 September.

### Making a specific date

To make any date you like, give the year, month and day as numbers:

```python
from datetime import date, datetime

holiday = date(2026, 12, 25)
print(holiday)  # prints: 2026-12-25

meeting = datetime(2026, 10, 9, 14, 30)  # year, month, day, hour, minute
print(meeting)  # prints: 2026-10-09 14:30:00
```

Months count from 1, the way people count: January is `1` and December is `12`. Hours use the 24-hour clock, so 2:30 PM is `14, 30`. You can add seconds as a sixth number if you need them.

> **Tip:** Don't write leading zeros: `date(2026, 10, 09)` is a `SyntaxError` (`leading zeros in decimal integer literals are not permitted`). Python numbers can't start with `0`. Write `date(2026, 10, 9)`.

If you did the [JavaScript course](../../JavaScript/19-dates-and-times/notes.md), you'll be glad to hear Python has none of its traps here: months start at 1, and dates and times are separate, clearly named tools.

### Reading the parts of a date

A date carries its parts as attributes (no brackets):

```python
from datetime import date, datetime

launch = date(2026, 10, 9)
print(launch.year)   # prints: 2026
print(launch.month)  # prints: 10
print(launch.day)    # prints: 9

meeting = datetime(2026, 10, 9, 14, 30)
print(meeting.hour)    # prints: 14
print(meeting.minute)  # prints: 30
print(meeting.date())  # prints: 2026-10-09
```

`.date()` takes just the calendar part of a `datetime`. (There's a `.time()` too, which gives `14:30:00`.)

The day of the week comes from a **method**, so it needs brackets:

```python
print(launch.weekday())  # prints: 4
```

`4`? `.weekday()` counts from **Monday as 0**, so Friday is `4` and Sunday is `6`. To get a name, use the number as an index into a list (chapter 11):

```python
DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
print(DAY_NAMES[launch.weekday()])  # prints: Friday
```

There's an easier way to get the name, which you'll see in the formatting section.

| You write | You get | For 9 October 2026, 14:30 |
|---|---|---|
| `.year`, `.month`, `.day` | the parts of the date | `2026`, `10`, `9` |
| `.hour`, `.minute`, `.second` | the parts of the time (`datetime` only) | `14`, `30`, `0` |
| `.weekday()` | `0` (Monday) to `6` (Sunday) | `4` |
| `.date()` | the date part of a `datetime` | `2026-10-09` |

### `timedelta`: a length of time

A `timedelta` is an amount of time: not "9 October", but "14 days". You make one with **keyword arguments** (chapter 10) for the units you want:

```python
from datetime import timedelta

two_weeks = timedelta(days=14)
print(two_weeks)  # prints: 14 days, 0:00:00

print(timedelta(hours=2))              # prints: 2:00:00
print(timedelta(minutes=90))           # prints: 1:30:00
print(timedelta(weeks=1))              # prints: 7 days, 0:00:00
print(timedelta(days=2, hours=3, minutes=15))  # prints: 2 days, 3:15:00
```

When it prints, a `timedelta` shows the days, then the leftover time as `hours:minutes:seconds`.

### Date maths: adding and subtracting

Here's where dates become really useful. **A date plus a timedelta is a new date.** Say a library lends books for 14 days:

```python
from datetime import date, timedelta

borrowed = date(2026, 10, 9)
due = borrowed + timedelta(days=14)
print(due)  # prints: 2026-10-23
```

Python handles the ends of months and years, and leap years, for you:

```python
print(date(2026, 10, 25) + timedelta(days=14))  # prints: 2026-11-08
print(date(2026, 12, 31) + timedelta(days=1))   # prints: 2027-01-01
print(date(2028, 2, 28) + timedelta(days=1))    # prints: 2028-02-29 (2028 is a leap year)
print(date(2026, 10, 9) - timedelta(weeks=1))   # prints: 2026-10-02
```

**A date minus a date is a timedelta**: the gap between them. Its `.days` attribute gives you a plain number:

```python
from datetime import date

today = date(2026, 10, 9)
holiday = date(2026, 12, 25)

gap = holiday - today
print(gap)       # prints: 77 days, 0:00:00
print(gap.days)  # prints: 77
print(f"{gap.days} days until the holiday")  # prints: 77 days until the holiday
```

If the first date is earlier, the answer is negative: `(date(2026, 10, 1) - date(2026, 10, 9)).days` is `-8`. That's handy: a negative "days until the due date" means it's overdue.

The same works with `datetime` and hours. Say Sandip works a shift at a cafe:

```python
from datetime import datetime

start = datetime(2026, 10, 9, 9, 15)
end = datetime(2026, 10, 9, 17, 40)

worked = end - start
print(worked)  # prints: 8:25:00

hours = worked.total_seconds() / 3600
print(f"Worked {hours:.2f} hours")  # prints: Worked 8.42 hours
```

`.total_seconds()` turns the whole timedelta into seconds. There are 3,600 seconds in an hour, so dividing by 3,600 gives hours.

| Calculation | Gives you | Example |
|---|---|---|
| `date + timedelta` | a `date` | due date, delivery date |
| `date - timedelta` | a `date` | "a week ago" |
| `date - date` | a `timedelta` | days until, days since, age in days |
| `datetime - datetime` | a `timedelta` | how long a shift, a race, or a film lasted |
| `timedelta.days` | an `int` | the number of whole days |
| `timedelta.total_seconds()` | a `float` | the whole length in seconds |

> **Watch out:** You can't add a plain number to a date. `date.today() + 7` gives `TypeError: unsupported operand type(s) for +: 'datetime.date' and 'int'`. Seven what? Days? Weeks? Python won't guess. Say what you mean: `date.today() + timedelta(days=7)`.

### Comparing dates

The comparison operators from [chapter 04](../04-operators/notes.md) all work on dates. "Earlier" counts as "smaller":

```python
from datetime import date

today = date(2026, 10, 9)
due = date(2026, 10, 1)

if today > due:
    days_late = (today - due).days
    print(f"Overdue by {days_late} days")  # prints: Overdue by 8 days

print(today == date(2026, 10, 9))  # prints: True
```

Because dates can be compared, `sorted()`, `min()` and `max()` work on them too:

```python
from datetime import date

birthdays = [date(2026, 12, 25), date(2026, 10, 9), date(2026, 11, 1)]
print(min(birthdays))  # prints: 2026-10-09
print(max(birthdays))  # prints: 2026-12-25

for day in sorted(birthdays):
    print(day)
```

You'll see:

```
2026-10-09
2026-11-01
2026-12-25
```

Try that with strings in the British style, `"9/10/2026"` and `"15/10/2026"`, and you get the wrong answer: `"9/10/2026" < "15/10/2026"` is `False`, because strings are compared letter by letter, and `"9"` comes after `"1"`. Real dates don't have that problem.

You can also compare a gap with a `timedelta`:

```python
from datetime import date, timedelta

due = date(2026, 10, 15)
today = date(2026, 10, 9)

if due - today <= timedelta(days=7):
    print("Due within a week!")  # prints: Due within a week!
```

(Or compare the plain numbers: `(due - today).days <= 7`. Both work. What doesn't work is mixing them: `due - today <= 7` gives `TypeError: '<=' not supported between instances of 'datetime.timedelta' and 'int'`.)

### Formatting dates for people: `strftime`

`2026-10-09` is perfect for computers, but people like `Friday, 9 October 2026` or `09/10/2026`. The `.strftime()` method ("string format time") turns a date into text using a **format string** full of codes. Each code starts with `%` and is replaced by one part of the date:

```python
from datetime import datetime

meeting = datetime(2026, 10, 9, 14, 5)

print(meeting.strftime("%Y-%m-%d"))  # prints: 2026-10-09
print(meeting.strftime("%d %B %Y"))  # prints: 09 October 2026
print(meeting.strftime("%A"))        # prints: Friday
print(meeting.strftime("%H:%M"))     # prints: 14:05
print(meeting.strftime("%A, %d %B %Y at %H:%M"))  # prints: Friday, 09 October 2026 at 14:05
```

Anything that isn't a code, like the commas, spaces and the word `at`, is copied as it is. Here are the codes you'll use most, shown for Friday 9 October 2026 at 14:05:

| Code | Meaning | Example |
|---|---|---|
| `%Y` | year, 4 digits | `2026` |
| `%y` | year, 2 digits | `26` |
| `%m` | month as a number, 2 digits | `10` |
| `%B` | month name | `October` |
| `%b` | short month name | `Oct` |
| `%d` | day of the month, 2 digits | `09` |
| `%A` | weekday name | `Friday` |
| `%a` | short weekday name | `Fri` |
| `%H` | hour, 24-hour clock | `14` |
| `%I` | hour, 12-hour clock | `02` |
| `%p` | AM or PM | `PM` |
| `%M` | minute | `05` |
| `%S` | second | `00` |

A few common styles:

```python
print(meeting.strftime("%d/%m/%Y"))      # prints: 09/10/2026 (UK, Nepal, India style)
print(meeting.strftime("%m/%d/%Y"))      # prints: 10/09/2026 (US style)
print(meeting.strftime("%I:%M %p"))      # prints: 02:05 PM
print(meeting.strftime("%a %d %b"))      # prints: Fri 09 Oct
```

The same codes work inside an f-string, after a colon, just like `:.2f` (chapter 06):

```python
print(f"The meeting is on {meeting:%A} at {meeting:%H:%M}")
# prints: The meeting is on Friday at 14:05
```

> **Watch out:** `%m` is the **month** and `%M` is the **minute**. Capital letters matter, and mixing these two up is the most common `strftime` bug.

> **Watch out:** You may see `%-d` online, to drop the leading zero (`9` instead of `09`). It works on Mac and Linux, but on Windows it crashes with `ValueError: Invalid format string`. A version that works everywhere: `f"{meeting.day} {meeting:%B %Y}"`, which gives `9 October 2026`.

Month and day names come out in English on most computers. They follow your computer's language settings, so on some setups they could appear in another language.

### Reading dates from text: `strptime`

The opposite job is turning text into a date. Someone types `15/10/2026` into your program, and you need a real date. `datetime.strptime()` ("string parse time") reads text using the same codes. You tell it the pattern the text follows:

```python
from datetime import datetime

text = "15/10/2026"
parsed = datetime.strptime(text, "%d/%m/%Y")

print(parsed)         # prints: 2026-10-15 00:00:00
print(parsed.date())  # prints: 2026-10-15
```

`strptime` always gives back a `datetime`. When there's no time in the text, it uses midnight (`00:00:00`). If you only want the day, add `.date()`.

The pattern must match the text exactly, separators and all:

```python
print(datetime.strptime("9 October 2026", "%d %B %Y").date())  # prints: 2026-10-09
print(datetime.strptime("2026-10-09 14:30", "%Y-%m-%d %H:%M"))  # prints: 2026-10-09 14:30:00
```

If it doesn't match, you get a `ValueError` that shows both the text and the pattern:

```python
datetime.strptime("2026-10-09", "%d/%m/%Y")
# ValueError: time data '2026-10-09' does not match format '%d/%m/%Y'
```

An easy way to remember which is which: str**f**time **f**ormats a date into text, str**p**time **p**arses text into a date. (To **parse** means to read text and work out what it means.)

### The easy path: ISO format

If you get to choose the format, choose ISO (`2026-10-09`). Python has two shortcuts for it, with no codes to remember:

```python
from datetime import date

due = date.fromisoformat("2026-10-09")  # text to date
print(due)              # prints: 2026-10-09
print(due.isoformat())  # prints: 2026-10-09 (date to text)
print(str(due))         # prints: 2026-10-09 (str() gives the same thing)
```

`datetime` has them too: `datetime.fromisoformat("2026-10-09 14:30")` gives `2026-10-09 14:30:00`.

ISO is the best way to **store** dates, for three reasons:

- **There's no confusion.** Everyone in every country reads `2026-10-09` the same way.
- **ISO strings sort correctly**, even as plain text: `sorted(["2026-12-25", "2026-10-09", "2026-11-01"])` gives `['2026-10-09', '2026-11-01', '2026-12-25']`.
- **It's the natural way to save dates in JSON.** In [chapter 21](../21-json-and-csv/notes.md) you saw that JSON can't save a date, and `str()` turns it into ISO text. Now `date.fromisoformat()` turns it back:

```python
import json
from datetime import date

task = {"text": "Return library book", "due": date(2026, 10, 23)}

text = json.dumps({"text": task["text"], "due": task["due"].isoformat()})
print(text)  # prints: {"text": "Return library book", "due": "2026-10-23"}

loaded = json.loads(text)
due = date.fromisoformat(loaded["due"])
print((due - date(2026, 10, 9)).days)  # prints: 14
```

The rule of thumb: **store dates as ISO text, do maths with real `date` objects, and format them nicely only when you show them to a person.**

### Impossible dates: `ValueError`

Python checks that every date really exists:

```python
from datetime import date

date(2026, 2, 30)
# ValueError: day is out of range for month
```

```python
date(2026, 13, 1)
# ValueError: month must be in 1..12
```

```python
date.fromisoformat("09/10/2026")
# ValueError: Invalid isoformat string: '09/10/2026'
```

That's a good thing: an impossible date stops right where it was made, instead of causing strange results later. When dates come from a person or a file, catch the error with `try`/`except` from [chapter 18](../18-error-handling/notes.md):

```python
from datetime import date

text = "2026-02-30"
try:
    due = date.fromisoformat(text)
    print(f"Due on {due:%d %B %Y}")
except ValueError as e:
    print(f"Not a real date: {e}")
```

You'll see:

```
Not a real date: day is out of range for month
```

### Time zones: naive and aware

So far, every `datetime` has been **naive**: it holds a date and a clock time, but no idea **where** that clock is. `datetime(2026, 10, 9, 14, 30)` means "14:30", but 14:30 in Kathmandu happens five and three-quarter hours before 14:30 in London.

For a program that only runs on your computer, naive times are usually fine. But as soon as people in different places share times (a video call, a football match, an online sale that ends "at midnight"), you need **aware** datetimes: ones that carry a time zone with them.

A **time zone** is a region that shares the same clock time. Every time zone is measured from **UTC** (Coordinated Universal Time), the world's reference clock. Nepal is UTC+5:45, India is UTC+5:30, and London is UTC+0 in winter and UTC+1 in summer.

The easiest aware datetime is "now, in UTC":

```python
from datetime import datetime, timezone

print(datetime.now())              # prints something like: 2026-10-09 14:05:09.482371
print(datetime.now(timezone.utc))  # prints something like: 2026-10-09 08:20:09.482371+00:00
```

The `+00:00` on the end is the **offset**: how far this clock is from UTC. A naive datetime has no offset, which is how you can tell them apart. (Those two lines show the same moment, run on a computer in Nepal.)

Python won't let you compare naive and aware datetimes, because it can't know what the naive one meant:

```python
from datetime import datetime, timezone

naive = datetime(2026, 10, 9, 14, 30)
aware = datetime(2026, 10, 9, 14, 30, tzinfo=timezone.utc)
print(naive < aware)
# TypeError: can't compare offset-naive and offset-aware datetimes
```

`tzinfo=` is how you attach a time zone when you make a datetime.

**A fixed offset.** For a place whose clocks never change, like Nepal (which has no summer time), you can build the time zone yourself from a `timedelta`:

```python
from datetime import datetime, timedelta, timezone

NEPAL = timezone(timedelta(hours=5, minutes=45))

call = datetime(2026, 10, 9, 14, 30, tzinfo=NEPAL)
print(call)                           # prints: 2026-10-09 14:30:00+05:45
print(call.astimezone(timezone.utc))  # prints: 2026-10-09 08:45:00+00:00
```

`.astimezone()` shows the same moment on a different clock. 14:30 in Kathmandu **is** 08:45 in UTC: one moment, two clock readings.

**Real time zones with `zoneinfo`.** Many countries move their clocks forward in summer and back in winter (called **daylight saving time**), so a fixed offset isn't enough for them. The `zoneinfo` module knows the rules for every place on Earth, by name. Names look like `"Asia/Kathmandu"`, `"Europe/London"` or `"America/New_York"`: a region and a big city.

On a Mac or Linux, `zoneinfo` works straight away. **On Windows, it needs one extra package**, because Windows doesn't keep the time zone rules where Python can find them. Without it, you get:

```
zoneinfo._common.ZoneInfoNotFoundError: 'No time zone found with key Asia/Kathmandu'
```

The fix is a small package called `tzdata`. You'll learn how installing packages works in [chapter 23](../23-pip-and-virtual-environments/notes.md). If you want to try this section now, run this once in the terminal:

```
python -m pip install tzdata
```

Then this works. Here's a football final, kicking off at 20:00 UTC, shown on clocks around the world:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

kickoff = datetime(2026, 12, 20, 20, 0, tzinfo=timezone.utc)

cities = [
    ("London", "Europe/London"),
    ("New York", "America/New_York"),
    ("Kathmandu", "Asia/Kathmandu"),
    ("Tokyo", "Asia/Tokyo"),
]

for city, zone in cities:
    local = kickoff.astimezone(ZoneInfo(zone))
    print(f"{city:<10} {local:%A %H:%M}")
```

You'll see:

```
London     Sunday 20:00
New York   Sunday 15:00
Kathmandu  Monday 01:45
Tokyo      Monday 05:00
```

One kickoff, four clocks, and in Kathmandu and Tokyo it's already Monday. `zoneinfo` also knows that London is on UTC+1 in summer: `datetime(2026, 7, 1, 12, tzinfo=ZoneInfo("Europe/London"))` prints with `+01:00` on the end, while a December date prints with `+00:00`.

> **Tip:** The habit professionals use: **store times in UTC, and convert to a local time zone only when you show them to a person.** For dates with no clock time, like birthdays and due dates, a plain `date` is all you need, and time zones don't matter.

### The `time` module: timestamps and pauses

You met `time.sleep()` in [chapter 19](../19-modules-and-standard-library/notes.md). The `time` module has one more tool you'll see a lot: `time.time()`.

```python
import time

print(time.time())  # prints something like: 1791541658.8547578
```

That big number is a **timestamp**: the number of seconds since midnight UTC on 1 January 1970, a starting point called the **Unix epoch**. Computers love timestamps because they're just one number, the same everywhere in the world.

The most common use is measuring how long something takes. Take the time before and after, and subtract:

```python
import time

start = time.time()

total = 0
for number in range(5_000_000):
    total += number

elapsed = time.time() - start
print(f"That took {elapsed:.2f} seconds")  # prints something like: That took 0.55 seconds
```

Your number will be different. It depends on your computer, and changes a little every run. (For very precise timing, `time.perf_counter()` works the same way and is more accurate. You'll use it in [chapter 49](../49-performance/notes.md).)

And `time.sleep(seconds)` pauses the program. It also takes decimals, so `time.sleep(0.5)` waits half a second:

```python
import time

for number in range(3, 0, -1):
    print(number)
    time.sleep(1)
print("Happy new year!")
```

### Putting it together: a log with timestamps

In [chapter 20](../20-files-and-folders/notes.md) you wrote a log file, but it didn't say **when** anything happened. Now it can:

```python
from datetime import datetime


def log(message):
    """Add a timestamped line to the end of the log file."""
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("app.log", "a", encoding="utf-8") as f:
        f.write(f"[{stamp}] {message}\n")


log("Program started")
log("Added 3 items to the cart")

with open("app.log", encoding="utf-8") as f:
    print(f.read(), end="")
```

You'll see something like this, with your own date and time:

```
[2026-10-09 14:05:09] Program started
[2026-10-09 14:05:09] Added 3 items to the cart
```

Notice the format: ISO style, biggest part first, with seconds. That way the lines sort in time order, and anyone reading the log knows exactly what each date means.

## Common mistakes

**1. Mixing up the module and the tool called `datetime`**

```python
import datetime

print(datetime.now())
# AttributeError: module 'datetime' has no attribute 'now'
```

With `import datetime`, the name `datetime` is the **module**, and `now()` lives on the `datetime` **tool** inside it. You'd have to write `datetime.datetime.now()` and `datetime.date.today()`, which is a mouthful. Fix: start your files with `from datetime import date, datetime, timedelta`, as this chapter does.

**2. Adding a plain number to a date**

```python
from datetime import date

print(date.today() + 7)
# TypeError: unsupported operand type(s) for +: 'datetime.date' and 'int'
```

Python won't guess whether `7` means days, weeks or hours. Fix: `date.today() + timedelta(days=7)`. The same goes for comparing: compare a gap with `timedelta(days=7)`, or use `.days` to get a plain number first.

**3. Mixing `date` and `datetime`**

```python
from datetime import date, datetime

print(datetime.now() - date.today())
# TypeError: unsupported operand type(s) for -: 'datetime.datetime' and 'datetime.date'
```

A `date` has no time, so Python can't subtract it from a `datetime`. Fix: make both the same kind. `datetime.now().date()` turns the `datetime` into a `date`.

**4. `%m` and `%M` mixed up**

```python
from datetime import datetime

print(datetime.strptime("09/10/2026", "%d/%M/%Y"))  # prints: 2026-01-09 00:10:00
```

No error, just the wrong date! `%M` means **minutes**, so Python read `10` as "ten minutes past midnight", and with no month given, it used January. Fix: `%m` (small m) for the month. When a parsed date looks odd, check every code against the table.

**5. Forgetting the brackets**

```python
from datetime import date

print(date.today)
# prints something like: <built-in method today of type object at 0x00007FF9B931A5B0>
```

`date.today` without brackets is the method itself, not its answer. (The long number is a memory address, and yours will be different.) Fix: `date.today()`. The same goes for `.weekday()`. But the parts `.year`, `.month` and `.day` are attributes, with **no** brackets.

**6. Comparing a date with a string**

```python
from datetime import date

print(date(2026, 10, 9) == "2026-10-09")  # prints: False
```

No error, so this bug can hide for a long time. A date is never equal to a string, even one that looks the same. Fix: turn the string into a date first, with `date.fromisoformat("2026-10-09")`, then compare.

## Quick recap

- `from datetime import date, datetime, timedelta`. A `date` is a calendar day, a `datetime` adds a clock time, and a `timedelta` is a length of time.
- `date.today()` and `datetime.now()` depend on when you run them. Make your own with `date(2026, 10, 9)` and `datetime(2026, 10, 9, 14, 30)`. Months count from 1, and `.weekday()` counts from Monday as 0.
- A date plus a `timedelta` is a date. A date minus a date is a `timedelta`, and `.days` turns it into a number. Dates compare with `<`, `>` and `==`, and work with `sorted()`, `min()` and `max()`.
- `strftime` turns a date into text (`"%d %B %Y"`), and `strptime` reads text into a date. For storing, use ISO: `.isoformat()` and `date.fromisoformat()`.
- Impossible dates raise `ValueError`, so catch it when dates come from people or files.
- Naive datetimes have no time zone, aware ones do. Use `datetime.now(timezone.utc)` and `.astimezone()`. `zoneinfo.ZoneInfo("Asia/Kathmandu")` needs the `tzdata` package on Windows.
- `time.time()` gives a timestamp in seconds, handy for timing code. `time.sleep()` pauses.

---

**Next:** try the [exercises](exercises.md), then move on to [23 pip and Virtual Environments](../23-pip-and-virtual-environments/notes.md).

