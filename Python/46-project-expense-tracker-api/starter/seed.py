# Expense Tracker API: seed.py
# =============================
# Adds eight sample expenses to your API, so you have something to list and
# add up. It's a small API client, like the ones in chapter 40.
#
# It's ready to use: you don't need to change anything in this file.
# It needs milestone 4 (POST /expenses) to be working.
#
# 1. Start the API in one terminal:  fastapi dev app/main.py
# 2. Run this in a second terminal (with .venv active):  python seed.py
#
# For a fresh start with ids 1 to 8, delete expenses.db before step 2.
#
# It uses httpx, which came with fastapi[standard]. httpx works almost
# exactly like requests: httpx.post(url, json=...), .status_code, .json().

import sys

import httpx

API_URL = "http://127.0.0.1:8000"

SAMPLE_EXPENSES = [
    ("Bus pass for October", 5500, "transport", "2026-10-01"),
    ("Electricity bill", 6230, "bills", "2026-10-02"),
    ("Lunch with Maya", 1450, "food", "2026-10-03"),
    ("Cinema tickets with Leo", 2400, "fun", "2026-10-04"),
    ("Coffee beans", 1275, "food", "2026-10-07"),
    ("Phone bill", 3000, "bills", "2026-10-09"),
    ("Birthday present for Zoe", 2599, "shopping", "2026-10-11"),
    ("Groceries at Fresh Mart", 4520, "food", "2026-09-28"),  # an old receipt
]


def main() -> None:
    """Send each sample expense to the API, and print what came back."""
    for description, amount_cents, category, spent_on in SAMPLE_EXPENSES:
        body = {
            "description": description,
            "amount_cents": amount_cents,
            "category": category,
            "spent_on": spent_on,
        }
        try:
            response = httpx.post(f"{API_URL}/expenses", json=body, timeout=5)
        except httpx.ConnectError:
            print(f"Error: can't reach the API at {API_URL}. Is it running?")
            sys.exit(1)
        if response.status_code != 201:
            print(f"Error: the API said {response.status_code}: {response.text}")
            sys.exit(1)
        saved = response.json()
        dollars = saved["amount_cents"] / 100
        print(f"Added expense {saved['id']}: {saved['description']} (${dollars:.2f})")


if __name__ == "__main__":
    main()
