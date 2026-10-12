# Library System: main.py
# =======================
# The command-line program. Run it like this:
#     python main.py books
#     python main.py --today 2026-10-12 lend B001 M004
# Build it one milestone at a time, and test after each one.
# The full guide is in this chapter's notes.md.
#
# Milestone 1: (models.py) Books, members and loans
# Milestone 2: (errors.py, library.py) The family of errors, and the Library class
# Milestone 3: (library.py) Check IDs with a regular expression
# Milestone 4: (models.py, storage.py) Save and load the library safely
# Milestone 5: The command line, and the books and members lists
# Milestone 6: search, add-book and add-member
# Milestone 7: lend and return, with the library's rules
# Milestone 8: overdue: late books and their fines
# Milestone 9: Keep a log file, and a final check
#
# Replace each "pass" with your code, and add type hints to every function
# as you go. The notes show the exact first line of each function.


def format_money(cents):
    """Return an amount of cents as text, like 250 -> "$2.50". (Milestone 7)"""
    pass


def plural(count, word, words):
    """Return the count with the right word: plural(1, "book", "books") is
    "1 book", and plural(3, "book", "books") is "3 books". (Milestone 5)
    """
    pass


def build_parser():
    """Create and return the argparse parser, with the --today option and
    the sub-commands books, search, add-book, members, add-member, lend,
    return and overdue. (Milestone 5)
    """
    pass


def book_status(library, book, today):
    """Return where a book is, like "on the shelf" or
    "on loan to Maya, due 2026-10-20". (Milestone 5)
    """
    pass


def print_books(library, books, today):
    """Print a table of books with their status. Returns nothing. (Milestone 5)"""
    pass


def print_members(library):
    """Print a table of members, with how many books each one has.
    Returns nothing. (Milestone 5)
    """
    pass


def print_overdue(library, today):
    """Print a table of overdue loans, most overdue first, with the fines,
    and a summary line. Returns nothing. (Milestone 8)
    """
    pass


def run_command(args, library, today):
    """Do the job the user asked for. Return True if the library changed
    and needs saving, False if not. It grows in every milestone from 5 to 8.
    """
    pass


def main():
    """Read the command line, load the library, run the command, and save
    if anything changed. Errors become a friendly message and exit code 1.
    (Milestone 5, and Milestone 9 adds logging.)
    """
    pass
