# 39 Full-Text Search: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch39/ex1.sql`, `ex2.sql`, and so on. Build the `articles` table from the notes at the top of files that need it, and drop it at the end.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Stems and stop words

1. Run `to_tsvector('english', ...)` on three sentences of your own. For each, write down which words disappeared and which changed form.
2. Show that `'running'`, `'runs'` and `'ran'` do or don't end up as the same stem. (One of them won't. Why might that be?)
3. Convert these user searches with `websearch_to_tsquery('english', ...)` and look at the result: `desk lamp`, `"sticky notes"`, `pen -fountain`, `notebook or backpack`.

---

## Exercise 2 (Easy): Searching the blog

With the `articles` table:

1. Articles about notebooks (any form of the word).
2. Articles mentioning desks but **not** lamps. Then articles mentioning desks **or** lamps.
3. Articles matching `pen`. Does "pens" match? Does "pencil"? Explain.

---

## Exercise 3 (Medium): A results page

Write **one** query that takes a search term (use a psql variable: `\set term 'organizing your notebooks'`) and returns, best match first, at most 5 rows of: title, a rank rounded to 3 places, and a snippet from the body with matches in `<b>` tags.

Then add the stored `search` column and GIN index from the notes, and rewrite the query to use the column. `EXPLAIN` it. On 8 rows the index won't be used; in a comment, explain what would be different with 80,000 articles.

<details>
<summary>Hint</summary>

`FROM articles, websearch_to_tsquery('english', :'term') AS q WHERE search @@ q ORDER BY ts_rank(search, q) DESC LIMIT 5`.

</details>

---

## Exercise 4 (Medium): Product search with typos

1. Add a generated `search tsvector` column to `products` built from `name` (and index it). Search for `note`, `notes`, and `notebooks`. Which match?
2. Enable `pg_trgm`. For the misspellings `notebok`, `staplr`, `bakpack`, and `wireles mouse`, show the closest product name and its similarity score.
3. Write "did you mean": a query that, for a term that matches nothing with full-text search, returns the single most similar product name if its similarity is above 0.3, else nothing.
4. Drop the column and index when done.

---

## Exercise 5 (Challenge): One search function

Using chapter 38, write `search_products(p_term text)` returning `(id, name, price, match_kind text, score numeric)` that:

1. Returns full-text matches on `name` first (`match_kind = 'word'`, score = `ts_rank`),
2. and, if there are **no** full-text matches, returns trigram matches with similarity above 0.3 instead (`match_kind = 'fuzzy'`, score = `similarity`),
3. ordered by score descending, at most 10 rows.

Test with `'pen'`, `'notebok'`, and `'xyz'`. The last should return nothing.

<details>
<summary>Hint</summary>

PL/pgSQL with `RETURN QUERY SELECT ...;` for the full-text part, then `IF NOT FOUND THEN RETURN QUERY SELECT ... (trigram) ...; END IF;`. `FOUND` is true if the previous query returned rows.

</details>
