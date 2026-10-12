"""Tests for library.py and storage.py.

Run them from the project folder (not from inside tests) with:
    python -m pytest
"""

from datetime import date

import pytest

from errors import NotFoundError
from library import Library
from models import Book, Genre, Member

TODAY = date(2026, 10, 12)


@pytest.fixture
def library() -> Library:
    """A small, fresh library for each test: four books, two members, no loans."""
    lib = Library()
    lib.add_book(Book("B001", "Dune", "Frank Herbert", Genre.SCIFI))
    lib.add_book(Book("B002", "Matilda", "Roald Dahl", Genre.CHILDREN))
    lib.add_book(Book("B003", "Holes", "Louis Sachar", Genre.CHILDREN))
    lib.add_book(Book("B004", "Coraline", "Neil Gaiman", Genre.FANTASY))
    lib.add_member(Member("M001", "Sandip"))
    lib.add_member(Member("M002", "Maya"))
    return lib


# Milestone 2
def test_len_and_in(library: Library) -> None:
    assert len(library) == 4
    assert "B002" in library
    assert "B999" not in library


def test_get_book_that_does_not_exist(library: Library) -> None:
    with pytest.raises(NotFoundError, match="B999"):
        library.get_book("B999")


# Milestone 3: write test_clean_id_tidies_up and
# test_clean_id_rejects_bad_shapes here.


# Milestone 4: write test_save_and_load and
# test_failed_save_keeps_the_old_file here.


# Milestone 6: write test_search_ignores_case_and_sorts and
# test_new_book_gets_the_next_id here.


# Milestone 7: write test_lend_gives_14_days, test_cannot_lend_a_book_twice,
# test_three_books_at_most and test_late_return_has_a_fine here.


# Milestone 8: write test_overdue_loans here.
