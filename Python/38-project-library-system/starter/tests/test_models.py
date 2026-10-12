"""Tests for models.py.

Run them from the project folder (not from inside tests) with:
    python -m pytest
"""

from datetime import date

from models import Book, Genre, Loan

TODAY = date(2026, 10, 12)


# Milestone 1
def test_book_prints_title_and_author() -> None:
    book = Book("B005", "The Hobbit", "J.R.R. Tolkien", Genre.FANTASY)
    assert str(book) == "The Hobbit by J.R.R. Tolkien"


def test_fine_is_25_cents_per_day_late() -> None:
    loan = Loan("B005", "M001", date(2026, 9, 18), date(2026, 10, 2))
    assert loan.is_overdue(TODAY)
    assert loan.days_late(TODAY) == 10
    assert loan.fine(TODAY) == 250


# Milestone 1: write test_returned_loan_is_not_overdue here.


# Milestone 4: write test_loan_survives_a_round_trip here.
