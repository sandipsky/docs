# Expense Tracker API: database.py
# =================================
# Everything that talks to SQLite lives here. main.py imports it.
# The full guide is in this chapter's notes.md.
#
# Milestone 3: DB_PATH, the SCHEMA statement, connect, row_to_expense,
#              add_expense and get_expense.
#              Test them with: python -m app.database
# Milestone 4: get_db, the dependency that gives each request a connection
# Milestone 5: list_expenses, with the category and month filters
# Milestone 6: update_expense and delete_expense
# Milestone 7: get_summary
#
# Replace each "pass" with your code, and add type hints to every function
# as you go. The notes show the exact first line of each function.


def connect(path):
    """Open the database at path, make sure the expenses table exists,
    and return the connection. Rows come back as sqlite3.Row. (Milestone 3)
    """
    pass


def row_to_expense(row):
    """Turn one row from the expenses table into an Expense. (Milestone 3)"""
    pass


def add_expense(con, expense):
    """Save a new expense, and return it with the id the database gave it.
    (Milestone 3)
    """
    pass


def get_expense(con, expense_id):
    """Return the expense with this id, or None if there isn't one.
    (Milestone 3)
    """
    pass


def get_db():
    """Give one request its own connection, and close it afterwards.
    A generator: FastAPI runs it up to the yield before the endpoint,
    and the rest after. (Milestone 4)
    """
    pass


def list_expenses(con, category, month):
    """Return the expenses, oldest first. Only the ones in this category,
    and in this month (like "2026-10"), when those aren't None. (Milestone 5)
    """
    pass


def update_expense(con, expense_id, expense):
    """Replace every field of the expense with this id. Return the updated
    expense, or None if there isn't one. (Milestone 6)
    """
    pass


def delete_expense(con, expense_id):
    """Delete the expense with this id. Return True if one was deleted,
    False if there wasn't one. (Milestone 6)
    """
    pass


def get_summary(con, month):
    """Add up the spending per category, for one month (like "2026-10")
    or for all time when month is None. Return a Summary. (Milestone 7)
    """
    pass
