# 39 Full-Text Search

## What is it?

**Full-text search** finds documents by the **words** in them, the way a search engine does: it understands that "organizing" and "organized" are the same word, ignores "the" and "a", lets users type "desk -lamp" to exclude things, and ranks the best matches first.

It's built into PostgreSQL. No extra server, no extension for the basics. The core is one operator, `@@`, that asks "does this text match this query?"

## Why does it matter?

Every app with a search box starts with `WHERE title ILIKE '%' || :term || '%'`, and it fails in four ways:

1. **Word forms.** Searching "organize" misses "organizing" and "Organised".
2. **Multiple words.** "desk lamp" with `ILIKE` means those two words *in that order, adjacent*. A document saying "lamp for your desk" is missed.
3. **No ranking.** Twenty results come back in whatever order. The best match might be last.
4. **No index.** `LIKE '%word%'` can't use a normal index (chapter 31), so it scans every row, every search.

Full-text search fixes all four. And for the fifth problem, typos, PostgreSQL has a second tool (`pg_trgm`) covered at the end.

## Real-world example

Finding a topic in a textbook:

| Approach | Database |
|---|---|
| Flip through every page looking for the exact letters "organizing" | `LIKE '%organizing%'` |
| Look up "organize" in the index at the back, which already groups "organizing", "organized", and "organization" under one heading, and lists the pages that matter most first | Full-text search with a GIN index |

The book's index was built once, when the book was printed. The database's index is built once, when the row is saved. Both make every lookup fast.

## How it works

Work in `sales`, with `\pset null '[NULL]'`. We'll make a small `articles` table for the shop's blog, and clean it up at the end.

### Two new types: `tsvector` and `tsquery`

A **`tsvector`** is a document broken into normalized words:

```sql
SELECT to_tsvector('english', 'The quick brown foxes are jumping over the lazy dogs');
```

```
 'brown':3 'dog':10 'fox':4 'jump':6 'lazi':9 'quick':2
```

Look at what happened: "foxes" became `fox`, "jumping" became `jump`, "lazy" became `lazi`, and "the", "are", "over" vanished. Each word is reduced to its **stem** (a root form, which is why `lazi` looks odd; it's internal, not shown to users), **stop words** (common words that carry no meaning) are dropped, and each stem records where it appeared. The `'english'` tells PostgreSQL which language's rules to use.

A **`tsquery`** is a search request in the same normalized form:

```sql
SELECT to_tsquery('english', 'jumping & fox');
```

```
 'jump' & 'fox'
```

And `@@` matches them:

```sql
SELECT to_tsvector('english', 'The quick brown foxes are jumping over the lazy dogs') @@ to_tsquery('english', 'fox');   -- t
SELECT to_tsvector('english', 'The quick brown foxes are jumping over the lazy dogs') @@ to_tsquery('english', 'cat');   -- f
```

"fox" matched "foxes" because both became `fox`. That's the whole trick.

### Some articles

```sql
CREATE TABLE articles (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  body text NOT NULL
);
INSERT INTO articles (title, body) VALUES
  ('Choosing the right notebook', 'Dotted, ruled or plain? We compare paper weights and binding styles so your notes look great.'),
  ('Five ways to organize your desk', 'A tidy desk starts with a good lamp, a pen holder and a weekly reset. Organizing is a habit.'),
  ('Why fountain pens are back', 'Fountain pens make writing slower and more deliberate. Here is how to pick your first one.'),
  ('Sticky notes for planning', 'Use sticky notes to plan a week on the wall. Move them, group them, throw them away.'),
  ('Backpacks that fit a laptop', 'Padded sleeves, water resistance and good straps: what to look for in a work backpack.'),
  ('Desk lamps and eye strain', 'Warm light in the evening, cool light in the day. A dimmable lamp protects your eyes.'),
  ('Our stapler is discontinued', 'The classic stapler has been retired. Here are the alternatives we now stock.'),
  ('Caring for your notebooks', 'Keep notebooks away from damp, and organise finished ones on a shelf by year.');
```

### Where `LIKE` gives up

```sql
SELECT title FROM articles WHERE body LIKE '%organize%';      -- 0 rows: the body says "Organizing"
SELECT title FROM articles WHERE body ILIKE '%organi%';       -- 2 rows, by luck of a shared prefix
```

Now with search:

```sql
SELECT title FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'organize');
```

```
 Five ways to organize your desk
```

"organize" found "organize" in the title and "Organizing" in the body, because all three stem to `organ`. (The British "organise" in the last article stems differently, to `organis`, and isn't found. Dictionaries are language-specific. Honest limitation; see the end.)

### Three ways to write the query

`to_tsquery` wants the raw syntax (`&` and, `|` or, `!` not, `:*` prefix) and errors on plain sentences. For user input, use one of these:

```sql
-- plainto_tsquery: all the words, ANDed together
SELECT title FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ plainto_tsquery('english', 'notebook paper');
-- Choosing the right notebook

-- websearch_to_tsquery: like a search engine box. Quotes for phrases, - to exclude, "or"
SELECT title FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ websearch_to_tsquery('english', 'desk lamp');
-- Five ways to organize your desk, Desk lamps and eye strain

SELECT title FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ websearch_to_tsquery('english', 'desk -lamp');
-- 0 rows: both desk articles mention lamps

SELECT title FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ websearch_to_tsquery('english', 'notebook or backpack');
-- 3 rows
```

**Use `websearch_to_tsquery` for anything a user types.** It never errors on strange input, and people already know its syntax from Google.

### Ranking

```sql
SELECT title, round(ts_rank(to_tsvector('english', title || ' ' || body), q)::numeric, 4) AS rank
FROM articles, websearch_to_tsquery('english', 'notebook') AS q
WHERE to_tsvector('english', title || ' ' || body) @@ q
ORDER BY rank DESC;
```

```
            title            |  rank
-----------------------------+--------
 Caring for your notebooks   | 0.0760
 Choosing the right notebook | 0.0608
```

`ts_rank` scores how well a document matches: more occurrences, closer together, score higher. (Putting the query in the `FROM` as `q` lets you write it once.) The absolute numbers mean nothing; only the order does. To weight titles higher than bodies, `setweight(to_tsvector(title), 'A') || setweight(to_tsvector(body), 'B')`.

### Showing why it matched

```sql
SELECT title, ts_headline('english', body, websearch_to_tsquery('english', 'lamp'), 'MaxWords=12, MinWords=6') AS snippet
FROM articles WHERE to_tsvector('english', body) @@ websearch_to_tsquery('english', 'lamp');
```

```
              title              |                           snippet
---------------------------------+--------------------------------------------------------------
 Five ways to organize your desk | <b>lamp</b>, a pen holder and a weekly
 Desk lamps and eye strain       | light in the day. A dimmable <b>lamp</b> protects your eyes.
```

`ts_headline` cuts out the relevant fragment and wraps the matches in `<b>` tags (configurable). That's the snippet under each result on a search page.

### Making it fast: a stored vector and a GIN index

Everything above recomputes `to_tsvector(...)` for every row on every search. On 8 rows, fine. On 80,000, slow. The production pattern is to **store the vector** in a column that PostgreSQL maintains, and **index it**:

```sql
ALTER TABLE articles ADD COLUMN search tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))) STORED;

CREATE INDEX idx_articles_search ON articles USING gin (search);

SELECT title FROM articles WHERE search @@ websearch_to_tsquery('english', 'organizing desks');
```

A **generated column** (`GENERATED ALWAYS AS (...) STORED`) is computed from other columns whenever the row changes. You never write to it; it's always right. The **GIN index** on it makes `@@` a lookup instead of a scan. Searches now take milliseconds no matter how many articles you have.

The `coalesce` guards against NULLs: `'text' || NULL` is NULL (chapter 07), which would blank out the whole vector.

### Prefix search

For "search as you type":

```sql
SELECT title FROM articles WHERE search @@ to_tsquery('english', 'note:*');
```

Three rows: anything with a word starting "note". Combine with `websearch_to_tsquery` by appending `:*` to the user's last word in your code.

### Language and spelling, honestly

`'english'` is a **text search configuration**: stemming rules and stop words for one language. PostgreSQL ships with about two dozen (`SELECT cfgname FROM pg_ts_config;`). There's also `'simple'`, which does no stemming and drops no words, for codes, names, and languages without a built-in dictionary:

```sql
SELECT to_tsvector('simple', 'The quick brown foxes are jumping');
```

```
 'are':5 'brown':3 'foxes':4 'jumping':6 'quick':2 'the':1
```

Two things full-text search does **not** do: fix typos ("notebok" matches nothing), or unify spellings across variants ("organise" vs "organize"). For those, the next section.

### Fuzzy matching: `pg_trgm`

An **extension** adds features to PostgreSQL. `pg_trgm` ("trigrams") compares strings by their three-letter chunks, which makes it tolerant of typos:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

SELECT similarity('notebook', 'notebok') AS close, similarity('notebook', 'backpack') AS far;   -- 0.7, 0
SELECT name FROM products WHERE name % 'notebok';                                              -- Notebook
SELECT name, round(similarity(name, 'staplr')::numeric, 2) AS sim FROM products ORDER BY sim DESC LIMIT 3;
```

```
     name      | sim
---------------+------
 Stapler       | 0.50
 Sticky notes  | 0.11
 Laptop sleeve | 0.05
```

`similarity()` is 0 to 1; `%` means "similar enough" (default threshold 0.3). "Did you mean *Stapler*?" is `ORDER BY similarity(name, :term) DESC LIMIT 1`.

`pg_trgm` also gives you the thing chapter 31 said was impossible: an index for `ILIKE '%word%'`:

```sql
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
```

On a big table, `WHERE name ILIKE '%note%'` now uses `idx_products_name_trgm` instead of scanning. (On our 11 products the planner still picks a Seq Scan, correctly.) For short fields like product names, where users expect substring matching and typo tolerance more than stemming, trigrams are often the better tool.

### Which tool?

| You're searching | Use |
|---|---|
| Articles, descriptions, comments: real sentences | Full-text search: `tsvector` column + GIN + `websearch_to_tsquery` |
| Names, titles, codes: short fields, typos likely | `pg_trgm`: `%`, `similarity()`, trigram GIN for `ILIKE` |
| Both (a product search box) | Full-text first, trigram as the "did you mean" fallback |
| Many languages at once, faceted filters, millions of documents with complex relevance tuning | A dedicated search engine (Elasticsearch, Meilisearch, Typesense), fed from PostgreSQL |

For most apps, PostgreSQL alone is plenty, and it saves running and syncing a second system.

Clean up:

```sql
DROP INDEX IF EXISTS idx_products_name_trgm;
DROP TABLE articles;
```

## Common mistakes

**1. `LIKE` for search**

Misses word forms, can't rank, can't index. Use `@@`.

**2. `to_tsquery` on user input**

`to_tsquery('english', 'desk lamp')` is a syntax error (no operator between words). `websearch_to_tsquery` handles anything.

**3. Recomputing `to_tsvector` per row**

Works, then slows to a crawl. Store it in a generated column and index it.

**4. Mismatched configurations**

An index built with `'english'` and a query written with `'simple'` (or no config at all, which uses a server default) may not use the index and may not match. Say `'english'` in both.

**5. Expecting typo tolerance from full-text search**

It's about word forms, not spelling mistakes. `pg_trgm` for typos.

**6. Forgetting `coalesce` in the generated column**

One NULL `body` and that article's whole search vector is NULL, so it never matches anything.

## Quick recap

- `to_tsvector('english', text)` normalizes a document into stems; `websearch_to_tsquery('english', input)` normalizes a user's search; `@@` matches them.
- Stemming means "organize" finds "organizing". Stop words are dropped. Multiple words match in any order.
- `ts_rank` orders results by relevance; `ts_headline` makes snippets.
- Production pattern: a `GENERATED ALWAYS AS (to_tsvector(...)) STORED` column with a **GIN index**.
- `pg_trgm` adds typo tolerance (`similarity`, `%`) and makes `ILIKE '%x%'` indexable.
- Sentences: full-text. Short names with typos: trigrams. Enormous multilingual catalogues: a dedicated engine.

---

**Next:** try the [exercises](exercises.md), then move on to [40 Connecting from Node.js](../40-connecting-from-nodejs/notes.md).
