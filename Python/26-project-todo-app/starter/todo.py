# To-Do List App: todo.py
# ========================
# The command-line program. Run it like this:
#     python todo.py add "Buy milk" --due 2026-10-15
#     python todo.py list
# Build it one milestone at a time, and test after each one.
# The full guide is in this chapter's notes.md.
#
# Milestone 1: (in storage.py) Load and save the tasks
# Milestone 2: Describe the five sub-commands with argparse, and print what was typed
# Milestone 3: list: show the tasks as a table, with overdue ones marked (--all shows done ones too)
# Milestone 4: add: add a task with an optional --due date, and report errors properly
# Milestone 5: done: tick off a task by its ID
# Milestone 6: remove: delete a task by its ID
# Milestone 7: clear-done: delete every done task at once
# Milestone 8: Handle a broken tasks.json, and check everything with mypy
#
# Replace each "pass" with your code, and add type hints to every function
# as you go. The notes show the exact first line of each function.


def build_parser():
    """Create and return the argparse parser, with the sub-commands
    add, list, done, remove and clear-done. (Milestone 2)
    """
    pass


def is_overdue(task, today):
    """Return True if the task isn't done and its due date is before today.
    A task with no due date is never overdue. (Milestone 3)
    """
    pass


def format_task(task, today):
    """Return one row of the task table, as a string. (Milestone 3)"""
    pass


def print_tasks(tasks, show_all, today):
    """Print the table of tasks and a summary line. Done tasks are only
    shown when show_all is True. Returns nothing. (Milestone 3)
    """
    pass


def next_id(tasks):
    """Return the ID for a new task: one more than the biggest ID so far,
    or 1 if there are no tasks. (Milestone 4)
    """
    pass


def parse_due(text):
    """Check a due date typed by the user, like "2026-10-15".
    Return it as text, or None if there isn't one. Raise a ValueError
    with a friendly message if it isn't a real date. (Milestone 4)
    """
    pass


def add_task(tasks, title, due, today):
    """Make a new task, add it to the list, and return it.
    Raise a ValueError if the title is empty. (Milestone 4)
    """
    pass


def find_task(tasks, task_id):
    """Return the task with this ID, or None if there isn't one. (Milestone 5)"""
    pass


def mark_done(tasks, task_id):
    """Tick off the task with this ID, and return it. Raise a ValueError
    if there's no such task, or if it's already done. (Milestone 5)
    """
    pass


def remove_task(tasks, task_id):
    """Delete the task with this ID from the list, and return it.
    Raise a ValueError if there's no such task. (Milestone 6)
    """
    pass


def clear_done(tasks):
    """Return a new list with only the tasks that aren't done. (Milestone 7)"""
    pass


def main():
    """Read the command line, do the job, and save if anything changed.
    It grows a little in every milestone from 2 to 7.
    """
    pass
