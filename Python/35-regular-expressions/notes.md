# 35 Regular Expressions

## What is it?

A **regular expression** (or **regex** for short) is a small pattern that describes the *shape* of the text you're looking for. The pattern `ORD-\d{4}` means "the letters `ORD-`, then exactly four digits". It matches `ORD-4821` and `ORD-0007`, but not `ORD-48` or `order 4821`.

Python's built-in `re` module takes a pattern and some text, and finds every piece of the text that fits the pattern.

## Why does it matter?

The string tools from [chapter 06](../06-strings/notes.md) are great at finding *exact* text. `"ORD-4821" in message` tells you whether that one order code is there. But what if a customer's email mentions some order codes, and you don't know which ones?

```python
text = "My order ORD-4821 hasn't arrived, and ORD-4907 was the wrong size."

codes = []
for word in text.split():
    word = word.strip(",.")
    if word.startswith("ORD-") and len(word) == 8 and word[4:].isdigit():
        codes.append(word)

print(codes)  # prints: ['ORD-4821', 'ORD-4907']
```

It works, but it took a loop, a clean-up step, three checks, and some careful thinking. And it's fragile: if the customer writes `(ORD-4821)` or `ORD-4907!`, the brackets and the `!` aren't stripped off, and those codes get missed.

Here's the same job with a regular expression:

```python
import re

text = "My order ORD-4821 hasn't arrived, and ORD-4907 was the wrong size."
print(re.findall(r"ORD-\d{4}", text))  # prints: ['ORD-4821', 'ORD-4907']
```

One line. It doesn't care about brackets, commas or exclamation marks, because it isn't looking at words: it's looking for anything with the right shape. `re.findall(r"ORD-\d{4}", "Is it (ORD-4821)? Or ORD-4907!")` finds both codes too.

String methods can say "find `ORD-4821`". Only a pattern can say "find `ORD-` followed by four digits". That's what regexes are for: every phone number in a document, every date in a log file, every price on a menu, or checking that a code someone typed has the right shape.

## Real-world example

Imagine a car drives off without paying at a petrol station. A witness didn't catch the whole number plate, but they tell the police: "It started with **BA**, then **two numbers**, then a dash, then **four more numbers**."

The police don't know the exact plate, but they know its *shape*. That's enough to check every car on the street and say "that one fits" or "that one doesn't".

| Describing the plate to the police | Regular expressions |
|---|---|
| "It started with BA" | Plain letters in a pattern match themselves: `BA` |
| "then a number" | `\d` means "any digit" |
| "two of them" | `{2}` means "exactly two of the thing before" |
| The whole description | The pattern: `BA\d{2}-\d{4}` |
| Walking down the street, checking every car | `re.findall()` scanning through the text |
| "Is *this* car's plate exactly that shape?" | `re.fullmatch()`, for checking one value |

## How it works

### Your first search: `re.search`

`re` is part of the standard library ([chapter 19](../19-modules-and-standard-library/notes.md)), so you only need to import it. `re.search(pattern, text)` looks through the text for the first piece that fits the pattern:

```python
import re

message = "Hi, my order ORD-4821 hasn't arrived yet."
match = re.search(r"ORD-\d\d\d\d", message)

print(match)
print(match.group())  # prints: ORD-4821
```

You'll see:

```
<re.Match object; span=(13, 21), match='ORD-4821'>
ORD-4821
```

Let's read the pattern `ORD-\d\d\d\d` piece by piece:

| Piece | Matches |
|---|---|
| `ORD-` | The four characters `O`, `R`, `D` and `-`, exactly. Ordinary characters match themselves. |
| `\d` | Any one digit, `0` to `9` |
| `\d\d\d\d` | Four digits in a row |

When `re.search` finds something, it gives you a **match object**: a little package of information about what it found. `.group()` gives you the matched text itself. The `span=(13, 21)` part tells you where it was found: `message[13:21]` (slicing, from chapter 06) is `ORD-4821`. You can also ask for these with `match.start()` and `match.end()`.

When there's nothing to find, `re.search` gives you `None` instead:

```python
match = re.search(r"ORD-\d\d\d\d", "Thanks, it arrived!")
print(match)  # prints: None
```

So always check for `None` before you use the result. (mypy knows this too: run it on the first example, and it warns that `match` might be `None` there.) Here's the usual pattern, inside a function with hints (the `str | None` from [chapter 25](../25-type-hints/notes.md)):

```python
import re


def find_order(message: str) -> str | None:
    """Return the first order code in the message, or None if there isn't one."""
    match = re.search(r"ORD-\d\d\d\d", message)
    if match is None:
        return None
    return match.group()


print(find_order("Where is ORD-4821?"))  # prints: ORD-4821
print(find_order("Thanks, it arrived!"))  # prints: None
```

### Why the `r` in front? Raw strings

Every pattern in this chapter starts with `r"..."`. That's a **raw string**, which you met in chapter 06 for Windows paths: a string where backslashes are just backslashes.

Patterns are full of backslashes (`\d`, `\s`, `\b` and more). But in a normal string, Python looks at backslashes *first*, before `re` ever sees them, and turns some of them into special characters. `\b` becomes a "backspace" character:

```python
print(len("\b"))   # prints: 1
print(len(r"\b"))  # prints: 2
```

In a normal string, `"\b"` is one strange invisible character. In a raw string, it's two characters: a backslash and a `b`, which is what `re` needs to see. (You'll see what `\b` means in a regex soon.)

Other combinations, like `"\d"`, aren't special to Python, so they happen to survive. But Python warns you about them:

```
SyntaxWarning: invalid escape sequence '\d'
```

The rule is simple: **always write regex patterns as raw strings.** Then you never have to think about it.

### Find them all: `re.findall`

`re.search` stops at the first match. `re.findall` keeps going, and gives you a list of every match, as strings:

```python
import re

order = "Maya wants 3 lattes and 12 cookies for table 7."
print(re.findall(r"\d+", order))  # prints: ['3', '12', '7']
```

(`\d+` means "one or more digits in a row". You'll meet `+` properly in a moment.)

If nothing matches, you get an empty list, `[]`, never `None`. And notice the matches are **strings**. To do maths with them, convert them with `int()`, as usual.

`re.findall` is great for trying out patterns, so the next few sections use it.

### The building blocks: `\d`, `\w`, `\s` and `.`

These shortcuts each match **one character** of a certain kind. They're called **character classes**:

| Pattern | Matches one... | Examples |
|---|---|---|
| `\d` | digit | `0`, `7`, `9` |
| `\w` | "word character": a letter, a digit or an underscore `_` | `a`, `Z`, `4`, `_` |
| `\s` | whitespace character: a space, a tab or a newline | `" "`, `"\t"`, `"\n"` |
| `\D` | anything that is **not** a digit | `a`, `-`, `" "` |
| `\W` | anything that is **not** a word character | `!`, `-`, `" "` |
| `\S` | anything that is **not** whitespace | `a`, `4`, `!` |
| `.` | any character at all, except a newline | `a`, `4`, `!`, `" "` |

The capital letter is always the opposite of the small one. Here they are at work:

```python
import re

print(re.findall(r"\d", "Table 4, 2 teas"))  # prints: ['4', '2']
print(re.findall(r"\w", "Hi, Leo!"))         # prints: ['H', 'i', 'L', 'e', 'o']
print(re.findall(r"\s", "a b\tc"))           # prints: [' ', '\t']
print(re.findall(r"\D", "4B-2"))             # prints: ['B', '-']
```

The dot is a wildcard: "any one character goes here".

```python
print(re.findall(r"c.t", "cat, cut, ct, c-t"))  # prints: ['cat', 'cut', 'c-t']
```

`ct` doesn't match, because the dot needs exactly one character between the `c` and the `t`.

> **Tip:** `\d` matches digits from *every* writing system, not just `0` to `9`. `re.findall(r"\d+", "Call ९८४१ or 42")` gives `['९८४१', '42']`, with the Nepali digits included. That's usually what you want. If you only want `0` to `9`, use `[0-9]`, which you'll meet next.

### Your own set of characters: `[...]` and `[^...]`

Square brackets make your own character class: "any **one** of these characters".

```python
import re

print(re.findall(r"gr[ae]y", "grey, gray or groy?"))  # prints: ['grey', 'gray']
print(re.findall(r"[A-Z]", "Sandip met Maya in Kathmandu"))  # prints: ['S', 'M', 'K']
```

`gr[ae]y` means "`g`, `r`, then an `a` **or** an `e`, then `y`", so it finds both spellings. A dash inside the brackets means a range:

| Pattern | Matches one... |
|---|---|
| `[aeiou]` | lowercase vowel |
| `[0-9]` | digit from `0` to `9` |
| `[a-z]` | lowercase English letter |
| `[A-Z]` | capital English letter |
| `[A-Za-z]` | English letter, either case |
| `[A-Za-z0-9_]` | letter, digit or underscore (like `\w`, but English letters only) |

A `^` straight after the opening bracket flips it: "any one character **except** these".

```python
print(re.findall(r"[^aeiou ]", "tea cup"))  # prints: ['t', 'c', 'p']
```

That's every character that isn't a vowel or a space.

### How many? Quantifiers

So far, each piece of a pattern matched exactly one character. A **quantifier** goes straight after a piece and says how many times it can repeat:

| Quantifier | Means | Example | Matches |
|---|---|---|---|
| `+` | one or more | `\d+` | `7`, `42`, `2026` |
| `*` | zero or more | `\d+ *kg` | `5kg`, `10 kg`, `20   kg` |
| `?` | zero or one (it's optional) | `colou?r` | `color`, `colour` |
| `{3}` | exactly 3 | `\d{3}` | `555` |
| `{2,4}` | from 2 to 4 | `\d{2,4}` | `42`, `365`, `2026` |
| `{2,}` | 2 or more | `\d{2,}` | `42`, `123456` |

```python
import re

print(re.findall(r"\d+", "Mix 250 g flour, 2 eggs and 125 ml milk"))
print(re.findall(r"\d{4}", "Opened in 1998, rebuilt in 2015, room 12"))
print(re.findall(r"colou?r", "color or colour?"))
print(re.findall(r"\d+ *kg", "5kg, 10 kg and 20   kg"))
```

You'll see:

```
['250', '2', '125']
['1998', '2015']
['color', 'colour']
['5kg', '10 kg', '20   kg']
```

A quantifier only applies to the **one thing just before it**. In `colou?r`, the `?` belongs to the `u` alone. In `\d+ *kg`, the `+` belongs to `\d` ("one or more digits") and the `*` belongs to the space ("any number of spaces, even none"). A football commentator's `Go+al!` matches `Goal!` and `Gooooooal!`, because the `+` only repeats the `o`.

### Special characters, and escaping them

Some characters have a special job in a pattern, like `.`, `+` and `?`. Here's the full list:

```
.  ^  $  *  +  ?  {  }  [  ]  \  |  (  )
```

To match one of them as an ordinary character, put a backslash in front of it. This is called **escaping** it. `\.` means "a real dot", `\$` means "a real dollar sign", and `\(` means "a real opening bracket". Prices are a good example, with both a `$` and a `.` in them:

```python
import re

menu = "Latte $3.50, cake $4.25, tip 5"
print(re.findall(r"\$\d+\.\d{2}", menu))  # prints: ['$3.50', '$4.25']
```

Read it as: a dollar sign, one or more digits, a real dot, exactly two digits.

Sometimes the text you're searching for comes from somewhere else, like the user typing it. Then you can't add the backslashes by hand. `re.escape()` adds them for you:

```python
print(re.escape("$4.50 (each)"))  # prints: \$4\.50\ \(each\)
print(re.findall(re.escape("C++"), "I know C, C++ and C#"))  # prints: ['C++']
```

Without `re.escape`, `re.findall("C++", "I know C, C++ and C#")` gives `['C', 'C', 'C']`. There's no error: the `+` signs are read as quantifiers, so the pattern quietly means something else. That's the worst kind of bug, because nothing tells you it's wrong.

### Anchors: `^`, `$` and `\b`

An **anchor** doesn't match a character at all. It matches a *position* in the text:

| Anchor | Matches the position... |
|---|---|
| `^` | at the very start of the text |
| `$` | at the very end of the text |
| `\b` | at the edge of a word: between a word character and a non-word character (or the start or end) |

```python
import re

print(re.search(r"^Hello", "Hello, Sam"))      # finds it
print(re.search(r"^Hello", "Sam said Hello"))  # prints: None
print(re.search(r"\.txt$", "notes.txt"))       # finds it
print(re.search(r"\.txt$", "notes.txt.zip"))   # prints: None
```

You'll see:

```
<re.Match object; span=(0, 5), match='Hello'>
None
<re.Match object; span=(5, 9), match='.txt'>
None
```

`\b` is the one you'll use most. It lets you find whole words only:

```python
print(re.findall(r"cat", "cat, category, concat, a cat!"))
print(re.findall(r"\bcat\b", "cat, category, concat, a cat!"))
```

You'll see:

```
['cat', 'cat', 'cat', 'cat']
['cat', 'cat']
```

Without `\b`, the pattern also found the `cat` hiding inside `category` and `concat`. With `\b` on both sides, it only finds `cat` when it stands alone as a word.

(Careful: `^` means "start" here, but "not" when it's the first thing inside `[...]`. Same character, two different jobs.)

### Checking a whole string: `re.fullmatch`

Finding things inside a long text is one job. The other big job is **validating**: checking that a value someone typed has exactly the right shape (you met validating in [chapter 18](../18-error-handling/notes.md)).

`re.search` is the wrong tool for that, because it's happy to find a match *anywhere*, even with extra text around it. `re.fullmatch` only matches if the pattern fits the **whole** string, from the first character to the last:

```python
import re

pattern = r"ORD-\d{4}"

for code in ["ORD-4821", "ORD-48", "ORD-48210", "my ORD-4821"]:
    found = re.search(pattern, code) is not None
    whole = re.fullmatch(pattern, code) is not None
    print(f"{code:<12} search: {str(found):<6} fullmatch: {whole}")
```

You'll see:

```
ORD-4821     search: True   fullmatch: True
ORD-48       search: False  fullmatch: False
ORD-48210    search: True   fullmatch: False
my ORD-4821  search: True   fullmatch: False
```

`ORD-48210` has five digits, and `my ORD-4821` has extra words in front. `re.search` still found a valid-looking code inside each of them. `re.fullmatch` said no, which is the right answer for a validator.

A validating function usually returns a `bool`:

```python
import re


def is_valid_pin(pin: str) -> bool:
    """A PIN is 4 to 6 digits and nothing else."""
    return re.fullmatch(r"\d{4,6}", pin) is not None


for pin in ["1234", "123", "1234567", "12a4", "12 34", "905512"]:
    print(f"{pin!r}: {is_valid_pin(pin)}")
```

You'll see:

```
'1234': True
'123': False
'1234567': False
'12a4': False
'12 34': False
'905512': True
```

There's a third function, `re.match`, which only checks the **start** of the string. It's an easy one to mix up, so here are all three side by side:

| Function | Where the pattern has to fit |
|---|---|
| `re.search(pattern, text)` | Anywhere in the text |
| `re.match(pattern, text)` | At the start of the text (anything can follow) |
| `re.fullmatch(pattern, text)` | The whole text, start to end |

> **Tip:** You'll see validators written as `re.search(r"^\d{4}$", text)` in older code. That nearly works, but `$` also matches just before a newline at the very end, so `"1234\n"` passes. `re.fullmatch(r"\d{4}", "1234\n")` correctly says `None`. Use `fullmatch` for validating.

### Every match, with details: `re.finditer`

`re.findall` gives you plain strings. Sometimes you want the match objects instead, for example to know *where* each match was. `re.finditer` gives you one match object at a time, ready for a `for` loop:

```python
import re

post = "Loving the new menu! #coffee #Kathmandu #brunch"
print(re.findall(r"#\w+", post))

for match in re.finditer(r"#\w+", post):
    print(match.start(), match.group())
```

You'll see:

```
['#coffee', '#Kathmandu', '#brunch']
21 #coffee
29 #Kathmandu
40 #brunch
```

(`finditer` hands out its matches one at a time, on demand, the way a generator does in [chapter 31](../31-iterators-and-generators/notes.md).)

### Groups: pulling out the parts

Often you want more than the whole match: you want **pieces** of it. Wrap a part of the pattern in round brackets to make a **group**. Here's a date, with the year, month and day each in a group:

```python
import re

line = "Delivered on 2026-10-09 to Priya"
match = re.search(r"(\d{4})-(\d{2})-(\d{2})", line)

if match:
    print(match.group())   # prints: 2026-10-09
    print(match.group(1))  # prints: 2026
    print(match.group(2))  # prints: 10
    print(match.group(3))  # prints: 09
    print(match.groups())  # prints: ('2026', '10', '09')
```

`.group()` with no number (or `.group(0)`) is still the whole match. `.group(1)` is the first bracket, counting opening brackets from the left. `.groups()` gives you all of them as a tuple.

Groups also let you say "this **or** that" with `|`. The `|` means "or", and the brackets show where the choice starts and ends:

```python
import re

recipe = "250 g flour, 2 eggs, 125 ml milk, 1 pinch of salt"
print(re.findall(r"(\d+) (g|ml)", recipe))  # prints: [('250', 'g'), ('125', 'ml')]
```

Notice what `findall` gave back this time. **When a pattern has groups, `findall` returns the groups, not the whole match**: one tuple per match, with one string per group. That's handy here (the amount and the unit, already split up), but it surprises everyone at least once. If you need brackets only for the `|`, and you don't want a group, write `(?:...)` instead. It groups without capturing:

```python
print(re.findall(r"\d+ (?:g|ml)", recipe))  # prints: ['250 g', '125 ml']
```

### Named groups

`match.group(3)` works, but in six months, will you remember what group 3 was? A **named group** gives each group a label. Write `?P<name>` just after the opening bracket:

```python
import re

line = "Delivered on 2026-10-09 to Priya"
match = re.search(r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})", line)

if match:
    print(match.group("year"))  # prints: 2026
    print(match.group("day"))   # prints: 09
    print(match.groupdict())    # prints: {'year': '2026', 'month': '10', 'day': '09'}
```

`.groupdict()` gives you every named group as a dictionary ([chapter 13](../13-dictionaries/notes.md)). The pattern is longer, but the code that uses it reads like plain English.

### Search and replace: `re.sub`

`.replace()` from chapter 06 swaps exact text. `re.sub(pattern, replacement, text)` swaps **everything that fits a pattern**:

```python
import re

print(re.sub(r"\s+", " ", "Too    many     spaces"))  # prints: Too many spaces

for phone in ["(555) 123-4567", "555.123.4567", "555 123 4567"]:
    print(re.sub(r"\D", "", phone))  # prints: 5551234567 (three times)
```

The first line squashes any run of whitespace into one space. The loop replaces every non-digit (`\D`) with nothing, so three different ways of writing a phone number all turn into the same ten digits.

In the replacement, `\1`, `\2` and so on mean "whatever group 1, group 2... matched". That lets you rearrange the pieces. Here are dates turned from ISO style into day/month/year:

```python
import re

text = "Ordered 2026-10-02, delivered 2026-10-09"
print(re.sub(r"(\d{4})-(\d{2})-(\d{2})", r"\3/\2/\1", text))
```

You'll see:

```
Ordered 02/10/2026, delivered 09/10/2026
```

The replacement is a raw string too, because of the backslashes. (With named groups, write `\g<name>` in the replacement, like `r"\g<day>/\g<month>/\g<year>"`.)

Putting both ideas together gives a phone number tidier:

```python
import re


def tidy_phone(phone: str) -> str:
    """Write any 10-digit phone number the same way: 555-123-4567."""
    digits = re.sub(r"\D", "", phone)  # throw away everything that isn't a digit
    if len(digits) != 10:
        return "invalid"
    return re.sub(r"(\d{3})(\d{3})(\d{4})", r"\1-\2-\3", digits)


for phone in ["(555) 123-4567", "555.123.4567", "555 123 4567", "123-45"]:
    print(f"{phone:<16} -> {tidy_phone(phone)}")
```

You'll see:

```
(555) 123-4567   -> 555-123-4567
555.123.4567     -> 555-123-4567
555 123 4567     -> 555-123-4567
123-45           -> invalid
```

### Replacing with a function

Sometimes the replacement needs some working out. It's happy hour at the cafe, and every price on the menu is half price. You can't write "half of it" with `\1`. Instead, give `re.sub` a **function** as the replacement. `re.sub` calls it once for every match, passes it the match object, and puts whatever string it returns into the text:

```python
import re


def half_price(match: re.Match[str]) -> str:
    """Turn one price like $3.50 into half of it."""
    cents = int(match.group(1)) * 100 + int(match.group(2))
    half = cents // 2
    return f"${half // 100}.{half % 100:02}"


menu = "Latte $3.50, muffin $2.25, cake $4.80"
print(re.sub(r"\$(\d+)\.(\d{2})", half_price, menu))
```

You'll see:

```
Latte $1.75, muffin $1.12, cake $2.40
```

Notice you pass `half_price` with **no brackets**. You're handing `re.sub` the function itself, so it can call it later, once per price. (Passing functions around like this is a big idea in [chapter 32](../32-decorators/notes.md).) The hint `re.Match[str]` means "a match object from searching a `str`". The money is turned into whole cents first, as usual, so there are no float surprises.

### Splitting on a pattern: `re.split`

`.split(",")` from chapter 06 splits on one exact separator. Real text is messier. Here's a shopping list that Leo typed in a hurry:

```python
import re

shopping = "eggs, milk;bread  /butter ,  jam"
print(shopping.split(","))
print(re.split(r"\s*[,;/]\s*", shopping))
```

You'll see:

```
['eggs', ' milk;bread  /butter ', '  jam']
['eggs', 'milk', 'bread', 'butter', 'jam']
```

The pattern means "a comma, semicolon or slash, with any amount of space on either side". `re.split` cuts the text wherever that appears, and the spaces disappear along with the separators.

### Flags: ignoring capitals

A **flag** is an extra setting that changes how a pattern behaves. The one you'll use most is `re.IGNORECASE`, which makes capital and small letters count as the same:

```python
import re

review = "Python is great. I love PYTHON. python forever!"
print(re.findall(r"python", review))
print(re.findall(r"python", review, re.IGNORECASE))
```

You'll see:

```
['python']
['Python', 'PYTHON', 'python']
```

Every function in this chapter takes flags as its last argument. `re.I` is a short name for the same thing. Another flag, `re.MULTILINE`, makes `^` and `$` work at the start and end of **every line** instead of only the whole text. To use two flags at once, join them with `|`: `re.IGNORECASE | re.MULTILINE`.

### Giving a pattern a name: `re.compile`

When you use the same pattern in several places, `re.compile` turns it into a **pattern object** that you can store under a name. The pattern object has the same methods you've been using, without the pattern argument:

```python
import re

ORDER_CODE = re.compile(r"ORD-\d{4}")

print(ORDER_CODE.findall("ORD-4821 and ORD-4907"))  # prints: ['ORD-4821', 'ORD-4907']
print(ORDER_CODE.search("Where is ORD-5000?"))
print(ORDER_CODE.fullmatch("ORD-12"))  # prints: None
```

The middle line prints `<re.Match object; span=(9, 17), match='ORD-5000'>`.

Is it faster? A little, but less than you'd think: Python quietly remembers the patterns you used recently, so it doesn't redo the work every time anyway. The real win is the **name**. `ORDER_CODE.search(message)` says what it's looking for, and if the code format ever changes, you change one line. Pattern objects are written in capitals at the top of a file, like other values that never change. The type hint for one is `re.Pattern[str]`.

### Greedy and lazy

Quantifiers are **greedy**: they grab as much text as they can, and only give some back if they have to. That's usually what you want, but watch what happens with `.*` (any characters, as many as possible):

```python
import re

text = 'Maya said "hi" and then "bye".'
print(re.findall(r'".*"', text))   # prints: ['"hi" and then "bye"']
print(re.findall(r'".*?"', text))  # prints: ['"hi"', '"bye"']
```

(These patterns use single quotes on the outside, because they contain double quotes. PEP 8 is fine with that: it says to use whichever quote saves you from backslashes.)

The first pattern started at the first `"`, and `.*` gobbled up everything to the end of the text, then backed up just enough to find a final `"`. So it matched from the very first quote to the very last one.

Adding a `?` after a quantifier makes it **lazy**: it takes as little as possible. `.*?` stops at the first `"` it reaches, so you get each quoted bit on its own. `+?` and `??` work the same way.

Another fix is to say exactly what's allowed between the quotes: `"[^"]*"` means "a quote, then any characters that *aren't* quotes, then a quote". It gives the same `['"hi"', '"bye"']`, and many people find it clearer.

### Putting it together: reading a log file

Log files are one of the most common places to use regexes. Each line has the same shape: a date, a time, a level, and a message. Save these lines as `app.log` (the fourth line is broken on purpose):

```
2026-10-12 09:15:02 INFO User maya logged in
2026-10-12 09:17:45 ERROR Payment failed for order ORD-4821
2026-10-12 09:18:10 WARNING Disk 91% full
something went wrong here
2026-10-12 09:20:33 INFO User leo logged in
2026-10-12 09:21:07 ERROR Payment failed for order ORD-4907
```

Now a program that reads it with named groups, counts the levels with `Counter` (chapter 19), and shows the errors:

```python
import re
from collections import Counter

LOG_LINE = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2}) "
    r"(?P<time>\d{2}:\d{2}:\d{2}) "
    r"(?P<level>[A-Z]+) "
    r"(?P<message>.*)"
)


def parse_line(line: str) -> dict[str, str] | None:
    """Split one log line into its parts, or return None if it doesn't fit."""
    match = LOG_LINE.fullmatch(line.strip())
    if match is None:
        return None
    return match.groupdict()


levels: Counter[str] = Counter()

with open("app.log", encoding="utf-8") as f:
    for line in f:
        entry = parse_line(line)
        if entry is None:
            print(f"Skipping a line I don't understand: {line.strip()!r}")
            continue
        levels[entry["level"]] += 1
        if entry["level"] == "ERROR":
            print(f"Error at {entry['time']}: {entry['message']}")

print(levels)
```

You'll see:

```
Error at 09:17:45: Payment failed for order ORD-4821
Skipping a line I don't understand: 'something went wrong here'
Error at 09:21:07: Payment failed for order ORD-4907
Counter({'INFO': 2, 'ERROR': 2, 'WARNING': 1})
```

A few things to notice:

- The pattern is long, so it's split over four lines. Python glues strings that sit next to each other into one string, so those four raw strings become one pattern. Each line handles one part of the log line, which makes it much easier to read.
- `(?P<message>.*)` at the end means "whatever is left". Greedy is exactly right here.
- For one line, `parse_line` gives back a dictionary like `{'date': '2026-10-12', 'time': '09:18:10', 'level': 'WARNING', 'message': 'Disk 91% full'}`.
- The broken line doesn't crash anything. `fullmatch` gives `None`, and the program says so and carries on.

In [chapter 37](../37-debugging-and-logging/notes.md), you'll make Python write log lines like these for you.

### Try your patterns at regex101.com

Patterns are easier to build when you can see what they match while you type. Go to <https://regex101.com>, choose **Python** in the "Flavor" list on the left, type your pattern at the top and some sample text underneath. It highlights every match, shows what each group caught, and explains your pattern piece by piece in plain words on the right.

> **Tip:** Different languages have slightly different regex rules. JavaScript's are very close to Python's (you may have met them in the [JavaScript course](../../JavaScript/README.md)), but not identical, so always pick the Python flavor. Python's full rules are in the official docs at <https://docs.python.org/3/library/re.html>.

### When *not* to use a regex

Regexes are powerful, but they're hard to read, and a wrong one fails quietly. There's an old programmer joke: "Some people, when they have a problem, think 'I know, I'll use regular expressions.' Now they have two problems." Reach for something simpler first:

- **Simple checks don't need one.** `in`, `.startswith()`, `.endswith()`, `.isdigit()` and `.split()` are clearer when you know the exact text:

  ```python
  print("milk" in "Buy milk and eggs")  # prints: True
  print("photo.jpg".endswith(".jpg"))   # prints: True
  ```

- **Dates:** a pattern can check the *shape* of a date, but not whether it's a real one. `re.fullmatch(r"\d{4}-\d{2}-\d{2}", "2026-13-45")` happily matches. `date.fromisoformat("2026-13-45")` from [chapter 22](../22-dates-and-times/notes.md) knows better: `ValueError: month must be in 1..12`.
- **Web pages (HTML):** HTML is nested, tags have attributes in any order, and pages change. Use a real HTML reader instead, like BeautifulSoup in [chapter 41](../41-web-scraping/notes.md).
- **Email addresses:** the official rules for what counts as an email address are so complicated that a "perfect" regex is enormous, and still can't tell you whether the address *exists*. A rough check (something, an `@`, something, a dot, something) catches typos, and the only real test is sending an email with a confirmation link.

## Common mistakes

**1. Forgetting the `r` in front of the pattern**

```python
import re

print(re.findall("\bcat\b", "my cat sat"))   # prints: []
print(re.findall(r"\bcat\b", "my cat sat"))  # prints: ['cat']
```

No error, just no matches. Without the `r`, Python turned each `\b` into a backspace character before `re` saw the pattern, so it was looking for a backspace, then `cat`, then another backspace. Other patterns, like `"\d+"`, still work but give a warning:

```
SyntaxWarning: invalid escape sequence '\d'
```

(Python's developers plan to turn that warning into an error in a future version.) Fix: always write patterns as raw strings, `r"..."`.

**2. Using `re.match` and expecting it to search everywhere**

```python
import re

print(re.match(r"\d+", "Order 42"))
print(re.search(r"\d+", "Order 42"))
```

You'll see:

```
None
<re.Match object; span=(6, 8), match='42'>
```

`re.match` only looks at the **start** of the text, and `Order 42` starts with a letter. Fix: use `re.search` to find something anywhere, and `re.fullmatch` to check a whole value.

**3. Groups changing what `findall` returns**

```python
import re

menu = "Latte $3.50, cake $4.25"
print(re.findall(r"\$(\d+)\.\d{2}", menu))  # prints: ['3', '4']
```

You wanted the prices, but you got only the dollars. Because the pattern has a group, `findall` returned just the group. Fix: drop the brackets if you don't need them (`r"\$\d+\.\d{2}"` gives `['$3.50', '$4.25']`), use `(?:...)` for brackets that shouldn't capture, or use `re.finditer` and call `.group()` on each match.

**4. A greedy `.*` grabbing too much**

```python
import re

order = "Latte (large) and tea (small)"
print(re.findall(r"\(.*\)", order))   # prints: ['(large) and tea (small)']
print(re.findall(r"\(.*?\)", order))  # prints: ['(large)', '(small)']
```

`.*` ran all the way to the last `)` in the text. Fix: make it lazy with `.*?`, or say what's allowed inside: `r"\([^)]*\)"`.

**5. Forgetting to escape a dot**

```python
import re

print(re.fullmatch(r"\d+.\d{2}", "4x50"))
```

```
<re.Match object; span=(0, 4), match='4x50'>
```

The pattern was meant to check a price like `4.50`, but `4x50` passed. An unescaped `.` means "any character", and `x` is a character. Fix: `r"\d+\.\d{2}"`. The same goes for `$`, `+`, `?`, `(` and the other special characters. When the text comes from a user, use `re.escape()`.

**6. Calling `.group()` when nothing matched**

```python
import re

text = "Thanks, everything arrived!"
code = re.search(r"ORD-\d{4}", text).group()
```

```
AttributeError: 'NoneType' object has no attribute 'group'
```

There was no order code, so `re.search` gave back `None`, and `None` has no `.group()`. This is the "forgetting `None`" bug from chapter 25, and mypy spots it before you run anything:

```
mistake6.py:4: error: Item "None" of "Match[str] | None" has no attribute "group"  [union-attr]
```

Fix: store the match first, and check it:

```python
match = re.search(r"ORD-\d{4}", text)
if match:
    print(f"Order: {match.group()}")
else:
    print("No order code in this message")
```

## Quick recap

- A regular expression describes the *shape* of text. Import `re`, and always write patterns as raw strings: `r"ORD-\d{4}"`.
- `re.search` finds the first match (or `None`, so check), `re.findall` gives a list of every match, `re.finditer` gives match objects one at a time, and `re.fullmatch` checks that a whole value fits, which is what you want for validating.
- Building blocks: `\d \w \s` (and the opposites `\D \W \S`), `.` for any character, `[...]` and `[^...]` for your own sets, quantifiers `+ * ? {n} {n,m}`, and anchors `^ $ \b`. Escape special characters with `\`, or with `re.escape()`.
- Round brackets make groups: `.group(1)`, `.groups()`, and named groups `(?P<year>...)` with `.group("year")` and `.groupdict()`. When there are groups, `findall` returns the groups.
- `re.sub` replaces matches, with `\1` for groups or a function for anything cleverer. `re.split` splits on a pattern. `re.IGNORECASE` ignores capitals. `re.compile` gives a pattern a name.
- Quantifiers are greedy. Add `?` (`.*?`) to make them lazy.
- Don't use a regex when `in` or `.startswith()` will do, for HTML, or as your only check on dates and email addresses.

---

**Next:** try the [exercises](exercises.md), then move on to [36 Testing with pytest](../36-testing-with-pytest/notes.md).
