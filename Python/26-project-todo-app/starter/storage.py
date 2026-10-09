# To-Do List App: storage.py
# ===========================
# This module loads and saves the tasks. todo.py imports it.
# The full guide is in this chapter's notes.md.
#
# Milestone 1: Write load_tasks and save_tasks, plus the Task type alias and
#              the TASKS_FILE path at the top of this file.
#              Test it with: python storage.py
# Milestone 8: Make load_tasks turn a broken tasks.json into a friendly
#              ValueError, then check both files with mypy.
#
# Replace each "pass" with your code, and add type hints to every function
# as you go. The notes show the exact first line of each function.


def load_tasks(path):
    """Read the list of tasks from the JSON file at path, and return it.

    If the file doesn't exist yet, return an empty list (no tasks yet).
    """
    pass


def save_tasks(tasks, path):
    """Write the list of tasks to the JSON file at path, replacing what was there.

    Returns nothing.
    """
    pass
