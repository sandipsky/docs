# 24 Command-Line Programs

## What is it?

A **command-line program** is a program you control by typing extra words after its name when you run it, like `python greet.py Sandip --shout`. Those extra words are called **command-line arguments**.

You've been using programs like this for a while: `python -m pip install cowsay` and `python -m venv .venv` from [chapter 23](../23-pip-and-virtual-environments/notes.md) both work this way. In this chapter, you'll write your own.

## Why does it matter?

Here's a tip calculator in the style of [chapter 07](../07-input-and-output/notes.md):

```python
total = float(input("Bill total: "))
percent = int(input("Tip percent: "))
print(f"Tip: ${total * percent / 100:.2f}")
```

It works, but it asks its questions one at a time, every single time. That gets slow when you use it often. Worse, nothing else can drive it: another program, or a script that runs every morning, can't easily answer the questions for you.

A command-line version takes everything at once, straight from the command:

```
python tip.py 45.50 --percent 15
```

That's quicker to type, easy to repeat (press the up arrow in the terminal and Enter), and easy for other programs to run. Most of the tools programmers use every day, like pip, Git and Python itself, work this way.

## Real-world example

Think about ordering at a coffee counter. You could wait for the barista to ask "What drink?", then "What size?", then "Any milk?". Or you could say it all at once: "A latte, large, with oat milk."

| Coffee counter | Command line |
|---|---|
| Saying your whole order at once | Typing the command with all its arguments |
| "A latte" (always needed, always first) | A **positional argument**: required, known by its position |
| "Large", "with oat milk" (extras you can skip) | **Options**, like `--size large` |
| "Extra hot" (just on or off) | A **flag**, like `--shout` |
| The menu board above the counter | The help screen you get with `-h` |
| "Sorry, we don't do extra-extra-large" | An error message when an argument isn't allowed |

## How it works

### `sys.argv`: the raw list

Python puts every word you type after `python` into a list called `sys.argv` (short for "argument values"). It lives in the `sys` module from [chapter 19](../19-modules-and-standard-library/notes.md). Save this as `args_demo.py`:

```python
import sys

print(sys.argv)
print(f"{len(sys.argv)} items")
```

Run it with some extra words after the file name:

```
python args_demo.py hello 42 "New York"
```

You'll see:

```
['args_demo.py', 'hello', '42', 'New York']
4 items
```

Three things to notice:

1. **Item 0 is the script's own name.** Your arguments start at index 1.
2. **Everything is a string**, even `42`. The terminal only knows about text, so converting is your job, with `int()` or `float()` from [chapter 03](../03-data-types/notes.md).
3. **Spaces split the words**, unless you put quotes around them. `"New York"` arrived as one item. Without the quotes, it would be two: `'New'` and `'York'`.

Here's a greeter that uses `sys.argv`. Save it as `greet_argv.py`:

```python
import sys

name = sys.argv[1]
print(f"Hello, {name}!")
```

`python greet_argv.py Sandip` prints `Hello, Sandip!`. But run it with no name, and the list only has item 0:

```
IndexError: list index out of range
```

You could check the length first and print a message yourself. You could also look for `--shout` in the list with `in`:

```python
import sys

if len(sys.argv) < 2:
    print("Usage: python greet_argv2.py NAME [--shout]")
    sys.exit(1)

name = sys.argv[1]
message = f"Hello, {name}!"
if "--shout" in sys.argv:
    message = message.upper()
print(message)
```

`python greet_argv2.py Sandip --shout` prints `HELLO, SANDIP!`, and with no name you get the usage line. A **usage line** is the one-line summary of how to run a program. By tradition, square brackets mean "optional", and capitals mean "put your own value here".

It works. But imagine adding five more options this way: numbers to convert, defaults to fill in, typos to catch, a help screen to keep up to date. The checking code would soon be longer than the program. That's why Python comes with a better tool.

### `argparse`: your first parser

`argparse` is a standard library module that does all that checking for you. You describe the arguments your program accepts, and it reads `sys.argv`, converts values, catches mistakes, and writes the help screen.

Save this as `greet.py`:

```python
import argparse

parser = argparse.ArgumentParser(description="Say hello to someone.")
parser.add_argument("name", help="who to greet")
args = parser.parse_args()

print(f"Hello, {args.name}!")
```

Line by line:

| Line | What it does |
|---|---|
| `argparse.ArgumentParser(...)` | Makes a **parser**: the thing that reads and checks the arguments. The `description` appears on the help screen. |
| `parser.add_argument("name", ...)` | Says "this program needs one argument, called `name`". The `help` text explains it on the help screen. |
| `parser.parse_args()` | Reads `sys.argv`, checks everything, and gives you back the answers. |
| `args.name` | The value that was typed for `name`. |

**Parsing** just means reading something and working out what each part is. The `args` you get back is a **Namespace**: an object that holds one value for each argument, which you read with a dot, like `args.name`. (Objects with dots are the subject of [chapter 27](../27-classes-and-objects/notes.md). Here you only need to read the values.)

Run it:

```
python greet.py Sandip
```

```
Hello, Sandip!
```

Now forget the name:

```
python greet.py
```

```
usage: greet.py [-h] name
greet.py: error: the following arguments are required: name
```

No traceback. argparse printed the usage line and a clear message, and stopped the program for you.

What about a full name? Spaces split words, so `python greet.py Sandip Shakya` gives:

```
usage: greet.py [-h] name
greet.py: error: unrecognized arguments: Shakya
```

The program expected one name and got two words. Put quotes around it: `python greet.py "Sandip Shakya"` prints `Hello, Sandip Shakya!`.

### The free help screen: `-h`

You wrote no help code, but every argparse program understands `-h` (or `--help`):

```
python greet.py -h
```

```
usage: greet.py [-h] name

Say hello to someone.

positional arguments:
  name        who to greet

options:
  -h, --help  show this help message and exit
```

Every `help=` text you write shows up here. Write them for the person who will use your program in six months' time. Often, that's you.

> **Watch out:** These outputs come from Python 3.13. Python 3.14 and newer print the help screen in colour, and small details of the wording can change between versions.

### Options: `--name value`

The `name` argument above is **positional**: it's required, and argparse knows it by its position. An **option** starts with `--`, can go anywhere on the line, and is usually optional, so it needs a `default`: the value to use when it's left out.

```python
import argparse

parser = argparse.ArgumentParser(description="Say hello to someone.")
parser.add_argument("name", help="who to greet")
parser.add_argument("-g", "--greeting", default="Hello", help="the word to greet with")
args = parser.parse_args()

print(f"{args.greeting}, {args.name}!")
```

```
python greet.py Sandip                      # prints: Hello, Sandip!
python greet.py Sandip --greeting Namaste   # prints: Namaste, Sandip!
python greet.py -g Hi Sandip                # prints: Hi, Sandip!
```

(The `# prints:` comments are just notes for you. Don't type them into the terminal.)

- `"-g", "--greeting"` gives the option two spellings: a short one for typing quickly and a long one that's easy to read. You read the value with the long name: `args.greeting`.
- Options can come before or after the positional arguments. `-g Hi Sandip` works just as well.
- Leave out the value, as in `python greet.py Sandip --greeting`, and argparse catches it:

```
usage: greet.py [-h] [-g GREETING] name
greet.py: error: argument -g/--greeting: expected one argument
```

### `type=`: getting numbers, not strings

Remember, everything on the command line arrives as a string. Add `type=int` (or `type=float`), and argparse converts the value for you, and refuses anything that isn't a number.

Here's a bigger greeter with three options. Each one shows a new idea:

```python
import argparse

GREETINGS = {"en": "Hello", "ne": "Namaste", "es": "Hola"}

parser = argparse.ArgumentParser(description="Say hello to someone.")
parser.add_argument("name", help="who to greet")
parser.add_argument("--times", type=int, default=1, help="how many times to say it")
parser.add_argument("--shout", action="store_true", help="use capital letters")
parser.add_argument(
    "--lang", choices=["en", "ne", "es"], default="en", help="the language to use"
)
args = parser.parse_args()

message = f"{GREETINGS[args.lang]}, {args.name}!"
if args.shout:
    message = message.upper()
for _ in range(args.times):
    print(message)
```

(`_` is the usual name for a loop variable you don't need. You only want the loop to repeat.)

`python greet.py Sandip --lang ne --times 2` prints:

```
Namaste, Sandip!
Namaste, Sandip!
```

`args.times` is already the `int` `2`, ready for `range()`. Type a word instead:

```
python greet.py Sandip --times lots
```

```
usage: greet.py [-h] [--times TIMES] [--shout] [--lang {en,ne,es}] name
greet.py: error: argument --times: invalid int value: 'lots'
```

No `int()` call, no `try`/`except`, and still no crash.

### `action="store_true"`: on/off flags

Some options don't need a value. They're just switched on or off, like a light switch. `--shout` above is one of those:

```python
parser.add_argument("--shout", action="store_true", help="use capital letters")
```

`action="store_true"` means: "if `--shout` is typed, store `True`. If not, store `False`." So `args.shout` is always a `bool`, and you can use it straight in an `if`.

`python greet.py Maya --shout` prints `HELLO, MAYA!`. A flag never takes a value, so `--shout yes` is an error:

```
usage: greet.py [-h] [--times TIMES] [--shout] [--lang {en,ne,es}] name
greet.py: error: unrecognized arguments: yes
```

### `choices=`: only these values

`--lang` only makes sense for the languages in `GREETINGS`. `choices=` lists the allowed values, and argparse turns everything else away:

```
python greet.py Sandip --lang fr
```

```
usage: greet.py [-h] [--times TIMES] [--shout] [--lang {en,ne,es}] name
greet.py: error: argument --lang: invalid choice: 'fr' (choose from 'en', 'ne', 'es')
```

That's much friendlier than the `KeyError: 'fr'` you'd get from `GREETINGS[args.lang]` without it.

Here's the help screen for the bigger greeter. Every option, its default and its choices are documented, and you didn't write a single line of it:

```
usage: greet.py [-h] [--times TIMES] [--shout] [--lang {en,ne,es}] name

Say hello to someone.

positional arguments:
  name               who to greet

options:
  -h, --help         show this help message and exit
  --times TIMES      how many times to say it
  --shout            use capital letters
  --lang {en,ne,es}  the language to use
```

> **Tip:** Want to see everything argparse worked out? Add `print(args)` just after `parse_args()`. For `python greet.py Sandip --shout`, it shows `Namespace(name='Sandip', times=1, shout=True, lang='en')`. It's a handy check while you're building a program.

### `nargs=`: more than one value

So far, each argument takes exactly one value. `nargs` (short for "number of arguments") changes that. The most useful setting is `nargs="+"`, which means "one or more", and gives you a **list**.

Save this as `average.py`. It averages your race times:

```python
import argparse

parser = argparse.ArgumentParser(description="Average some race times.")
parser.add_argument("minutes", type=float, nargs="+", help="one or more times, in minutes")
args = parser.parse_args()

print(args.minutes)
average = sum(args.minutes) / len(args.minutes)
print(f"{len(args.minutes)} runs, average {average:.1f} minutes")
```

```
python average.py 31.5 29 30.25
```

```
[31.5, 29.0, 30.25]
3 runs, average 30.2 minutes
```

`type=float` was used on every value in the list. And with no times at all, you get `error: the following arguments are required: minutes`, because "one or more" means at least one.

| `nargs` | Means | You get |
|---|---|---|
| (left out) | exactly one | a single value |
| `"+"` | one or more | a list |
| `"*"` | zero or more | a list (maybe empty) |
| `"?"` | zero or one | a single value, or the `default` |
| `2` (a number) | exactly that many | a list |

### Sub-commands: `todo add`, `todo list`

Big tools often do several different jobs, and each job needs different arguments. pip is one: `pip install cowsay` needs a package name, but `pip list` and `pip freeze` need nothing. The first word after the program name picks the job. These jobs are called **sub-commands**.

argparse handles them with `add_subparsers()`. Each sub-command gets its own little parser, with its own arguments. Here's a calculator for the end of a cafe meal, with two sub-commands. Save it as `cafe.py`:

```python
import argparse

parser = argparse.ArgumentParser(description="Handy sums for a cafe table.")
subparsers = parser.add_subparsers(dest="command", required=True)

split_parser = subparsers.add_parser("split", help="split the bill")
split_parser.add_argument("total", type=float, help="the bill, like 45.50")
split_parser.add_argument("people", type=int, help="how many people are paying")

tip_parser = subparsers.add_parser("tip", help="work out a tip")
tip_parser.add_argument("total", type=float, help="the bill, like 45.50")
tip_parser.add_argument("--percent", type=int, default=10, help="tip size (default: 10)")

args = parser.parse_args()

if args.command == "split":
    share = args.total / args.people
    print(f"{args.people} people pay ${share:.2f} each")
elif args.command == "tip":
    tip = args.total * args.percent / 100
    print(f"A {args.percent}% tip on ${args.total:.2f} is ${tip:.2f}")
```

The new parts:

| Line | What it does |
|---|---|
| `parser.add_subparsers(dest="command", required=True)` | Says "this program has sub-commands". `dest="command"` stores the chosen one in `args.command`. `required=True` makes choosing one compulsory. |
| `subparsers.add_parser("split", help=...)` | Creates the `split` sub-command and gives back its own parser. |
| `split_parser.add_argument(...)` | Adds arguments that only `split` uses, exactly like before. |
| `if args.command == "split":` | After parsing, check which sub-command was chosen, and do that job. |

Try it:

```
python cafe.py split 45.50 4                 # prints: 4 people pay $11.38 each
python cafe.py tip 45.50                     # prints: A 10% tip on $45.50 is $4.55
python cafe.py tip 45.50 --percent 15        # prints: A 15% tip on $45.50 is $6.83
```

`args` only holds the arguments of the sub-command that ran. For `split`, that's `Namespace(command='split', total=45.5, people=4)`. There's no `args.percent` at all, so only read `args.percent` inside the `tip` branch.

The help screens come in two layers. `python cafe.py -h` lists the sub-commands:

```
usage: cafe.py [-h] {split,tip} ...

Handy sums for a cafe table.

positional arguments:
  {split,tip}
    split      split the bill
    tip        work out a tip

options:
  -h, --help   show this help message and exit
```

And `python cafe.py tip -h` explains one sub-command:

```
usage: cafe.py tip [-h] [--percent PERCENT] total

positional arguments:
  total              the bill, like 45.50

options:
  -h, --help         show this help message and exit
  --percent PERCENT  tip size (default: 10)
```

Mistakes are caught at both levels:

```
python cafe.py
usage: cafe.py [-h] {split,tip} ...
cafe.py: error: the following arguments are required: command

python cafe.py pay 10
usage: cafe.py [-h] {split,tip} ...
cafe.py: error: argument command: invalid choice: 'pay' (choose from 'split', 'tip')

python cafe.py split 45.50
usage: cafe.py split [-h] total people
cafe.py split: error: the following arguments are required: people
```

You'll use exactly this pattern in [chapter 26](../26-project-todo-app/notes.md), to build a to-do app with `add`, `list`, `done` and `remove` sub-commands.

### Exit codes: telling the world how it went

When a program finishes, it hands back a small number called its **exit code**. `0` means "everything went fine". Anything else means "something went wrong". You never see it printed, but other programs check it. For example, a script that runs your program every night can stop and warn you if the exit code isn't `0`.

Your programs exit with `0` by themselves when they reach the end. To stop early with an error code, use `sys.exit(1)` from [chapter 19](../19-modules-and-standard-library/notes.md). argparse already does this for you: every usage error above ended with exit code `2`, which is the traditional code for "you ran me the wrong way".

You can see the last exit code in the terminal. In PowerShell:

```
python greet.py Sandip
$LASTEXITCODE
```

```
Hello, Sandip!
0
```

Run `python greet.py` (no name) followed by `$LASTEXITCODE`, and you get the usage error and then `2`. In Command Prompt, the same check is `echo %ERRORLEVEL%`. On Mac and Linux, it's `echo $?`.

### Errors go to `sys.stderr`

A program actually has two output channels, both shown in the terminal:

- **Standard output** (`sys.stdout`): the normal results. This is where `print()` writes.
- **Standard error** (`sys.stderr`): error messages and warnings.

Why two? Because results are often sent somewhere else. In [chapter 23](../23-pip-and-virtual-environments/notes.md), `pip freeze > requirements.txt` sent pip's normal output into a file. If error messages went into the same file, you'd never see them, and the file would be full of junk. Errors written to `sys.stderr` still appear on the screen, even when the results go into a file.

`print()` can write to standard error with `file=sys.stderr` (the same `file=` you used to print into a file in [chapter 20](../20-files-and-folders/notes.md)):

```python
import sys

print("Error: that file doesn't exist", file=sys.stderr)
sys.exit(1)
```

The pattern for every error in a command-line program is the same: print a clear message to `sys.stderr`, then `sys.exit(1)`.

### Putting it together: a unit converter

Here's a small but complete tool that converts distances. It uses positional arguments, `type=`, `choices=` and an option with a default. Save it as `convert.py`:

```python
import argparse

# How many metres are in one of each unit
METRES_PER_UNIT = {"m": 1, "km": 1000, "mi": 1609.344, "ft": 0.3048}
UNITS = list(METRES_PER_UNIT)

parser = argparse.ArgumentParser(description="Convert between units of distance.")
parser.add_argument("value", type=float, help="the number to convert")
parser.add_argument("from_unit", choices=UNITS, help="the unit you have")
parser.add_argument("to_unit", choices=UNITS, help="the unit you want")
parser.add_argument("--decimals", type=int, default=2, help="decimal places (default: 2)")
args = parser.parse_args()

metres = args.value * METRES_PER_UNIT[args.from_unit]
result = round(metres / METRES_PER_UNIT[args.to_unit], args.decimals)
print(f"{args.value} {args.from_unit} = {result} {args.to_unit}")
```

```
python convert.py 5 km mi                     # prints: 5.0 km = 3.11 mi
python convert.py 26.2 mi km --decimals 1     # prints: 26.2 mi = 42.2 km
python convert.py 1 mi ft                     # prints: 1.0 mi = 5280.0 ft
```

The trick is to convert everything to metres first, then from metres to the unit you want. That way, four units need only four numbers in the dictionary, not a separate rule for every pair. And because the choices come from the dictionary, adding a new unit is one new line:

```
python convert.py 3 yd m
usage: convert.py [-h] [--decimals DECIMALS] value {m,km,mi,ft} {m,km,mi,ft}
convert.py: error: argument from_unit: invalid choice: 'yd' (choose from 'm', 'km', 'mi', 'ft')
```

### Putting it together: a word counter

This one counts the lines and words in one or more text files. It uses `nargs="+"`, a flag, `pathlib` from [chapter 20](../20-files-and-folders/notes.md), `try`/`except` from [chapter 18](../18-error-handling/notes.md), and an exit code. Save it as `wordcount.py`:

```python
import argparse
import sys
from pathlib import Path

parser = argparse.ArgumentParser(description="Count the lines and words in text files.")
parser.add_argument("files", nargs="+", help="one or more text files")
parser.add_argument("--words-only", action="store_true", help="only show word counts")
args = parser.parse_args()

problems = 0
for name in args.files:
    try:
        text = Path(name).read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"wordcount: {name}: no such file", file=sys.stderr)
        problems += 1
        continue
    words = len(text.split())
    if args.words_only:
        print(f"{name}: {words} words")
    else:
        lines = len(text.splitlines())
        print(f"{name}: {lines} lines, {words} words")

if problems > 0:
    sys.exit(1)
```

Notice `--words-only` became `args.words_only`. Python names can't contain dashes, so argparse swaps them for underscores.

Make two small text files to test it. `fox.txt`:

```
The quick brown fox
jumps over
the lazy dog
```

and `python.txt`:

```
Python reads almost like English.
That is why people love it.
```

Then run it with a file that doesn't exist in the middle:

```
python wordcount.py fox.txt missing.txt python.txt
```

```
fox.txt: 3 lines, 9 words
wordcount: missing.txt: no such file
python.txt: 2 lines, 11 words
```

One missing file doesn't stop the others from being counted. But the exit code is `1`, so anything that runs this tool knows something went wrong. And because the error went to `sys.stderr`, it still appears on screen when the results go into a file:

```
python wordcount.py fox.txt missing.txt > results.txt
```

```
wordcount: missing.txt: no such file
```

Open `results.txt`, and it only contains the clean result: `fox.txt: 3 lines, 9 words`.

## Common mistakes

**1. Forgetting that arguments are strings**

With `sys.argv`, nothing is converted for you. Save this as `add.py`:

```python
import sys

print(sys.argv[1] + sys.argv[2])
```

`python add.py 2 3` prints `23`, not `5`. The two strings were joined. argparse has the same trap if you leave out `type=`:

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("total")
parser.add_argument("people")
args = parser.parse_args()

print(args.total / args.people)
```

```
TypeError: unsupported operand type(s) for /: 'str' and 'str'
```

Fix: convert with `int()` / `float()` when using `sys.argv`, or add `type=float` and `type=int` with argparse.

**2. Typing the dash in the attribute name**

```python
parser.add_argument("--max-price", type=float, default=10.0)
args = parser.parse_args()
print(f"Showing items under ${args.max-price}")
```

```
AttributeError: 'Namespace' object has no attribute 'max'
```

Python read `args.max-price` as `args.max` minus `price`. argparse turns dashes in option names into underscores, so the value lives in `args.max_price`.

**3. Forgetting quotes around words with spaces**

```
python greet.py Sandip Shakya
usage: greet.py [-h] name
greet.py: error: unrecognized arguments: Shakya
```

The terminal splits the line at every space before Python even sees it. Put quotes around anything that contains a space: `python greet.py "Sandip Shakya"`.

**4. Putting your options before the file name**

```
python --name Sandip greet.py
unknown option --name
```

Python then prints its own usage line. Everything between `python` and the file name is for Python itself, not for your program. Python doesn't have a `--name` option, so it complains. Your program's arguments always go *after* the file name: `python greet.py --name Sandip`.

**5. Using a Python keyword as an option name**

```python
parser.add_argument("--from", default="km")
args = parser.parse_args()
print(args.from)
```

```
SyntaxError: invalid syntax
```

`from` is a keyword (remember `from math import sqrt`?), so `args.from` isn't valid Python. Give the value a different name with `dest=`: `parser.add_argument("--from", dest="from_unit")`. The option is still typed as `--from`, but you read it as `args.from_unit`.

**6. Printing an error, but exiting with `0`**

```python
print("Error: no such file")
```

The message appears, but the program ends normally, so its exit code is `0` and anything checking it thinks all went well. And because the message went to standard output, it ends up inside the file when someone uses `>`. Fix: `print("Error: no such file", file=sys.stderr)`, then `sys.exit(1)`.

## Quick recap

- Command-line arguments are the words typed after `python file.py`. `sys.argv` holds them as a list of strings, with the script's name at index 0.
- `argparse` does the hard work: `ArgumentParser()`, then `add_argument()` for each argument, then `args = parser.parse_args()`, then read `args.name`.
- Positional arguments are required. Options start with `--` and need a `default`. Use `type=int`, `action="store_true"` for on/off flags, `choices=` for a fixed set of values, and `nargs="+"` for one or more.
- Every argparse program gets a free `-h` help screen, built from your `help=` texts, and friendly errors with exit code `2`.
- Sub-commands (`add_subparsers(dest="command", required=True)` and `add_parser()`) let one program do several jobs, each with its own arguments.
- For your own errors: print to `sys.stderr`, then `sys.exit(1)`. Exit code `0` means success.

---

**Next:** try the [exercises](exercises.md), then move on to [25 Type Hints](../25-type-hints/notes.md).
