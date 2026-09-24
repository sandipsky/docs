# 06 Strings

## What is it?

A **string** is a piece of text: a name, a password, a chat message, a whole paragraph. You've used strings since [chapter 01](../01-getting-started/notes.md) (text inside quotes), and you met them as a data type in [chapter 03](../03-data-types/notes.md).

This chapter is about *working* with text: building it, measuring it, cleaning it up, searching it, and cutting it into pieces.

## Why does it matter?

Almost everything people type or read in an app is a string. Names, emails, search boxes, product titles, receipts.

And people type messy things. They add spaces by accident. They mix up capital letters. To a human, `"  Sam@Gmail.COM "` and `"sam@gmail.com"` are the same email. To JavaScript, they're two completely different strings.

With the tools in this chapter, you can:

- Build messages from variables: `Hi Sam, your order #1042 has shipped!`
- Clean up what people type (extra spaces, random capitals).
- Check text: does this email contain an `@`? Does this file name end in `.pdf`?
- Line text up neatly, like the rows on a receipt.

## Real-world example

Think of a string as a strip of tape from a **label maker**.

| Label maker | String |
|---|---|
| Letters printed in order on a strip | Characters in order: `"COFFEE"` |
| Measuring how long the strip is | `.length` |
| Pointing at the 1st, 2nd, 3rd letter | Positions `[0]`, `[1]`, `[2]` (counting starts at 0) |
| Once it's printed, you can't change a letter | A string can't be changed |
| Want a different label? Print a new strip | String tools always give you a *new* string |

Keep that last row in mind. It explains the most common string mistake, and you'll see it again at the end of this chapter.

## How it works

### Three kinds of quotes

You can write a string with double quotes, single quotes, or backticks (the `` ` `` key, usually just below `Esc`):

```js
const city = "Kathmandu";
const food = 'momo';
const drink = `lassi`;

console.log(city, food, drink); // prints: Kathmandu momo lassi
```

All three make a normal string. The quotes aren't part of the text. They only show where it starts and ends.

Why have more than one kind? So you can put quotes *inside* a string:

```js
console.log("It's raining");      // prints: It's raining
console.log('She said "hello"');  // prints: She said "hello"
```

In this course we use double quotes for plain text, and backticks when we put values inside the text. That's what backticks are really for.

### Template literals: putting values inside text

Remember joining strings with `+` from [chapter 03](../03-data-types/notes.md)? It works, but it gets messy fast:

```js
const guest = "Aisha";
const nights = 3;

console.log("Welcome, " + guest + "! You're staying " + nights + " nights.");
```

So many quotes, spaces, and plus signs. It's easy to forget a space.

A **template literal** is a string written with backticks. Inside it, `${ }` is a slot where you can drop in any value:

```js
console.log(`Welcome, ${guest}! You're staying ${nights} nights.`);
// prints: Welcome, Aisha! You're staying 3 nights.
```

It reads almost like the finished sentence. Think of `${ }` as a blank on a form that JavaScript fills in for you.

You can put any calculation inside the slot, not only a variable:

```js
const pricePerNight = 85;
console.log(`Total: $${pricePerNight * nights}`); // prints: Total: $255
```

The first `$` is a normal dollar sign. The `${` right after it opens the slot.

Slots are also a good place to tidy numbers. Remember the decimal surprises from [chapter 05](../05-numbers-and-math/notes.md)?

```js
const price = 1.1;
const quantity = 3;

console.log(`Total: $${price * quantity}`);             // prints: Total: $3.3000000000000003
console.log(`Total: $${(price * quantity).toFixed(2)}`); // prints: Total: $3.30
```

### Multi-line strings

Backticks can also span several lines. The line breaks become part of the string:

```js
const poem = `Roses are red,
Violets are blue,
JavaScript is fun,
And so are you.`;

console.log(poem);
```

You'll see:

```
Roses are red,
Violets are blue,
JavaScript is fun,
And so are you.
```

Double and single quotes can't do this. Press `Enter` in the middle of a `"..."` string and you get `SyntaxError: Invalid or unexpected token`.

### Escape characters

What if you need a double quote *inside* a double-quoted string? Or a new line without using backticks?

You use an **escape character**: a backslash `\` that gives the next character a special meaning.

| You type | You get |
|---|---|
| `\n` | a new line |
| `\t` | a tab (a wide space) |
| `\"` | a `"` inside a double-quoted string |
| `\'` | a `'` inside a single-quoted string |
| `\\` | one real backslash |

```js
console.log("Shopping list:\n- milk\n- eggs");
```

You'll see:

```
Shopping list:
- milk
- eggs
```

```js
console.log("She said \"hello\"");        // prints: She said "hello"
console.log("C:\\Users\\Sam\\notes.txt"); // prints: C:\Users\Sam\notes.txt
```

That last one matters on Windows. File paths are full of backslashes, and each one must be written as `\\`.

### Length and positions

Every string knows how many characters it has. A **character** is one letter, digit, space, or symbol.

```js
const word = "pizza";

console.log(word.length);       // prints: 5
console.log("New York".length); // prints: 8 (the space counts too)
console.log("".length);         // prints: 0 (an empty string)
```

`length` is a **property**: a piece of information the string carries around. You read it with a dot and no parentheses.

Each character has a position number, called its **index**. Counting starts at 0, not 1:

```
 p   i   z   z   a
[0] [1] [2] [3] [4]
```

Put the index in square brackets to read one character:

```js
console.log(word[0]); // prints: p
console.log(word[4]); // prints: a
console.log(word[5]); // prints: undefined (there's nothing at position 5)
```

Because counting starts at 0, the last character is always at `length - 1`. For "pizza", that's 5 - 1 = 4:

```js
console.log(word[word.length - 1]); // prints: a
```

### Your first string methods

Remember **methods** from [chapter 05](../05-numbers-and-math/notes.md)? A method is a tool that belongs to a value. You write a dot, the method's name, and parentheses, like `price.toFixed(2)`. Strings come with lots of useful methods of their own, and the rest of this chapter is mostly about them.

The first one is `at()`. It works like square brackets, with a bonus: negative numbers count from the end. `-1` is the last character, `-2` the one before it:

```js
console.log(word.at(0));  // prints: p
console.log(word.at(-1)); // prints: a
console.log(word.at(-2)); // prints: z
```

`word.at(-1)` is much easier to read than `word[word.length - 1]`.

Two more methods change the case of the letters:

```js
console.log("stop!".toUpperCase());       // prints: STOP!
console.log("HeLLo WoRLD".toLowerCase()); // prints: hello world
```

### Strings can't be changed

Back to the label maker. Once a label is printed, you can't swap one of its letters. Strings are the same: they're **immutable**, which means "can't be changed".

```js
let pet = "cat";
pet[0] = "b";    // try to change the first letter

console.log(pet); // prints: cat (nothing changed, and no error either)
```

You *can* put a brand-new string in the variable, though. That's like printing a new label:

```js
pet = "bat";
console.log(pet); // prints: bat
```

This is why every string method gives you back a **new** string and leaves the original alone:

```js
const username = "sam";
const loudName = username.toUpperCase();

console.log(loudName); // prints: SAM
console.log(username); // prints: sam (the original is untouched)
```

If you want to keep the result, save it in a variable.

### Cleaning up spaces with `trim`

People often type extra spaces by accident, especially before or after their email. `trim()` removes the spaces from both ends, but never from the middle:

```js
const typedEmail = "   sam@example.com  ";

console.log(`[${typedEmail}]`);        // prints: [   sam@example.com  ]
console.log(`[${typedEmail.trim()}]`); // prints: [sam@example.com]
```

The square brackets are only there so you can *see* the spaces. It's a handy trick when you're checking text.

If you only want to clean one side, there's `trimStart()` and `trimEnd()`.

### Searching inside a string

These three methods answer yes/no questions, so they give you `true` or `false`:

```js
const email = "sam@example.com";
const fileName = "holiday-photo.jpg";

console.log(email.includes("@"));            // prints: true
console.log(email.includes("gmail"));        // prints: false
console.log(fileName.startsWith("holiday")); // prints: true
console.log(fileName.endsWith(".jpg"));      // prints: true
```

- `includes(text)`: is this text anywhere inside?
- `startsWith(text)`: does it begin with this?
- `endsWith(text)`: does it finish with this?

If you want to know *where* something is, use `indexOf()`. It gives you the index of the first match, or `-1` if there's no match at all:

```js
console.log(email.indexOf("@")); // prints: 3
console.log(email.indexOf("e")); // prints: 4 (only the first "e" counts)
console.log(email.indexOf("#")); // prints: -1 (not found)
```

> **Watch out:** all of these are case-sensitive. `"Hello".includes("hello")` is `false`, because `H` and `h` are different characters.

### Cutting out a piece with `slice`

`slice(start, end)` copies part of a string. It starts at the `start` index and stops *just before* the `end` index. The character at `end` isn't included.

```
 2   0   2   6   -   0   9   -   2   4
[0] [1] [2] [3] [4] [5] [6] [7] [8] [9]
```

```js
const date = "2026-09-24";

console.log(date.slice(0, 4)); // prints: 2026 (positions 0, 1, 2, 3)
console.log(date.slice(5, 7)); // prints: 09
console.log(date.slice(8));    // prints: 24 (no end means "to the end")
console.log(date.slice(-2));   // prints: 24 (negative counts from the end)
```

A nice way to remember it: `slice(0, 4)` gives you 4 - 0 = 4 characters.

`slice` gets really useful when you combine it with `indexOf`. You don't always know where the `@` in an email will be, but you can ask:

```js
const atPosition = email.indexOf("@"); // 3

console.log(email.slice(0, atPosition));  // prints: sam
console.log(email.slice(atPosition + 1)); // prints: example.com
```

Everything before the `@` is the name. Everything after it is the domain. This works for any email, however long.

### Replacing text

`replace(old, new)` swaps the **first** match. `replaceAll(old, new)` swaps **every** match:

```js
const phone = "555-123-4567";

console.log(phone.replace("-", ""));    // prints: 555123-4567 (only the first dash)
console.log(phone.replaceAll("-", "")); // prints: 5551234567
```

These methods search for exact text. For smarter searches, like "any digit", you'll use patterns in [chapter 37](../37-regular-expressions/notes.md).

### Splitting text into pieces

`split(separator)` cuts a string wherever it finds the separator:

```js
const groceries = "milk,eggs,bread";

console.log(groceries.split(","));             // prints: [ 'milk', 'eggs', 'bread' ]
console.log("The quick brown fox".split(" ")); // prints: [ 'The', 'quick', 'brown', 'fox' ]
console.log("hello".split(""));                // prints: [ 'h', 'e', 'l', 'l', 'o' ]
```

The result isn't a string. The square brackets show it's an **array**: a list of values in order. Node shows the text inside it with single quotes. (The browser console shows it a little differently, but it's the same list.)

You'll learn to work with arrays in [chapter 10](../10-arrays/notes.md). For now, just know that `split` is how you turn text into a list.

### Repeating and padding

`repeat(count)` repeats a string that many times. It's great for lines and simple ratings:

```js
console.log("=".repeat(20));  // prints: ====================
console.log("ha".repeat(3));  // prints: hahaha

const rating = 4;
console.log(`Rating: ${"*".repeat(rating)}`); // prints: Rating: ****
```

`padStart(length, filler)` adds filler characters to the *start* until the string is `length` characters long. `padEnd` does the same at the end. If you leave out the filler, it uses spaces.

```js
console.log("42".padStart(5, "0"));  // prints: 00042 (an order number)
console.log("7".padStart(2, "0"));   // prints: 07 (minutes on a clock)
console.log("12".padStart(2, "0"));  // prints: 12 (already long enough, so nothing changes)
```

Padding is how you line things up in columns, like on a receipt. Every name is padded to the same width, and every price too:

```js
console.log("Pizza".padEnd(12) + "$9.50".padStart(8));
console.log("Garlic bread".padEnd(12) + "$4.25".padStart(8));
```

You'll see:

```
Pizza          $9.50
Garlic bread   $4.25
```

> **Watch out:** padding is a string method, so it doesn't work on numbers. If `minutes` is the number `7`, `minutes.padStart(2, "0")` gives `TypeError: minutes.padStart is not a function`. Turn it into a string first: `String(minutes).padStart(2, "0")`.

### Chaining methods

Every string method gives you a new string. So you can call another method straight on the result. This is called **method chaining**:

```js
const typedEmail = "   Sam@Example.COM  ";
const cleanEmail = typedEmail.trim().toLowerCase();

console.log(cleanEmail); // prints: sam@example.com
```

Read it from left to right, like a car wash with several stations:

1. `typedEmail` is the dirty car: `"   Sam@Example.COM  "`
2. `.trim()` washes off the spaces: `"Sam@Example.COM"`
3. `.toLowerCase()` polishes the capitals: `"sam@example.com"`

Here's a chain that turns a full name into a username:

```js
const fullName = "  Priya Sharma ";

const username = fullName
  .trim()                // "Priya Sharma"
  .toLowerCase()         // "priya sharma"
  .replaceAll(" ", "."); // "priya.sharma"

console.log(username); // prints: priya.sharma
```

When a chain gets long, you can put each step on its own line, like above. It's exactly the same code, just easier to read.

### Comparing strings

`===` checks whether two strings are exactly the same, character for character. That includes capital letters:

```js
console.log("apple" === "apple"); // prints: true
console.log("Apple" === "apple"); // prints: false
```

So when you compare something a person typed, clean it up first. Imagine a quiz where the answer is "paris":

```js
const typedAnswer = "PARIS";

console.log(typedAnswer === "paris");               // prints: false
console.log(typedAnswer.toLowerCase() === "paris"); // prints: true
```

You can also use `<` and `>` to check alphabetical order. But there are two surprises:

```js
console.log("apple" < "banana"); // prints: true (a comes before b)
console.log("Zoe" < "adam");     // prints: true (surprise!)
console.log("10" < "9");         // prints: true (surprise!)
```

JavaScript compares strings one character at a time, using a code number for each character. In that code, **all capital letters come before all lowercase letters**. So `"Z"` comes before `"a"`.

And `"10"` vs `"9"` is text, not numbers. The first characters are `"1"` and `"9"`, and `"1"` comes first, so JavaScript stops there. If you mean numbers, convert them first with `Number()` from [chapter 03](../03-data-types/notes.md).

## Common mistakes

**1. Forgetting to save the result**

```js
const city = "  london ";
city.trim();
city.toUpperCase();

console.log(`[${city}]`); // prints: [  london ]
```

Nothing changed! Strings can't be changed, so `trim()` and `toUpperCase()` made new strings... and then threw them away. Save the result: `const cleanCity = city.trim().toUpperCase();`

**2. Using `${}` inside normal quotes**

```js
const guest = "Aisha";
console.log("Welcome, ${guest}!"); // prints: Welcome, ${guest}!
```

The slots only work inside backticks. In double or single quotes, `${guest}` is just ordinary text. Fix: ``console.log(`Welcome, ${guest}!`);``

**3. Mixing up properties and methods**

```js
console.log(city.toUpperCase); // prints: [Function: toUpperCase]

console.log(city.length());
// TypeError: city.length is not a function
```

`toUpperCase` is a method, so it needs parentheses. Without the `()`, JavaScript shows you the method itself instead of running it. `length` is a property, so it has no parentheses. Fix: `city.toUpperCase()` and `city.length`.

**4. Counting from 1 instead of 0**

```js
const word = "pizza";
console.log(word[1]); // prints: i (not p!)
```

The first character is at index 0. And remember that `slice(start, end)` stops *before* `end`: `word.slice(0, 2)` is `"pi"`, not `"piz"`.

**5. Forgetting to double the backslashes**

```js
console.log("C:\Users\Sam\notes.txt");
```

You'll see:

```
C:UsersSam
otes.txt
```

JavaScript read `\n` in `\notes` as "new line", and dropped the other backslashes. Every real backslash must be written as `\\`: `"C:\\Users\\Sam\\notes.txt"`.

## Quick recap

- Strings can use `"double"`, `'single'`, or `` `backtick` `` quotes. Backticks make template literals, where `${ }` drops values into the text. They can also span several lines.
- Escape characters start with a backslash: `\n` (new line), `\"` (a quote), `\\` (a backslash).
- `.length` counts characters. Indexes start at 0: `text[0]` is the first character, and `text.at(-1)` is the last.
- Strings can't be changed. Every method returns a **new** string, so save the result in a variable.
- Key methods: `toUpperCase`, `toLowerCase`, `trim`, `includes`, `startsWith`, `endsWith`, `indexOf`, `slice`, `replace`, `replaceAll`, `split`, `repeat`, `padStart`, `padEnd`.
- Chain methods to clean up text in one go: `input.trim().toLowerCase()`.
- String comparisons are case-sensitive, and `<` / `>` compare text character by character.

---

**Next:** try the [exercises](exercises.md), then move on to [07 Conditionals](../07-conditionals/notes.md).
