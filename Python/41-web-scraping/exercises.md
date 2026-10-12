# 41 Web Scraping: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on), and run it with `python ex1.py` from a terminal opened in this folder.
- Set up once before you start: make and activate a virtual environment in this folder, and install what you need into it: `python -m pip install requests beautifulsoup4 mypy` (see the notes).
- Exercises 1 and 2 work on HTML you save yourself, so they don't need the internet. Exercises 3 to 5 visit the two practice sites from the notes, whose content doesn't change, so your output should match exactly.
- Be polite, even on practice sites: pass `timeout=` to every request, send a `User-Agent` with your own name, and wait at least one second between pages. While you're working on the parsing part of an exercise, save the page once and work on the saved copy (like `fetch_cached` in the notes), instead of downloading it on every run.
- Put hints on every function, and finish each exercise with `python -m mypy ex1.py` saying `Success`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The gym timetable

Zoe's gym puts its class timetable on a web page, and she wants to see at a glance which classes still have spaces. Save this page as `gym.html` in this folder:

```html
<html>
  <head>
    <title>FitLife Gym</title>
  </head>
  <body>
    <h1>FitLife Gym: Monday classes</h1>
    <table id="timetable">
      <tr><th>Time</th><th>Class</th><th>Coach</th><th>Spaces</th></tr>
      <tr class="session">
        <td class="time">07:00</td><td class="name">Spin</td>
        <td class="coach">Leo</td><td class="spaces">4</td>
      </tr>
      <tr class="session full">
        <td class="time">09:30</td><td class="name">Yoga</td>
        <td class="coach">Priya</td><td class="spaces">0</td>
      </tr>
      <tr class="session">
        <td class="time">12:15</td><td class="name">HIIT</td>
        <td class="coach">Sam</td><td class="spaces">7</td>
      </tr>
      <tr class="session">
        <td class="time">18:00</td><td class="name">Pilates</td>
        <td class="coach">Aisha</td><td class="spaces">2</td>
      </tr>
      <tr class="session full">
        <td class="time">19:30</td><td class="name">Boxing</td>
        <td class="coach">Tom</td><td class="spaces">0</td>
      </tr>
    </table>
  </body>
</html>
```

Open it in your browser and use **Inspect** to look at a row. Then write `ex1.py`, which reads `gym.html` with BeautifulSoup and prints:

- the page's heading,
- one line per class: the time, the class name padded to 9 characters, `with` and the coach padded to 7, then either the number of spaces or `FULL` (a full class has the extra class `full` on its row),
- how many classes have spaces, and how many spaces there are in total,
- the names of the full classes.

Expected output:

```
FitLife Gym: Monday classes
07:00  Spin      with Leo    4 spaces
09:30  Yoga      with Priya  FULL
12:15  HIIT      with Sam    7 spaces
18:00  Pilates   with Aisha  2 spaces
19:30  Boxing    with Tom    FULL
3 classes have spaces, 13 spaces in total
Full: Yoga, Boxing
```

<details>
<summary>Hint 1</summary>

The header row has no `session` class, so `soup.select("tr.session")` gives you just the five class rows. Inside each row, `row.select_one("td.name")` finds the name cell.

</details>

<details>
<summary>Hint 2</summary>

The `text_of` helper from the notes saves you a `None` check for every cell. The spaces arrive as text, so turn them into a number with `int()` before you add them up.

</details>

<details>
<summary>Hint 3</summary>

`row["class"]` is a list, like `['session', 'full']`, so `"full" in row["class"]` tells you whether the class is full.

</details>

---

## Exercise 2 (Easy): Allowed or not?

Sandip wants to write a scraper for his city library's "New books" page, at `https://citylibrary.example/books/new/`. (It's an imaginary site, so this exercise works offline.) Before he visits anything, he checks the library's `robots.txt` and works out where each link on the page goes. Start `ex2.py` with the robots file and the links from the page:

```python
ROBOTS_TXT = """
User-agent: *
Disallow: /account/
Disallow: /search
Crawl-delay: 2

User-agent: GreedyBot
Disallow: /
"""

PAGE_HTML = """
<nav>
  <a href="/">Home</a>
  <a href="../popular/">Popular books</a>
  <a href="dune.html">Dune</a>
  <a href="/search?q=python">Search for Python</a>
  <a href="/account/loans">My loans</a>
  <a href="https://events.citylibrary.example/kids">Kids' events</a>
</nav>
"""
```

Using a robot name of `SandipBot`, print the crawl delay, then one line per link: its text padded to 19 characters, its **full** URL padded to 49, and one of three words:

- `allowed` if the URL is on `https://citylibrary.example/` and `robots.txt` allows it,
- `blocked` if it's on that site but `robots.txt` says no,
- `other site` if it's on a different site. That library's `robots.txt` says nothing about other sites, which would each need their own.

Finally, check whether a robot called `GreedyBot` may visit the home page. Expected output:

```
Crawl delay for SandipBot: 2 seconds
Home               https://citylibrary.example/                     allowed
Popular books      https://citylibrary.example/books/popular/       allowed
Dune               https://citylibrary.example/books/new/dune.html  allowed
Search for Python  https://citylibrary.example/search?q=python      blocked
My loans           https://citylibrary.example/account/loans        blocked
Kids' events       https://events.citylibrary.example/kids          other site
GreedyBot may visit the home page: False
```

<details>
<summary>Hint 1</summary>

`RobotFileParser()` with no address, then `.parse(ROBOTS_TXT.splitlines())`, reads rules from a string. After that, `can_fetch(name, url)` and `crawl_delay(name)` work as usual.

</details>

<details>
<summary>Hint 2</summary>

Every `href` must be joined to the page it came from: `urljoin(PAGE_URL, str(link["href"]))`. Work out by hand where `../popular/` should end up, then check that `urljoin` agrees.

</details>

<details>
<summary>Hint 3</summary>

Put the three-way decision in a small function that takes the parser and a full URL, and returns the word. `url.startswith("https://citylibrary.example/")` tells you whether a link stays on the library's site. Check that before you ask `can_fetch`.

</details>

---

## Exercise 3 (Medium): Bargain hunting

Maya loves a cheap book. Write `ex3.py`, which reads the first page of `https://books.toscrape.com/` and reports:

- how many books are on the page, and their average price (rounded to the nearest penny),
- every book under £20, cheapest first, with its star rating drawn as `*` characters (padded to 5) and its **full** title,
- how many books have each rating, from five stars down to one.

Expected output:

```
20 books, average price £38.05
Bargains under £20:
  £13.99  **     Starving Hearts (Triangular Trade Trilogy, #1)
  £17.46  *****  Set Me Free
  £17.93  ***    The Coming Woman: A Novel Based on the Life of the Infamous Feminist, Victoria Woodhull
Books per rating:
  *****  4
  ****   4
  ***    3
  **     3
  *      6
```

Rules: keep every price in whole pence (an `int`), and turn each book into a `Book` dataclass with `title`, `price_pence` and `rating` as soon as you've found it.

If your first try shows `Â£` in the prices, or crashes with a `ValueError` like `could not convert string to float: 'Â£51.77'`, you've met the encoding trap from the notes.

<details>
<summary>Hint 1</summary>

Start from `parse_book` in the notes. The full title is in the link's `title` attribute, not in its text, and the rating word is the last item in the `p.star-rating` element's class list.

</details>

<details>
<summary>Hint 2</summary>

Either set `response.encoding = "utf-8"` before using `response.text`, or give BeautifulSoup `response.content`. To strip the pound sign, `.removeprefix("£")` (or `.replace("£", "")`) works once the encoding is right.

</details>

<details>
<summary>Hint 3</summary>

`Counter` from chapter 19 counts the ratings in one line, and `counts[3]` gives `0` for a rating nobody has, instead of a `KeyError`. A loop over `range(5, 0, -1)` goes from five stars down to one.

</details>

---

## Exercise 4 (Medium): Quotes about one thing

Leo is making a poster about love, and wants every quote on Quotes to Scrape with the tag `love`. Each tag has its own pages, starting at `https://quotes.toscrape.com/tag/love/`, with the same "Next" links as the main pages.

Write `ex4.py`, a command-line tool that takes the tag as a positional argument, follows the "Next" links with a one-second pause between pages (and a safety limit of 10 pages), and then prints a summary. Expected output for `python ex4.py love`:

```
Page 1: 10 quotes
Page 2: 4 quotes
14 quotes tagged 'love'
Authors with more than one:
  Marilyn Monroe: 3
  Jane Austen: 2
Shortest: “To die will be an awfully big adventure.” (J.M. Barrie)
```

For `python ex4.py humor`:

```
Page 1: 10 quotes
Page 2: 2 quotes
12 quotes tagged 'humor'
Authors with more than one:
  Jane Austen: 2
Shortest: “A day without sunshine is like, you know, night.” (Steve Martin)
```

And for a tag nobody uses, `python ex4.py zebra`. (The site still answers `200 OK`, with a page that says "No quotes found!".)

```
Page 1: 0 quotes
No quotes tagged 'zebra'.
```

<details>
<summary>Hint 1</summary>

Build the first address with `urljoin("https://quotes.toscrape.com/", f"/tag/{tag}/")`. After that, the loop is the same as `scrape_all` in the notes: fetch, parse, find `li.next a`, join its `href` to the current page, and stop when there isn't one.

</details>

<details>
<summary>Hint 2</summary>

Keep each quote as a `(text, author)` tuple. Then `Counter(author for _, author in quotes)` counts the authors, and `most_common()` gives them biggest first.

</details>

<details>
<summary>Hint 3</summary>

"Shortest" means the quote whose text has the fewest characters: `min(quotes, key=...)` with a `key` that gives the length of the text ([chapter 34](../34-functional-tools/notes.md)).

</details>

---

## Exercise 5 (Challenge): A category report

Priya runs a book club and picks a genre each month. Write `ex5.py`, a polite scraper that reports on one category of Books to Scrape. It brings together this chapter and several earlier ones:

1. **Ask first.** Read `https://books.toscrape.com/robots.txt` with `RobotFileParser`, and stop with an error if your robot isn't allowed on the home page.
2. **Find the category.** The category is a positional argument (`python ex5.py Mystery`, or `python ex5.py "Historical Fiction"`), matched without caring about capital letters. The home page lists every category in its sidebar, inside `div.side_categories`: inspect it to find the links. An unknown category prints `Error: there's no category called 'cookery'` to standard error, and exits with code `1`.
3. **Collect every book**, following the category's "next" links, with a one-second pause before every page and a safety limit of 20 pages. Each book becomes a `Book` dataclass with `title`, `price_pence`, `rating` and a full `url`.
4. **Report.** Sort the books by rating, highest first, and by price, cheapest first, when ratings are equal. Print how many pages were read, the number of books, the average price, and the top five.
5. **Save.** With `--csv FILE`, also save every book (in the sorted order) to a CSV file with the columns `title,price_pence,rating,url`.
6. **Keep a log.** Log every page you fetch to a file called `scraper.log` with `logging` ([chapter 37](../37-debugging-and-logging/notes.md)), at INFO level, and log a warning for any book card that can't be read. If a request fails, log it with `logger.exception(...)`, print `Error:` and the problem to standard error, and exit with code `1`.

Expected output for `python ex5.py Mystery --csv mystery.csv`:

```
Read 2 page(s)
32 books in Mystery, average price £31.72
Best rated, cheapest first:
  *****  £12.29  The Girl You Lost
  *****  £23.05  The Silkworm (Cormoran Strike #2)
  *****  £25.37  What Happened on Beale Street (Secrets of the South Mysteries #2)
  *****  £48.35  A Time of Torment (Charlie Parker #14)
  *****  £52.30  The Bachelor Girl's Guide to Murder (Herringford and Watts Mysteries #1)
Saved 32 books to mystery.csv
```

The start of `mystery.csv`:

```
title,price_pence,rating,url
The Girl You Lost,1229,5,https://books.toscrape.com/catalogue/the-girl-you-lost_66/index.html
The Silkworm (Cormoran Strike #2),2305,5,https://books.toscrape.com/catalogue/the-silkworm-cormoran-strike-2_280/index.html
```

And `scraper.log` has one line per page (your dates and times will be different):

```
2026-10-12 11:34:35,792 INFO Fetching https://books.toscrape.com/
2026-10-12 11:34:38,250 INFO Fetching https://books.toscrape.com/catalogue/category/books/mystery_3/index.html
2026-10-12 11:34:40,021 INFO Fetching https://books.toscrape.com/catalogue/category/books/mystery_3/page-2.html
```

Answer in a comment: the category links on the home page start `catalogue/category/...`, but the "next" link on a category page is just `page-2.html`. Why does `urljoin` still get both right?

<details>
<summary>Hint 1</summary>

Plan the functions before you write them: one that fetches a URL and returns a soup, one that finds the category's URL in the home page's soup (or `None`), one that turns a book card into a `Book` (or `None`), one that follows the pages of a category, and one that saves the CSV. `main()` handles the arguments, the logging setup and the errors.

</details>

<details>
<summary>Hint 2</summary>

The category links are `div.side_categories ul li ul li a`. Compare `link.get_text(strip=True).lower()` with the name the user typed, also in lower case. The text has lots of spaces and line breaks around it, which is why `strip=True` matters.

</details>

<details>
<summary>Hint 3</summary>

For the sort, use a tuple key with the rating made negative: `key=lambda book: (-book.rating, book.price_pence)`. For the log file, call `logging.basicConfig(filename="scraper.log", encoding="utf-8", level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")` once, at the start of `main()`.

</details>

---

## Before you move on

You can now get data from almost anywhere on the web: from APIs when a site offers one, and from the pages themselves when it doesn't, politely and in a way that tells you when something breaks.

So far, everything you've collected ends up in a CSV or JSON file. That's fine for a hundred quotes, but what about every price, every day, for a year? In [chapter 42](../42-databases/notes.md), you'll save data in a real database with SQLite, where searching, updating and adding to it stay quick, however big it gets.
