# 37 Regular Expressions

## What is it?

A **regular expression** (or **regex** for short) is a search pattern. Instead of saying *exactly* what text you're looking for, you describe what it *looks like*.

"Find the word `cat`" is a normal search. "Find any five-digit number" is a pattern, and that's what regular expressions are for.

## Why does it matter?

In [chapter 06](../06-strings/notes.md), you searched text with `includes`, `indexOf`, and `replace`. They're great, but they only find **exact** text. Real-world jobs often need patterns:

- Pull every price out of a receipt, whatever the prices are.
- Check that a ZIP code is exactly five digits.
- Clean up phone numbers that people typed as `(555) 123-4567`, `555.123.4567`, or `555 123 4567`.
- Find every date like `2026-09-24` in a long log file.

Without regex, each of those is a long, fiddly loop. With regex, it's often one line, once you can read the pattern.

Let's be honest, though: regex looks like a cat walked across the keyboard at first. `/^\d{5}$/` isn't friendly. That's normal, and it gets easier fast. In this chapter, you'll build every pattern one small piece at a time, and each one gets a plain-English explanation.

## Real-world example

Imagine you're picking up a friend's cousin at the airport. You've never met her, so you can't look for her face. Instead, your friend describes her: *"curly hair, a green jacket, and a guitar case."* You scan the crowd for anyone who fits.

A normal search is looking for someone you already know. A regex is the description. It doesn't say *who* you want, only what they look like.

Describing text works the same way:

| You'd say | As a regex |
|---|---|
| "the word *cat*" | `/cat/` |
| "any digit" | `/\d/` |
| "exactly five digits, and nothing else" | `/^\d{5}$/` |
| "a date like 2026-09-24" | `/\d{4}-\d{2}-\d{2}/` |

By the end of this chapter, you'll be able to read and write every one of those.

## How it works

### Your first regex: `test`

A regex goes between two forward slashes, the way a string goes between quotes. The simplest question you can ask it is "does this pattern appear anywhere in the text?" The `test` method answers with `true` or `false`:

```js
const pattern = /cat/;

console.log(pattern.test("I love my cat")); // prints: true
console.log(pattern.test("I love my dog")); // prints: false
console.log(pattern.test("Concatenate"));   // prints: true
```

The last one surprises people. A regex looks for its letters *anywhere* in the text, even in the middle of a longer word: con-**cat**-enate. You'll see how to be stricter soon.

### Flags: `i`, `g`, and `m`

Letters after the closing slash are **flags**: settings that change how the whole regex behaves.

```js
console.log(/cat/.test("CAT"));  // prints: false (case matters by default)
console.log(/cat/i.test("CAT")); // prints: true
```

You'll meet three flags in this chapter:

| Flag | Name | What it does |
|---|---|---|
| `i` | ignore case | `a` and `A` count as the same letter |
| `g` | global | find **every** match, not only the first one |
| `m` | multiline | makes `^` and `$` (coming soon) work on each line, not just the whole text |

You can combine flags, like `/cat/gi`.

### `match`: what did it find?

`test` only says yes or no. To see *what* matched, use the string method `match`. With the `g` flag, it gives you an array of every match:

```js
const order = "2 bagels, 1 coffee, 3 cookies";

console.log(order.match(/\d/g));  // prints: [ '2', '1', '3' ]
console.log(order.match(/tea/g)); // prints: null
```

Two things to notice:

- `\d` means "any digit". It's your first special piece, and there are more below.
- When nothing matches, you get `null`, not an empty array. Keep that in mind: it's the first of the common mistakes at the end.

Without `g`, `match` stops at the first match and tells you more about it:

```js
const order = "2 bagels, 1 coffee, 3 cookies";
console.log(order.match(/\d/));
```

You'll see:

```
[
  '2',
  index: 0,
  input: '2 bagels, 1 coffee, 3 cookies',
  groups: undefined
]
```

It's still an array with the match at `[0]`, plus a few extras: `index` is where the match starts in the text, and `groups` will make sense later in this chapter.

While you're learning, `match` with `g` is your best friend. It shows you exactly what a pattern finds.

### Building a regex from a variable: `new RegExp`

Sometimes the pattern comes from a variable, like a word someone typed into a search box. Then you create the regex with `new RegExp(text, flags)`:

```js
const searchWord = "tea";
const pattern = new RegExp(searchWord, "i");

console.log(pattern);                   // prints: /tea/i
console.log(pattern.test("Green TEA")); // prints: true
```

When you know the pattern in advance, the `/.../` form is shorter, so use that.

### Character classes: `\d`, `\w`, `\s`, and `.`

A **character class** is a piece that matches **one** character out of a whole group of characters.

| Piece | Matches one... | For example |
|---|---|---|
| `\d` | digit | `0` to `9` |
| `\w` | "word character": an English letter (`a` to `z`, `A` to `Z`), a digit, or `_` | `a`, `Z`, `7`, `_` (but not `é`) |
| `\s` | whitespace character: a space, a tab, or a new line | `" "` |
| `.` | character of any kind (except a new line) | `a`, `7`, `!`, `" "` |

The capital versions mean the opposite: `\D` is "anything that's *not* a digit", `\W` is "not a word character", and `\S` is "not whitespace".

```js
const address = "Room 12B, floor 3";

console.log(address.match(/\d/g)); // prints: [ '1', '2', '3' ]
console.log(address.match(/\s/g)); // prints: [ ' ', ' ', ' ' ]

console.log("Hi, Sam_99!".match(/\W/g));  // prints: [ ',', ' ', '!' ]
console.log("cat cot cut".match(/c.t/g)); // prints: [ 'cat', 'cot', 'cut' ]
```

Read `c.t` as "a `c`, then any one character, then a `t`". Normal letters like `c` and `t` just match themselves.

### Quantifiers: how many?

So far, each piece matches exactly one character. A **quantifier** goes right after a piece and says how many of it you want.

| Quantifier | Means | Example | Matches |
|---|---|---|---|
| `+` | one or more | `\d+` | `7`, `42`, `2026` |
| `*` | zero or more | `go*al` | `gal`, `goal`, `gooooal` |
| `?` | zero or one (it's optional) | `colou?r` | `color`, `colour` |
| `{3}` | exactly 3 | `\d{3}` | `555` |
| `{2,4}` | from 2 to 4 | `\d{2,4}` | `12`, `123`, `1234` |
| `{2,}` | 2 or more | `\d{2,}` | `12`, `12345` |

`+` is the one you'll use most. Look at the difference it makes:

```js
const receipt = "2 coffees for $12, 1 muffin for $4";

console.log(receipt.match(/\d/g));  // prints: [ '2', '1', '2', '1', '4' ]
console.log(receipt.match(/\d+/g)); // prints: [ '2', '12', '1', '4' ]
```

`\d` finds single digits, so `12` gets chopped into `1` and `2`. `\d+` means "one or more digits in a row", so it grabs whole numbers.

`?` makes the piece right before it optional. Here it's only the `u`:

```js
const color = /colou?r/;

console.log(color.test("color"));  // prints: true
console.log(color.test("colour")); // prints: true
```

### Character sets: `[abc]`, `[a-z]`, and `[^abc]`

Square brackets make a **character set**: a piece that matches any **one** character from a list you choose. (Regex just uses the word "set" too. It has nothing to do with the `Set` from [chapter 35](../35-map-and-set/notes.md).)

| Piece | Matches one... |
|---|---|
| `[aeiou]` | vowel |
| `[a-z]` | lowercase letter from `a` to `z` (a dash inside brackets makes a range) |
| `[A-Za-z]` | letter, lowercase or uppercase (ranges can be combined) |
| `[0-9]` | digit, the same as `\d` |
| `[^0-9]` | character that is **not** a digit (a `^` right after `[` means "not") |

```js
console.log("banana bread".match(/[aeiou]/g)); // prints: [ 'a', 'a', 'a', 'e', 'a' ]
console.log("Size: XL".match(/[A-Z]+/g));        // prints: [ 'S', 'XL' ]
```

The second one is a set plus a quantifier: "one or more capital letters in a row".

Remember the ZIP code field from [chapter 22](../22-forms/notes.md), with `pattern="[0-9]{5}"`? Now you can read it: "a character from `0` to `9`, exactly five times".

### Anchors: `^` and `$`

The patterns so far match *anywhere* in the text. That's perfect for searching, but wrong for checking what someone typed. Watch:

```js
const zipCode = /\d{5}/;

console.log(zipCode.test("90210"));     // prints: true
console.log(zipCode.test("902101"));    // prints: true (it contains five digits in a row)
console.log(zipCode.test("zip 90210")); // prints: true
```

An **anchor** pins the pattern to a position. `^` means "the start of the text" and `$` means "the end of the text". Put them around your pattern, and the *whole* text has to match:

```js
const zipCode = /^\d{5}$/;

console.log(zipCode.test("90210"));     // prints: true
console.log(zipCode.test("9021"));      // prints: false (too short)
console.log(zipCode.test("902101"));    // prints: false (too long)
console.log(zipCode.test("zip 90210")); // prints: false (extra text)
```

| Piece | Meaning |
|---|---|
| `^` | the text starts here |
| `\d{5}` | exactly five digits |
| `$` | the text ends here |

A good rule: when you're **searching**, leave the anchors off. When you're **checking** input, put `^` at the start and `$` at the end. (The HTML `pattern` attribute from chapter 22 adds them for you, which is why `[0-9]{5}` worked there. With the `m` flag, `^` and `$` match at the start and end of *every line* instead.)

### Replacing with a pattern

`replace` from [chapter 06](../06-strings/notes.md) also accepts a regex. Add the `g` flag, and it replaces **every** match:

```js
const phone = "(555) 123-4567";
console.log(phone.replace(/\D/g, "")); // prints: 5551234567
```

`\D` means "any character that isn't a digit", and `g` means "all of them". So every bracket, space, and dash is replaced with nothing. In chapter 06, `replace("-", "")` could only remove one exact dash.

Another everyday cleanup, squashing extra spaces:

```js
const messy = "Too    many     spaces";
console.log(messy.replace(/\s+/g, " ")); // prints: Too many spaces
```

`\s+` finds each run of whitespace (one or more spaces or tabs in a row), and each run becomes a single space.

The replacement can even be a function: a callback, like the ones from [chapter 13](../13-array-methods/notes.md). It receives each match and returns what to put in its place. Here's a recipe, doubled:

```js
const recipe = "2 eggs, 100 g flour, 1 cup milk";
const doubled = recipe.replace(/\d+/g, (amount) => Number(amount) * 2);

console.log(doubled); // prints: 4 eggs, 200 g flour, 2 cup milk
```

Each match arrives as a string, like `"100"`, so we convert it with `Number` before doing math.

> **Tip:** `replaceAll` accepts a regex too, but only one with the `g` flag. Without it, you get `TypeError: String.prototype.replaceAll called with a non-global RegExp argument`. With a regex, `replace` plus `g` does the same job, so most people use that.

### Splitting with a pattern

`split` accepts a pattern as well. That helps with messy lists, like tags someone typed with random spaces:

```js
const tags = "js, css,html ,  node";

console.log(tags.split(","));       // prints: [ 'js', ' css', 'html ', '  node' ]
console.log(tags.split(/\s*,\s*/)); // prints: [ 'js', 'css', 'html', 'node' ]
```

| Piece | Meaning |
|---|---|
| `\s*` | any amount of whitespace, even none |
| `,` | a comma |
| `\s*` | any amount of whitespace again |

So the text is cut at every comma, and the spaces around each comma are cut away with it.

### Groups: `( )`

Let's build a date pattern, one piece at a time, using a line from a log file. `[0]` is the whole match:

```js
const log = "Backup finished on 2026-09-24 at 03:15";

console.log(log.match(/\d{4}/)[0]);             // prints: 2026
console.log(log.match(/\d{4}-\d{2}/)[0]);       // prints: 2026-09
console.log(log.match(/\d{4}-\d{2}-\d{2}/)[0]); // prints: 2026-09-24
```

| Piece | Meaning |
|---|---|
| `\d{4}` | four digits: the year |
| `-` | a dash (a normal character matches itself) |
| `\d{2}` | two digits: the month |
| `-` | another dash |
| `\d{2}` | two digits: the day |

That finds the date. But what if you want the year, month, and day **separately**? Wrap each part in parentheses. A **group** `( )` **captures** whatever matched inside it, and `match` hands you each group after the whole match:

```js
const log = "Backup finished on 2026-09-24 at 03:15";
const result = log.match(/(\d{4})-(\d{2})-(\d{2})/);

console.log(result[0]); // prints: 2026-09-24 (the whole match)
console.log(result[1]); // prints: 2026 (group 1)
console.log(result[2]); // prints: 09 (group 2)
console.log(result[3]); // prints: 24 (group 3)
```

In a replacement text, `$1`, `$2`, and `$3` stand for the groups. That makes it easy to reorder the parts:

```js
const isoDate = "2026-09-24";
console.log(isoDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1")); // prints: 24/09/2026
```

Groups also let a quantifier apply to several characters at once: `(ha)+` matches `ha`, `haha`, and `hahaha`.

### Named groups: `(?<name>...)`

`result[2]` is easy to mix up with `result[3]`. A **named group** gives each part a name, like `(?<year>\d{4})`, and the parts appear on `result.groups`. Destructuring from [chapter 15](../15-destructuring-spread-rest/notes.md) makes it tidy:

```js
const log = "Backup finished on 2026-09-24 at 03:15";
const result = log.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);

const { year, month, day } = result.groups;
console.log(`Day ${day}, month ${month}, year ${year}`); // prints: Day 24, month 09, year 2026
```

If you print `result.groups` directly, Node shows `[Object: null prototype] { year: '2026', month: '09', day: '24' }`. That label only means it's an object with no prototype ([chapter 28](../28-prototypes/notes.md)). You can use it like any other object. In a replacement text, named groups are written `$<name>`, like `"$<day>/$<month>/$<year>"`.

### `matchAll`: every match, with its groups

`match` with `g` gives you every match, but it leaves out the groups. `matchAll` gives you both. It returns an iterator ([chapter 36](../36-iterators-and-generators/notes.md)), so you can loop over it with `for...of`:

```js
const notice = "Deliveries: 2026-09-24, 2026-10-01 and 2026-10-15";
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/g;

for (const match of notice.matchAll(datePattern)) {
  const { month, day } = match.groups;
  console.log(`Delivery on ${day}/${month}`);
}
```

You'll see:

```
Delivery on 24/09
Delivery on 01/10
Delivery on 15/10
```

Each `match` is the same kind of array you get from `match` without `g`. `matchAll` insists on the `g` flag. Without it, you get `TypeError: String.prototype.matchAll called with a non-global RegExp argument`.

### Alternation: `|` means "or"

A `|` between two patterns means "this one or that one":

```js
const pets = "I have a cat, a dog, and a fish";
console.log(pets.match(/cat|dog/g)); // prints: [ 'cat', 'dog' ]
```

To accept one of a few exact choices, put the choices in a group and add anchors:

```js
const weekend = /^(Saturday|Sunday)$/;

console.log(weekend.test("Sunday")); // prints: true
console.log(weekend.test("Monday")); // prints: false
```

In plain words: the text starts (`^`), then comes either `Saturday` or `Sunday`, and then the text ends (`$`).

### Escaping special characters

Some characters have special jobs in a regex: `.` `*` `+` `?` `^` `$` `(` `)` `[` `]` `{` `}` `|` `\` `/`. To match one of them as a plain character, put a backslash in front of it. That's called **escaping** it, just like `\"` inside a string in chapter 06.

Here's a pattern for prices on a menu:

```js
const menu = "Tea $3.50, Cake $4.25";
console.log(menu.match(/\$\d+\.\d{2}/g)); // prints: [ '$3.50', '$4.25' ]
```

| Piece | Meaning |
|---|---|
| `\$` | a real dollar sign (a bare `$` would mean "end of the text") |
| `\d+` | one or more digits: the dollars |
| `\.` | a real dot (a bare `.` would mean "any character") |
| `\d{2}` | exactly two digits: the cents |

### Real-world pattern: phone numbers

People type phone numbers in all sorts of ways. One regex that accepts every possible style gets huge and hard to read. Two tiny steps are much easier: throw away everything that isn't a digit, then check that exactly ten digits are left.

```js
function cleanPhone(input) {
  const digits = input.replace(/\D/g, ""); // keep only the digits
  return /^\d{10}$/.test(digits) ? digits : null;
}

console.log(cleanPhone("(555) 123-4567")); // prints: 5551234567
console.log(cleanPhone("555.123.4567"));   // prints: 5551234567
console.log(cleanPhone("123-4567"));       // prints: null
```

Ten digits is the US style. Other countries use other lengths, so adjust the `{10}` for the numbers your app expects.

### Real-world pattern: dates like `2026-09-24`

```js
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

console.log(isoDate.test("2026-09-24")); // prints: true
console.log(isoDate.test("24/09/2026")); // prints: false
console.log(isoDate.test("2026-13-45")); // prints: true (!)
```

Look at the last one. A regex checks the **shape** of text, not its meaning. It has no idea that there's no month 13. So check the shape with a regex, then check the numbers with normal code or a `Date` ([chapter 19](../19-dates-and-times/notes.md)).

### Real-world pattern: a simple email check

```js
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log(email.test("sam@example.com"));       // prints: true
console.log(email.test("sam@example"));           // prints: false (no dot after the @)
console.log(email.test("sam smith@example.com")); // prints: false (a space)
console.log(email.test("sam@@example.com"));      // prints: false (two @ signs)
```

| Piece | Meaning |
|---|---|
| `^` | the text starts here |
| `[^\s@]+` | one or more characters that aren't a space or an `@` (the name) |
| `@` | exactly one `@` |
| `[^\s@]+` | more of the same (the domain, like `example`) |
| `\.` | a real dot |
| `[^\s@]+` | more of the same (the ending, like `com`) |
| `$` | the text ends here |

Here's the honest truth about email: the official rules are so complicated that a "perfect" email regex would be enormous, and it *still* couldn't tell you whether the address exists. Real apps do a simple shape check like this one, then send a confirmation email. That's the only way to know an address really works.

### Keeping regexes readable

- **Keep them small.** Two simple regexes, or one regex plus a line of normal code (like `cleanPhone`), beat one giant pattern.
- **Give them good names.** `const zipCode = /^\d{5}$/;` tells the reader what it's for.
- **Explain them in a comment**, in plain words, like the tables in this chapter.
- **Test them at [regex101.com](https://regex101.com).** Paste your pattern and some sample text. It highlights every match and explains each piece in plain English. Make sure the flavor is set to JavaScript (it may be listed as ECMAScript, the official name of the JavaScript standard).

## Common mistakes

**1. Forgetting that `match` can give you `null`**

```js
const note = "No numbers here";
const count = note.match(/\d/g).length;
// TypeError: Cannot read properties of null (reading 'length')
```

When nothing matches, `match` returns `null`, and `null` has no `length`. Fall back to an empty array with `??` from [chapter 07](../07-conditionals/notes.md): `(note.match(/\d/g) ?? []).length` gives `0`.

**2. Forgetting the anchors when checking input**

```js
const pin = /\d{4}/;
console.log(pin.test("12345678")); // prints: true
```

Without `^` and `$`, this only asks "are there four digits in a row somewhere?" To check that the *whole* input is four digits, write `/^\d{4}$/`.

**3. Forgetting to escape a special character**

```js
const text = "Call 4550 or pay $4.50";
console.log(text.match(/\d+.\d{2}/g)); // prints: [ '4550', '4.50' ]
```

A bare `.` means "any character", so `4550` sneaks in: the `.` matched the second `5`. Escape it to mean a real dot: `/\d+\.\d{2}/g` finds only `4.50`.

**4. Using `|` without a group**

```js
const size = /^S|M|L$/;
console.log(size.test("Medium")); // prints: true
```

`|` splits the *whole* pattern, so this means "starts with `S`, or contains `M`, or ends with `L`". `"Medium"` contains an `M`, so it passes. Put the choices in a group: `/^(S|M|L)$/`.

**5. Reusing a regex with `g` in `test`**

```js
const hasCat = /cat/g;

console.log(hasCat.test("cat")); // prints: true
console.log(hasCat.test("cat")); // prints: false
console.log(hasCat.test("cat")); // prints: true
```

With the `g` flag, a regex remembers where its last match ended (in a property called `lastIndex`), and the next `test` carries on searching from there. That's why the answer flips. `test` only needs a yes or no, so leave the `g` off: `/cat/`.

**6. Single backslashes in `new RegExp`**

```js
const digits = new RegExp("\d+");
console.log(digits); // prints: /d+/
```

Inside a normal string, a backslash starts an escape ([chapter 06](../06-strings/notes.md)), and `"\d"` quietly turns into plain `"d"`. So this regex looks for the letter `d`! In a string, write the backslash twice: `new RegExp("\\d+")` gives you `/\d+/`.

## Quick recap

- A regex describes what text *looks like*: `/pattern/flags`, or `new RegExp(text, flags)` when the pattern is in a variable.
- The pieces: `\d`, `\w`, `\s`, and `.` match one character from a group. `[...]` matches one character from your own list, and `[^...]` means "not these". Quantifiers (`+`, `*`, `?`, `{n}`, `{n,m}`) say how many.
- `^` and `$` pin the pattern to the start and end. Use them whenever you're checking input.
- `test` gives `true` or `false`. `match` with `g` gives every match (or `null`). `matchAll` gives every match with its groups. `replace` and `split` accept patterns too.
- Groups `( )` capture parts of a match, named groups `(?<name>...)` make them readable, and `|` means "or".
- Escape special characters with a backslash to match them as plain text: `\.`, `\$`, `\?`.
- Keep regexes small, name them, and test them on regex101.com.

---

**Next:** try the [exercises](exercises.md), then move on to [38 Type Coercion](../38-type-coercion/notes.md).
