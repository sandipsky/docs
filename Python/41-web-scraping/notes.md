# 41 Web Scraping

## What is it?

**Web scraping** means writing a program that downloads a web page and pulls the information you want out of its HTML: prices, titles, dates, links.

You'll use `requests` from [chapter 40](../40-working-with-apis/notes.md) to download pages, and a package called **BeautifulSoup** to find things inside them.

## Why does it matter?

In chapter 40, the data came from APIs: neat JSON, made for programs. But lots of useful information only exists on ordinary web pages, made for people:

- the prices in an online shop, so you can spot when something gets cheaper,
- the new books at your library, or the events at your gym,
- a timetable, a table of results, a list of job adverts.

Most of these sites have no API. You could copy what you need by hand, but that's slow, boring and easy to get wrong, and you'd have to do it again tomorrow. A scraper does it in seconds, as often as you like.

The catch: web pages are built for people, not programs. A scraper is more fragile than an API client, because a site can change its layout at any time. And a scraper visits someone else's website, so there are rules of good behaviour. That's where this chapter starts.

## Real-world example

Think of two ways to collect the football results from a newspaper.

You could sit down with the paper and a pair of scissors, find the sports page, and cut out the results table. Or the newspaper could post you a tidy list of results every morning, in exactly the format you asked for.

| Getting the football results | Getting data from the web |
|---|---|
| The newspaper posts you a tidy list | An API (chapter 40) |
| Cutting the table out with scissors | Web scraping |
| Knowing the results are in the box at the bottom of page 34 | Knowing which HTML tags and classes hold the data |
| The paper redesigns its sports page, and you cut out an advert instead | The site changes its HTML, and your scraper breaks |
| "Please don't cut up the library's copy" | The site's `robots.txt` and terms of use |

If the newspaper offers the tidy list, use it. Get the scissors out only when there's no other way, and be careful with them.

## How it works

### Rules first: scraping politely

A program can ask for hundreds of pages a second. To a small website, that can feel like an attack, and it can slow the site down or even knock it over for everyone else. So before you write a single line, learn the rules of polite scraping:

| Rule | Why |
|---|---|
| **Use an API if there is one.** | It's faster, more reliable, and the site wants you to use it. |
| **Read the site's terms of use.** | Many sites say whether automated access is allowed. |
| **Check `robots.txt`.** | It lists the parts of the site that robots should stay out of (below). |
| **Slow down.** | Wait at least a second between pages, with `time.sleep(1)`. |
| **Say who you are.** | Send a `User-Agent` header with your program's name and a way to contact you. |
| **Only take what you need.** | Fewer pages means less work for the site. Save pages while you develop, so you don't download them again and again. |
| **Leave personal data alone.** | Names, emails and photos of real people are protected by privacy laws in many countries (such as the GDPR in Europe). |

> **Watch out:** The law about scraping is different in each country, and depends on the site and on what you do with the data. "Anyone can see it" doesn't mean "anyone may copy and reuse it": text and pictures are usually protected by copyright. This chapter isn't legal advice. For learning, stick to sites that are made for practice.

Two sites are built exactly for practising, and this chapter uses both:

- **Quotes to Scrape** (`quotes.toscrape.com`): famous quotes with their authors and tags, spread over several pages.
- **Books to Scrape** (`books.toscrape.com`): a pretend bookshop with 1,000 books, prices and star ratings.

They're run by a web-scraping company for anyone to practise on, and their content doesn't change, so your results will match these notes.

### `robots.txt`: the sign on the door

Most websites have a file called `robots.txt` at the top of the site, like `https://www.python.org/robots.txt`. It's a plain text file that tells **robots** (programs that visit pages automatically, like search engines and your scraper) where they may and may not go. Part of python.org's file looks like this:

```
# Hide old versions of the documentation and various large sets of files.
User-agent: *
Disallow: /~guido/orlijn/
Disallow: /webstats/
```

`User-agent: *` means "these rules are for every robot", and each `Disallow:` line names a part of the site to stay out of. A file can also have a `Crawl-delay:` line: how many seconds to wait between pages.

It's a polite sign on the door, not a lock: nothing stops a program from ignoring it. But ignoring it is rude, and it's the quickest way to get your program blocked.

Python's standard library can read these files for you, with `urllib.robotparser`. Here it reads a small set of rules for an imaginary cafe website:

```python
from urllib.robotparser import RobotFileParser

rules = """
User-agent: *
Disallow: /admin/
Disallow: /cart/
Crawl-delay: 5
"""

robots = RobotFileParser()
robots.parse(rules.splitlines())

print(robots.can_fetch("SandipBot", "https://maya-cafe.example/menu"))  # prints: True
print(robots.can_fetch("SandipBot", "https://maya-cafe.example/cart/42"))  # prints: False
print(robots.crawl_delay("SandipBot"))  # prints: 5
```

`can_fetch(name, url)` answers "may a robot called this visit this page?". For a real site, give `RobotFileParser` the address of the file, and call `.read()` to download it:

```python
from urllib.robotparser import RobotFileParser

robots = RobotFileParser("https://www.python.org/robots.txt")
robots.read()  # downloads and reads the file

print(robots.can_fetch("SandipBot", "https://www.python.org/downloads/"))  # prints: True
print(robots.can_fetch("SandipBot", "https://www.python.org/webstats/"))  # prints: False

robots = RobotFileParser("https://books.toscrape.com/robots.txt")
robots.read()
page = "https://books.toscrape.com/catalogue/page-2.html"
print(robots.can_fetch("SandipBot", page))  # prints: True
```

The two practice sites have no `robots.txt` at all (asking for one gives a 404). `RobotFileParser` treats a missing file as "everything is allowed", which is why the last line says `True`.

### HTML in five minutes

To pull things out of a page, you need to read its HTML. Here's the minimum. (The JavaScript course has a longer introduction in [chapter 20](../../JavaScript/20-dom-basics/notes.md).)

HTML is made of **tags**: words in angle brackets. Most come in pairs, an opening tag and a closing tag with a `/`. Everything from the opening tag to the closing tag is an **element**:

```html
<h1>Maya's Cafe</h1>
```

Elements sit inside other elements, like boxes inside boxes. That's called **nesting**:

```html
<ul class="menu">
  <li class="item">Latte</li>
  <li class="item special">Mocha</li>
</ul>
```

`<ul>` is a bullet list, and each `<li>` is one item in it. **Attributes** add extra information inside the opening tag, written `name="value"`. Three of them matter most for scraping:

- **`class`** puts an element in a group, like a team shirt. Many elements can share a class, and one element can have several, separated by spaces: `class="item special"` has two classes.
- **`id`** gives one element a unique name, like a passport number.
- **`href`** on an `<a>` tag (a link) is the address the link goes to.

The tags you'll meet most often:

| Tag | What it is |
|---|---|
| `<h1>` to `<h6>` | Headings, from biggest to smallest |
| `<p>` | A paragraph |
| `<a href="...">` | A link |
| `<ul>`, `<ol>` and `<li>` | Bullet lists, numbered lists, and their items |
| `<div>` and `<span>` | Plain boxes for grouping things: `<div>` for blocks, `<span>` for a few words inside a line |
| `<table>`, `<tr>`, `<td>` | A table, its rows, and the cells in each row |
| `<img src="...">` | An image |

Save this page as `cafe.html` in this chapter's folder. The next few examples all read it, so they work without the internet, and give the same result every time:

```html
<html>
  <head>
    <title>Maya's Cafe</title>
  </head>
  <body>
    <h1 id="cafe-name">Maya's Cafe</h1>
    <p class="intro">Fresh coffee and cake, every day.</p>
    <ul class="menu">
      <li class="item">
        <span class="name">Latte</span> <span class="price">$3.50</span>
      </li>
      <li class="item special">
        <span class="name">Mocha</span> <span class="price">$4.25</span>
      </li>
      <li class="item">
        <span class="name">Carrot cake</span> <span class="price">$3.75</span>
      </li>
    </ul>
    <p>See our <a href="/specials">specials</a>, or <a href="https://maps.example.com/maya">find us</a>.</p>
  </body>
</html>
```

### Looking at a page with your browser's dev tools

Before you scrape a page, you need to know which tags and classes hold the data. Your browser can show you.

1. Open the page in Chrome, Edge or Firefox. (Double-click `cafe.html` to try it.)
2. Right-click the thing you want, like a price, and choose **Inspect**. (Or press `F12`.)
3. The **developer tools** open, with the **Elements** panel (called **Inspector** in Firefox) showing the page's HTML. The price's element is highlighted, inside its `<li>`, inside the `<ul class="menu">`.
4. Hover over other lines in the panel, and the matching part of the page lights up.

Write down what you find, like "each menu item is an `li` with class `item`, and the price is a `span` with class `price`". That's your map for the scraper. (The panels look a little different in each browser, and they change between versions, but the right-click **Inspect** is always there.)

There's also **View page source** (right-click, or `Ctrl+U`), which shows the raw HTML exactly as the server sent it. That's what `requests` downloads. You'll see later why the two can be different.

### Installing BeautifulSoup

**BeautifulSoup** reads HTML and lets you search it, the way `json.loads` turns JSON text into dictionaries. Install it with requests, in a virtual environment ([chapter 23](../23-pip-and-virtual-environments/notes.md)):

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install requests beautifulsoup4
```

The end of pip's output looks something like this:

```
Successfully installed beautifulsoup4-4.15.0 certifi-2026.7.22 charset_normalizer-3.5.2 idna-3.20 requests-2.34.2 soupsieve-3.0.2 typing-extensions-4.16.0 urllib3-2.8.0
```

Notice the name: you **install** `beautifulsoup4`, but you **import** `bs4`. (The `4` is the version: BeautifulSoup 4 replaced an older, retired BeautifulSoup 3 long ago.) These notes were written with beautifulsoup4 4.15.

### Your first soup

```python
from pathlib import Path

from bs4 import BeautifulSoup

html = Path("cafe.html").read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")

heading = soup.find("h1")
print(heading)  # prints: <h1 id="cafe-name">Maya's Cafe</h1>
print(type(heading))  # prints: <class 'bs4.element.Tag'>
if heading is not None:
    print(heading.get_text())  # prints: Maya's Cafe

print(soup.find("table"))  # prints: None
```

- `BeautifulSoup(html, "html.parser")` reads the HTML and builds the **soup**: an object you can search. `"html.parser"` is the HTML reader built into Python. (Faster ones, like `lxml`, exist, but need installing.)
- `soup.find("h1")` gives back the first `<h1>` element, as a **Tag** object.
- `.get_text()` gives you the text inside a tag, without the angle brackets.
- When nothing matches, `find` gives back `None`. The page has no `<table>`, so the last line prints `None`.

That `None` is why there's an `if heading is not None:` check. It's the "forgetting `None`" bug from [chapter 25](../25-type-hints/notes.md) all over again: if you call `.get_text()` on `None`, the program crashes. BeautifulSoup comes with type hints, so mypy and Pylance remind you to check.

### `find` and `find_all`

`find` gives you the first match. `find_all` gives you a list of every match (an empty list when there are none):

```python
from pathlib import Path

from bs4 import BeautifulSoup

soup = BeautifulSoup(Path("cafe.html").read_text(encoding="utf-8"), "html.parser")

prices = soup.find_all("span", class_="price")
print([price.get_text() for price in prices])  # prints: ['$3.50', '$4.25', '$3.75']

print(soup.find(id="cafe-name"))  # prints: <h1 id="cafe-name">Maya's Cafe</h1>
print(len(soup.find_all("li", class_="special")))  # prints: 1
```

- `class_="price"` finds elements with that class. It has an underscore because `class` is a Python keyword ([chapter 27](../27-classes-and-objects/notes.md)), and Python won't let you use it as an argument name.
- `id="cafe-name"` finds the element with that id.
- An element with several classes, like `class="item special"`, matches any one of them.
- Every tag has `find` and `find_all` too, not just the soup. `item.find("span", class_="price")` only looks inside that one `item`, which is how you keep each name together with its own price. You'll use that a lot below.

### Text and attributes

Text from a web page usually comes with extra spaces and line breaks from the way the HTML was laid out:

```python
from pathlib import Path

from bs4 import BeautifulSoup

soup = BeautifulSoup(Path("cafe.html").read_text(encoding="utf-8"), "html.parser")

for item in soup.find_all("li"):
    print(repr(item.get_text()))
    print(repr(item.get_text(strip=True)))
    print(repr(item.get_text(" ", strip=True)))
    break
```

You'll see:

```
'\nLatte $3.50\n'
'Latte$3.50'
'Latte $3.50'
```

(`repr()` shows the hidden `\n` line breaks, and `break` stops after the first item.) `strip=True` removes the spaces and line breaks around each piece of text, but then glues the pieces together with nothing in between. Give it a separator first, like `" "`, to keep them apart. For a tag with just one piece of text inside, like `<span class="price">`, plain `.get_text(strip=True)` is perfect.

Attributes work like a dictionary. Read them with square brackets, or with `.get()` when they might be missing:

```python
from pathlib import Path

from bs4 import BeautifulSoup

soup = BeautifulSoup(Path("cafe.html").read_text(encoding="utf-8"), "html.parser")

for link in soup.find_all("a"):
    print(link.get_text(), link["href"])

special = soup.find("li", class_="special")
if special is not None:
    print(special["class"])  # prints: ['item', 'special']
    print(special.get("id"))  # prints: None
```

You'll see:

```
specials /specials
find us https://maps.example.com/maya
['item', 'special']
None
```

Look at `special["class"]`: it's a **list**, because an element can have several classes. Every other attribute is a plain string. (BeautifulSoup's type hints say an attribute can be "a string or a list of strings", so when you pass an `href` to something that needs a string, wrap it in `str()` to keep mypy happy. You'll see this below.)

### CSS selectors: `select` and `select_one`

There's a second way to search, and it's often shorter: **CSS selectors**, the same little patterns that web designers use to pick elements for styling (and that JavaScript uses with `querySelector`). `select` gives you a list of every match, and `select_one` gives you the first match or `None`:

```python
from pathlib import Path

from bs4 import BeautifulSoup

soup = BeautifulSoup(Path("cafe.html").read_text(encoding="utf-8"), "html.parser")

print([tag.get_text() for tag in soup.select("span.price")])
print([tag.get_text() for tag in soup.select("ul.menu li.special span.name")])
print(soup.select_one("#cafe-name"))
print(len(soup.select("a[href]")))
print(soup.select_one("div.footer"))
```

You'll see:

```
['$3.50', '$4.25', '$3.75']
['Mocha']
<h1 id="cafe-name">Maya's Cafe</h1>
2
None
```

| Selector | Matches |
|---|---|
| `span` | Every `<span>` |
| `.price` | Every element with the class `price` |
| `span.price` | Every `<span>` with the class `price` |
| `li.item.special` | Every `<li>` with *both* classes |
| `#cafe-name` | The element with the id `cafe-name` |
| `ul.menu li` | Every `<li>` somewhere inside a `<ul class="menu">` (a space means "inside") |
| `a[href]` | Every `<a>` that has an `href` attribute |

`find`/`find_all` and `select_one`/`select` can do the same jobs. Use whichever reads better to you. This chapter uses selectors from here on, because they're short and you can copy the idea straight from what you see in the browser's dev tools.

### A helper for things that might be missing

Real pages are messy: one product has no price, one quote has no author. Checking for `None` every time gets long, so write the check once:

```python
from pathlib import Path

from bs4 import BeautifulSoup, Tag


def text_of(parent: Tag, selector: str) -> str:
    """Return the text of the first match for selector inside parent, or "" if none."""
    found = parent.select_one(selector)
    if found is None:
        return ""
    return found.get_text(strip=True)


def price_to_cents(text: str) -> int:
    """Turn a price like "$3.50" into whole cents, like 350."""
    return round(float(text.replace("$", "")) * 100)


soup = BeautifulSoup(Path("cafe.html").read_text(encoding="utf-8"), "html.parser")

menu: dict[str, int] = {}
for item in soup.select("li.item"):
    name = text_of(item, "span.name")
    price = text_of(item, "span.price")
    menu[name] = price_to_cents(price)

print(menu)  # prints: {'Latte': 350, 'Mocha': 425, 'Carrot cake': 375}
print(text_of(soup, "h1"))  # prints: Maya's Cafe
print(repr(text_of(soup, "h2")))  # prints: ''
```

`Tag` is the type of an element, so it's the hint for `parent`. The soup itself counts as a `Tag` too, which is why `text_of(soup, "h1")` works. And the prices are now whole cents, ready for maths, like the money in [chapter 14](../14-project-shopping-cart/notes.md).

### Scraping a real page

Time for the real internet. Open `https://quotes.toscrape.com` in your browser, right-click a quote and choose **Inspect**. Each quote looks like this (shortened):

```html
<div class="quote">
  <span class="text">“The world as we have created it is a process of our thinking...”</span>
  <span>by <small class="author">Albert Einstein</small></span>
  <div class="tags">
    Tags:
    <a class="tag" href="/tag/change/page/1/">change</a>
    <a class="tag" href="/tag/deep-thoughts/page/1/">deep-thoughts</a>
  </div>
</div>
```

So: each quote is a `div.quote`, its words are in `span.text`, the author in `small.author`, and each tag is an `a.tag`. Now download the page with requests, and hand its text to BeautifulSoup:

```python
import requests
from bs4 import BeautifulSoup, Tag

URL = "https://quotes.toscrape.com/"
HEADERS = {"User-Agent": "SandipLearningBot/1.0 (learning Python; sandip@example.com)"}


def text_of(parent: Tag, selector: str) -> str:
    """Return the text of the first match for selector inside parent, or "" if none."""
    found = parent.select_one(selector)
    if found is None:
        return ""
    return found.get_text(strip=True)


response = requests.get(URL, headers=HEADERS, timeout=10)
response.raise_for_status()
soup = BeautifulSoup(response.text, "html.parser")

quotes = soup.select("div.quote")
print(f"Found {len(quotes)} quotes")
for quote in quotes[:3]:
    text = text_of(quote, "span.text")
    author = text_of(quote, "small.author")
    tags = [tag.get_text() for tag in quote.select("a.tag")]
    print(f"{author}: {text[:45]}...")
    print(f"  tags: {', '.join(tags)}")
```

You'll see:

```
Found 10 quotes
Albert Einstein: “The world as we have created it is a process...
  tags: change, deep-thoughts, thinking, world
J.K. Rowling: “It is our choices, Harry, that show what we ...
  tags: abilities, choices
Albert Einstein: “There are only two ways to live your life. O...
  tags: inspirational, life, live, miracle, miracles
```

Everything from chapter 40 still applies: a `timeout`, `raise_for_status()`, and a `User-Agent` header that says who's visiting and how to reach you. (Use your own name and email address in yours.)

### Following links: `urljoin`

Links on a page are often **relative**: they leave out the start of the address, like `/author/Albert-Einstein` or `page-3.html`. Your browser fills in the rest from the page you're on, but requests can't. `urljoin` from the standard library's `urllib.parse` does the same job as the browser:

```python
from urllib.parse import urljoin

page = "https://quotes.toscrape.com/page/2/"
print(urljoin(page, "/author/Albert-Einstein"))
print(urljoin(page, "/page/3/"))

page = "https://books.toscrape.com/catalogue/page-2.html"
print(urljoin(page, "page-3.html"))
print(urljoin(page, "../index.html"))
print(urljoin(page, "https://www.python.org/"))
```

You'll see:

```
https://quotes.toscrape.com/author/Albert-Einstein
https://quotes.toscrape.com/page/3/
https://books.toscrape.com/catalogue/page-3.html
https://books.toscrape.com/index.html
https://www.python.org/
```

A link starting with `/` starts from the top of the site. A link without one is next to the current page (`../` means "one folder up"). A full address is left as it is. You don't have to remember these rules: give `urljoin` the page you're on and the link, and it gets it right.

### Many pages: following "Next"

Quotes to Scrape spreads its 100 quotes over 10 pages. At the bottom of each page there's a "Next" button, which in the HTML is `<li class="next"><a href="/page/2/">Next</a></li>`. The last page has no such link. So the plan is: scrape a page, find its "Next" link, go there, and stop when there isn't one. Here's the whole program, which also saves the quotes to a CSV file ([chapter 21](../21-json-and-csv/notes.md)). Save it as `all_quotes.py`:

```python
"""Collect every quote from quotes.toscrape.com and save them in a CSV file."""

import csv
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag

START_URL = "https://quotes.toscrape.com/"
HEADERS = {"User-Agent": "SandipLearningBot/1.0 (learning Python; sandip@example.com)"}
DELAY = 1  # seconds to wait between pages
MAX_PAGES = 20  # a safety limit, in case the "Next" links never stop

Quote = dict[str, str]


def text_of(parent: Tag, selector: str) -> str:
    """Return the text of the first match for selector inside parent, or "" if none."""
    found = parent.select_one(selector)
    if found is None:
        return ""
    return found.get_text(strip=True)


def parse_quotes(soup: BeautifulSoup) -> list[Quote]:
    """Pull every quote out of one page."""
    quotes: list[Quote] = []
    for block in soup.select("div.quote"):
        tags = [tag.get_text() for tag in block.select("a.tag")]
        quotes.append(
            {
                "text": text_of(block, "span.text"),
                "author": text_of(block, "small.author"),
                "tags": ", ".join(tags),
            }
        )
    return quotes


def next_page_url(soup: BeautifulSoup, current_url: str) -> str | None:
    """Return the full URL of the "Next" page, or None on the last page."""
    link = soup.select_one("li.next a")
    if link is None:
        return None
    return urljoin(current_url, str(link["href"]))


def scrape_all(start_url: str) -> list[Quote]:
    """Follow the "Next" links from start_url, collecting quotes on the way."""
    all_quotes: list[Quote] = []
    url: str | None = start_url
    page = 1
    with requests.Session() as session:
        session.headers.update(HEADERS)
        while url is not None and page <= MAX_PAGES:
            response = session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            quotes = parse_quotes(soup)
            print(f"Page {page}: {len(quotes)} quotes")
            all_quotes.extend(quotes)
            url = next_page_url(soup, url)
            page += 1
            if url is not None:
                time.sleep(DELAY)  # be polite: one page per second at most
    return all_quotes


def save_csv(quotes: list[Quote], path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "author", "tags"])
        writer.writeheader()
        writer.writerows(quotes)


def main() -> None:
    quotes = scrape_all(START_URL)
    save_csv(quotes, Path("quotes.csv"))
    print(f"Saved {len(quotes)} quotes to quotes.csv")


if __name__ == "__main__":
    main()
```

It takes about 10 seconds (one second's pause per page), and you'll see:

```
Page 1: 10 quotes
Page 2: 10 quotes
Page 3: 10 quotes
Page 4: 10 quotes
Page 5: 10 quotes
Page 6: 10 quotes
Page 7: 10 quotes
Page 8: 10 quotes
Page 9: 10 quotes
Page 10: 10 quotes
Saved 100 quotes to quotes.csv
```

The start of `quotes.csv`:

```
text,author,tags
“The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking.”,Albert Einstein,"change, deep-thoughts, thinking, world"
"“It is our choices, Harry, that show what we truly are, far more than our abilities.”",J.K. Rowling,"abilities, choices"
```

A few things worth noticing:

- `MAX_PAGES` is a safety net. If a site's "Next" links went round in a circle, the loop would otherwise run forever, hammering the site.
- The `requests.Session` from chapter 40 keeps one connection open for all 10 pages, and sends the `User-Agent` with every request.
- Each function has one job: `parse_quotes` only knows about the HTML, `scrape_all` only knows about pages and links. When the site changes its layout, only `parse_quotes` needs fixing.

### Prices, star ratings, and the encoding trap

Now the bookshop. Open `https://books.toscrape.com` and inspect a book. Each one is an `article.product_pod`. Here's what you'll find inside it (shortened):

```html
<article class="product_pod">
  <p class="star-rating Three">...</p>
  <h3><a href="catalogue/a-light-in-the-attic_1000/index.html"
         title="A Light in the Attic">A Light in the ...</a></h3>
  <p class="price_color">£51.77</p>
</article>
```

Three puzzles here:

1. The visible title is cut short (`A Light in the ...`), but the full title is in the link's `title` attribute.
2. The star rating isn't text at all. It's the second **class**: `star-rating Three`. The page uses the class to draw three stars.
3. The price has a `£` sign, which leads to a classic trap.

Let's try the price first:

```python
import requests
from bs4 import BeautifulSoup

response = requests.get("https://books.toscrape.com/", timeout=10)
response.raise_for_status()

print(response.headers["Content-Type"])  # prints: text/html
print(response.encoding)  # prints: ISO-8859-1

soup = BeautifulSoup(response.text, "html.parser")
print(soup.select("p.price_color")[0].get_text())  # prints: Â£51.77
```

Where did that `Â` come from? A page arrives as bytes, and `response.text` has to turn those bytes into letters. To do that, it needs the page's **encoding**: the rulebook that says which bytes mean which letters. This site's `Content-Type` header says `text/html`, but doesn't say which encoding. When that happens, requests follows an old web rule and guesses `ISO-8859-1`. But the page is really in UTF-8. In UTF-8, `£` is two bytes, and read with the wrong rulebook, those two bytes become two letters: `Â£`.

There are two easy fixes:

- Tell requests the right encoding before you read `.text`: add `response.encoding = "utf-8"` just after `raise_for_status()`. Now the last line prints `£51.77`.
- Or give BeautifulSoup the raw bytes, `response.content`, instead of `response.text`. BeautifulSoup then looks for the encoding that the page declares in its own `<meta>` tag, and uses that.

(If you have no idea what a page's encoding is, `response.apparent_encoding` is requests' best guess from the bytes themselves.)

Now the whole first page, as `Book` dataclasses ([chapter 30](../30-dataclasses-and-enums/notes.md)), with the prices in whole pence:

```python
from dataclasses import dataclass
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag

URL = "https://books.toscrape.com/"
HEADERS = {"User-Agent": "SandipLearningBot/1.0 (learning Python; sandip@example.com)"}
RATINGS = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}


@dataclass
class Book:
    title: str
    price_pence: int
    rating: int
    url: str


def parse_book(card: Tag, page_url: str) -> Book | None:
    """Turn one book's <article> into a Book, or None if something is missing."""
    link = card.select_one("h3 a")
    price = card.select_one("p.price_color")
    stars = card.select_one("p.star-rating")
    if link is None or price is None or stars is None:
        return None
    return Book(
        title=str(link["title"]),
        price_pence=round(float(price.get_text().replace("£", "")) * 100),
        rating=RATINGS.get(stars["class"][-1], 0),
        url=urljoin(page_url, str(link["href"])),
    )


response = requests.get(URL, headers=HEADERS, timeout=10)
response.raise_for_status()
response.encoding = "utf-8"
soup = BeautifulSoup(response.text, "html.parser")

books: list[Book] = []
for card in soup.select("article.product_pod"):
    book = parse_book(card, URL)
    if book is not None:
        books.append(book)

print(f"{len(books)} books on the first page")
print(books[0])

five_stars = [book for book in books if book.rating == 5]
for book in sorted(five_stars, key=lambda book: book.price_pence):
    print(f"£{book.price_pence / 100:.2f}  {book.title}")
```

You'll see:

```
20 books on the first page
Book(title='A Light in the Attic', price_pence=5177, rating=3, url='https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html')
£17.46  Set Me Free
£35.02  Rip it Up and Start Again
£52.29  Scott Pilgrim's Precious Little Life (Scott Pilgrim #1)
£54.23  Sapiens: A Brief History of Humankind
```

`stars["class"]` is the list `['star-rating', 'Three']`, so `[-1]` is the last class, `'Three'`, and the `RATINGS` dictionary turns the word into a number. `parse_book` returns `None` for a card that's missing a piece, so one broken book can't crash the whole run. And the five-star books are sorted cheapest first with `key=` from [chapter 34](../34-functional-tools/notes.md).

### Pages built by JavaScript

Some pages don't arrive finished. The server sends a nearly empty page plus some JavaScript, and the browser runs the JavaScript to build the content. requests doesn't run JavaScript, so it only ever sees the empty starting page.

Quotes to Scrape has a version like this at `/js/`. It looks exactly the same in your browser. But:

```python
import requests
from bs4 import BeautifulSoup

response = requests.get("https://quotes.toscrape.com/js/", timeout=10)
response.raise_for_status()
soup = BeautifulSoup(response.text, "html.parser")

print(len(soup.select("div.quote")))  # prints: 0
print("var data" in response.text)  # prints: True
```

No quotes at all! This is where **View page source** and **Inspect** disagree: Inspect shows the page after the JavaScript has built it, but View page source (and requests) shows what the server really sent. Here, the quotes are hidden inside a `<script>` tag, as JavaScript data (`var data = [...]`), waiting to be turned into HTML.

What can you do?

1. **Look for the data the page loads.** Many JavaScript pages fetch their content from an API, and you can call that API yourself. Open the dev tools, go to the **Network** tab, click the **Fetch/XHR** filter (just **XHR** in Firefox), and reload the page. Each line is a request the page made. Click one to see its address and its answer. For example, the infinite-scrolling version at `https://quotes.toscrape.com/scroll` loads its quotes from `https://quotes.toscrape.com/api/quotes?page=1`, which answers with JSON. That's chapter 40 again:

   ```python
   import requests

   API_URL = "https://quotes.toscrape.com/api/quotes"

   response = requests.get(API_URL, params={"page": 1}, timeout=10)
   response.raise_for_status()
   data = response.json()

   print(data["has_next"])  # prints: True
   first = data["quotes"][0]
   print(first["author"]["name"])  # prints: Albert Einstein
   print(first["tags"])  # prints: ['change', 'deep-thoughts', 'thinking', 'world']
   ```

   No HTML to pick apart, and `has_next` tells you when to stop, like the pagination loop in chapter 40. When you find an API like this, it's almost always the better choice. (Do check the site's terms first: an API that was made for the site's own pages isn't always meant for everyone.)

2. **Look in View page source.** Sometimes, as on `/js/`, the data is right there in a `<script>` tag. A regular expression ([chapter 35](../35-regular-expressions/notes.md)) and `json.loads` can sometimes dig it out.

3. **Drive a real browser.** Tools like **Playwright** and **Selenium** control a real browser from Python: it loads the page, runs the JavaScript, and then your code reads the finished page. They're powerful but slower and more work to set up, so they're outside this chapter. Reach for them only when the first two options fail.

### Keeping a scraper healthy

Websites change without warning. A redesign renames a class, and suddenly `soup.select("div.quote")` finds nothing. The worst part: no error. Your scraper happily saves an empty CSV file every night, and nobody notices for weeks.

So make your scraper tell you when something looks wrong. The `logging` module from [chapter 37](../37-debugging-and-logging/notes.md) is perfect for that:

```python
import logging

from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def count_quotes(html: str, url: str) -> int:
    """Count the quotes on a page, and warn if there are none."""
    soup = BeautifulSoup(html, "html.parser")
    quotes = soup.select("div.quote")
    if not quotes:
        logger.warning("No quotes found on %s. Has the page layout changed?", url)
    else:
        logger.info("Found %d quotes on %s", len(quotes), url)
    return len(quotes)


old_layout = '<div class="quote">Be yourself.</div><div class="quote">Keep going.</div>'
new_layout = '<article class="quote-card"><p>Be yourself.</p></article>'
count_quotes(old_layout, "https://quotes.example/page/1/")
count_quotes(new_layout, "https://quotes.example/page/2/")
```

You'll see:

```
INFO: Found 2 quotes on https://quotes.example/page/1/
WARNING: No quotes found on https://quotes.example/page/2/. Has the page layout changed?
```

A few more habits that keep scrapers healthy, and keep the sites you visit happy:

- **Check what you got.** Zero items, or lots of empty fields from `text_of`, usually means the layout changed.
- **Expect failures.** Wrap each page in `try`/`except requests.RequestException`, log the problem, and carry on with the next page, instead of losing everything.
- **Save pages while you develop.** You'll run your parsing code dozens of times while you get it right. Download each page once and keep a copy:

```python
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

CACHE_DIR = Path("cache")
HEADERS = {"User-Agent": "SandipLearningBot/1.0 (learning Python; sandip@example.com)"}


def fetch_cached(url: str) -> bytes:
    """Return a page. Download it only the first time, then reuse the saved copy."""
    CACHE_DIR.mkdir(exist_ok=True)
    path = CACHE_DIR / (re.sub(r"\W+", "_", url) + ".html")
    if path.exists():
        return path.read_bytes()
    print(f"(downloading {url})")
    time.sleep(1)  # a polite pause before every real download
    response = requests.get(url, headers=HEADERS, timeout=10)
    response.raise_for_status()
    path.write_bytes(response.content)
    return response.content


for _ in range(2):
    soup = BeautifulSoup(fetch_cached("https://books.toscrape.com/"), "html.parser")
    print(soup.select("p.price_color")[0].get_text())
```

You'll see:

```
(downloading https://books.toscrape.com/)
£51.77
£51.77
```

The page was downloaded once, and the second time came from the `cache` folder, as a file called `https_books_toscrape_com_.html`. The regular expression `\W+` turns every run of characters that aren't letters, digits or `_` into `_`, to make a safe file name. And because the cache keeps the raw bytes, BeautifulSoup works out the encoding itself, so the `£` comes out right. Delete the `cache` folder when you want fresh pages.

## Common mistakes

**1. Scraping too fast**

```python
for page in range(1, 51):
    url = f"https://books.toscrape.com/catalogue/page-{page}.html"
    response = requests.get(url, timeout=10)
```

There's no error, which is the problem. Fifty requests fire as fast as your connection allows. On a real site, that can slow things down for everyone, and many sites answer with `429 Too Many Requests` or block your address altogether. Add `time.sleep(1)` inside the loop (or follow the site's `Crawl-delay`), and use a session.

**2. Ignoring `robots.txt`**

Your program works, so why check? Because a site that asks robots to stay out of a section has a reason, and sites that notice robots ignoring the rules block them. Check before you start, with `RobotFileParser`, and skip the pages where `can_fetch` says `False`. Read the terms of use too.

**3. Calling `.get_text()` on `None`**

```python
print(soup.select_one("span.prise").get_text())
```

```
AttributeError: 'NoneType' object has no attribute 'get_text'
```

A typo in the selector (`prise` instead of `price`), or a page that doesn't have that element, makes `select_one` give back `None`. mypy spots the risk before you run anything: `Item "None" of "Tag | None" has no attribute "get_text"  [union-attr]`. Check for `None` first, or use a helper like `text_of`.

**4. Requesting a relative link**

```python
requests.get("catalogue/page-2.html", timeout=10)
```

```
requests.exceptions.MissingSchema: Invalid URL 'catalogue/page-2.html': No scheme supplied. Perhaps you meant https://catalogue/page-2.html?
```

Links taken from a page are often relative, and requests needs a full address. (Its guess, `https://catalogue/page-2.html`, would be wrong too.) Join every link to the address of the page it came from: `urljoin(page_url, href)`.

**5. Reading with the wrong encoding**

`Â£51.77` instead of `£51.77`, or `â€œ` instead of a curly quote, means the bytes were turned into letters with the wrong rulebook. Set `response.encoding = "utf-8"` before reading `response.text`, or give BeautifulSoup `response.content` and let it read the page's own `<meta charset>`.

**6. Writing `class=` instead of `class_=`**

```python
print(soup.find_all("span", class="price"))
```

```
SyntaxError: invalid syntax
```

`class` is a Python keyword, so it can't be an argument name. BeautifulSoup uses `class_` instead. Or use a CSS selector: `soup.select("span.price")`.

**7. Scraping when there's an API**

Scraping a weather website when Open-Meteo has a free API, or picking apart the quotes HTML when the page loads the same quotes from `/api/quotes`, is doing it the hard way. The API is faster, it gives you clean data, it doesn't break when the page is redesigned, and the site is happy for you to use it. Look for an API first: in the site's footer (often a "Developers" link), in a web search for the site's name plus "API", and in the dev tools' Network tab.

## Quick recap

- Web scraping pulls data out of web pages, for when there's no API. Use an API whenever there is one.
- Be polite: read the terms, check `robots.txt` with `urllib.robotparser`, wait between pages with `time.sleep()`, send a `User-Agent` that says who you are, and leave personal data alone. The law differs by country and site.
- Inspect the page in your browser to find the tags and classes you need. `BeautifulSoup(html, "html.parser")` makes a soup. `find`/`select_one` give the first match or `None`, and `find_all`/`select` give a list.
- `.get_text(strip=True)` gives clean text. Attributes work like a dictionary: `link["href"]`, `tag.get("id")`, and `tag["class"]` is a list.
- Turn relative links into full ones with `urljoin`. Follow "Next" links page by page, with a pause and a page limit.
- If you see `Â£`, fix the encoding (`response.encoding = "utf-8"`, or pass `response.content`). If the data is missing, the page may be built by JavaScript: look for its API in the Network tab.
- Sites change. Check for `None`, warn when nothing is found, and save pages while you develop.

---

**Next:** try the [exercises](exercises.md), then move on to [42 Databases](../42-databases/notes.md).
