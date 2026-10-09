# 01 Getting Started

## What is it?

Python is a **programming language**: a way to give instructions to a computer, the way a recipe gives instructions to a cook.

Python is famous for reading almost like plain English. It was created by Guido van Rossum and first came out in 1991. It's named after the British comedy show *Monty Python's Flying Circus*, not the snake.

## Why does it matter?

Python is one of the most popular languages in the world, because one language can do a huge range of jobs:

- **Websites and web services.** The part of a website that runs on a server, out of sight: logging you in, saving your order, sending emails.
- **Automation.** Boring jobs you'd otherwise do by hand, like renaming 500 photos or copying numbers from one spreadsheet into another.
- **Data.** Reading big tables of numbers, finding patterns, and drawing charts.
- **AI and machine learning.** Most of the tools people use to build AI are written for Python.
- **Small gadgets.** Python runs on tiny computers like the Raspberry Pi, so people use it to build weather stations and robots.

Picture renaming 500 holiday photos by hand: click, type, Enter, 500 times. That's an afternoon gone. A Python program can do it in under a second, and you'll be able to write one by the end of this course.

And because Python reads so much like English, it's one of the friendliest first languages. You spend your energy on the ideas, not on fighting strange symbols.

> **Where does Python run?** Not in a web browser. (That's JavaScript's job.) Python runs on your own computer, on servers in the cloud, and on little boards like the Raspberry Pi. That's why the first step is installing it.

## Real-world example

Think of cooking from a recipe:

| In the kitchen | In Python |
|---|---|
| The recipe card | Your Python file (it ends in `.py`) |
| The cook who reads the recipe and does each step | The Python **interpreter** |
| One step on the card, like "boil the water" | One line of code, called a **statement** |
| Doing the steps in order, from the top | Python runs your code from top to bottom |
| Tasting a spoonful as you go | The REPL, where you try one line at a time (more on it soon) |

An **interpreter** is a program that reads your code and carries it out, one line at a time. When you "install Python", you're really installing this interpreter. Without it, your computer has no idea what a `.py` file means, just like a recipe is useless without a cook.

## How it works

You need two things before you write any code: Python itself, and a good editor to write it in. Let's set up both, one step at a time.

### Step 1: Install Python (Windows 11)

1. Open your web browser and go to [python.org](https://www.python.org).
2. Click **Downloads**. The site guesses that you're on Windows and shows a big yellow button like **Download Python 3.13.x**. The numbers will be different by the time you read this. Pick the newest version that starts with `3`.
3. Open the file you downloaded to start the installer.
4. **Before you click anything else**, look at the bottom of the first screen. Tick the box that says **Add python.exe to PATH**.
5. Click **Install Now** and wait for it to finish.
6. At the end, you may see a button called **Disable path length limit**. It's optional. Clicking it lets Windows handle very long folder names, and it does no harm.

Why that box in step 4? **PATH** is a list of folders that Windows searches when you type a command. If Python's folder is on the list, you can type `python` in any terminal and Windows finds it. If it isn't, Windows says it has never heard of `python`.

> **Watch out:** the PATH box is not ticked for you. Forgetting it is the most common setup problem on Windows. If you missed it, the "If something goes wrong" section below shows how to fix it.

> **Note:** python.org is slowly moving Windows users to a newer tool called the **Python install manager**. If the download page offers you that instead of the installer above, that's fine too: run it, follow its prompts, and it sets up the `python` command for you. Then carry on with Step 2.

### Step 2: Check that it worked

You type commands into a **terminal**: a window where you talk to the computer by typing instead of clicking. Windows has one built in, and VS Code has one too.

If a terminal was already open, close it and open a new one, so it picks up the new PATH. Then type this and press `Enter`:

```
python --version
```

You'll see something like:

```
Python 3.13.15
```

Any version that starts with `Python 3` is fine. This course is written for 3.13 or newer, and the basics barely change from one version to the next.

### If something goes wrong

**Typing `python` opens the Microsoft Store.** This is a famous Windows trap. Windows 11 has a shortcut that sends `python` to the Microsoft Store when it can't find the real Python. In a terminal you might see a message that starts with `Python was not found` instead.

- If you haven't installed Python yet, close the Store and install it from python.org (Step 1).
- If you *have* installed it and the Store still opens, turn the shortcut off: open **Settings**, go to **Apps**, then **Advanced app settings**, then **App execution aliases**. Switch off the two entries called **App Installer python.exe** and **App Installer python3.exe**. Then open a fresh terminal and try again.

**Windows says it doesn't recognize `python`.** Python is probably installed, but the PATH box wasn't ticked. Try the **Python launcher** instead, a small helper that the python.org installer adds for you:

```
py --version
```

If that shows a version, you have two choices:

- Use `py` wherever this course says `python` (for example `py hello.py`). It works just as well.
- Or run the installer again, choose **Uninstall**, then install once more with **Add python.exe to PATH** ticked.

**On a Mac or Linux?** The command is usually `python3`, not `python`. Check with `python3 --version`. Most Linux systems come with Python already. On a Mac, get the macOS installer from python.org. Everywhere this course says `python`, type `python3` instead. This is the only chapter that mentions it.

### Step 3: Set up VS Code

**VS Code** (Visual Studio Code) is a free code editor from Microsoft. An **editor** is like a word processor made for code: it colors your code so it's easier to read, and it warns you about mistakes as you type.

1. If you don't have VS Code yet, download it from [code.visualstudio.com](https://code.visualstudio.com) and install it.
2. Open VS Code and click the **Extensions** icon on the left (four little squares), or press `Ctrl+Shift+X`.
3. Search for **Python**. Install the one called **Python** made by **Microsoft**. Check the publisher name, because there are many look-alikes.

An **extension** is an add-on that teaches VS Code new tricks. The Python extension brings two helpers along with it: **Pylance**, which suggests code as you type and underlines mistakes, and the **Python Debugger**, a tool for finding bugs that you'll meet much later.

VS Code usually finds your Python by itself. You can check by opening any `.py` file and looking at the bottom-right corner of the window: you should see a version number like `3.13.15`. If you see **Select Interpreter** instead, click it and pick the Python you just installed.

### Way 1: The REPL (try it right now)

There are two ways to run Python code. The first is the **REPL**, which stands for Read, Evaluate, Print, Loop: Python reads one line, works it out, prints the answer, and waits for the next one. It's like a calculator that speaks Python.

In VS Code, open a terminal (**Terminal**, then **New Terminal**) and type:

```
python
```

You'll see a few lines about your Python version, then three arrows:

```
>>>
```

The `>>>` is Python saying "I'm listening". Type `2 + 3` and press `Enter`. Then try `print("Hello")`:

```
>>> 2 + 3
5
>>> print("Hello")
Hello
```

🎉 You just ran your first Python!

When you're done, leave the REPL by typing this and pressing `Enter`:

```
>>> exit()
```

You're back at the normal terminal. (In Python 3.13 and newer, plain `exit` works too.)

The REPL is a scratchpad. It's perfect for quick experiments, but everything you typed disappears when you leave.

> **Tip:** The REPL shows the answer to anything you type, even without `print()`. A file doesn't. In a file, nothing appears on screen unless you `print()` it. Keep that difference in mind when you move between the two.

### Way 2: A file (we'll use this most)

To keep your code, save it in a file and run the whole file.

**Step 1: Create a file.** In VS Code's Explorer (the file list on the left), make a new file called `hello.py` in this chapter's folder. Every Python file ends in `.py`. Type this line into it:

```python
print("Hello, world!")
```

Save it with `Ctrl+S`.

**Step 2: Run it.** Right-click the chapter folder in the Explorer, choose **Open in Integrated Terminal**, and type:

```
python hello.py
```

You'll see:

```
Hello, world!
```

That's the whole routine for the rest of the course: write a file, save it, run it with `python` and the file name.

> **Watch out:** the terminal has to be "standing in" the same folder as your file, or Python can't find it. That's why you open the terminal by right-clicking the folder.

> **Tip:** VS Code also has a ▶ (Run) button at the top right of the editor. It works, but this course uses the terminal, so you always know exactly which file is running and from where.

### What is `print()`?

`print()` shows something on the screen. It's how your program talks back to you, and you'll use it all the time to check what your code is doing.

```python
print("Hello, world!")
```

- `print` is a **function**: a named action that Python already knows how to do. You run it by writing its name followed by brackets. (You'll write your own functions in chapter 10.)
- `( )` holds what you want to show.
- `"Hello, world!"` is the text. Text always goes inside quotes.

Text in programming is called a **string** (a "string" of characters, like beads on a thread). You can use double quotes `"..."` or single quotes `'...'`. This course uses double quotes, but both work, as long as the start and end match.

### Text vs. numbers

```python
print("5 + 3")  # prints: 5 + 3
print(5 + 3)  # prints: 8
```

- **With quotes**, Python treats it as text and prints it exactly as written.
- **Without quotes**, Python treats it as numbers and does the math.

Python knows the usual math symbols. `*` means multiply and `/` means divide:

```python
print(10 + 4)  # prints: 14
print(10 - 4)  # prints: 6
print(10 * 4)  # prints: 40
print(10 / 4)  # prints: 2.5
print(12 / 4)  # prints: 3.0
```

Notice the last one: `12 / 4` gives `3.0`, not `3`. In Python, dividing with `/` always gives a number with a decimal point. [Chapter 04](../04-operators/notes.md) explains why, and shows how to get a whole number when you want one.

You can print several things at once by separating them with commas. Python puts a space between them for you:

```python
print("Total:", 5 + 3)  # prints: Total: 8
print("Sandip", "is", 25)  # prints: Sandip is 25
```

### Comments

A **comment** is a note for humans. Python ignores it completely. A comment starts with `#` and runs to the end of the line:

```python
# This is a comment. Python skips this whole line.
print("Hi")  # A comment can also go at the end of a line.

# Python has no special symbol for a long comment.
# For a longer note, start each line with #.
print("Bye")
```

You'll see:

```
Hi
Bye
```

Think of comments as sticky notes in a textbook. They don't change the book, but they help you (and others) understand it later.

> **Tip:** When a comment goes at the end of a line, put two spaces before the `#`. Python doesn't care, but it's the tidy, standard way to write it, and this course does it everywhere.

### Capital letters matter

Python is **case-sensitive**: it treats capital and small letters as different. To Python, `print` and `Print` are two completely different words, and it only knows the first one.

```python
Print("Hi")
```

You'll see this error (the last line of the message):

```
NameError: name 'Print' is not defined. Did you mean: 'print'?
```

Python even guesses what you meant. Newer versions of Python are very good at these helpful hints.

### Code runs from top to bottom

```python
print("Step 1: Boil water")
print("Step 2: Add pasta")
print("Step 3: Eat!")
```

You'll see:

```
Step 1: Boil water
Step 2: Add pasta
Step 3: Eat!
```

Each line is a **statement**, which is one instruction. Python runs them in order, from the top of the file to the bottom, like the steps in a recipe.

Python doesn't need anything at the end of a line. The end of the line is the end of the statement.

> **If you did the [JavaScript course](../../JavaScript/README.md):** no semicolons! Python allows them, but nobody writes them. And `console.log()` is just `print()`.

### Spaces at the start of a line matter

Here's something that makes Python different from most languages. The spaces at the very start of a line, called **indentation**, have a meaning in Python. Add a space where Python doesn't expect one, and it refuses to run:

```python
 print("Hi")
```

There's one space before `print`. You'll see:

```
IndentationError: unexpected indent
```

For now, the rule is easy: **start every line at the left edge.** Later, in [chapter 08](../08-conditionals/notes.md), you'll use indentation on purpose to group lines together, and it'll all make sense.

### Reading an error message

Everyone gets errors, all the time, including people who have programmed for 20 years. The skill isn't avoiding errors. It's reading them.

Here's a small file called `cafe.py` with a mistake on line 2:

```python
print("Welcome to the cafe")
print(menu)
print("Open 7 days a week")
```

When you run it, you'll see something like this (your folder path will be different):

```
Welcome to the cafe
Traceback (most recent call last):
  File "C:\Users\Sandip\docs\Python\01-getting-started\cafe.py", line 2, in <module>
    print(menu)
          ^^^^
NameError: name 'menu' is not defined
```

This whole report is called a **traceback**: Python's trail of where it was and what went wrong. It looks scary, but you only need to read it in this order:

1. **Read the last line first.** It names the kind of error (`NameError`) and says what's wrong: Python has never heard of anything called `menu`. (`menu` has no quotes, so Python thinks it's a name, not text.)
2. **Then look just above it.** `line 2` tells you where the problem is, and the `^^^^` marks point at the exact spot.
3. Ignore `in <module>` for now. It just means "in the main part of your file".

Notice that `Welcome to the cafe` was printed before the error. Python ran line 1 happily, then stopped at line 2. Line 3 never ran.

There's a second kind of error you'll meet a lot: the **SyntaxError**. **Syntax** means the grammar rules of a language. A SyntaxError means Python couldn't even read your file, so it doesn't run a single line:

```python
print("Welcome to the cafe"
print("Open 7 days a week")
```

You'll see:

```
  File "C:\Users\Sandip\docs\Python\01-getting-started\cafe.py", line 1
    print("Welcome to the cafe"
         ^
SyntaxError: '(' was never closed
```

This time nothing was printed at all. Python checks the grammar of the whole file first, and only runs it if the grammar is fine.

| Error | What it means | A common cause |
|---|---|---|
| `NameError` | "I don't know that name." | Missing quotes, a typo, or wrong capital letters |
| `SyntaxError` | "I can't read this. The grammar is broken." | A missing bracket or quote |
| `IndentationError` | "There are spaces where I didn't expect them." | A space at the start of a line |

> **Tip:** Error messages are your friend, not your enemy. Read the last line first. It usually tells you exactly what went wrong.

## Common mistakes

**1. Forgetting quotes around text**

```python
print(Hello)
# NameError: name 'Hello' is not defined
```

Without quotes, Python thinks `Hello` is the name of something it should already know about. Fix: `print("Hello")`.

**2. Mixing quote types**

```python
print("Hello')
# SyntaxError: unterminated string literal (detected at line 1)
```

"Unterminated" means "never ended". The text starts with `"`, so Python keeps looking for another `"` to end it, and never finds one. Start and end with the same kind of quote. Both `"Hello"` and `'Hello'` work, just don't mix them.

**3. Wrong capital letters**

```python
Print("Hi")
# NameError: name 'Print' is not defined. Did you mean: 'print'?
```

Python is case-sensitive. `print` is always all lowercase. Fix: `print("Hi")`.

**4. Forgetting the closing bracket**

```python
print("Hi"
# SyntaxError: '(' was never closed
```

Every `(` needs a matching `)`. VS Code helps here: click next to a bracket, and it highlights the matching one.

**5. Running `python` from the wrong folder**

```
python hello.py
C:\...\python.exe: can't open file 'C:\...\hello.py': [Errno 2] No such file or directory
```

Your terminal isn't in the same folder as your file, so Python looked in the wrong place. Open the terminal by right-clicking the folder that holds your file, and try again. (Also check the file name is spelled right, and that you saved it.)

**6. Typing a terminal command inside the REPL**

```
>>> python hello.py
SyntaxError: invalid syntax
```

The `>>>` means you're inside Python, which only understands Python code. `python hello.py` is a command for the terminal. Leave the REPL with `exit()` first, then run your file.

## Quick recap

- Python is a friendly, popular language for websites, automation, data, AI and more. It runs on your computer, not in the browser.
- Install it from python.org and tick **Add python.exe to PATH**. Check it with `python --version` (or `py --version` on Windows, `python3 --version` on Mac and Linux).
- Use VS Code with the **Python** extension by Microsoft.
- The REPL (`>>>`) is for quick experiments. To run a saved file, use `python filename.py` from a terminal in the same folder.
- `print()` shows things on the screen. Text needs quotes, numbers and math don't. `#` starts a comment.
- Python is case-sensitive, runs from top to bottom, and cares about spaces at the start of a line.
- When you get an error, read the last line of the traceback first.

---

**Next:** try the [exercises](exercises.md), then move on to [02 Variables](../02-variables/notes.md).
