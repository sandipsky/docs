# Python: Beginner to Mastery

Python is a programming language that reads almost like English. People use it to build websites, automate boring tasks, work with data, and much more. It's one of the most popular languages in the world, and one of the friendliest to learn first.

This course takes you from your very first line of Python to building real programs and web services the way professionals do. There are 54 chapters in five levels. They go in order, and each one builds on the ones before it.

**Before you start:** nothing! This course assumes you've never programmed before. If you've done the [JavaScript course](../JavaScript/README.md), many ideas (variables, loops, functions) will feel familiar, and the chapters point out where Python does things differently.

## How to use this folder

1. **Read** the chapter's `notes.md`.
2. **Type every example yourself.** Don't copy and paste. Typing it out helps you remember it.
3. **Do the exercises** in `exercises.md`. Try on your own before you open a hint.
4. **Ask Claude to check your work** when you're done or stuck.
5. **Tick the chapter off** below (change `[ ]` to `[x]`).

**What you need:** your computer, Python (free), and VS Code with the Python extension. Chapter 01 walks you through the setup.

**Versions:** this course is written for Python 3.13 or newer. A new version comes out every October, but the basics almost never change, so any recent Python 3 will work. When a chapter uses a newer feature, it will say so. (Python 2 is long retired. If you ever see `print "hello"` with no brackets, that's old Python 2 code, and it won't run today.)

**Projects:** five chapters are projects where you build something real. Some come with a `starter/` folder, so you can focus on the Python.

**Take your time.** Understanding one chapter well beats skimming three. Going back to an earlier chapter is normal, and it's how learning sticks.

---

## Level 1: Foundations

*Goal: learn the basic building blocks and write small programs that make decisions and repeat tasks.*

- [ ] [01 Getting Started](01-getting-started/notes.md): what Python is, installing it, and running your first program
- [ ] [02 Variables](02-variables/notes.md): storing information under a name
- [ ] [03 Data Types](03-data-types/notes.md): text, numbers, true/false, and `None` (Python's word for "nothing")
- [ ] [04 Operators](04-operators/notes.md): doing math and comparing values
- [ ] [05 Numbers and Math](05-numbers-and-math/notes.md): whole numbers vs. decimals, rounding, random numbers, and the `math` module
- [ ] [06 Strings](06-strings/notes.md): working with text, slicing, and f-strings
- [ ] [07 Input and Output](07-input-and-output/notes.md): asking the user questions with `input()` and printing tidy answers
- [ ] [08 Conditionals](08-conditionals/notes.md): making decisions with `if`, `elif`, and `else`
- [ ] [09 Loops](09-loops/notes.md): repeating things with `for` and `while`
- [ ] [10 Functions](10-functions/notes.md): reusable blocks of code with `def`
- [ ] [11 Lists](11-lists/notes.md): ordered collections of things
- [ ] [12 Tuples and Sets](12-tuples-and-sets/notes.md): lists that can't change, and collections with no duplicates
- [ ] [13 Dictionaries](13-dictionaries/notes.md): looking things up by name, like a real dictionary
- [ ] [14 Project: Shopping Cart](14-project-shopping-cart/notes.md): put Level 1 together in a real program

## Level 2: Writing Better Python

*Goal: write cleaner code, handle things that go wrong, and save your data so it survives after the program ends.*

- [ ] [15 Comprehensions](15-comprehensions/notes.md): building lists and dictionaries in one line
- [ ] [16 Scope and Mutability](16-scope-and-mutability/notes.md): where variables can be seen, and why copying a list can surprise you
- [ ] [17 Recursion](17-recursion/notes.md): functions that call themselves
- [ ] [18 Error Handling](18-error-handling/notes.md): dealing with things that go wrong using `try` and `except`
- [ ] [19 Modules and the Standard Library](19-modules-and-standard-library/notes.md): splitting code into files, and the toolbox Python ships with
- [ ] [20 Files and Folders](20-files-and-folders/notes.md): reading and writing files, and finding your way around with `pathlib`
- [ ] [21 JSON and CSV](21-json-and-csv/notes.md): saving structured data, and reading spreadsheet-style files
- [ ] [22 Dates and Times](22-dates-and-times/notes.md): working with calendars and clocks
- [ ] [23 pip and Virtual Environments](23-pip-and-virtual-environments/notes.md): installing other people's code, and keeping each project's packages separate
- [ ] [24 Command-Line Programs](24-command-line-programs/notes.md): programs that take options, like `python app.py --name Sandip`
- [ ] [25 Type Hints](25-type-hints/notes.md): telling Python (and your editor) what kind of value a variable holds
- [ ] [26 Project: To-Do List App](26-project-todo-app/notes.md): a terminal app that remembers your tasks between runs

## Level 3: Objects and Advanced Python

*Goal: model real-world things with classes, and use the features that make Python code short and powerful.*

- [ ] [27 Classes and Objects](27-classes-and-objects/notes.md): blueprints for things, like a `BankAccount` with a balance
- [ ] [28 Inheritance](28-inheritance/notes.md): building new classes from old ones
- [ ] [29 Dunder Methods](29-dunder-methods/notes.md): `__str__`, `__eq__`, `__len__`, and how your objects plug into Python
- [ ] [30 Dataclasses and Enums](30-dataclasses-and-enums/notes.md): less typing for classes that mainly hold data, and fixed sets of choices
- [ ] [31 Iterators and Generators](31-iterators-and-generators/notes.md): values one at a time, on demand, with `yield`
- [ ] [32 Decorators](32-decorators/notes.md): wrapping a function to add extra behavior
- [ ] [33 Context Managers](33-context-managers/notes.md): how `with` cleans up after you, and writing your own
- [ ] [34 Functional Tools](34-functional-tools/notes.md): `lambda`, `map`, `filter`, `sorted` with `key`, and `functools`
- [ ] [35 Regular Expressions](35-regular-expressions/notes.md): finding patterns in text
- [ ] [36 Testing with pytest](36-testing-with-pytest/notes.md): proving your code works
- [ ] [37 Debugging and Logging](37-debugging-and-logging/notes.md): finding bugs with the debugger, and keeping a record of what your program did
- [ ] [38 Project: Library System](38-project-library-system/notes.md): books, members, and loans, built with classes and saved to a file

## Level 4: Python in the Real World

*Goal: use Python for the jobs people actually hire it for: the internet, databases, data, and automation.*

**Before chapter 42:** Levels 1 to 3 of the [PostgreSQL course](../PostgreSQL/README.md) will help. The SQLite part needs nothing extra.

- [ ] [39 Project Structure and Packaging](39-project-structure-and-packaging/notes.md): laying out a real project with `pyproject.toml`, and sharing it with others
- [ ] [40 Working with APIs](40-working-with-apis/notes.md): getting data from the internet with `requests`
- [ ] [41 Web Scraping](41-web-scraping/notes.md): pulling information out of web pages, and doing it politely
- [ ] [42 Databases](42-databases/notes.md): saving data in SQLite, and connecting to PostgreSQL
- [ ] [43 Building a Web API with FastAPI](43-building-a-web-api-with-fastapi/notes.md): writing the server side that your [React](../React/README.md) apps can talk to
- [ ] [44 Working with Data](44-working-with-data/notes.md): a first look at pandas for tables of data
- [ ] [45 Automating Tasks](45-automating-tasks/notes.md): scripts that rename files, run other programs, and do boring jobs for you
- [ ] [46 Project: Expense Tracker API](46-project-expense-tracker-api/notes.md): a FastAPI service with a database, ready for a React front end

## Level 5: Mastery

*Goal: understand how Python runs your code, write code other people enjoy reading, and ship it.*

- [ ] [47 Async Python](47-async-python/notes.md): doing many slow things at once with `async` and `await`
- [ ] [48 Threads, Processes and the GIL](48-threads-processes-and-the-gil/notes.md): the other ways to do more than one thing at a time, and the catch
- [ ] [49 Performance](49-performance/notes.md): measuring what's slow before you guess, and the usual fixes
- [ ] [50 Clean Code and Style](50-clean-code-and-style/notes.md): PEP 8, tools like Ruff, and what "Pythonic" really means
- [ ] [51 Design Patterns](51-design-patterns/notes.md): proven solutions to common problems, the Python way
- [ ] [52 Security Basics](52-security-basics/notes.md): keeping secrets out of your code, and your users safe
- [ ] [53 Deploying](53-deploying/notes.md): putting a Python app online with Docker and a cloud host
- [ ] [54 Final Project](54-final-project/notes.md): build something of your own, from start to finish

---

**After this:** Django is the big, batteries-included web framework, and it's a natural next step after FastAPI. If data interests you, NumPy, pandas, and machine learning with scikit-learn are where Python really shines. Each of these could get its own folder.
