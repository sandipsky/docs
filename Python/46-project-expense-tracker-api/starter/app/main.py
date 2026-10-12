# Expense Tracker API: main.py
# =============================
# The web part: the FastAPI app, its endpoints, status codes and errors.
# Run it from the project folder (the one with requirements.txt) with:
#     fastapi dev app/main.py
# The full guide is in this chapter's notes.md.
#
# Milestone 1: Create the app, and a health check
# Milestone 2: GET /categories
# Milestone 4: POST /expenses and GET /expenses/{expense_id}
# Milestone 5: GET /expenses, with ?category= and ?month= filters
# Milestone 6: PUT /expenses/{expense_id} and DELETE /expenses/{expense_id}
# Milestone 7: GET /summary
# Milestone 9: Let the React app in with CORS
#
# Replace each "pass" with your code, and add the @app decorator and type
# hints to every function as you go. The notes show the exact first lines.


def health():
    """GET /health: a quick check that the API is up. (Milestone 1)"""
    pass


def list_categories():
    """GET /categories: every category an expense can have. (Milestone 2)"""
    pass


def create_expense(expense, con):
    """POST /expenses: save a new expense and return it, with status 201.
    (Milestone 4)
    """
    pass


def read_expense(expense_id, con):
    """GET /expenses/{expense_id}: return one expense, or a 404 error.
    (Milestone 4)
    """
    pass


def read_expenses(con, category, month):
    """GET /expenses: list the expenses, oldest first, filtered by
    ?category=food and ?month=2026-10 when those are given. (Milestone 5)
    """
    pass


def replace_expense(expense_id, expense, con):
    """PUT /expenses/{expense_id}: replace every field of an expense,
    or a 404 error. (Milestone 6)
    """
    pass


def remove_expense(expense_id, con):
    """DELETE /expenses/{expense_id}: delete an expense (status 204),
    or a 404 error. (Milestone 6)
    """
    pass


def read_summary(con, month):
    """GET /summary: totals per category, for ?month=2026-10 or for all time.
    (Milestone 7)
    """
    pass
