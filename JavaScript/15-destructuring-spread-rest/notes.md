# 15 Destructuring, Spread and Rest

## What is it?

Three shortcuts for working with arrays and objects:

- **Destructuring** unpacks values from an array or object into separate variables, in one line.
- **Spread** (`...`) spreads an array or object out into its separate pieces. It's great for copying and merging.
- **Rest** (also `...`) does the opposite: it collects "the rest" of the pieces into one array or object.

## Why does it matter?

Without these shortcuts, working with objects means a lot of repetition:

```js
const user = { name: "Priya", city: "Pune", plan: "pro" };

const name = user.name;
const city = user.city;
const plan = user.plan;
```

With destructuring, those last three lines become one:

```js
const { name, city, plan } = user;
```

Spread lets you copy and combine arrays and objects without writing a loop. You'll see all three shortcuts everywhere in modern JavaScript: in function parameters, in code that handles data from the internet, and in tools like React.

## Real-world example

Think about unpacking your shopping when you get home:

| Tool | Everyday version | In code |
|---|---|---|
| Destructuring | Unpacking a grocery bag: the milk goes in the fridge, the bread goes in the cupboard | `const { milk, bread } = bag;` |
| Spread | Tipping two bags out onto one table | `[...bagA, ...bagB]` |
| Rest | "I'll take the first two apples. The rest go in the fruit bowl." | `const [first, second, ...fruitBowl] = apples;` |

Spread and rest use the same three dots, `...`. Spread *unpacks* things and rest *packs* them up. There's a table at the end of this chapter that shows how to tell them apart.

## How it works

### Array destructuring

Put variable names inside square brackets on the left of `=`. Each one gets the item at the same position:

```js
const podium = ["Ana", "Ben", "Chen"];
const [gold, silver, bronze] = podium;

console.log(gold);   // prints: Ana
console.log(silver); // prints: Ben
console.log(bronze); // prints: Chen
```

Position is what matters: the first variable gets the first item, the second gets the second, and so on. The names are up to you.

It's handy with `split` from [chapter 06](../06-strings/notes.md):

```js
const [firstName, lastName] = "Ada Lovelace".split(" ");
console.log(lastName); // prints: Lovelace
```

**Skipping items.** Leave a gap with an extra comma:

```js
const [winner, , third] = ["Ana", "Ben", "Chen"];
console.log(winner, third); // prints: Ana Chen
```

**Default values.** If there's no item at a position, its variable gets `undefined`. You can give it a default instead, with `=`:

```js
const [main, side = "fries"] = ["burger"];
console.log(main); // prints: burger
console.log(side); // prints: fries
```

The default is only used when the value would be `undefined`.

**Swapping two variables.** Destructuring can swap two values in one line:

```js
let left = "cat";
let right = "dog";

[left, right] = [right, left];

console.log(left, right); // prints: dog cat
```

The right side builds a new array, `["dog", "cat"]`, and the left side unpacks it back into the two variables. There's no `let` on that line, because both variables already exist.

### Object destructuring

Put variable names inside curly braces on the left of `=`. Each variable gets the property **with the same name**:

```js
const book = { title: "Dune", author: "Frank Herbert", pages: 412 };
const { title, author } = book;

console.log(title);  // prints: Dune
console.log(author); // prints: Frank Herbert
```

With objects, the names matter and the order doesn't: `const { author, title } = book;` does exactly the same thing. If you ask for a property that doesn't exist, you get `undefined`.

**Renaming.** To use a different variable name, write `property: newName`:

```js
const { title: bookTitle } = book;
console.log(bookTitle); // prints: Dune
```

Read it as "take `title`, and call it `bookTitle`".

**Default values.** These work the same way as with arrays:

```js
const { format = "paperback" } = book;
console.log(format); // prints: paperback
```

`book` has no `format` property, so the default is used.

**Nested objects.** To reach inside a nested object, repeat the pattern:

```js
const order = {
  id: 501,
  customer: { name: "Leo", city: "Oslo" },
};

const { id, customer: { name, city } } = order;
console.log(id, name, city); // prints: 501 Leo Oslo
```

`customer: { name, city }` means "go into `customer`, and unpack `name` and `city` from there". This does **not** create a `customer` variable. Only `id`, `name`, and `city` exist afterwards.

Keep nesting shallow. If a pattern gets hard to read, unpack in two steps instead: first `const { customer } = order;`, then `const { name } = customer;`.

**In loops.** Destructuring works anywhere you create a variable, including a `for...of` loop:

```js
const products = [
  { name: "Tent", price: 120 },
  { name: "Lantern", price: 25 },
];

for (const { name, price } of products) {
  console.log(`${name}: $${price}`);
}
```

You'll see:

```
Tent: $120
Lantern: $25
```

Remember `Object.entries` from [chapter 11](../11-objects/notes.md)? It gives you a list of `[key, value]` pairs. Now you can unpack each pair right in the loop:

```js
const stock = { apples: 12, pears: 0, plums: 7 };

for (const [fruit, count] of Object.entries(stock)) {
  console.log(`${fruit}: ${count}`);
}
```

You'll see:

```
apples: 12
pears: 0
plums: 7
```

### Destructuring function parameters

Here's where destructuring really shines. Imagine calling a function with lots of parameters:

```js
createAccount("Sam", "sam@mail.com", "EUR", true);
```

What do `"EUR"` and `true` mean? You'd have to go and read the function to find out. And if you mix up the order, you get a bug without any error.

The fix is the **options object** pattern: pass one object with named properties, and destructure it right in the parameter list:

```js
function createAccount({ name, email, currency = "USD", newsletter = false }) {
  console.log(`${name} <${email}> | ${currency} | newsletter: ${newsletter}`);
}

createAccount({ name: "Sam", email: "sam@mail.com", newsletter: true });
// prints: Sam <sam@mail.com> | USD | newsletter: true
```

Now every value has a label, the order doesn't matter, anything with a default can be left out, and adding a new option later won't break the calls you already wrote.

It works in callbacks from [chapter 13](../13-array-methods/notes.md) too:

```js
const products = [
  { name: "Tent", price: 120 },
  { name: "Lantern", price: 25 },
];

const names = products.map(({ name }) => name);
console.log(names); // prints: [ 'Tent', 'Lantern' ]
```

### Spread with arrays

Putting `...` in front of an array spreads its items out, as if you'd typed them one by one with commas in between.

**Copying an array:**

```js
const playlist = ["Intro", "Sunrise"];
const copy = [...playlist];

copy.push("Night Drive");
console.log(playlist); // prints: [ 'Intro', 'Sunrise' ]
console.log(copy);     // prints: [ 'Intro', 'Sunrise', 'Night Drive' ]
```

The copy is a separate array, so changing it leaves the original alone.

**Merging arrays**, with extra items anywhere you like:

```js
const fruits = ["apple", "pear"];
const veggies = ["carrot", "leek"];
const groceries = [...fruits, ...veggies, "bread"];

console.log(groceries); // prints: [ 'apple', 'pear', 'carrot', 'leek', 'bread' ]
```

It does the same job as `concat` from [chapter 10](../10-arrays/notes.md), and many people find it easier to read.

**Passing an array's items as separate arguments.** `Math.max` and `Math.min` from [chapter 05](../05-numbers-and-math/notes.md) want separate numbers, not an array:

```js
const lapTimes = [62, 58, 71, 60];

console.log(Math.max(lapTimes));    // prints: NaN
console.log(Math.max(...lapTimes)); // prints: 71
console.log(Math.min(...lapTimes)); // prints: 58
```

`Math.max(...lapTimes)` is the same as writing `Math.max(62, 58, 71, 60)`.

### Spread with objects

Spread works on objects too. It copies all of an object's properties into a new object.

**Copying an object:**

```js
const original = { name: "Maya", plan: "free" };
const copy = { ...original };
copy.plan = "pro";

console.log(original.plan); // prints: free
console.log(copy.plan);     // prints: pro
```

**Merging objects, and overriding default settings.** When two objects have a property with the same name, the one that comes **later wins**:

```js
const defaultSettings = { theme: "light", fontSize: 14, sound: true };
const userSettings = { theme: "dark", fontSize: 18 };

const settings = { ...defaultSettings, ...userSettings };
console.log(settings); // prints: { theme: 'dark', fontSize: 18, sound: true }
```

This pattern is everywhere: start from the defaults, then lay the user's choices on top. If you swapped the order, the defaults would win instead.

**Changing one property in a copy:**

```js
const user = { name: "Maya", city: "Lisbon" };
const movedUser = { ...user, city: "Berlin" };

console.log(movedUser); // prints: { name: 'Maya', city: 'Berlin' }
console.log(user);      // prints: { name: 'Maya', city: 'Lisbon' }
```

### Spread makes a shallow copy

One warning before we move on. Spread only copies the **top level**. If an object holds another object or an array, the copy shares that inner one with the original:

```js
const team = { name: "Blue Team", members: ["Ana", "Ben"] };
const copy = { ...team };

copy.members.push("Cleo");
console.log(team.members); // prints: [ 'Ana', 'Ben', 'Cleo' ]
```

Changing the copy's `members` changed the original's too! A copy like this, where only the top level is new, is called a **shallow copy**. Why this happens, and how to make a full copy, is the whole story of [chapter 16](../16-values-vs-references/notes.md).

### Rest in destructuring

Rest collects "everything else" into one array or object. It uses the same `...`, but on the **left** side of `=`:

```js
const [leader, ...followers] = ["Kim", "Lou", "Max", "Noor"];

console.log(leader);    // prints: Kim
console.log(followers); // prints: [ 'Lou', 'Max', 'Noor' ]
```

With objects, rest collects every property you didn't unpack. A real use: removing a password before you show or send someone's account details:

```js
const account = { username: "sam99", password: "hunter2", email: "sam@mail.com" };
const { password, ...safeAccount } = account;

console.log(safeAccount); // prints: { username: 'sam99', email: 'sam@mail.com' }
```

The rest part always has to come **last**. Nothing can come after it.

### Rest parameters

Rest also works in a function's parameter list. A **rest parameter** collects any number of arguments into a real array:

```js
function sumAll(...numbers) {
  return numbers.reduce((total, number) => total + number, 0);
}

console.log(sumAll(5, 10, 15)); // prints: 30
console.log(sumAll(2));         // prints: 2
console.log(sumAll());          // prints: 0
```

Remember `sumAll` from chapter 10? That one took an array: `sumAll([10, 20, 30])`. With a rest parameter, the caller passes plain numbers, and the function still gets them as an array.

You can mix normal parameters with a rest parameter, as long as the rest parameter comes last:

```js
function orderPizza(size, ...toppings) {
  console.log(`${size} pizza with ${toppings.join(", ")}`);
}

orderPizza("Large", "mushrooms", "olives", "basil");
// prints: Large pizza with mushrooms, olives, basil
```

> In older code you may see `arguments`, a built-in, array-like list of everything passed to a function. It isn't a real array, and arrow functions don't get their own, so use rest parameters instead.

### Spread or rest? How to tell them apart

Both are written `...`. What they do depends on where they appear:

| Where the `...` is | Name | What it does | Example |
|---|---|---|---|
| Inside `[ ]` or `{ }` that you're building, or in a function call | Spread | Unpacks items **out** | `[...fruits, "kiwi"]`, `Math.max(...nums)` |
| On the left of `=`, or in a parameter list | Rest | Collects items **in** | `const [first, ...others] = list;`, `function sumAll(...numbers)` |

A quick way to remember: spread **expands**, rest **collects**.

## Common mistakes

**1. Using names that don't match the properties**

```js
const movie = { title: "Up", year: 2009 };
const { name, released } = movie;
console.log(name, released); // prints: undefined undefined
```

Object destructuring matches property *names*, not positions. `movie` has no `name` or `released`, so both are `undefined`. Fix: use the real names, `const { title, year } = movie;`, or rename them: `const { title: name } = movie;`.

**2. Destructuring a parameter that wasn't passed**

```js
function showProfile({ name, age }) {
  console.log(`${name} (${age})`);
}

showProfile();
// TypeError: Cannot destructure property 'name' of 'undefined' as it is undefined.
```

Nothing was passed in, so there's nothing to unpack. Fix: give the whole parameter a default of an empty object, `function showProfile({ name, age } = {})`, and give the properties defaults too if they need them.

**3. Forgetting the spread when merging**

```js
const breakfast = ["eggs", "toast"];
const lunch = ["soup"];
const meals = [breakfast, lunch];
console.log(meals); // prints: [ [ 'eggs', 'toast' ], [ 'soup' ] ]
```

Without `...`, you get an array of arrays instead of one flat list. Fix: `const meals = [...breakfast, ...lunch];`.

**4. Passing an array to `Math.max`**

```js
const temperatures = [18, 25, 21];
console.log(Math.max(temperatures)); // prints: NaN
```

`Math.max` expects separate numbers, and it can't turn a whole array into one number. Fix: spread it: `Math.max(...temperatures)` gives `25`.

**5. Putting rest anywhere but last**

```js
const [...allButLast, last] = ["Mon", "Tue", "Wed"];
// SyntaxError: Rest element must be last element
```

Rest means "everything that's left", so it can only go at the end. Rest parameters have the same rule: `function logAll(...items, label)` gives `SyntaxError: Rest parameter must be last formal parameter`. Fix: move the rest part to the end, or use `at(-1)` from chapter 10 to get the last item.

## Quick recap

- **Destructuring** unpacks arrays by position (`const [first, second] = list;`) and objects by name (`const { name } = user;`). You can skip items, rename, set defaults, and reach into nested objects.
- Destructure a function's parameter to use an **options object**: every value is labeled, the order doesn't matter, and defaults are easy.
- **Spread** `...` unpacks. Copy and merge arrays with `[...a, ...b]` and objects with `{ ...defaults, ...choices }` (the later one wins), or pass an array's items as arguments: `Math.max(...nums)`.
- **Rest** `...` collects: `const [first, ...others] = list;` and `function sumAll(...numbers)`. It always comes last.
- Spread makes a **shallow** copy: nested objects and arrays are still shared with the original ([chapter 16](../16-values-vs-references/notes.md) explains why).

---

**Next:** try the [exercises](exercises.md), then move on to [16 Values vs. References](../16-values-vs-references/notes.md).
