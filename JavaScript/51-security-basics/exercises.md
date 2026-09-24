# 51 Security Basics: Exercises

**How to do these:**

- Exercises 1, 2, 4 and 5 are Node exercises: make one file per exercise in this folder (`ex1.js`, `ex2.js`, and so on) and run it with `node ex2.js`.
- Exercises 2 and 5 use `import`/`export`, so add a `package.json` containing `{ "type": "module" }` to this folder first ([chapter 29](../29-modules/notes.md)).
- Exercise 3 is a browser exercise: make a folder `ex3` with `index.html` and `script.js`, open `index.html` by double-clicking it, and press `F12` for the Console.
- Only ever try these attacks on your own pages.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Spot the vulnerability

A friend asks you to review their app before it goes live. Each of these six snippets has one security problem. In `ex1.js`, write a comment for each one: **what's wrong**, **what an attacker could do**, and **how to fix it**.

**A.** Showing product reviews that came from an API (visitors wrote them):

```js
for (const review of reviews) {
  reviewList.innerHTML += `<li>${review.author}: ${review.text}</li>`;
}
```

**B.** A weather widget in the page's `script.js`:

```js
const weatherApiSecret = "secret-key-98765";
fetch(`https://api.weather.example/today?city=Oslo&key=${weatherApiSecret}`);
```

**C.** After a successful login:

```js
localStorage.setItem("authToken", loginResult.token);
```

**D.** A calculator page:

```js
const answer = eval(calculationInput.value);
resultBox.textContent = answer;
```

**E.** On the server, saving a user's settings with the simple `merge` helper from the notes:

```js
const userSettings = merge({}, JSON.parse(requestBody));
```

**F.** On the server, working out an order's total:

```js
const total = order.price * order.quantity; // order was sent by the browser
```

<details>
<summary>Hint 1</summary>

Each snippet matches one section of the notes. Match them up first, then reread that section.

</details>

<details>
<summary>Hint 2</summary>

For each one, ask: "If a stranger controlled this data (or could read this file), what could they do?"

</details>

---

## Exercise 2 (Easy): Build `escapeHTML`

Write a function `escapeHTML(value)` that swaps the five special characters from the notes (`&`, `<`, `>`, `"` and `'`) for their HTML entities. Put it in its own file, `escape.js`, and export it. You'll reuse it in Exercise 5.

Then create `ex2.js` with these tests:

```js
import { escapeHTML } from "./escape.js";

console.log(escapeHTML("Tom & Jerry"));
console.log(escapeHTML("<b>bold</b>"));
console.log(escapeHTML(`<img src="x" onerror="alert('hacked')">`));
console.log(escapeHTML("5 < 10 && 10 > 5"));
console.log(escapeHTML("Hello, world!"));
console.log(escapeHTML(42));
```

Expected output:

```
Tom &amp; Jerry
&lt;b&gt;bold&lt;/b&gt;
&lt;img src=&quot;x&quot; onerror=&quot;alert(&#39;hacked&#39;)&quot;&gt;
5 &lt; 10 &amp;&amp; 10 &gt; 5
Hello, world!
42
```

**Rule:** replace *every* special character, not only the first one of each kind. And it must work for numbers too (the last test).

<details>
<summary>Hint 1</summary>

Which string method from chapter 06 replaces every match, not just the first? You can chain five of them, one per character.

</details>

<details>
<summary>Hint 2</summary>

Seeing `&amp;lt;` in your output? The `&` inside `&lt;` got escaped a second time. One character has to be replaced first, before all the others. Which one?

</details>

<details>
<summary>Hint 3</summary>

`42` is a number, and numbers don't have string methods. Turn the value into a string first (chapter 05).

</details>

---

## Exercise 3 (Medium): Fix the comment box

A recipe website lets visitors leave comments, but its code has an XSS hole. Use this HTML for `ex3/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Recipe Comments</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Grandma's Apple Pie</h1>
    <form id="comment-form">
      <label for="name">Name</label>
      <input id="name" required>
      <label for="comment">Comment</label>
      <textarea id="comment" required></textarea>
      <button type="submit">Post comment</button>
    </form>
    <ul id="comments"></ul>
  </body>
</html>
```

And this vulnerable code for `ex3/script.js`:

```js
const form = document.getElementById("comment-form");
const nameInput = document.getElementById("name");
const commentInput = document.getElementById("comment");
const commentList = document.getElementById("comments");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  commentList.innerHTML += `<li><strong>${nameInput.value}</strong>: ${commentInput.value}</li>`;
  form.reset();
});
```

1. **See the hole.** Post a normal comment first. Then post one with the name `Sam` and this comment (it's harmless, it only shows an alert): `<img src="x" onerror="alert('hacked')">`. An alert pops up: your page just ran code that a visitor typed.
2. **Fix `script.js`** so every comment is shown as plain text, and the name is still bold.

After the fix, posting that same comment shows this on the page, and no alert appears:

```
• Sam: <img src="x" onerror="alert('hacked')">
```

**Rule:** no `innerHTML` (or `outerHTML` or `insertAdjacentHTML`) anywhere in your fixed code.

<details>
<summary>Hint 1</summary>

Build the `<li>` and the `<strong>` with `createElement` ([chapter 20](../20-dom-basics/notes.md)), and fill them with `textContent`.

</details>

<details>
<summary>Hint 2</summary>

`append()` accepts plain strings as well as elements, and it always adds strings as text, never as HTML.

</details>

**Bonus:** try the attack in the *name* field too. Is your fix safe there as well?

---

## Exercise 4 (Medium): Find the leaked secrets

A teammate is about to make their weather project public on GitHub, and asks you to review it first. Here are the files that matter.

`public/app.js`, which runs in the browser:

```js
const WEATHER_KEY = "wk-live-4f8a2c91";
const ADMIN_PASSWORD = "sunflower42";

async function loadWeather(city) {
  const response = await fetch(`https://api.weather.example/v1?city=${city}&key=${WEATHER_KEY}`);
  return response.json();
}

function isAdmin(typedPassword) {
  return typedPassword === ADMIN_PASSWORD;
}
```

`server.js`, which runs on the server:

```js
const databasePassword = "practice-only-123";
console.log("Connecting with password:", databasePassword);
```

And `.gitignore`:

```
node_modules
```

**Part 1: review.** In a comment at the top of `ex4.js`, list every problem you can find (there are at least four) and how you'd fix each one.

**Part 2: fix the server.** Write the server code again in `ex4.js`, this time without the password in it:

1. Create a `.env` file in this folder containing `DATABASE_PASSWORD=practice-only-123` (a made-up practice password).
2. Create a `.gitignore` file next to it that lists `.env`, the way you'd fix your teammate's.
3. Read the password with `process.env`. Don't print it. Print whether it loaded, and a masked preview: the first 3 characters, then one `*` for each remaining character.

Running `node --env-file=.env ex4.js` should print:

```
Database password loaded: yes
Password preview: pra**************
```

And running plain `node ex4.js`, without `--env-file`, shouldn't crash (Node only reads `.env` when you ask it to):

```
Database password loaded: no
Password preview: (none)
```

**Rule:** the password must not appear anywhere in `ex4.js`, and the full password must never be printed.

<details>
<summary>Hint 1</summary>

For Part 1, look for two kinds of problems: secrets in a file that every visitor downloads, and secrets that end up in git or in logs. Also think about `isAdmin`: can a password check that runs in the browser ever be safe?

</details>

<details>
<summary>Hint 2</summary>

When the variable isn't set, `process.env.DATABASE_PASSWORD` is `undefined` ([chapter 49](../49-nodejs-basics/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

`slice` and `repeat` from chapter 06 can build the preview. The number of stars depends on the password's `length`.

</details>

---

## Exercise 5 (Challenge): A safe profile card

On a hobby website, users fill in a profile: a username, a short bio, and a website. Your job is to turn each profile into a small piece of HTML, safely. Start `ex5.js` with this:

```js
import { escapeHTML } from "./escape.js";

const profiles = [
  { username: "sam_codes", bio: "I love <b>JavaScript</b> & hiking.", website: "https://sam.example" },
  { username: "mallory", bio: `<img src="x" onerror="alert('hacked')">`, website: "javascript:alert('hacked')" },
  { username: "<script>", bio: "Hi!", website: "https://ok.example" },
  { username: "long_story", bio: "I have baked bread every weekend since I was twelve, & I still love it.", website: "not a url" },
];

// Write renderProfile(profile) here

for (const profile of profiles) {
  try {
    console.log(renderProfile(profile));
  } catch (error) {
    console.log("Rejected:", error.message);
  }
}
```

`renderProfile(profile)` returns one line of HTML and follows these rules:

- **Username:** 3 to 20 characters, using only letters, digits and `_`. Anything else throws an error with the message `Invalid username`.
- **Bio:** if it's longer than 60 characters, keep the first 60 and add `...`.
- **Website:** only `https:` and `http:` addresses become a link, like `<a href="https://sam.example">https://sam.example</a>`. Anything else becomes `<p>No website</p>`.
- **Everything the user typed** (username, bio and website) goes through `escapeHTML` before it goes into the HTML.
- The result looks like this: `<div class="profile"><h2>username</h2><p>bio</p>` + the website part + `</div>`.

Expected output:

```
<div class="profile"><h2>sam_codes</h2><p>I love &lt;b&gt;JavaScript&lt;/b&gt; &amp; hiking.</p><a href="https://sam.example">https://sam.example</a></div>
<div class="profile"><h2>mallory</h2><p>&lt;img src=&quot;x&quot; onerror=&quot;alert(&#39;hacked&#39;)&quot;&gt;</p><p>No website</p></div>
Rejected: Invalid username
<div class="profile"><h2>long_story</h2><p>I have baked bread every weekend since I was twelve, &amp; I sti...</p><p>No website</p></div>
```

**Rules:** check the username with a regular expression ([chapter 37](../37-regular-expressions/notes.md)), and the website with `URL`. Don't change the starter data or the loop.

<details>
<summary>Hint 1</summary>

For the username, use a character set with a `{3,20}` quantifier, between `^` and `$`. Try it without `^` and `$`: `"<script>"` passes! Why?

</details>

<details>
<summary>Hint 2</summary>

For the website, reuse the `isSafeLink` idea from the notes: `new URL()` inside `try`/`catch`, then check the `protocol`.

</details>

<details>
<summary>Hint 3</summary>

Cut the bio *before* you escape it. The 60-character limit is about what the user typed. After escaping, one `&` has become five characters (`&amp;`), which throws off the count, and a cut could even land in the middle of an entity.

</details>

---

## Before you move on

You can now build apps *and* keep them safe. In [chapter 52](../52-final-project/notes.md), you'll plan and build a project of your own, from the first idea to sharing it online. Give it the same security check you practiced here before you show it to the world.
