# Library System: storage.py
# ==========================
# Loading and saving the whole library as one JSON file. main.py imports it.
# The full guide is in this chapter's notes.md.
#
# Milestone 4: Write safe_write, save_library and load_library, plus the
#              LIBRARY_FILE path at the top of this file.
#              Test it with: python storage.py
#
# Replace each "pass" with your code, and add type hints to every function
# as you go. The notes show the exact first line of each function.


def safe_write(path):
    """A context manager for saving a text file safely. It opens a
    temporary file next to path, gives it to the with block, and only
    replaces the real file once the with block has finished without an
    error. (Milestone 4)
    """
    pass


def save_library(library, path):
    """Write the whole library (books, members and loans) to the JSON file
    at path, using safe_write. Returns nothing. (Milestone 4)
    """
    pass


def load_library(path):
    """Read the library from the JSON file at path, and return it.
    A missing file gives an empty Library. A broken file raises
    LibraryError with a friendly message. (Milestone 4)
    """
    pass
