# 51 Security Basics

## What is it?

**Security** means protecting your app, and the people who use it, from anyone trying to misuse it: stealing data, taking over accounts, or making your page do things you never wrote.

This chapter is about **defense**. You'll learn the most common holes in JavaScript apps, and how to close each one.

## Why does it matter?

Your users trust you with their names, their messages, their passwords, and sometimes their money. And attackers don't have to be geniuses. They use automated tools that scan thousands of websites for the same handful of well-known mistakes.

Small mistakes can have big effects. In 2005, a MySpace user found he could sneak his own JavaScript into his profile page. Anyone who viewed the profile automatically "added him as a friend" and got a copy of the code in their own profile. In less than a day, it had spread to over a million profiles. It was a prank, but the same hole could just as easily have been used to steal accounts.

The good news: most of these mistakes have simple fixes, and you already know several of them from earlier chapters.

> **Watch out:** use what you learn here to protect your *own* projects. Testing other people's websites for holes without their permission is illegal in most countries.

## Real-world example

Security is like keeping your home safe. There's no single magic lock. You close each door and window, one at a time:

| Keeping your home safe | Keeping your app safe |
|---|---|
| Check who's at the door before you let them in | Check everything users send you |
| A note pushed under your door isn't an order you must follow | Show user text as text. Never run it as code |
| Don't hide a spare key under the doormat | Don't put secret keys in front-end code |
| Don't let strangers copy your house keys | Keep login tokens where other scripts can't read them |
| Only let builders you trust work on your house | Only install packages you trust |
| Have private conversations behind closed doors | Always use HTTPS |

A burglar only needs one open window. The rest of this chapter walks through the windows, one by one.

## How it works

### Rule 1: never trust user input

**User input** is anything that comes from outside your own code: form fields, the page URL, data from an API, even `localStorage` (users can edit it in DevTools). Treat all of it as possibly harmful until you've checked it.

Remember the form validation from [chapter 22](../22-forms/notes.md)? Those checks are great for the *user*: quick, friendly messages. But they don't protect anything. Anyone can open DevTools, delete a `required` attribute, change a hidden field, or skip your page completely and send a request straight to your server with `fetch`.

So here's the rule: **the browser checks for convenience, the server checks for safety.** The server must check everything again. And it should never trust a value it can work out by itself, like a price.

Here's a classic mistake. An online shop's page sends the price along with the order, and a sneaky user changes it to 1 cent before sending. A safe server ignores that price and uses its own:

```js
const prices = { mug: 12, poster: 8 }; // the server's own price list
const MAX_QUANTITY = 10;

function calculateTotal(order) {
  if (!Object.hasOwn(prices, order.productId)) {
    throw new Error("Unknown product");
  }
  if (!Number.isInteger(order.quantity) || order.quantity < 1 || order.quantity > MAX_QUANTITY) {
    throw new Error(`Quantity must be a whole number from 1 to ${MAX_QUANTITY}`);
  }
  // Ignore any price the browser sent. Use the server's own price.
  return prices[order.productId] * order.quantity;
}

console.log(calculateTotal({ productId: "mug", quantity: 2, price: 0.01 })); // prints: 24

try {
  calculateTotal({ productId: "mug", quantity: -5 });
} catch (error) {
  console.log("Rejected:", error.message); // prints: Rejected: Quantity must be a whole number from 1 to 10
}
```

Two details worth copying:

- **It lists what's allowed** (known products, 1 to 10 items) and rejects everything else. That's called an **allowlist**. It's much safer than a blocklist that tries to name every bad value, because attackers are good at finding the one you forgot.
- **`Object.hasOwn`** checks that the product really is in the price list. A plain `prices[order.productId]` lookup can be fooled by sneaky IDs like `"constructor"`, which every object has behind the scenes ([chapter 28](../28-prototypes/notes.md)). You'll see why that matters later in this chapter.

A real server does these checks in code like this, running on Node ([chapter 49](../49-nodejs-basics/notes.md)).

### XSS: when user text turns into code

**XSS** (cross-site scripting) is one of the most common holes on the web. It happens when text from a user ends up being run as code on your page. [Chapter 20](../20-dom-basics/notes.md) warned you about it. Here's the full story.

Picture a recipe site where visitors leave comments, and the page shows them with `innerHTML`:

```js
const commentList = document.getElementById("comments");

// A visitor typed this into the comment box:
const comment = `<img src="x" onerror="alert('hacked')">`;

// Vulnerable: the browser reads the comment as HTML
commentList.innerHTML += `<li>${comment}</li>`;
```

The browser turns that comment into a real `<img>` element. It tries to load an image called `x`, fails, and then runs the code inside `onerror`.

Here, that code only shows a harmless alert. But it runs in the browser of **every visitor** who opens the page, with the same powers as your own JavaScript. A real attacker's code could:

- read everything on the page, and everything in `localStorage`,
- send requests to your server as the logged-in visitor,
- swap your page for a fake login form that sends passwords to the attacker.

You might think: "I'll block `<script>` tags." That's not enough. Browsers don't even run `<script>` tags added with `innerHTML`, which is exactly why attackers use tricks like `onerror` instead. There are dozens of tags and attributes that can run code, and people keep finding new ones.

So don't try to spot the bad stuff. Make sure user text can **never** become HTML in the first place.

`innerHTML` isn't the only way in. `outerHTML`, `insertAdjacentHTML()` and `document.write()` also read strings as HTML, so the same rules apply to them.

### XSS fix 1: use `textContent`

This is the best fix, and the simplest. `textContent` treats everything as plain text, so the comment appears exactly as typed, angle brackets and all, and nothing runs:

```js
const commentList = document.getElementById("comments");
const comment = `<img src="x" onerror="alert('hacked')">`;

const item = document.createElement("li");
item.textContent = comment; // shown as text, never run
commentList.append(item);
```

The page now shows `<img src="x" onerror="alert('hacked')">` as plain text. Anyone reading the comments can see what the attacker tried, and nothing happens.

Build new elements with `createElement` and fill them with `textContent`, as you learned in chapter 20. That covers almost every case.

### XSS fix 2: escape user text before it goes into HTML

Sometimes you're building a string of HTML anyway, like a big template with lots of parts. Then you **escape** every piece of user text first. Escaping means swapping each character that has a special meaning in HTML for a safe code, called an **HTML entity**. The browser shows the entity as the normal character, but never treats it as HTML:

| Character | Escaped as |
|---|---|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |

After escaping, `<img ...>` becomes `&lt;img ...&gt;`. The browser shows `<img ...>` on the screen, but as text, not as a tag.

You'll write your own `escapeHTML` function in the exercises. In bigger projects, frameworks like React and Vue escape text for you automatically, which is one of the reasons people like them.

> **Tip:** here's a slogan worth remembering: **validate what comes in, escape what goes out.**

### XSS fix 3: when you need user HTML, use a sanitizer

Some apps want users to add a little formatting, like **bold** text in a comment. Then you can't escape everything. Instead, you pass the HTML through a **sanitizer**: a library that removes everything dangerous and keeps only safe tags. The best-known one is **DOMPurify**:

```js
const userHtml = `Great <b>recipe</b>! <img src="x" onerror="alert('hacked')">`;
const cleanHtml = DOMPurify.sanitize(userHtml);
console.log(cleanHtml); // prints: Great <b>recipe</b>! <img src="x">
```

The bold stays, and the `onerror` is gone. To use it, install it with `npm install dompurify` and write `import DOMPurify from "dompurify";` in a project built with a bundler like Vite ([chapter 50](../50-tooling/notes.md)).

Don't write your own sanitizer. HTML has far too many tricks, and the DOMPurify team has spent years finding them.

### Watch out for links too

A link can run code if its address starts with `javascript:`. So if users can add a website to their profile, someone will try `javascript:alert('hacked')`, and anyone who clicks the link runs that code.

The fix is another allowlist. Read the address with `URL` ([chapter 33](../33-fetch-and-apis/notes.md)) and allow only `http:` and `https:`:

```js
function isSafeLink(address) {
  try {
    const url = new URL(address);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch (error) {
    return false; // not a valid address at all
  }
}

console.log(isSafeLink("https://sam.example")); // prints: true
console.log(isSafeLink("javascript:alert('hacked')")); // prints: false
console.log(isSafeLink("  JavaScript:alert('hacked')")); // prints: false
```

Why not check the text yourself, with something like `address.startsWith("javascript:")`? The last example would get past it, thanks to the spaces and the capital letter, and browsers would still run it. `URL` reads the address the same way the browser does, so it isn't fooled.

### A safety net: Content Security Policy

A **Content Security Policy** (CSP) is a set of rules you give the browser about which scripts are allowed to run on your page. A common strict rule allows only script files from your own site:

```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self'">
```

With this rule in the page's `<head>`, the browser refuses to run code written inside the HTML itself, like an `onerror="..."` attribute or a `<script>` block, even if an attacker sneaks one onto the page. Your own files, like `<script src="script.js" defer>`, still work. (It also blocks inline `onclick="..."` attributes, one more reason [chapter 21](../21-events/notes.md) told you to avoid them.) Real sites usually send this rule from the server, as an HTTP header.

Think of CSP as a seatbelt. You still drive carefully, with `textContent` and escaping, but if something slips through, CSP can stop it from doing harm.

### Never run user input as code: `eval` and `new Function`

`eval()` takes a string and runs it as JavaScript. `new Function()` does the same thing, building a function out of strings:

```js
console.log(eval("2 + 3")); // prints: 5

const add = new Function("a", "b", "return a + b");
console.log(add(2, 3)); // prints: 5
```

That looks like an easy way to build a calculator: take whatever the user typed and `eval` it. But then the user isn't typing a sum. They're writing *your program*. In a browser, they can run any code on your page (XSS again). On a server, it's even worse: they could read or delete your files.

So the rule is: **never pass user input to `eval` or `new Function`.** You'll almost never need them at all.

The safe way is, once again, an allowlist. Decide exactly what's allowed, and handle each case yourself:

```js
const operations = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

function calculate(a, operator, b) {
  if (!Object.hasOwn(operations, operator)) {
    throw new Error(`Unknown operator: ${operator}`);
  }
  return operations[operator](Number(a), Number(b));
}

console.log(calculate("12", "*", "3")); // prints: 36

try {
  calculate("2", "alert('hacked')", "3");
} catch (error) {
  console.log(error.message); // prints: Unknown operator: alert('hacked')
}
```

It's the strategy pattern from [chapter 44](../44-design-patterns/notes.md): a lookup table of allowed actions. Whatever the user types, the only code that can ever run is the four small functions you wrote. And to turn text into data, use `JSON.parse` ([chapter 23](../23-json-and-local-storage/notes.md)), never `eval`.

One more hidden `eval`: browsers let you pass a string of code to `setTimeout` and `setInterval`, like `setTimeout("save()", 1000)`, and they run that string the same way. Always pass a function instead ([chapter 30](../30-timers-and-callbacks/notes.md)). Node doesn't allow the string version at all, and throws a `TypeError`.

### Everything in front-end code is public

Every file your page loads, like `script.js`, is downloaded to the visitor's computer, and they can read all of it. Press `F12`, open the **Sources** tab, and there it is. Minified code ([chapter 50](../50-tooling/notes.md)) is harder to read, but it's not secret.

So front-end code must never contain **secrets**: anything that gives access or costs money if someone else gets hold of it, like a paid API's secret key, a database password, or an admin password.

```js
// Never do this in front-end code: anyone can open DevTools and copy it
const paymentApiKey = "secret-key-12345";
```

Bots scan public websites and code on GitHub for leaked keys all day long. A key that slips into a public project can be found and misused within minutes.

The fix is to keep secrets on a server. Your page asks *your* server, and your server adds the secret and talks to the paid API:

```
Browser  --->  Your server (keeps the secret key)  --->  Paid API
```

On the server, keep the secret out of the code too. Put it in a `.env` file, and add `.env` to your `.gitignore` so it never ends up in git:

```
WEATHER_API_KEY=your-real-key-goes-here
```

Then start the server with `node --env-file=.env server.js` ([chapter 50](../50-tooling/notes.md)) and read the key with `process.env.WEATHER_API_KEY` ([chapter 49](../49-nodejs-basics/notes.md)).

Some keys are *meant* to be public, like a key for showing a map that only works on your own website. The service's documentation will tell you which kind you have. When in doubt, treat a key as secret.

### Login tokens: keep them away from JavaScript

When you log in to a website, the server gives your browser a **token**: a long random string that proves who you are, like a wristband at a festival. As far as the server knows, whoever holds the token *is* you.

It's tempting to save it with `localStorage.setItem("token", token)` ([chapter 23](../23-json-and-local-storage/notes.md)). But `localStorage` can be read by **any** script running on your page. That includes an attacker's XSS code, and third-party scripts (for analytics, ads or chat) that might get hacked themselves. One line, `localStorage.getItem("token")`, and the account is theirs.

The safer home for a token is an **httpOnly cookie**. A **cookie** is a small piece of data a browser keeps for a website, and sends back automatically with every request to it. The server creates it, with a few safety settings:

```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax
```

- `HttpOnly` means JavaScript can't read the cookie at all. It doesn't even show up in `document.cookie`, so XSS code can't steal it.
- `Secure` means it's only ever sent over HTTPS.
- `SameSite=Lax` means it isn't sent along when another website secretly sends a request to yours (see CSRF, next).

This is all set up on the server. Your front-end code doesn't need to touch the token at all. `localStorage` is still great for things that aren't secret: a theme, a draft, the items in a cart.

### CSRF, in brief

**CSRF** (cross-site request forgery) is a trick where another website makes your browser send a request to a site you're logged in to.

Say you're logged in to your bank in one tab, and you open an evil page in another. That page has a hidden form that sends "transfer 500 dollars" to your bank. Your browser helpfully attaches your bank cookies, so the bank thinks you sent it.

The defenses are mostly the server's job:

- **`SameSite` cookies** (above), so the browser doesn't attach them to requests started by other sites.
- **A CSRF token**: a secret random value the server puts into its own forms and checks on every request. The evil site can't know it.
- **Never change data with a `GET` request.** Use `POST`, `PUT` or `DELETE` for that ([chapter 33](../33-fetch-and-apis/notes.md)).

### Passwords are never stored as plain text

Real websites never store your password as you typed it. They store a **hash**: the result of a one-way scramble that can't be turned back into the password. When you log in, the server scrambles what you typed the same way and compares the two results. If the database is ever stolen, the attackers get scrambles, not passwords.

That's server work, done with slow, purpose-built tools like bcrypt or Argon2 (never a homemade scheme). On the front end, your job is simpler: send passwords only over HTTPS, and never save them in `localStorage` or print them with `console.log`.

### Dependencies: trust, but check

Every `npm install` brings strangers' code into your project, plus all the packages that *those* packages need. Even a small project can end up with hundreds. This chain of other people's code is called your **supply chain**.

Most of it is fine, but attackers know it's a way in:

- **Hijacked packages.** In 2018, a popular package called `event-stream` was handed over to a new maintainer, who quietly added code that tried to steal from a Bitcoin wallet app. It went unnoticed for about two months.
- **Look-alike names.** In 2017, a fake package called `crossenv` (the real one is `cross-env`) stole secret settings from every project that installed it by mistake.

Good habits:

- **Install only what you need.** Before adding a package, check it's really the one you want: the exact name, lots of weekly downloads, recent updates, and a real project page. And ask yourself: could 20 lines of your own code do the job?
- **Commit your `package-lock.json`** ([chapter 50](../50-tooling/notes.md)), so everyone installs exactly the same versions.
- **Run `npm audit` now and then.** It checks your packages against a public list of known security holes.

Here's what `npm audit` printed for a practice project that used an old version of lodash, a popular helper library (trimmed):

```
# npm audit report

lodash  <=4.17.23
Severity: high
Command Injection in lodash - https://github.com/advisories/GHSA-35jh-r3h4-6jhm
Prototype Pollution in lodash - https://github.com/advisories/GHSA-p6mc-m468-83gw
fix available via `npm audit fix`
node_modules/lodash

1 high severity vulnerability
```

Running `npm audit fix` updated lodash to a fixed version, and after that `npm audit` said `found 0 vulnerabilities`. Your output will look different, because new problems are reported all the time.

Be careful with `npm audit fix --force`. It may jump to a new major version with breaking changes (remember semantic versioning from chapter 50), so check what it changed and run your tests.

### Prototype pollution, in brief

Remember `__proto__` from [chapter 28](../28-prototypes/notes.md)? It's behind a sneaky attack called **prototype pollution**. It can happen when your code merges data from a user into one of your objects, and that data contains a key named `__proto__`.

Here's a simple "deep merge" helper that copies settings from one object into another. Lots of projects write something like it:

```js
function merge(target, source) {
  for (const key in source) {
    const value = source[key];
    if (typeof value === "object" && value !== null) {
      if (typeof target[key] !== "object" || target[key] === null) {
        target[key] = {};
      }
      merge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const settings = { theme: "light" };
const fromUser = JSON.parse('{"theme": "dark", "__proto__": {"isAdmin": true}}');
merge(settings, fromUser);

const brandNewObject = {};
console.log(brandNewObject.isAdmin); // prints: true
```

A brand-new, empty object claims to be an admin! When the loop reached the key `"__proto__"`, `target["__proto__"]` wasn't a normal property. It was `Object.prototype`, the shared parent of every object. So `isAdmin: true` was written onto that parent, and now **every** object in the program inherits it. If any code checks `user.isAdmin`, everyone is an admin.

The fix: skip the dangerous keys, and only loop over the object's own keys:

```js
const FORBIDDEN_KEYS = ["__proto__", "constructor", "prototype"];

function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (FORBIDDEN_KEYS.includes(key)) {
      continue; // never copy a key that could reach a prototype
    }
    const value = source[key];
    if (typeof value === "object" && value !== null) {
      if (typeof target[key] !== "object" || target[key] === null) {
        target[key] = {};
      }
      safeMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const settings = { theme: "light" };
safeMerge(settings, JSON.parse('{"theme": "dark", "__proto__": {"isAdmin": true}}'));
console.log(settings.theme, {}.isAdmin); // prints: dark undefined
```

Other ways to stay safe: when the keys come from users, store the data in a `Map` ([chapter 35](../35-map-and-set/notes.md)) instead of a plain object. Or copy only the fields you expect, like `{ theme: fromUser.theme }`. And keep your libraries updated. The "Prototype Pollution in lodash" line in the `npm audit` report above is exactly this bug, in a library millions of projects use.

### HTTPS

Plain **HTTP** sends everything as readable text. Anyone on the same cafe Wi-Fi, or anywhere along the way, could read it or even change it. **HTTPS** encrypts the connection between the browser and the server. It's the padlock next to the address in your browser.

- Serve your site over HTTPS, and only call APIs with `https://` addresses. Hosts like GitHub Pages and Netlify give you HTTPS for free ([chapter 52](../52-final-project/notes.md)).
- Browsers mark plain HTTP pages as "Not secure". Some features, like finding the user's location with `navigator.geolocation` and the clipboard API, only work on HTTPS pages (or on `localhost` while you develop).
- If an HTTPS page tries to load a script over plain `http://`, the browser blocks it.

## Common mistakes

**1. Putting user text into `innerHTML`**

```js
const username = new URLSearchParams(location.search).get("name");
greeting.innerHTML = `Welcome back, ${username}!`;
```

Anyone can send a friend a link with HTML hidden in `?name=...`. Fix: `greeting.textContent = ...`. The same goes for anything that came from a form, an API or `localStorage`.

**2. Checking only in the browser**

```html
<input type="number" name="quantity" min="1" max="10">
```

`max="10"` stops honest users from typing 11. It doesn't stop anyone who opens DevTools or sends a request with `fetch`. The server must check again.

**3. Blocking what you fear instead of allowing what you expect**

```js
const address = "  JavaScript:alert('hacked')";
console.log(!address.startsWith("javascript:")); // prints: true
```

This "is it safe?" check says yes, fooled by two spaces and a capital letter. Use an allowlist instead: read the address with `URL` and accept only `https:` and `http:`.

**4. Committing a secret to git**

A `.env` file that isn't in `.gitignore`, or a key typed into the code "just for a quick test". Once a secret has been pushed, deleting it later isn't enough: it stays in the git history, and bots may already have copied it. Cancel the key straight away (services call this **revoking** it) and create a new one.

**5. Logging secrets**

```js
console.log("Logging in with", email, password);
```

Logs end up in files, terminals and error-tracking tools that other people can read. Log *that* something happened, like `"Login attempt"`, never the password or token itself.

## Quick recap

- Never trust user input. The browser checks for convenience, and the server checks for safety.
- Allow what you expect (an allowlist), instead of trying to block every bad thing.
- Never put user text into `innerHTML`: use `textContent`, escape it, or clean it with DOMPurify. Only allow `http:` and `https:` links, and add a CSP as a safety net.
- Never run user input as code, whether with `eval`, `new Function` or a string in `setTimeout`.
- Front-end code is public. Keep secrets on a server, in a `.env` file that's listed in `.gitignore`.
- Keep login tokens in httpOnly cookies, not `localStorage`, and use HTTPS everywhere.
- Install only packages you trust, commit your lockfile, run `npm audit`, and skip `__proto__` keys when merging user data.

---

**Next:** try the [exercises](exercises.md), then move on to [52 Final Project](../52-final-project/notes.md).
