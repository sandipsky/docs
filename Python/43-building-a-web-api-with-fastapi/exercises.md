# 43 Building a Web API with FastAPI: Exercises

**How to do these:**

- Make a folder called `cafe-api` in this chapter's folder, and open a terminal in it. Make and activate a virtual environment, then install what you need for all five exercises:

  ```
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  python -m pip install "fastapi[standard]" pytest httpx2
  ```

  (If the install fails with a long-path error, see the Watch out in the notes: use a folder with a shorter path.)
- Exercises 1 to 4 build one app, `cafe.py`, a bit at a time. Exercise 5 is a new app in `todo_api.py`.
- Run your app with `fastapi dev cafe.py`, and keep that terminal open. Open a **second** terminal for everything else, and activate the virtual environment there too.
- Check your endpoints in the browser, in `/docs`, or with the small `requests` scripts given below. The browser shows JSON on one line, like the expected outputs here.
- Put type hints on every function. When you're done, `python -m mypy cafe.py` should say `Success`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The cafe menu

Sandip's cafe wants an API so its new website can show the menu. Start `cafe.py` with this code:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Sandip's Cafe")


class MenuItem(BaseModel):
    id: int
    name: str
    category: str
    price_cents: int


MENU: dict[int, MenuItem] = {
    1: MenuItem(id=1, name="Latte", category="drink", price_cents=350),
    2: MenuItem(id=2, name="Masala chai", category="drink", price_cents=250),
    3: MenuItem(id=3, name="Croissant", category="food", price_cents=275),
    4: MenuItem(id=4, name="Veg momo", category="food", price_cents=600),
    5: MenuItem(id=5, name="Lemonade", category="drink", price_cents=300),
}
```

Add three endpoints:

- `GET /` answers with a welcome message.
- `GET /menu` answers with every item on the menu, as a list.
- `GET /menu/{item_id}` answers with one item. If there's no item with that ID, it answers with a `404` and the detail `No menu item with id 9` (with the real ID in it).

Start the server with `fastapi dev cafe.py`, then visit each address. You should see:

`http://127.0.0.1:8000/`

```
{"cafe":"Sandip's Cafe","message":"Welcome! See /menu"}
```

`http://127.0.0.1:8000/menu`

```
[{"id":1,"name":"Latte","category":"drink","price_cents":350},{"id":2,"name":"Masala chai","category":"drink","price_cents":250},{"id":3,"name":"Croissant","category":"food","price_cents":275},{"id":4,"name":"Veg momo","category":"food","price_cents":600},{"id":5,"name":"Lemonade","category":"drink","price_cents":300}]
```

`http://127.0.0.1:8000/menu/4`

```
{"id":4,"name":"Veg momo","category":"food","price_cents":600}
```

`http://127.0.0.1:8000/menu/9` (status `404`)

```
{"detail":"No menu item with id 9"}
```

`http://127.0.0.1:8000/menu/latte` (status `422`)

```
{"detail":[{"type":"int_parsing","loc":["path","item_id"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"latte"}]}
```

You didn't write any code for that last one. Explain in a comment why it's a `422` and not a `404`.

Finally, open `http://127.0.0.1:8000/docs`, and use **Try it out** on `GET /menu/{item_id}` with a few IDs.

<details>
<summary>Hint 1</summary>

For the list, `MENU.values()` gives you the items, and the return hint is `list[MenuItem]`. Turn the values into a real list with `list(...)` first (mypy will remind you if you forget).

</details>

<details>
<summary>Hint 2</summary>

For the missing item, check `if item_id not in MENU:` and then `raise HTTPException(status_code=404, detail=...)`. Use an f-string for the detail. You'll need this check again in exercise 3, so a small helper function like `find_item(item_id: int) -> MenuItem` saves repeating it.

</details>

---

## Exercise 2 (Easy): Filter the menu

The website needs a "drinks only" tab and a "cheap eats" button. Change `GET /menu` so it takes two **optional** query parameters:

- `category`: only show items in this category.
- `max_price_cents`: only show items that cost this much or less.

Both can be used together. With neither, the menu is the same as before.

| Visit | You should see |
|---|---|
| `/menu?category=drink` | `[{"id":1,"name":"Latte","category":"drink","price_cents":350},{"id":2,"name":"Masala chai","category":"drink","price_cents":250},{"id":5,"name":"Lemonade","category":"drink","price_cents":300}]` |
| `/menu?max_price_cents=300` | `[{"id":2,"name":"Masala chai","category":"drink","price_cents":250},{"id":3,"name":"Croissant","category":"food","price_cents":275},{"id":5,"name":"Lemonade","category":"drink","price_cents":300}]` |
| `/menu?category=food&max_price_cents=300` | `[{"id":3,"name":"Croissant","category":"food","price_cents":275}]` |
| `/menu?category=cake` | `[]` |

And `/menu?max_price_cents=cheap` should give a `422`, with this inside the detail:

```
"loc":["query","max_price_cents"],"msg":"Input should be a valid integer, unable to parse string as an integer"
```

<details>
<summary>Hint 1</summary>

Optional query parameters have a default. For "a value, or nothing", that's `category: str | None = None`. What hint makes `max_price_cents` a whole number, or nothing?

</details>

<details>
<summary>Hint 2</summary>

Start with every item, then narrow the list down one filter at a time: `if category is not None:` keep only the matching items (a list comprehension from [chapter 15](../15-comprehensions/notes.md) is perfect), then do the same for the price.

</details>

---

## Exercise 3 (Medium): Take orders

Now customers can order from the website. Add two Pydantic models: `OrderIn` for what a customer sends, and `Order` for what the API keeps and sends back.

`OrderIn` has three fields, with these rules:

- `item_id`: a whole number.
- `quantity`: a whole number from 1 to 10.
- `customer`: the customer's name. It can't be empty.

`Order` has `id`, `customer`, `item_name`, `quantity` and `total_cents` (the item's price times the quantity).

Keep the orders in a list in memory, and add two endpoints:

- `POST /orders` takes an `OrderIn`, and answers with the new `Order` and the status `201`. If the item doesn't exist, it answers `404` with the same detail as exercise 1. Orders get IDs `1`, `2`, `3` and so on.
- `GET /orders` answers with every order so far.

Save this script as `order_client.py` and run it (with the server running) in your second terminal:

```python
import requests

BASE_URL = "http://127.0.0.1:8000"

test_orders: list[dict[str, str | int]] = [
    {"item_id": 4, "quantity": 2, "customer": "Maya"},
    {"item_id": 1, "quantity": 3, "customer": "Leo"},
    {"item_id": 9, "quantity": 1, "customer": "Zoe"},
    {"item_id": 2, "quantity": 0, "customer": ""},
]

for order in test_orders:
    response = requests.post(f"{BASE_URL}/orders", json=order, timeout=5)
    if response.status_code == 422:
        problems = [error["msg"] for error in response.json()["detail"]]
        print(422, problems)
    else:
        print(response.status_code, response.json())

response = requests.get(f"{BASE_URL}/orders", timeout=5)
print(response.status_code, response.json())
```

Expected output (run it on a freshly started server):

```
201 {'id': 1, 'customer': 'Maya', 'item_name': 'Veg momo', 'quantity': 2, 'total_cents': 1200}
201 {'id': 2, 'customer': 'Leo', 'item_name': 'Latte', 'quantity': 3, 'total_cents': 1050}
404 {'detail': 'No menu item with id 9'}
422 ['Input should be greater than 0', 'String should have at least 1 character']
200 [{'id': 1, 'customer': 'Maya', 'item_name': 'Veg momo', 'quantity': 2, 'total_cents': 1200}, {'id': 2, 'customer': 'Leo', 'item_name': 'Latte', 'quantity': 3, 'total_cents': 1050}]
```

Run the script a second time without restarting the server. What changes, and why? Then save `cafe.py` (even without changing anything) and run it again. Write both answers in a comment.

<details>
<summary>Hint 1</summary>

The rules all go in `Field(...)`: `gt`/`ge` and `lt`/`le` for numbers, `min_length` for text. A quantity "from 1 to 10" can be written as `gt=0, le=10`.

</details>

<details>
<summary>Hint 2</summary>

In `POST /orders`, look the item up first with your helper from exercise 1. If it isn't there, the `HTTPException` stops everything before an order is made. The next ID can be `len(orders) + 1`, because orders are never deleted.

</details>

<details>
<summary>Hint 3</summary>

Don't forget `status_code=201` in the decorator. For the second question: where do the orders live, and what happens to that place when the server reloads?

</details>

---

## Exercise 4 (Medium): Test the cafe

Clicking around `/docs` after every change is slow. Write `test_cafe.py` next to `cafe.py`, using `TestClient` and pytest, with a fixture called `client` that empties the orders list and returns a `TestClient` for your app.

Write these five tests, with exactly these names:

| Test | What it checks |
|---|---|
| `test_menu_has_five_items` | `GET /menu` answers `200` with five items |
| `test_missing_item_gives_404` | `GET /menu/9` answers `404` with the right detail |
| `test_order_total` | Ordering 2 veg momos answers `201`, with a total of `1200` |
| `test_quantity_must_be_positive` | An order with quantity `0` answers `422` |
| `test_order_for_missing_item` | Ordering item `9` answers `404`, and afterwards `GET /orders` is still an empty list |

You don't need the server running for this. `python -m pytest -v` should end with:

```
test_cafe.py::test_menu_has_five_items PASSED                            [ 20%]
test_cafe.py::test_missing_item_gives_404 PASSED                         [ 40%]
test_cafe.py::test_order_total PASSED                                    [ 60%]
test_cafe.py::test_quantity_must_be_positive PASSED                      [ 80%]
test_cafe.py::test_order_for_missing_item PASSED                         [100%]

============================== 5 passed in 0.48s ==============================
```

(Your time will be different.) Now prove the tests can catch a real bug. In `cafe.py`, change the `*` in the total to a `+`, and run the tests again (without `-v`). The summary should say:

```
FAILED test_cafe.py::test_order_total - assert 602 == 1200
========================= 1 failed, 4 passed in 1.44s =========================
```

Put the `*` back, and check that everything passes again.

<details>
<summary>Hint 1</summary>

Look at the fixture in the notes. Yours is simpler: there's no sample data to put back, so it only needs `cafe.orders.clear()` before returning `TestClient(cafe.app)`. For that, use `import cafe` at the top, rather than `from cafe import app`.

</details>

<details>
<summary>Hint 2</summary>

Send a body with `client.post("/orders", json={...})`, and read the answer with `response.json()`. In the last test, the second check is `client.get("/orders").json() == []`.

</details>

<details>
<summary>Hint 3</summary>

Why does the last test check `GET /orders` too? Think about what would happen if your code added the order to the list *before* looking up the item.

</details>

---

## Exercise 5 (Challenge): A to-do API that remembers

Your to-do app from [chapter 26](../26-project-todo-app/notes.md) only worked in the terminal. Give it an API, so a React app could use it one day. This time, the tasks must survive a restart: save them to `tasks.json` after every change, like chapter 26 did, and load them when the server starts.

Make a new file, `todo_api.py`, with two models:

- `TaskIn`: `title` (not empty) and `due` (a `date`, or `None`, defaulting to `None`).
- `Task`: everything in `TaskIn`, plus `id` and `done` (defaulting to `False`).

And these endpoints:

| Endpoint | What it does |
|---|---|
| `GET /tasks` | Every task. An optional `done` query parameter (`true` or `false`) filters them. |
| `GET /tasks/overdue` | Tasks that aren't done and whose due date is before `today`. `today` is an optional query parameter (a `date`), defaulting to today's real date. |
| `GET /tasks/{task_id}` | One task, or `404` with the detail `No task with id 7`. |
| `POST /tasks` | Adds a task (status `201`). The new ID is one more than the biggest so far. |
| `POST /tasks/{task_id}/done` | Marks a task as done, and answers with it. |
| `DELETE /tasks/{task_id}` | Deletes a task (status `204`). |

Delete any old `tasks.json`, start the server with `fastapi dev todo_api.py`, and run this script (`try_tasks.py`) in your second terminal:

```python
import requests

BASE_URL = "http://127.0.0.1:8000"

new_tasks: list[dict[str, str | None]] = [
    {"title": "Buy milk", "due": "2026-10-08"},
    {"title": "Call grandma", "due": None},
    {"title": "Return library book", "due": "2026-10-10"},
    {"title": "Renew passport", "due": "2029-03-01"},
]
for task in new_tasks:
    response = requests.post(f"{BASE_URL}/tasks", json=task, timeout=5)
    print(response.status_code, response.json())

response = requests.post(f"{BASE_URL}/tasks/1/done", timeout=5)
print(response.status_code, response.json())

response = requests.get(f"{BASE_URL}/tasks/overdue?today=2026-10-12", timeout=5)
print(response.status_code, [task["title"] for task in response.json()])

response = requests.delete(f"{BASE_URL}/tasks/2", timeout=5)
print(response.status_code)

response = requests.post(f"{BASE_URL}/tasks/2/done", timeout=5)
print(response.status_code, response.json())

bad_task = {"title": "Party", "due": "2026-02-30"}
response = requests.post(f"{BASE_URL}/tasks", json=bad_task, timeout=5)
print(response.status_code, response.json()["detail"][0]["msg"])
```

Expected output:

```
201 {'title': 'Buy milk', 'due': '2026-10-08', 'id': 1, 'done': False}
201 {'title': 'Call grandma', 'due': None, 'id': 2, 'done': False}
201 {'title': 'Return library book', 'due': '2026-10-10', 'id': 3, 'done': False}
201 {'title': 'Renew passport', 'due': '2029-03-01', 'id': 4, 'done': False}
200 {'title': 'Buy milk', 'due': '2026-10-08', 'id': 1, 'done': True}
200 ['Return library book']
204
404 {'detail': 'No task with id 2'}
422 Input should be a valid date or datetime, day value is outside expected range
```

Now the real test. Stop the server with `Ctrl+C`, start it again, and visit `http://127.0.0.1:8000/tasks`:

```
[{"title":"Buy milk","due":"2026-10-08","id":1,"done":true},{"title":"Return library book","due":"2026-10-10","id":3,"done":false},{"title":"Renew passport","due":"2029-03-01","id":4,"done":false}]
```

The tasks survived. `/tasks?done=false` shows only the last two, and `tasks.json` holds the same three tasks, with the dates saved as ISO text, like `"due": "2026-10-08"`.

<details>
<summary>Hint 1</summary>

Pydantic understands dates: with the hint `due: date | None = None`, the text `"2026-10-08"` in the JSON body becomes a real `date` object ([chapter 22](../22-dates-and-times/notes.md)), and an impossible date like `"2026-02-30"` gets a 422 all by itself. The same goes for the `today: date | None = None` query parameter.

</details>

<details>
<summary>Hint 2</summary>

`json.dump` can't save a `date` ([chapter 21](../21-json-and-csv/notes.md)), but `task.model_dump(mode="json")` gives you a dictionary with the dates already turned into text. Going the other way, `Task(**item)` turns a dictionary loaded from the file back into a `Task`, dates included. Keep the file next to your code with `Path(__file__).parent / "tasks.json"`, like chapter 26.

</details>

<details>
<summary>Hint 3</summary>

Two traps. First, remember Common mistake 2 in the notes: where must `GET /tasks/overdue` go, compared with `GET /tasks/{task_id}`? Second, call your save function at the end of **every** endpoint that changes something (there are three), and load the file once, when the module starts. A missing file just means "no tasks yet".

</details>

---

## Before you move on

You've built the server side: endpoints that check their own data, answer with the right status codes, test themselves, and (in exercise 5) remember things between runs. In [chapter 46](../46-project-expense-tracker-api/notes.md) you'll build a bigger one, backed by a real database.

First, a change of scene. APIs and databases are full of tables of data, and sooner or later someone asks "what did we sell most of last month?" In [chapter 44](../44-working-with-data/notes.md), you'll meet pandas, which answers questions like that in a line or two.
