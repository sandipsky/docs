# Library System: models.py
# =========================
# The records the library keeps: books, members and loans.
# Every other file imports from this one.
# The full guide is in this chapter's notes.md.
#
# Milestone 1: Turn Genre into an enum and the other three classes into
#              dataclasses, add the FINE_PER_DAY constant, and write the
#              methods marked (Milestone 1).
#              Test it with: python models.py
#              and with: python -m pytest tests/test_models.py
# Milestone 4: Write to_dict and from_dict for Book, Member and Loan.
#
# Replace each "pass" with your code, and add type hints to every method
# as you go. The notes show the exact first line of each one.


class Genre:
    """The kinds of book the library has: children, classic, fantasy,
    mystery and scifi. (Milestone 1)
    """
    pass


class Book:
    """One book on the library's shelves: an ID like "B001", a title,
    an author and a genre. (Milestone 1)
    """

    def __str__(self):
        """Return the book as text, like "Dune by Frank Herbert". (Milestone 1)"""
        pass

    def to_dict(self):
        """Return the book as a dictionary that json can save. (Milestone 4)"""
        pass

    @classmethod
    def from_dict(cls, data):
        """Make a Book from a dictionary that json loaded. (Milestone 4)"""
        pass


class Member:
    """Someone with a library card: an ID like "M001", and a name. (Milestone 1)"""

    def to_dict(self):
        """Return the member as a dictionary that json can save. (Milestone 4)"""
        pass

    @classmethod
    def from_dict(cls, data):
        """Make a Member from a dictionary that json loaded. (Milestone 4)"""
        pass


class Loan:
    """One time a member borrowed a book: the book's ID, the member's ID,
    the day it was borrowed, the day it's due back, and the day it came
    back (None while it's still out). (Milestone 1)
    """

    def is_overdue(self, today):
        """Return True if the book is still out and today is after the
        due date. (Milestone 1)
        """
        pass

    def days_late(self, today):
        """Return how many days late the book is: counted up to today while
        it's still out, or up to the day it came back. Return 0 if it isn't
        late. (Milestone 1)
        """
        pass

    def fine(self, today):
        """Return the fine in cents: FINE_PER_DAY for every day late. (Milestone 1)"""
        pass

    def to_dict(self):
        """Return the loan as a dictionary that json can save, with the
        dates as text like "2026-10-12". (Milestone 4)
        """
        pass

    @classmethod
    def from_dict(cls, data):
        """Make a Loan from a dictionary that json loaded, turning the
        dates back into real dates. (Milestone 4)
        """
        pass
