# 49 Node.js Basics: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on), and run it with `node ex1.js`, adding any extra words the exercise asks for.
- These exercises use `import`, so make sure this folder has a `package.json` containing `{ "type": "module" }` ([chapter 29](../29-modules/notes.md)).
- Some exercises create files and folders next to your code. That's expected. Delete them whenever you like.
- In the expected outputs, lines starting with `>` are what you type. To check a program's exit code in PowerShell, type `$LASTEXITCODE` after it finishes.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Distance converter

A running club wants a quick way to convert race distances in the terminal. Write `ex1.js`, which takes a distance and a unit, and converts between kilometers and miles. One mile is 1.609344 km. Show the answer with two decimal places.

Expected output:

```
> node ex1.js 5 km
5 km is 3.11 miles
> node ex1.js 10 miles
10 miles is 16.09 km
> node ex1.js 21.1 km
21.1 km is 13.11 miles
```

When something is wrong, print a helpful message with `console.error`, and stop with exit code 1:

```
> node ex1.js
Usage: node ex1.js <distance> <km|miles>
> node ex1.js five km
"five" is not a number.
> node ex1.js 5 feet
Unknown unit "feet". Use km or miles.
```

**Rule:** use guard clauses ([chapter 18](../18-error-handling/notes.md)), and keep 1.609344 in a named constant instead of a magic number ([chapter 45](../45-clean-code/notes.md)).

<details>
<summary>Hint 1</summary>

`process.argv.slice(2)` gives you just your own words. Destructure them into two variables. If the user typed nothing, both are `undefined`.

</details>

<details>
<summary>Hint 2</summary>

`Number("five")` gives `NaN`, and `Number.isNaN` spots it ([chapter 05](../05-numbers-and-math/notes.md)). After `process.exit(1)`, nothing else in your file runs, so each guard clause can end with it.

</details>

---

## Exercise 2 (Easy): Word counter

A writing app shows a few stats about a text file. Create a file called `poem.txt` in this folder, with this text:

```
The rain fell on the town all day.
The children stayed inside and played.
By night the rain had gone away,
and the moon came out to watch the bay.
```

Then write `ex2.js`, which reads the file named on the command line and prints its stats.

Expected output:

```
> node ex2.js poem.txt
File: poem.txt
Lines: 4
Words: 30
Longest word: children
Most common word: "the" (6 times)
```

**Rules:**

- Look for the file in the same folder as `ex2.js`, so the program works from any folder. Test it: from the `JavaScript` folder, `node 49-nodejs-basics/ex2.js poem.txt` must print the same stats.
- Ignore capital letters and punctuation when comparing words: `The` and `the` are the same word, and `day.` counts as `day`.
- If there's no file name, print `Usage: node ex2.js <file name>`. If the file doesn't exist, print `Can't find a file called "missing.txt".` (with the real name). Both stop with exit code 1.

<details>
<summary>Hint 1</summary>

Split the text into lines at `"\n"`, `trim()` each line, and skip the empty ones. The trim matters on Windows: files saved there often end each line with `"\r\n"`, so without it, every line would end with an invisible `\r`.

</details>

<details>
<summary>Hint 2</summary>

To clean a word, make it lower case, then remove everything that isn't a letter using `replace` with a regular expression like `/[^a-z]/g` ([chapter 37](../37-regular-expressions/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

Counting words is a job for a Map, like the word-frequency example in [chapter 35](../35-map-and-set/notes.md). For the missing file, catch the error from `readFile` and check its `code`.

</details>

---

## Exercise 3 (Medium): Monthly sales report

A small bookshop's till saves each month's sales in its own text file, one sale per line: the title, a comma, then the price. First, copy this into `setup3.js` and run it once. It creates a `sales` folder with some example files:

```js
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const salesFolder = path.join(import.meta.dirname, "sales");
await mkdir(salesFolder, { recursive: true });

await writeFile(path.join(salesFolder, "2026-01.txt"), "The Hobbit,9.99\nDune,12.50\nMatilda,6.99\n");
await writeFile(path.join(salesFolder, "2026-02.txt"), "Dune,12.50\nWonder,8.49\nThe Hobbit,9.99\nHoles,7.25\n");
await writeFile(path.join(salesFolder, "2026-03.txt"), "Coraline,8.75\nMatilda,6.99\n");
await writeFile(path.join(salesFolder, "readme.md"), "One file per month. One sale per line: title,price\n");

console.log("Sales files are ready.");
```

Now write `ex3.js`. It reads **every `.txt` file** in the `sales` folder (and skips anything else, like `readme.md`), works out the number of sales and the money taken each month, and prints a report. Then it saves the same report in a new file called `summary.txt`, next to `ex3.js`.

Expected output:

```
2026-01: 3 sales, $29.48
2026-02: 4 sales, $38.23
2026-03: 2 sales, $15.74
Total: 9 sales, $83.45
Saved summary.txt
```

Open `summary.txt` afterwards. It should hold the first four lines.

**Rule:** don't type the file names into `ex3.js`. Find them with `readdir`, so next month's file gets picked up without changing any code.

<details>
<summary>Hint 1</summary>

`path.extname(name)` tells you whether a name ends in `.txt`, so you can `filter` the list from `readdir`. Sort the names too, since `readdir` doesn't promise any order. Because the files are named like `2026-01`, alphabetical order is also date order, one more reason to write dates the ISO way ([chapter 19](../19-dates-and-times/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

`path.basename(name, ".txt")` gives you the name without its extension, like `2026-01`. For each line, `split(",")` gives you the title and the price, and the price is still a string.

</details>

<details>
<summary>Hint 3</summary>

Collect the report lines in an array. Then you can print them with `join("\n")`, and write the very same text to `summary.txt`.

</details>

---

## Exercise 4 (Medium): Cinema ticket booth

The Starlight Cinema wants a ticket booth that runs in the terminal. It asks how many tickets you'd like, then the age of each guest, and prints the bill. Children under 13 pay $7.00, guests aged 65 and over pay $8.50, and everyone else pays $12.00.

If an answer isn't a whole number in the allowed range (1 to 10 tickets, ages 0 to 120), the booth says so and asks the same question again.

Here's a run. The answers after each `?` are typed in:

```
Welcome to the Starlight Cinema!
How many tickets? two
Please type a whole number from 1 to 10.
How many tickets? 3
Age of guest 1? 34
Age of guest 2? 8
Age of guest 3? abc
Please type a whole number from 0 to 120.
Age of guest 3? 70
Guest 1: adult $12.00
Guest 2: child $7.00
Guest 3: senior $8.50
Total: $27.50
Enjoy the film!
```

Also check what happens when you press `Enter` without typing anything. It should ask again, too.

<details>
<summary>Hint 1</summary>

Write one helper, `askNumber(question, min, max)`, that keeps asking until it gets a good answer, then returns the number. A `while` loop with a `return` inside it works well ([chapter 08](../08-loops/notes.md)). Use it for both questions.

</details>

<details>
<summary>Hint 2</summary>

An empty answer is sneaky: `Number("")` is `0`, not `NaN` ([chapter 38](../38-type-coercion/notes.md)), so an empty age would sneak through as a baby's ticket. Check for an empty answer before you convert it. `Number.isInteger` rules out answers like `2.5`.

</details>

<details>
<summary>Hint 3</summary>

Ask all the questions first and call `rl.close()`, then print the bill. A small function that turns an age into `{ type: "child", price: 7 }` keeps the loop short.

</details>

---

## Exercise 5 (Challenge): A recipes API

Build a small API for a recipe website. The recipes live in a JSON file, and your server answers requests for all of them, some of them, or just one.

Create `recipes.json` in this folder:

```json
[
  { "id": 1, "name": "Pancakes", "minutes": 20, "vegetarian": true },
  { "id": 2, "name": "Chicken curry", "minutes": 45, "vegetarian": false },
  { "id": 3, "name": "Tomato soup", "minutes": 30, "vegetarian": true },
  { "id": 4, "name": "Fish tacos", "minutes": 25, "vegetarian": false }
]
```

Write `ex5-server.js`. When it starts, it reads the recipes from `recipes.json` (found with `import.meta.dirname`). Then it listens on port 3000, logs each request, and answers these `GET` requests with JSON:

| Request | Answer |
|---|---|
| `/recipes` | `200` and all the recipes |
| `/recipes?vegetarian=true` | `200` and only the vegetarian recipes |
| `/recipes?maxMinutes=25` | `200` and only the recipes that take 25 minutes or less (any number works) |
| Both filters together | `200` and the recipes that pass both |
| `/recipes/3` | `200` and just the recipe with id 3 |
| `/recipes/99` | `404` and `{ "error": "Recipe 99 not found" }` |
| Anything else | `404` and `{ "error": "Not found" }` |

To test it, copy this into `ex5-client.js`:

```js
const BASE_URL = "http://localhost:3000";

const paths = [
  "/recipes",
  "/recipes?vegetarian=true",
  "/recipes?maxMinutes=25",
  "/recipes?vegetarian=true&maxMinutes=25",
  "/recipes/3",
  "/recipes/99",
  "/menu",
];

for (const path of paths) {
  const response = await fetch(BASE_URL + path);
  const data = await response.json();

  let summary;
  if (!response.ok) {
    summary = data.error;
  } else if (Array.isArray(data)) {
    summary = data.map((recipe) => recipe.name).join(", ");
  } else {
    summary = `${data.name} (${data.minutes} minutes)`;
  }
  console.log(`GET ${path} -> ${response.status}: ${summary}`);
}
```

Start your server with `node ex5-server.js`, then run `node ex5-client.js` in a second terminal.

Expected output from the client:

```
GET /recipes -> 200: Pancakes, Chicken curry, Tomato soup, Fish tacos
GET /recipes?vegetarian=true -> 200: Pancakes, Tomato soup
GET /recipes?maxMinutes=25 -> 200: Pancakes, Fish tacos
GET /recipes?vegetarian=true&maxMinutes=25 -> 200: Pancakes
GET /recipes/3 -> 200: Tomato soup (30 minutes)
GET /recipes/99 -> 404: Recipe 99 not found
GET /menu -> 404: Not found
```

And your server's terminal shows:

```
Recipes API running at http://localhost:3000/recipes
GET /recipes
GET /recipes?vegetarian=true
GET /recipes?maxMinutes=25
GET /recipes?vegetarian=true&maxMinutes=25
GET /recipes/3
GET /recipes/99
GET /menu
```

Try the addresses in your browser too, while the server is running. Remember to stop it with `Ctrl + C` when you're done.

<details>
<summary>Hint 1</summary>

Read and parse the file once, at the top of the server file, before `http.createServer`. Top-level `await` makes that easy. Then every request uses the same `recipes` array.

</details>

<details>
<summary>Hint 2</summary>

`new URL(request.url, "http://localhost:3000")` splits the address for you ([chapter 33](../33-fetch-and-apis/notes.md)). `url.pathname` is `"/recipes/3"`, without the query, and `url.searchParams.get("vegetarian")` is the string `"true"` (or `null` when it's missing).

</details>

<details>
<summary>Hint 3</summary>

`"/recipes/3".split("/")` gives `[ '', 'recipes', '3' ]`. Filter out the empty string, and you can check the parts one by one: the first must be `recipes`, and a second part, if there is one, is the id. It's still a string, so convert it before comparing it with the ids in your data.

</details>

<details>
<summary>Hint 4</summary>

For the filters, start with the whole list of recipes, then narrow it down one filter at a time with `filter` ([chapter 13](../13-array-methods/notes.md)). A request that fails a check can get its 404 answer and `return` straight away, like a guard clause.

</details>

---

## Before you move on

So far, you've only used what comes built into Node. But there are millions of free packages out there, from web frameworks like Express to tools that check and format your code for you.

In [chapter 50](../50-tooling/notes.md), you'll learn how to install and use them with npm, and meet the tools professional developers use every day. 🙂
