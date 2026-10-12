# 35 Regular Expressions: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- `re` comes with Python, so there's nothing to install. If you want to check your hints with mypy, use the virtual environment from [chapter 25](../25-type-hints/notes.md) and run `python -m mypy ex1.py`.
- Write every pattern as a raw string, `r"..."`, and put hints on every function.
- Stuck on a pattern? Paste it into <https://regex101.com> (with the **Python** flavor) together with some sample text, and see what it really matches.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Order numbers in the inbox

You help out at an online cake shop. Customers write in about their orders, and every order code looks like `ORD-` followed by exactly four digits. Start `ex1.py` with today's messages:

```python
messages = [
    "Hi, where is my order ORD-4821?",
    "Thanks, the cake was lovely!",
    "ORD-5002 and ORD-5003 both arrived damaged.",
    "My order number is ord-7781, I think.",
    "Is ORD-123 right? It looks short.",
]
```

1. Write `first_order_code(message: str) -> str | None` that returns the first order code in a message, or `None` if there isn't one. Use it in a loop to print each message's number and its code.
2. Write `all_order_codes(messages: list[str]) -> list[str]` that returns every order code from every message, in order. Print how many there are, and the list.

Expected output:

```
1: ORD-4821
2: no order code
3: ORD-5002
4: no order code
5: no order code
Found 3 order codes: ['ORD-4821', 'ORD-5002', 'ORD-5003']
```

3. The customer in message 4 typed the code in small letters, and it was missed. Add a second version, `all_order_codes_any_case`, that also finds codes written in any mix of capitals, and gives them all back in capitals. Its line of output should be:

```
Found 4 order codes: ['ORD-4821', 'ORD-5002', 'ORD-5003', 'ORD-7781']
```

`ORD-123` must never be found: it's too short to be a real code.

<details>
<summary>Hint 1</summary>

For part 1, `re.search` gives a match object or `None`. Look at `find_order` in the notes. For the numbering, `enumerate(messages, start=1)` from chapter 11 does the counting for you.

</details>

<details>
<summary>Hint 2</summary>

For part 2, `re.findall` gives a list for one message. To add all the items of one list to the end of another, use `.extend()` instead of `.append()`.

</details>

<details>
<summary>Hint 3</summary>

For part 3, there's a flag that makes capitals and small letters count as the same. The codes it finds keep whatever capitals the customer typed, so turn each one into capitals with a string method from chapter 06.

</details>

---

## Exercise 2 (Easy): Check library card numbers

At the town library, every card number is **two capital letters followed by exactly six digits**, like `LB204518`. People type their card number into a self-service machine, and the machine should only accept the right shape.

Write `is_valid_card(card: str) -> bool` in `ex2.py`, and test it with this list:

```python
CARDS = ["LB204518", "lb204518", "LB20451", "LB2045189", " LB204518",
         "L8204518", "LB-204518", "KT000001", "LB--204518"]

for card in CARDS:
    print(f"{card!r:<13} {is_valid_card(card)}")
```

Expected output:

```
'LB204518'    True
'lb204518'    False
'LB20451'     False
'LB2045189'   False
' LB204518'   False
'L8204518'    False
'LB-204518'   False
'KT000001'    True
'LB--204518'  False
```

Then the library changes its mind: old cards were printed with a dash, like `LB-204518`, and those should work too. Change the pattern so that **one** dash between the letters and the digits is allowed, but not required. Now `'LB-204518'` gives `True`, and every other line stays the same (including `'LB--204518'`, which is still `False`).

Answer in a comment: why is `' LB204518'` (with a space in front) rejected? Would it still be rejected if you'd used `re.search` instead?

<details>
<summary>Hint 1</summary>

Which function checks that the pattern fits the **whole** string? And remember the trick `... is not None` for turning a match into `True` or `False`.

</details>

<details>
<summary>Hint 2</summary>

"Two capital letters" is a character set with a quantifier after it. Look at the `[A-Z]` row in the notes, and at `{n}`.

</details>

<details>
<summary>Hint 3</summary>

For the dash: which quantifier means "zero or one"? It goes straight after the thing it applies to.

</details>

---

## Exercise 3 (Medium): Scale a recipe

Priya's pancake recipe serves 2, but she's cooking for 6. Instead of doing the sums in her head, she wants a program that rewrites the recipe. Start `ex3.py` with the recipe as a triple-quoted string (chapter 06):

```python
PANCAKES = """Pancakes (serves 2)
200 g flour
2 eggs
300 ml milk
1 tbsp sugar
1 tsp baking powder
Rest the batter for 10 minutes.
Heat the pan to 180 C and cook each side for 2 minutes."""
```

Write `scale_recipe(recipe: str, factor: int) -> str`. It multiplies:

- every number that's followed by a space and one of these units: `g`, `ml`, `tbsp`, `tsp` or `eggs`,
- and the number after `serves`.

Every other number stays as it is. The oven temperature and the cooking times must **not** change!

```python
print(scale_recipe(PANCAKES, 3))
print()
print(scale_recipe("Add 2 grapes and 5 g gum", 2))
```

Expected output:

```
Pancakes (serves 6)
600 g flour
6 eggs
900 ml milk
3 tbsp sugar
3 tsp baking powder
Rest the batter for 10 minutes.
Heat the pan to 180 C and cook each side for 2 minutes.

Add 2 grapes and 10 g gum
```

Look closely at the last line. `grapes` starts with a `g`, but it isn't the unit `g`, so `2 grapes` stays the same. Make sure your pattern gets that right.

<details>
<summary>Hint 1</summary>

This is a job for `re.sub` with a **function** as the replacement, like `half_price` in the notes. Use two groups: one for the number and one for the unit. The function multiplies the number and puts the unit back.

</details>

<details>
<summary>Hint 2</summary>

The replacement function needs to know `factor`, but `re.sub` only passes it the match. Write the function *inside* `scale_recipe`, so it can see `factor`: that's a closure, from [chapter 32](../32-decorators/notes.md). (A `lambda` from [chapter 34](../34-functional-tools/notes.md) works too.)

</details>

<details>
<summary>Hint 3</summary>

The "or" between the units is `(g|ml|tbsp|tsp|eggs)`. To stop `g` matching the start of `grapes`, add an anchor that means "the word ends here". Then do the `serves` number with a second `re.sub`.

</details>

---

## Exercise 4 (Medium): The gym door log

The gym's front door writes a line to a log file every time a member taps their card. Save these lines as `door.log` in this folder (one line is broken on purpose):

```
2026-10-12 06:02 IN maya
2026-10-12 06:15 IN leo
2026-10-12 06:20 DENIED tom (card expired)
2026-10-12 07:01 OUT maya
2026-10-12 07:05 IN zoe
2026-10-12 07:30 OUT leo
door sensor restarted
2026-10-12 07:45 DENIED sam (unknown card)
2026-10-12 08:10 OUT zoe
```

Each good line is a date, a time (hours and minutes), an action (`IN`, `OUT` or `DENIED`), the member's name, and, only for `DENIED`, a reason in brackets.

Write `ex4.py` to read the file and print a report:

1. Make one compiled pattern, `DOOR_LINE`, with **named groups** for the date, the hour, the minute, the action, the member and the reason. Split it over several lines like `LOG_LINE` in the notes.
2. Write `parse_line(line: str) -> re.Match[str] | None`. Lines that don't fit are reported as skipped.
3. Count each action, list the people turned away, and work out the longest visit (from `IN` to `OUT`) in minutes.

Expected output:

```
Skipped: 'door sensor restarted'
IN: 3, OUT: 3, DENIED: 2
Denied at the door:
  06:20 tom (card expired)
  07:45 sam (unknown card)
Longest visit: leo, 75 minutes
```

<details>
<summary>Hint 1</summary>

The action is one of three words: `(?P<action>IN|OUT|DENIED)`. The reason is the tricky part, because it's only there sometimes. Wrap the space, the brackets and the reason in a non-capturing group `(?:...)`, and put `?` after it to make the whole thing optional. Remember to escape the real brackets: `\(` and `\)`.

</details>

<details>
<summary>Hint 2</summary>

When an optional group didn't match, `match.group("reason")` gives `None`. Test your pattern on single lines first: `print(DOOR_LINE.fullmatch("2026-10-12 06:20 DENIED tom (card expired)"))`.

</details>

<details>
<summary>Hint 3</summary>

Separate hour and minute groups make the time easy to turn into "minutes since midnight": hours times 60, plus minutes. Keep a dictionary of when each member came `IN`, and when they go `OUT`, subtract. `Counter` from chapter 19 is handy for counting the actions.

</details>

---

## Exercise 5 (Challenge): Build your own search tool

Programmers have a famous tool called `grep` that shows every line of a file that matches a regex. Build a small one of your own in `ex5.py`. It brings together argparse ([chapter 24](../24-command-line-programs/notes.md)), files ([chapter 20](../20-files-and-folders/notes.md)) and error handling ([chapter 18](../18-error-handling/notes.md)).

Save this as `menu.txt` to search in:

```
Latte $3.50
Cappuccino $3.80
Iced latte $4.10
Masala chai $2.90
Hot chocolate $3.20
Chocolate muffin $2.75
Lemon cake $3.95
```

The tool takes a pattern and a file name, and an optional `-i` / `--ignore-case` flag. It prints each matching line with its line number, puts every match inside `[square brackets]`, and ends with a count. `python ex5.py -h` should show:

```
usage: ex5.py [-h] [-i] pattern file

Show the lines of a file that match a pattern.

positional arguments:
  pattern            the regular expression to look for
  file               the text file to search

options:
  -h, --help         show this help message and exit
  -i, --ignore-case  ignore capital letters
```

Here are some runs to check against:

```
python ex5.py latte menu.txt
3: Iced [latte] $4.10
1 matching line

python ex5.py latte menu.txt --ignore-case
1: [Latte] $3.50
3: Iced [latte] $4.10
2 matching lines

python ex5.py '\$3\.\d\d' menu.txt
1: Latte [$3.50]
2: Cappuccino [$3.80]
5: Hot chocolate [$3.20]
7: Lemon cake [$3.95]
4 matching lines

python ex5.py 'choc\w+' menu.txt -i
5: Hot [chocolate] $3.20
6: [Chocolate] muffin $2.75
2 matching lines

python ex5.py tea menu.txt
No matches.
```

And two problems, which must print a friendly message to `sys.stderr` and finish with exit code `1` (check with `$LASTEXITCODE`):

```
python ex5.py '(latte' menu.txt
Invalid pattern: missing ), unterminated subpattern at position 0

python ex5.py latte menus.txt
No such file: menus.txt
```

> **Watch out:** In PowerShell, put patterns in **single quotes**, like `'\$3\.\d\d'`. Inside double quotes, PowerShell treats `$3` as one of its own variables and swaps it for nothing before Python ever sees it. The pattern becomes empty, and an empty pattern matches every line. (In Command Prompt, use double quotes instead.)

<details>
<summary>Hint 1</summary>

Compile the pattern once, with `re.IGNORECASE` when the flag is on and `0` (no flags) when it's off. A bad pattern makes `re.compile` raise `re.error` (since Python 3.13 it's also called `re.PatternError`; both names work). Catch it, and print `e` to get Python's explanation.

</details>

<details>
<summary>Hint 2</summary>

To wrap each match in brackets, use `.sub()` on the compiled pattern. In the replacement, `\g<0>` means "the whole match", so `r"[\g<0>]"` puts brackets around it.

</details>

<details>
<summary>Hint 3</summary>

Look at the `wordcount.py` example in chapter 24 for the shape of the program: argparse at the top, `try`/`except FileNotFoundError` around the reading, and `print(..., file=sys.stderr)` followed by `sys.exit(1)` for each problem. Watch the count line: `1 matching line`, but `2 matching lines`.

</details>

---

## Before you move on

You can now describe text by its shape and find it, check it, pull it apart and rewrite it. Regexes will keep turning up: cleaning data, reading logs, checking what people type.

But how do you know your patterns really work, for every tricky input, and keep working after you change them? Running the program and reading the output by eye gets old fast. In [chapter 36](../36-testing-with-pytest/notes.md), you'll write tests that check your code for you, in a second, every time.
