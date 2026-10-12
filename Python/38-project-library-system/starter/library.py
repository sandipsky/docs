# Library System: library.py
# ==========================
# The Library class: all the books and members, every loan, and the rules.
# main.py and storage.py import it.
# The full guide is in this chapter's notes.md.
#
# Milestone 2: The Library class: __init__, __len__, __contains__,
#              add_book, add_member, get_book and get_member.
#              Test it with: python library.py
# Milestone 3: clean_id, to check IDs with a regular expression.
# Milestone 5: current_loan, loans_of, sorted_books and available_books.
# Milestone 6: next_id, search, new_book and new_member.
# Milestone 7: lend and return_book, plus the LOAN_DAYS and MAX_LOANS rules.
# Milestone 8: overdue_loans, a generator.
# Milestone 9: Log every change with the logging module.
#
# Replace each "pass" with your code, and add type hints to every function
# and method as you go. The notes show the exact first line of each one.


def clean_id(text, prefix):
    """Tidy up an ID that someone typed, like " b001 " -> "B001", and return
    it. Raise InvalidIdError unless it's the prefix letter followed by
    exactly three digits. (Milestone 3)
    """
    pass


def next_id(ids, prefix):
    """Return the ID that comes after the biggest one in the list:
    ["B001", "B007"] -> "B008". An empty list gives "B001". (Milestone 6)
    """
    pass


class Library:
    """All the books and members, and every loan, past and present."""

    def __init__(self):
        """Start with no books, no members and no loans. (Milestone 2)"""
        pass

    def __len__(self):
        """Return how many books the library has. (Milestone 2)"""
        pass

    def __contains__(self, book_id):
        """Return True if the library has a book with this ID. (Milestone 2)"""
        pass

    def add_book(self, book):
        """Put a book into the library. (Milestone 2)"""
        pass

    def add_member(self, member):
        """Put a member into the library. (Milestone 2)"""
        pass

    def get_book(self, book_id):
        """Return the book with this ID. Raise NotFoundError if there's
        no such book. (Milestone 2, and Milestone 3 checks the ID first.)
        """
        pass

    def get_member(self, member_id):
        """Return the member with this ID. Raise NotFoundError if there's
        no such member. (Milestone 2, and Milestone 3 checks the ID first.)
        """
        pass

    def current_loan(self, book_id):
        """Return the loan of this book that hasn't been returned yet,
        or None if the book is on the shelf. (Milestone 5)
        """
        pass

    def loans_of(self, member_id):
        """Return a list of this member's loans that haven't been returned
        yet. (Milestone 5)
        """
        pass

    def sorted_books(self):
        """Return a list of all the books, sorted by title. (Milestone 5)"""
        pass

    def available_books(self):
        """Return a list of the books on the shelf, sorted by title. (Milestone 5)"""
        pass

    def search(self, text):
        """Return a list of the books whose title or author contains the text,
        ignoring capital letters, sorted by title. (Milestone 6)
        """
        pass

    def new_book(self, title, author, genre):
        """Make a book with the next free ID, add it, and return it.
        Raise LibraryError if the title or author is empty. (Milestone 6)
        """
        pass

    def new_member(self, name):
        """Make a member with the next free ID, add them, and return them.
        Raise LibraryError if the name is empty. (Milestone 6)
        """
        pass

    def lend(self, book_id, member_id, today):
        """Lend a book to a member, and return the new loan. Raise the right
        error if the book is already out, or the member has too many books.
        (Milestone 7)
        """
        pass

    def return_book(self, book_id, today):
        """Mark a book as returned today, and return its loan. Raise
        NotOnLoanError if the book isn't out. (Milestone 7)
        """
        pass

    def overdue_loans(self, today):
        """Yield every loan that's overdue today, one at a time. (Milestone 8)"""
        pass
