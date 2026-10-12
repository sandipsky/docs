# Expense Tracker API: models.py
# ===============================
# The shapes of the data that goes in and out of the API, as Pydantic models.
# The full guide is in this chapter's notes.md.
#
# Milestone 2: Write Category, ExpenseIn and Expense.
#              Test them with: python app/models.py
# Milestone 7: Write CategoryTotal and Summary.
#
# Replace each "pass" with your code. The notes show what goes in each class.


class Category:
    """The six categories an expense can have, as a StrEnum:
    food, transport, bills, shopping, fun and other. (Milestone 2)
    """
    pass


class ExpenseIn:
    """What a client sends to create or change an expense: a description,
    an amount in cents, a category and the date it was spent. (Milestone 2)
    """
    pass


class Expense:
    """An expense as the API sends it back: everything in ExpenseIn,
    plus its id. (Milestone 2)
    """
    pass


class CategoryTotal:
    """How much was spent in one category, and on how many expenses.
    (Milestone 7)
    """
    pass


class Summary:
    """The totals for one month, or for all time when there's no month.
    (Milestone 7)
    """
    pass
