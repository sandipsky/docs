# 44 Working with Data

## What is it?

**pandas** is the most popular Python package for working with tables of data. It reads a CSV or Excel file into a **DataFrame**, a whole table held in memory, and lets you filter it, sort it, add up columns and total things per group, usually in one line each.

## Why does it matter?

In [chapter 21](../21-json-and-csv/notes.md), you totalled expenses per category with the `csv` module. It worked, but it took a loop, a dictionary and `totals.get(category, 0) + amount`. Now imagine the questions that come next: Which day was busiest? What's the best-selling item? What's the average price in each category? Each one is another loop, another dictionary, more chances for a mistake.

With pandas, each of those questions is one line. Here's the total per category for a cafe:

```python
print(sales.groupby("category")["total_cents"].sum())
```

```
category
drink    6000
food     3160
Name: total_cents, dtype: int64
```

That's why pandas is everywhere in data work: in offices, in science, in finance, anywhere people have spreadsheets. It handles a million rows as easily as fifteen, it reads and writes Excel files, and unlike clicking around in a spreadsheet, your steps are saved in a script. Next month, you run the same script on the new file.

## Real-world example

Think of pandas as **a spreadsheet you drive with code**. Everything you'd click on in Excel or Google Sheets has a pandas command:

| Spreadsheet | pandas |
|---|---|
| A sheet | A **DataFrame** |
| One column | A **Series** |
| The column headings | The column names, `sales.columns` |
| The row numbers down the left | The **index** |
| The filter button on a column | A condition in brackets: `sales[sales["category"] == "food"]` |
| The sort button | `sales.sort_values("quantity")` |
| A formula copied down a whole column | A new column: `sales["total_cents"] = sales["quantity"] * sales["price_cents"]` |
| A pivot table, or SUMIF | `sales.groupby("category")["total_cents"].sum()` |
| File, Save As, CSV | `sales.to_csv("sales.csv", index=False)` |

The difference: a spreadsheet remembers the result, while a script remembers the steps.

## How it works

### Installing pandas

pandas isn't part of the standard library, so install it into a virtual environment, as in [chapter 23](../23-pip-and-virtual-environments/notes.md). Make a folder for this chapter, open a terminal in it, and run:

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install pandas
```

(Use the activate command for your terminal from chapter 23 if you're not in PowerShell.) pandas brings **NumPy** along with it, a package for fast maths on big lists of numbers that pandas is built on.

Check it worked:

```python
import pandas as pd

print(pd.__version__)  # prints: 3.0.6 (or whichever version you got)
```

`import pandas as pd` gives the package a short nickname ([chapter 19](../19-modules-and-standard-library/notes.md)). Everyone uses `pd`, so you'll see it in every example online.

> **Watch out:** This chapter was written with pandas 3.0. Version 3 changed some of what pandas prints (text columns now show as `str`) and how changing values works (see "Common mistakes"). If you find older tutorials online written for pandas 2, most of the code still works, but some printed output looks a little different. This chapter points out those differences where they show up.

### The sample data

Save this as `sales.csv` in your folder. Each line is one line on a cafe receipt: the date, what was sold, its category, how many, and the price of one, in whole cents (like the cafe till in [chapter 25](../25-type-hints/notes.md)):

```
date,item,category,quantity,price_cents
2026-09-29,Latte,drink,2,350
2026-09-29,Croissant,food,1,275
2026-09-29,Tea,drink,1,225
2026-09-30,Latte,drink,3,350
2026-09-30,Bagel,food,2,290
2026-09-30,Hot chocolate,drink,1,375
2026-10-01,Latte,drink,4,350
2026-10-01,Croissant,food,3,275
2026-10-01,Banana bread,food,2,320
2026-10-02,Tea,drink,2,225
2026-10-02,Latte,drink,2,350
2026-10-02,Bagel,food,1,290
2026-10-03,Croissant,food,2,275
2026-10-03,Latte,drink,1,350
2026-10-03,Hot chocolate,drink,2,375
```

### Reading a CSV: `pd.read_csv`

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
print(sales)
```

You'll see:

```
          date           item category  quantity  price_cents
0   2026-09-29          Latte    drink         2          350
1   2026-09-29      Croissant     food         1          275
2   2026-09-29            Tea    drink         1          225
3   2026-09-30          Latte    drink         3          350
4   2026-09-30          Bagel     food         2          290
5   2026-09-30  Hot chocolate    drink         1          375
6   2026-10-01          Latte    drink         4          350
7   2026-10-01      Croissant     food         3          275
8   2026-10-01   Banana bread     food         2          320
9   2026-10-02            Tea    drink         2          225
10  2026-10-02          Latte    drink         2          350
11  2026-10-02          Bagel     food         1          290
12  2026-10-03      Croissant     food         2          275
13  2026-10-03          Latte    drink         1          350
14  2026-10-03  Hot chocolate    drink         2          375
```

One line did everything `csv.DictReader` did in chapter 21, and more: it used the header row for the column names, and it turned `quantity` and `price_cents` into real numbers by itself. The numbers down the left, 0 to 14, are the **index**: a label for each row, like the row numbers in a spreadsheet (except they start at 0, like list positions).

### Taking a first look

Real files have thousands of rows, so you don't print the whole thing. Instead, you take a quick look:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
print(sales.head(3))
print(sales.shape)
print(sales.columns)
print(sales.dtypes)
```

You'll see:

```
         date       item category  quantity  price_cents
0  2026-09-29      Latte    drink         2          350
1  2026-09-29  Croissant     food         1          275
2  2026-09-29        Tea    drink         1          225
(15, 5)
Index(['date', 'item', 'category', 'quantity', 'price_cents'], dtype='str')
date             str
item             str
category         str
quantity       int64
price_cents    int64
dtype: object
```

- `head(3)` shows the first 3 rows (5 if you leave the number out). `tail()` shows the last ones.
- `shape` is a tuple: (rows, columns). 15 rows, 5 columns.
- `columns` lists the column names.
- `dtypes` says what type each column holds. A **dtype** (data type) is pandas' word for a column's type. `int64` is a whole number (the 64 is how much memory each one uses), `float64` is a decimal, and `str` is text. (In pandas 2, text columns showed as `object` instead of `str`.)

Two more methods give you a summary in one go:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
sales.info()
print(sales.describe())
```

```
<class 'pandas.DataFrame'>
RangeIndex: 15 entries, 0 to 14
Data columns (total 5 columns):
 #   Column       Non-Null Count  Dtype
---  ------       --------------  -----
 0   date         15 non-null     str
 1   item         15 non-null     str
 2   category     15 non-null     str
 3   quantity     15 non-null     int64
 4   price_cents  15 non-null     int64
dtypes: int64(2), str(3)
memory usage: 732.0 bytes
        quantity  price_cents
count  15.000000    15.000000
mean    1.933333   311.666667
std     0.883715    50.308572
min     1.000000   225.000000
25%     1.000000   275.000000
50%     2.000000   320.000000
75%     2.000000   350.000000
max     4.000000   375.000000
```

`info()` prints a report by itself (so there's no `print` around it): the number of rows, each column's type, and how many values are **non-null**, meaning "not missing". Here nothing is missing; you'll meet missing values later. `describe()` gives quick statistics for every number column: the count, the average (`mean`), the smallest and biggest, and so on. (`std` is the standard deviation, a measure of how spread out the numbers are, and `25%`, `50%`, `75%` split the values into quarters. `50%` is the middle value.)

### Columns: a Series

Put a column name in square brackets, like a dictionary key, to get one column:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
items = sales["item"]
print(type(items))  # prints: <class 'pandas.Series'>
print(items.head(3))
print(sales[["item", "quantity"]].head(3))
```

```
0        Latte
1    Croissant
2          Tea
Name: item, dtype: str
        item  quantity
0      Latte         2
1  Croissant         1
2        Tea         1
```

One column is a **Series**: a list of values with the index alongside. A list of names inside the brackets (notice the **double** brackets) gives a smaller DataFrame with just those columns.

### Maths on whole columns

Here's the big idea of pandas: you do maths on a **whole column at once**, with no loop. Multiply two columns, and pandas multiplies them row by row:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
sales["total_cents"] = sales["quantity"] * sales["price_cents"]
print(sales.head(3))
print(sales["total_cents"].sum())  # prints: 9160
print(sales["quantity"].mean())  # prints: 1.9333333333333333
print(sales["price_cents"].max())  # prints: 375
```

```
         date       item category  quantity  price_cents  total_cents
0  2026-09-29      Latte    drink         2          350          700
1  2026-09-29  Croissant     food         1          275          275
2  2026-09-29        Tea    drink         1          225          225
```

Assigning to a new column name adds the column, like typing a formula at the top of a spreadsheet column and copying it all the way down. Then `sum()`, `mean()`, `max()`, `min()` and `count()` work on the whole column. The cafe took 9160 cents, or $91.60, in five days.

### Picking rows with a condition

Comparing a column with a value also works on every row at once. The answer is a Series of `True` and `False`:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
is_food = sales["category"] == "food"
print(is_food.head(3))
print(sales[is_food])
```

```
0    False
1     True
2    False
Name: category, dtype: bool
          date          item category  quantity  price_cents
1   2026-09-29     Croissant     food         1          275
4   2026-09-30         Bagel     food         2          290
7   2026-10-01     Croissant     food         3          275
8   2026-10-01  Banana bread     food         2          320
11  2026-10-02         Bagel     food         1          290
12  2026-10-03     Croissant     food         2          275
```

A Series of `True`/`False` used to pick rows is called a **mask** (or a boolean mask), because it covers up the rows you don't want, like masking tape. Put it in square brackets after the DataFrame, and you get only the rows where it's `True`. Notice that the rows keep their original index numbers.

Usually you write it all in one line: `sales[sales["category"] == "food"]`. Read it as "sales, where the category is food".

### Combining conditions: `&`, `|` and `~`

To combine conditions, pandas uses symbols instead of the words `and`, `or` and `not`, and **each condition needs its own brackets**:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
big_drinks = sales[(sales["category"] == "drink") & (sales["quantity"] >= 3)]
print(big_drinks)

tea_or_bagel = sales[(sales["item"] == "Tea") | (sales["item"] == "Bagel")]
print(len(tea_or_bagel))  # prints: 4

same_thing = sales[sales["item"].isin(["Tea", "Bagel"])]
print(len(same_thing))  # prints: 4

not_latte = sales[~(sales["item"] == "Latte")]
print(len(not_latte))  # prints: 10
```

```
         date   item category  quantity  price_cents
3  2026-09-30  Latte    drink         3          350
6  2026-10-01  Latte    drink         4          350
```

| Symbol | Means | Python's word |
|---|---|---|
| `&` | both are true | `and` |
| `\|` | at least one is true | `or` |
| `~` | the opposite | `not` |

`isin()` checks whether each value is one of a list, which is shorter than a chain of `|`. Using the words `and`/`or`, or forgetting the brackets, are the two most common pandas mistakes (both are in "Common mistakes").

### `.loc`: rows and columns together

`.loc` picks rows **and** columns in one go: `sales.loc[which_rows, which_columns]`. It's also the right way to **change** values:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
print(sales.loc[sales["item"] == "Tea", ["date", "quantity"]])

sales.loc[sales["item"] == "Tea", "price_cents"] = 250  # tea costs more now
print(sales.loc[sales["item"] == "Tea", ["item", "price_cents"]])
```

```
         date  quantity
2  2026-09-29         1
9  2026-10-02         2
  item  price_cents
2  Tea          250
9  Tea          250
```

The second line reads: "in the rows where the item is Tea, set the `price_cents` column to 250". Remember this shape. When you want to change some values, `.loc[rows, column] = value` is the way that always works.

### Sorting: `sort_values`

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
sales["total_cents"] = sales["quantity"] * sales["price_cents"]

biggest = sales.sort_values("total_cents", ascending=False)
print(biggest.head(3))

by_item = sales.sort_values(["item", "date"])
print(by_item[["item", "date", "quantity"]].head(4))
```

```
         date       item category  quantity  price_cents  total_cents
6  2026-10-01      Latte    drink         4          350         1400
3  2026-09-30      Latte    drink         3          350         1050
7  2026-10-01  Croissant     food         3          275          825
            item        date  quantity
4          Bagel  2026-09-30         2
11         Bagel  2026-10-02         1
8   Banana bread  2026-10-01         2
1      Croissant  2026-09-29         1
```

`ascending=False` puts the biggest first, so `sort_values(...)` then `head(3)` is the "top 3" pattern. A list of columns sorts by the first one, and uses the next one to break ties. Like `sorted()` from [chapter 11](../11-lists/notes.md), `sort_values` gives you a **new** DataFrame and leaves the original alone.

### Dates

Look back at the `dtypes`: `date` came in as `str`, plain text. Tell `read_csv` which columns hold dates, and pandas turns them into real dates:

```python
import pandas as pd

sales = pd.read_csv("sales.csv", parse_dates=["date"])
print(sales.dtypes)

sales["day"] = sales["date"].dt.day_name()
sales["month"] = sales["date"].dt.month
print(sales[["date", "day", "month", "item"]].head(4))

october = sales[sales["date"] >= "2026-10-01"]
print(len(october))  # prints: 9
```

```
date           datetime64[us]
item                      str
category                  str
quantity                int64
price_cents             int64
dtype: object
        date        day  month       item
0 2026-09-29    Tuesday      9      Latte
1 2026-09-29    Tuesday      9  Croissant
2 2026-09-29    Tuesday      9        Tea
3 2026-09-30  Wednesday      9      Latte
```

`datetime64[us]` is pandas' date-and-time type. (The `us` means it's accurate to a microsecond. pandas 2 shows `datetime64[ns]`, for nanoseconds.) The `.dt` part gives you the date tools from [chapter 22](../22-dates-and-times/notes.md) for a whole column at once: `.dt.year`, `.dt.month`, `.dt.day`, `.dt.day_name()` and more. And date columns compare with ISO text like `"2026-10-01"` directly.

### Counting: `value_counts`

How many times does each value appear?

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
print(sales["item"].value_counts())
```

```
item
Latte            5
Croissant        3
Tea              2
Bagel            2
Hot chocolate    2
Banana bread     1
Name: count, dtype: int64
```

That's `collections.Counter` from [chapter 19](../19-modules-and-standard-library/notes.md), for a column, sorted with the most common first. It counts **lines** on receipts, not cups sold: Latte appears on 5 lines. For the number of lattes sold, you need to add up the `quantity`, which is grouping.

### Grouping: `groupby`

`groupby` answers "for each something, what's the total?". Picture tipping all the receipt lines onto a table, sorting them into piles (one pile per category), and adding up each pile:

```python
import pandas as pd

sales = pd.read_csv("sales.csv", parse_dates=["date"])
sales["total_cents"] = sales["quantity"] * sales["price_cents"]

print(sales.groupby("category")["total_cents"].sum())
print(sales.groupby("item")["quantity"].sum().sort_values(ascending=False))

sales["day"] = sales["date"].dt.day_name()
print(sales.groupby("day")["total_cents"].sum())
```

```
category
drink    6000
food     3160
Name: total_cents, dtype: int64
item
Latte            12
Croissant         6
Hot chocolate     3
Bagel             3
Tea               3
Banana bread      2
Name: quantity, dtype: int64
day
Friday       1440
Saturday     1650
Thursday     2865
Tuesday      1200
Wednesday    2005
Name: total_cents, dtype: int64
```

Read `sales.groupby("category")["total_cents"].sum()` in three steps: **group** the rows by category, **take** the `total_cents` column of each group, and **sum** it. You can use `mean()`, `count()`, `max()` and the others in place of `sum()`. The result is a Series whose index is the group names, sorted alphabetically (so the days come out in alphabetical order, not calendar order). Thursday, 1 October, was the busiest day.

To get several answers per group at once, use `agg` (short for "aggregate", which means "combine into a summary"). Each keyword names a new column, and gets a pair: which column to use, and what to do with it:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
sales["total_cents"] = sales["quantity"] * sales["price_cents"]

summary = sales.groupby("category").agg(
    lines=("item", "count"),
    items_sold=("quantity", "sum"),
    average_price=("price_cents", "mean"),
    takings_cents=("total_cents", "sum"),
)
print(summary)
print(summary.loc["food", "takings_cents"])  # prints: 3160
```

```
          lines  items_sold  average_price  takings_cents
category
drink         9          18     327.777778           6000
food          6          11     287.500000           3160
```

That's a pivot table in five lines. And because the category names are the index, `.loc["food", "takings_cents"]` picks one value out by its row and column names.

### Missing values

Real data has gaps: someone forgot to type the quantity, or a cell was left empty. Save this as `messy.csv` (notice the three empty spots):

```
date,item,category,quantity,price_cents
2026-10-04,Latte,drink,2,350
2026-10-04,Croissant,,1,275
2026-10-04,Tea,drink,,225
2026-10-05,Bagel,food,2,290
2026-10-05,Latte,drink,1,
```

```python
import pandas as pd

messy = pd.read_csv("messy.csv")
print(messy)
print(messy.isna().sum())
```

```
         date       item category  quantity  price_cents
0  2026-10-04      Latte    drink       2.0        350.0
1  2026-10-04  Croissant      NaN       1.0        275.0
2  2026-10-04        Tea    drink       NaN        225.0
3  2026-10-05      Bagel     food       2.0        290.0
4  2026-10-05      Latte    drink       1.0          NaN
date           0
item           0
category       1
quantity       1
price_cents    1
dtype: int64
```

pandas marks each gap as **NaN** (short for "not a number"), its way of saying "missing". Notice the side effect: `quantity` and `price_cents` turned into decimals, `2.0` and `350.0`, because a normal whole-number (`int64`) column can't hold NaN. `isna()` gives `True` for every missing value, and `.sum()` counts the `True`s in each column (each `True` counts as 1).

Then you decide what to do with each gap. Fill it in, or drop the row:

```python
import pandas as pd

messy = pd.read_csv("messy.csv")
print(messy[messy["quantity"].isna()])

filled = messy.fillna({"category": "unknown", "quantity": 1})
clean = filled.dropna(subset=["price_cents"])
clean["quantity"] = clean["quantity"].astype(int)
clean["price_cents"] = clean["price_cents"].astype(int)
print(clean)
```

```
         date item category  quantity  price_cents
2  2026-10-04  Tea    drink       NaN        225.0
         date       item category  quantity  price_cents
0  2026-10-04      Latte    drink         2          350
1  2026-10-04  Croissant  unknown         1          275
2  2026-10-04        Tea    drink         1          225
3  2026-10-05      Bagel     food         2          290
```

- `messy[messy["quantity"].isna()]` shows the rows with a missing quantity, so you can look at them first.
- `fillna({...})` fills the gaps, with a different value for each column. A missing category becomes `"unknown"`, and a missing quantity becomes `1`.
- `dropna(subset=["price_cents"])` drops the rows with no price, because there's no sensible guess for it. (`dropna()` with no `subset` drops every row with **any** gap, which is often more than you want.)
- `astype(int)` turns the columns back into whole numbers, now that no NaN is left.

There's no single right answer for missing data. Guessing a quantity of 1 might be fine for a cafe's report and very wrong for a bank. Decide on purpose, and say what you did.

### Saving: `to_csv` and `to_excel`

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
sales["total_cents"] = sales["quantity"] * sales["price_cents"]
totals = sales.groupby("item")["total_cents"].sum().sort_values(ascending=False)

table = totals.reset_index()  # turn the Series into a two-column DataFrame
print(table)
table.to_csv("item_totals.csv", index=False)
```

```
            item  total_cents
0          Latte         4200
1      Croissant         1650
2  Hot chocolate         1125
3          Bagel          870
4            Tea          675
5   Banana bread          640
```

`reset_index()` moves the item names out of the index into a normal column. `to_csv` writes the file, and `index=False` leaves out the index numbers (without it, you get an extra unnamed column, see "Common mistakes"). `item_totals.csv` now contains:

```
item,total_cents
Latte,4200
Croissant,1650
Hot chocolate,1125
Bagel,870
Tea,675
Banana bread,640
```

For Excel, pandas needs one more package, **openpyxl**, which reads and writes `.xlsx` files:

```
python -m pip install openpyxl
```

Then it's the same shape, plus an optional sheet name:

```python
table.to_excel("item_totals.xlsx", index=False, sheet_name="Totals")
```

Double-click `item_totals.xlsx`, and it opens in Excel as a normal spreadsheet. `pd.read_excel("item_totals.xlsx")` reads one back in.

> **Tip:** pandas can also read straight from a database. With a connection from [chapter 42](../42-databases/notes.md), `pd.read_sql_query("SELECT * FROM tasks", con)` gives you the query's rows as a DataFrame.

### The same job, two ways

Here's the total per category with the `csv` module, the chapter 21 way:

```python
import csv

totals: dict[str, int] = {}
with open("sales.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        line_total = int(row["quantity"]) * int(row["price_cents"])
        totals[row["category"]] = totals.get(row["category"], 0) + line_total

for category, cents in sorted(totals.items()):
    print(f"{category:<8}{cents / 100:>8.2f}")
```

And with pandas:

```python
import pandas as pd

sales = pd.read_csv("sales.csv")
sales["total_cents"] = sales["quantity"] * sales["price_cents"]
totals = sales.groupby("category")["total_cents"].sum()

for category, cents in totals.items():
    print(f"{category:<8}{cents / 100:>8.2f}")
```

Both print exactly the same:

```
drink      60.00
food       31.60
```

So which should you use? For one simple total, the `csv` version is fine, and it needs nothing installed. pandas wins as soon as there's a second question, and a third, and a tenth: each new question is one more line, not one more loop. A Series works with `.items()` like a dictionary, so mixing pandas with plain Python is easy.

> **Tip:** pandas can draw charts too, with one more package: `python -m pip install matplotlib`. Then `totals.plot(kind="barh")` draws a bar chart of a Series, `import matplotlib.pyplot as plt` and `plt.savefig("takings.png")` save it as an image, and `plt.show()` opens it in a window.

### Type hints with pandas

`pd.DataFrame` and `pd.Series` work as type hints, like any class:

```python
from pathlib import Path

import pandas as pd


def load_sales(path: Path) -> pd.DataFrame:
    """Read the sales file, and add a total_cents column."""
    sales = pd.read_csv(path, parse_dates=["date"])
    sales["total_cents"] = sales["quantity"] * sales["price_cents"]
    return sales


def takings_by(sales: pd.DataFrame, column: str) -> pd.Series:
    """Total takings for each value in a column, biggest first."""
    return sales.groupby(column)["total_cents"].sum().sort_values(ascending=False)


sales = load_sales(Path(__file__).parent / "sales.csv")
print(takings_by(sales, "item").head(3))
```

```
item
Latte            4200
Croissant        1650
Hot chocolate    1125
Name: total_cents, dtype: int64
```

But save it as `typed.py`, run `python -m mypy typed.py`, and you'll see:

```
typed.py:3: error: Library stubs not installed for "pandas"  [import-untyped]
typed.py:3: note: Hint: "python3 -m pip install pandas-stubs"
typed.py:3: note: (or run "mypy --install-types" to install all missing stub packages)
typed.py:3: note: See https://mypy.readthedocs.io/en/stable/running_mypy.html#missing-imports
Found 1 error in 1 file (checked 1 source file)
```

pandas itself doesn't include type hints that mypy can read. They come in a separate package, **pandas-stubs** (a **stub** is a file that holds only the hints for a package, with no real code). Install it next to mypy, and mypy is happy:

```
python -m pip install pandas-stubs
python -m mypy typed.py
Success: no issues found in 1 source file
```

## Common mistakes

**1. Using `and` / `or` instead of `&` / `|`**

```python
big_drinks = sales[sales["category"] == "drink" and sales["quantity"] >= 2]
```

```
ValueError: The truth value of a Series is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all().
```

`and` asks "is this whole thing true?", and a Series of 15 `True`s and `False`s has no single answer, so pandas refuses to guess. Use `&` for "and", `|` for "or" and `~` for "not": they work row by row.

**2. Forgetting the brackets around each condition**

```python
big_drinks = sales[sales["category"] == "drink" & sales["quantity"] >= 2]
```

```
TypeError: Cannot perform 'rand_' with a dtyped [int64] array and scalar of type [bool]
```

A confusing message for a simple cause: Python does `&` **before** `==` and `>=`, so it tried to work out `"drink" & sales["quantity"]` first. Brackets fix the order: `(sales["category"] == "drink") & (sales["quantity"] >= 2)`.

**3. Expecting `sort_values` to change the DataFrame**

```python
sales.sort_values("quantity", ascending=False)
print(sales.head(3))
```

```
         date       item category  quantity  price_cents
0  2026-09-29      Latte    drink         2          350
1  2026-09-29  Croissant     food         1          275
2  2026-09-29        Tea    drink         1          225
```

Not sorted at all. `sort_values` returns a new, sorted DataFrame, and that line threw it away. The same goes for `fillna`, `dropna`, `reset_index` and most other methods. Keep the result: `sales = sales.sort_values(...)`, or give it a new name.

**4. Changing values with two sets of brackets (chained assignment)**

```python
sales[sales["item"] == "Tea"]["price_cents"] = 250
print(sales.loc[sales["item"] == "Tea", ["item", "price_cents"]])
```

pandas 3 prints a warning (it starts with your file's path and line number), and the price doesn't change:

```
C:\...\mistakes.py:4: ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment.
Such chained assignment never works to update the original DataFrame or Series, because the intermediate object on which we are setting values always behaves as a copy (due to Copy-on-Write).

Try using '.loc[row_indexer, col_indexer] = value' instead, to perform the assignment in a single step.

See the documentation for a more detailed explanation: https://pandas.pydata.org/pandas-docs/stable/user_guide/copy_on_write.html#chained-assignment
  sales[sales["item"] == "Tea"]["price_cents"] = 250
  item  price_cents
2  Tea          225
9  Tea          225
```

`sales[sales["item"] == "Tea"]` makes a separate little DataFrame, so `["price_cents"] = 250` changed that copy, not `sales`. This is called **chained assignment** (two sets of brackets chained together, then `=`). pandas 3 uses a rule called **Copy-on-Write**, which means "every selection behaves like a separate copy", so chained assignment never works. (In pandas 2, it sometimes worked and sometimes didn't, with a `SettingWithCopyWarning`, which was even more confusing.) Do it in one step with `.loc`: `sales.loc[sales["item"] == "Tea", "price_cents"] = 250`.

**5. A `KeyError` from a column name that isn't quite right**

```python
print(sales["Item"])
```

```
KeyError: 'Item'
```

Column names are case-sensitive, like dictionary keys: the column is `"item"`. Print `sales.columns` to see the real names. A sneakier version: a file whose header is `item, price`, with a space after the comma. pandas keeps the space, so the column is called `" price"`:

```python
prices = pd.read_csv("prices.csv")
print(prices.columns)  # prints: Index(['item', ' price'], dtype='str')
```

and `prices["price"]` gives `KeyError: 'price'`. Read the file with `pd.read_csv("prices.csv", skipinitialspace=True)`, which ignores spaces after commas.

**6. Numbers read as text because of `$` signs**

That `prices.csv` file has prices like `$3.50`. With the `$`, pandas can't read them as numbers, so the column is text:

```python
prices = pd.read_csv("prices.csv", skipinitialspace=True)
print(prices.dtypes)
print(prices["price"].sum())
print(prices["price"].mean())
```

```
item     str
price    str
dtype: object
$3.50$2.25$2.75
TypeError: Cannot perform reduction 'mean' with string dtype
```

`sum()` glued the strings together, like `+` does for text, and `mean()` gave up. Always check `dtypes` after loading. To fix it, strip the `$` with `.str.replace()` (`.str` gives you the string methods from [chapter 06](../06-strings/notes.md) for a whole column), turn the text into numbers with `astype(float)`, and then into whole cents:

```python
dollars = prices["price"].str.replace("$", "").astype(float)
prices["price_cents"] = (dollars * 100).round().astype(int)
print(prices["price_cents"].sum())  # prints: 850
```

(The `round()` matters: floats aren't exact, as [chapter 05](../05-numbers-and-math/notes.md) showed, and `astype(int)` simply chops off anything after the point.)

**7. An `Unnamed: 0` column after saving and loading**

```python
drinks = sales[sales["category"] == "drink"]
drinks.to_csv("drinks.csv")
again = pd.read_csv("drinks.csv")
print(again.head(3))
```

```
   Unnamed: 0        date   item category  quantity  price_cents
0           0  2026-09-29  Latte    drink         2          350
1           2  2026-09-29    Tea    drink         1          225
2           3  2026-09-30  Latte    drink         3          350
```

`to_csv` saved the index as a first column with no name, and `read_csv` read it back as an ordinary column called `Unnamed: 0`. Save with `to_csv("drinks.csv", index=False)`. (If someone sends you a file like this, `pd.read_csv("drinks.csv", index_col=0)` turns that column back into the index.)

## Quick recap

- pandas reads a table into a **DataFrame** (`pd.read_csv`, `pd.read_excel`). One column is a **Series**. Install it in a venv, and add `openpyxl` for Excel and `pandas-stubs` for mypy.
- Take a first look with `head()`, `shape`, `columns`, `dtypes`, `info()` and `describe()`. Always check the dtypes.
- Maths works on whole columns with no loop: `sales["total_cents"] = sales["quantity"] * sales["price_cents"]`, then `sum()`, `mean()`, `max()`.
- Pick rows with a mask: `sales[(cond1) & (cond2)]`, with `&`, `|`, `~` and brackets around each condition. Change values with `.loc[rows, column] = value`.
- `sort_values`, `value_counts` and `groupby(...)[column].sum()` (or `.agg(...)`) answer most questions. Methods return a **new** DataFrame, so keep the result.
- `parse_dates` plus `.dt` handles dates. `isna`, `fillna` and `dropna` handle missing values. `to_csv(..., index=False)` saves.

---

**Next:** try the [exercises](exercises.md), then move on to [45 Automating Tasks](../45-automating-tasks/notes.md).
