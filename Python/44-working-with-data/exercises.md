# 44 Working with Data: Exercises

**How to do these:**

- Work in your folder from the notes, with its virtual environment active, so pandas is installed. Exercise 4 also needs `openpyxl`, and checking hints with mypy needs `mypy` and `pandas-stubs` (see the notes).
- Make a new file for each exercise (`ex1.py`, `ex2.py`, and so on), and run it with `python ex1.py`. Exercise 5 is called `report.py`.
- Each exercise gives you a small CSV file. Copy it into a new file with the name shown, in the same folder as your script.
- Let pandas do the work: no `for` loops over rows, unless the exercise says so.
- Put type hints on every function you write.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A first look at the cinema

A small cinema exported a weekend of showings. Save this as `cinema.csv`:

```
date,film,screen,showtime,tickets,price_cents
2026-10-09,Space Llamas,1,18:00,112,1250
2026-10-09,Midnight Bakery,2,14:00,64,900
2026-10-09,Robot Picnic,3,16:30,48,900
2026-10-09,Space Llamas,1,21:00,135,1250
2026-10-10,Midnight Bakery,2,11:00,88,900
2026-10-10,Robot Picnic,3,13:30,71,900
2026-10-10,Space Llamas,1,18:00,150,1250
2026-10-10,The Last Lighthouse,2,16:00,95,1000
2026-10-11,The Last Lighthouse,2,11:00,102,1000
2026-10-11,Midnight Bakery,3,14:00,57,900
2026-10-11,Space Llamas,1,20:00,98,1250
2026-10-11,Robot Picnic,3,17:00,40,900
```

Write `ex1.py` that loads it and prints, in this order: the shape, the column names as a plain list, the dtypes, the first 3 rows, the total tickets sold, the average tickets per showing (to one decimal place), the biggest audience, and how many showings each film had.

Expected output:

```
(12, 6)
['date', 'film', 'screen', 'showtime', 'tickets', 'price_cents']
date             str
film             str
screen         int64
showtime         str
tickets        int64
price_cents    int64
dtype: object
         date             film  screen showtime  tickets  price_cents
0  2026-10-09     Space Llamas       1    18:00      112         1250
1  2026-10-09  Midnight Bakery       2    14:00       64          900
2  2026-10-09     Robot Picnic       3    16:30       48          900
Tickets sold: 1060
Average per showing: 88.3
Biggest audience: 150
film
Space Llamas           4
Midnight Bakery        3
Robot Picnic           3
The Last Lighthouse    2
Name: count, dtype: int64
```

Then answer in a comment: two columns came in as `str` even though they aren't really plain text. Which ones, and what are they really?

<details>
<summary>Hint 1</summary>

`list(...)` turns the `columns` into a plain Python list. For the numbers, pick the `tickets` column and use `sum()`, `mean()` and `max()` on it. An f-string with `:.1f` gives one decimal place ([chapter 06](../06-strings/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

"How many showings each film had" means counting how often each film name appears in the `film` column. Which method from the notes counts values?

</details>

---

## Exercise 2 (Easy): Picking showings

Using the same `cinema.csv`, write `ex2.py` that prints:

1. Every showing of "Space Llamas", with only the `date`, `showtime` and `tickets` columns.
2. How many showings sold more than 100 tickets.
3. The "quiet" showings: not on screen 1, **and** fewer than 60 tickets. Show `date`, `film`, `screen` and `tickets`.
4. How many showings are matinees, meaning they start before 15:00.
5. A new column `takings_cents` (tickets times price), then the top 3 showings by takings, with `date`, `film` and `takings_cents`.

Expected output:

```
          date showtime  tickets
0   2026-10-09    18:00      112
3   2026-10-09    21:00      135
6   2026-10-10    18:00      150
10  2026-10-11    20:00       98
Over 100 tickets: 4 showings
          date             film  screen  tickets
2   2026-10-09     Robot Picnic       3       48
9   2026-10-11  Midnight Bakery       3       57
11  2026-10-11     Robot Picnic       3       40
Matinees: 5
         date          film  takings_cents
6  2026-10-10  Space Llamas         187500
3  2026-10-09  Space Llamas         168750
0  2026-10-09  Space Llamas         140000
```

<details>
<summary>Hint 1</summary>

Each one is a mask in square brackets: `shows[shows["film"] == "Space Llamas"]`. Then pick columns from the result with a list in double brackets. `!=` means "is not equal to", just like in plain Python.

</details>

<details>
<summary>Hint 2</summary>

For two conditions, use `&` and put each condition in its own brackets. For "how many", `len()` of the filtered DataFrame works.

</details>

<details>
<summary>Hint 3</summary>

`showtime` is text like `"14:00"`, not a real time. But because every time has two digits for the hour, text comparison puts them in the right order: `"11:00" < "15:00"` is `True`, just like the ISO dates in chapter 42.

</details>

---

## Exercise 3 (Medium): Where does my money go?

Sandip wants to understand his spending. Save this as `expenses.csv` (amounts in cents):

```
date,category,description,amount_cents
2026-09-02,food,Groceries,4250
2026-09-05,transport,Bus pass,3000
2026-09-09,fun,Cinema ticket,1250
2026-09-14,food,Lunch with Maya,1875
2026-09-20,bills,Phone bill,2500
2026-09-27,food,Groceries,3890
2026-10-01,transport,Bus pass,3000
2026-10-03,food,Groceries,4610
2026-10-06,fun,Concert,4500
2026-10-08,bills,Phone bill,2500
2026-10-10,food,Pizza night,2240
2026-10-11,fun,Board game,2999
```

Write `ex3.py` that prints:

1. The total for each category, biggest first.
2. The total for each month (use real dates).
3. The single biggest expense, with its `date`, `description` and `amount_cents`.
4. A summary table, one row per category, biggest total first, with four columns: `count` (how many expenses), `total`, `average` (rounded to whole cents, as an `int`) and `share` (the category's percentage of all spending, rounded to one decimal place).

Then save the summary to `summary.csv`, with the category as a normal column and no index numbers.

Expected output:

```
category
food         16865
fun           8749
transport     6000
bills         5000
Name: amount_cents, dtype: int64
month
9     16765
10    19849
Name: amount_cents, dtype: int64
        date description  amount_cents
7 2026-10-03   Groceries          4610
           count  total  average  share
category
food           5  16865     3373   46.1
fun            3   8749     2916   23.9
transport      2   6000     3000   16.4
bills          2   5000     2500   13.7
```

And `summary.csv` contains:

```
category,count,total,average,share
food,5,16865,3373,46.1
fun,3,8749,2916,23.9
transport,2,6000,3000,16.4
bills,2,5000,2500,13.7
```

Finally, answer in a comment: the shares add up to 100.1, not 100. Is that a bug?

<details>
<summary>Hint 1</summary>

Load with `parse_dates=["date"]`, then make a `month` column with `.dt.month` and group by it. For the biggest expense, sort by amount (biggest first) and keep the first row with `head(1)`.

</details>

<details>
<summary>Hint 2</summary>

The summary is `groupby("category").agg(...)` with three named results, like the cafe summary in the notes. Then add `share` as a new column: each `total` divided by the sum of the whole `total` column, times 100. Columns do maths row by row, so no loop is needed.

</details>

<details>
<summary>Hint 3</summary>

A Series has `.round(1)` for one decimal place, and `.round()` then `.astype(int)` gives whole numbers. To save the category as a normal column, `reset_index()` first, then `to_csv(..., index=False)`.

</details>

---

## Exercise 4 (Medium): Clean up a messy gym export

A gym's old system exported its members, and the file is a mess. Save this as `members.csv`, exactly as it is, spaces included:

```
,name, plan, monthly_fee, joined
0,Sandip, gold, $45.00, 2026-01-15
1,Maya, silver, $30.00, 2026-03-02
2,Leo, , $30.00, 2026-04-20
3,Zoe, gold, , 2026-05-11
4,Priya, bronze, $20.00, 2026-06-01
5,Sam, silver, $30.00, 2026-07-19
6,Aisha, gold, $45.00, 2026-08-30
```

First, just load it with a plain `pd.read_csv("members.csv")` and print the columns and dtypes. You'll see three problems from "Common mistakes" at once:

```
['Unnamed: 0', 'name', ' plan', ' monthly_fee', ' joined']
Unnamed: 0      int64
name              str
 plan             str
 monthly_fee      str
 joined           str
dtype: object
```

Now write `ex4.py` that cleans it up:

1. Load it so that the column names have no spaces, the first column becomes the index instead of `Unnamed: 0`, and `joined` holds real dates. Print the column names, then the number of missing values in each column.
2. A missing plan becomes `"unknown"`.
3. A member with no fee can't be billed: drop that row.
4. Turn `monthly_fee` into a new whole-number column `fee_cents`, then remove the old `monthly_fee` column.
5. Print the clean table, its dtypes, the total monthly income, and how many members are on each plan.
6. Save it as `members_clean.csv` (no index numbers) and as `members_clean.xlsx`.

Expected output:

```
['name', 'plan', 'monthly_fee', 'joined']
name           0
plan           1
monthly_fee    1
joined         0
dtype: int64
     name     plan     joined  fee_cents
0  Sandip     gold 2026-01-15       4500
1    Maya   silver 2026-03-02       3000
2     Leo  unknown 2026-04-20       3000
4   Priya   bronze 2026-06-01       2000
5     Sam   silver 2026-07-19       3000
6   Aisha     gold 2026-08-30       4500
name                    str
plan                    str
joined       datetime64[us]
fee_cents             int64
dtype: object
Monthly income: $200.00
plan
gold       2
silver     2
unknown    1
bronze     1
Name: count, dtype: int64
```

And `members_clean.csv` contains:

```
name,plan,joined,fee_cents
Sandip,gold,2026-01-15,4500
Maya,silver,2026-03-02,3000
Leo,unknown,2026-04-20,3000
Priya,bronze,2026-06-01,2000
Sam,silver,2026-07-19,3000
Aisha,gold,2026-08-30,4500
```

Open `members_clean.xlsx` in Excel (or any spreadsheet app) to check it too.

<details>
<summary>Hint 1</summary>

`read_csv` can do all of step 1 in one call: `skipinitialspace=True` for the spaces, `index_col=0` for the index, and `parse_dates=["joined"]` for the dates. Bonus: with `skipinitialspace=True`, Leo's blank plan (which was really a single space) becomes a proper missing value.

</details>

<details>
<summary>Hint 2</summary>

`fillna` and `dropna(subset=[...])` from the notes do steps 2 and 3. For step 4, "Numbers read as text because of `$` signs" in the notes shows the whole recipe. To remove a column, `members.drop(columns=["monthly_fee"])` returns a new DataFrame without it (so keep the result).

</details>

<details>
<summary>Hint 3</summary>

Notice the index in the expected output skips 3: that was Zoe's row, which you dropped. That's fine, and it's one more reason to save with `index=False`.

</details>

---

## Exercise 5 (Challenge): A sales report from the command line

Time to combine pandas with argparse ([chapter 24](../24-command-line-programs/notes.md)), error handling ([chapter 18](../18-error-handling/notes.md)) and type hints ([chapter 25](../25-type-hints/notes.md)). Write `report.py`, a command-line tool that reports on the cafe's `sales.csv` from the notes.

`python report.py -h` shows:

```
usage: report.py [-h] [--month MONTH] [--top TOP] [--excel EXCEL] file

Sales report for the cafe.

positional arguments:
  file           the sales CSV file

options:
  -h, --help     show this help message and exit
  --month MONTH  only this month, like 2026-10
  --top TOP      how many top items to show (default: 3)
  --excel EXCEL  also save the item totals to this Excel file
```

Then:

```
python report.py sales.csv
Report for all dates (15 lines)
Takings: $91.60
Busiest day: Thursday 2026-10-01 ($28.65)
Top 3 items by takings:
  Latte            $42.00
  Croissant        $16.50
  Hot chocolate    $11.25

python report.py sales.csv --month 2026-10
Report for 2026-10 (9 lines)
Takings: $59.55
Busiest day: Thursday 2026-10-01 ($28.65)
Top 3 items by takings:
  Latte            $24.50
  Croissant        $13.75
  Hot chocolate     $7.50

python report.py sales.csv --month 2026-09 --top 2 --excel september.xlsx
Report for 2026-09 (6 lines)
Takings: $32.05
Busiest day: Wednesday 2026-09-30 ($20.05)
Top 2 items by takings:
  Latte            $17.50
  Bagel             $5.80
Saved september.xlsx

python report.py sales.csv --month 2026-12
Error: no sales in 2026-12

python report.py nosuch.csv
Error: can't find nosuch.csv
```

The two errors go to standard error, with exit code `1`. `september.xlsx` holds every item's total for September (two columns, `item` and `total_cents`, biggest first).

Split the work into functions with hints, for example:

```python
def build_parser() -> argparse.ArgumentParser:
def load_sales(path: Path) -> pd.DataFrame:
def filter_month(sales: pd.DataFrame, month: str | None) -> pd.DataFrame:
def item_totals(sales: pd.DataFrame) -> pd.Series:
def money(cents: int) -> str:
def print_report(sales: pd.DataFrame, title: str, top: int) -> None:
def main() -> None:
```

When you're done, `python -m mypy report.py` (with `pandas-stubs` installed) says `Success: no issues found in 1 source file`.

<details>
<summary>Hint 1</summary>

Follow chapter 26's error pattern: `load_sales` and `filter_month` raise `ValueError` with the message, and `main()` catches it, prints `Error: ...` to `sys.stderr`, and calls `sys.exit(1)`. `pd.read_csv` raises `FileNotFoundError` for a missing file, so catch that in `load_sales` and raise your own `ValueError` instead.

</details>

<details>
<summary>Hint 2</summary>

To compare a date column with text like `2026-10`, turn each date into that same text first: `sales["date"].dt.strftime("%Y-%m")` gives `"2026-09"`, `"2026-10"` and so on ([chapter 22](../22-dates-and-times/notes.md)). If the filtered DataFrame has no rows, raise the "no sales" error.

</details>

<details>
<summary>Hint 3</summary>

For the busiest day, group by `date` and sum the totals. A Series has `.max()` for the biggest value, and `.idxmax()` for the **index label** of the biggest value, which here is the date. A date formats nicely in an f-string with `{best_day:%A %Y-%m-%d}`.

</details>

<details>
<summary>Hint 4</summary>

If mypy says `Argument 1 to "money" has incompatible type "float"; expected "int"`, it's because pandas-stubs can't know that your column holds whole numbers, so it calls the result of `sum()` or `max()` a `float`. You know better: wrap it in `int(...)`.

</details>

---

## Before you move on

You can now load a table, look at it, clean it, ask it questions and save the answers, in a script you can run again next month. That's already most of what people do with pandas day to day.

Notice how much of this chapter was about doing a boring job reliably: the same report, the same clean-up, every time. Computers love that kind of work. In [chapter 45](../45-automating-tasks/notes.md), you'll write scripts that tidy folders, rename files and run other programs for you, and even run themselves on a timer.
