# Library System: errors.py
# =========================
# Every problem the library can report, as a family of exception classes.
# The full guide is in this chapter's notes.md.
#
# Milestone 2: Give each class the right parent in brackets. LibraryError is
#              the parent of the whole family, and its own parent is Exception.
#              The other five are its children.


class LibraryError:
    """The parent of every library problem. main() catches this one."""


class InvalidIdError:
    """An ID that doesn't have the right shape, like "B1" or "book7"."""


class NotFoundError:
    """An ID with the right shape, but no book or member has it."""


class AlreadyOnLoanError:
    """Someone tried to borrow a book that's already out."""


class NotOnLoanError:
    """Someone tried to return a book that's on the shelf."""


class LoanLimitError:
    """A member with the most books allowed tried to borrow one more."""
