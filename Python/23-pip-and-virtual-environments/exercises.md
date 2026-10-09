# 23 pip and Virtual Environments: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- All five exercises share **one** virtual environment, which you make in Exercise 1, right here in this chapter's folder. Look for `(.venv)` in your prompt before you install or run anything.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Am I inside?

Make a virtual environment called `.venv` in this chapter's folder, and activate it. Check that `(.venv)` appears in your prompt, and that `python -m pip list` shows only pip.

Then write `ex1.py`, which prints which Python is running it, and whether that Python is inside a virtual environment.

You need one new fact. The `sys` module has two paths:

- `sys.prefix` is the folder of the Python that is running right now.
- `sys.base_prefix` is the folder of the original Python it was made from.

For your global Python, the two are the same. Inside a virtual environment, they're different.

Expected output with the environment active (your path will be different, but it should end in `.venv\Scripts\python.exe`):

```
Python: C:\Users\Sandip\docs\Python\23-pip-and-virtual-environments\.venv\Scripts\python.exe
Inside a virtual environment: True
```

Now run `deactivate` and run `python ex1.py` again. This time:

```
Python: C:\Users\Sandip\AppData\Local\Programs\Python\Python313\python.exe
Inside a virtual environment: False
```

Activate the environment again before you move on to Exercise 2.

**Rule:** don't type `True` or `False` yourself. Let a comparison work it out.

<details>
<summary>Hint 1</summary>

If PowerShell refuses to run `Activate.ps1`, read "Step 2: Activate it" in the notes again. There's a one-time fix.

</details>

<details>
<summary>Hint 2</summary>

`sys.executable` gives you the first line. For the second, which operator from chapter 04 asks "are these two things different?" It gives you a `bool` straight away.

</details>

---

## Exercise 2 (Easy): The cafe mascot

Your favourite cafe wants a mascot for its menu board. Install `cowsay` into your environment, then write `ex2.py`, which:

1. prints how many characters cowsay has,
2. prints the first and the last character's name,
3. makes the fox announce the special.

Expected output:

```
19 characters to choose from
First: beavis, last: tux
  _________________
| Fresh momo today! |
  =================
                  \
                   \
                    \
                     |\_/|,,_____,~~`
                     (.".)~~     )`~}}
                      \o/\ /---~\\ ~}}
                        _//    _// ~}
```

(If a newer version of cowsay adds characters, your first line may show a bigger number. That's fine.)

**Rule:** don't type `19`, `beavis` or `tux` yourself. Get them from `cowsay.char_names`.

<details>
<summary>Hint 1</summary>

`cowsay.char_names` is an ordinary list. Everything from [chapter 11](../11-lists/notes.md) works on it: `len()`, index `0`, and index `-1`.

</details>

<details>
<summary>Hint 2</summary>

Every character has a function with the same name, just like `cowsay.cow()` in the notes.

</details>

---

## Exercise 3 (Medium): Moving house

Pretend you're moving this project to a brand-new computer. The new computer will get your code and your `requirements.txt`, but **not** your `.venv`. Can you rebuild everything from the list alone?

Do these steps in order, and write down what you see at each step as comments in `ex3.py`:

1. Save your shopping list: `python -m pip freeze > requirements.txt`. Open the file in VS Code. What's inside?
2. Run `deactivate`, then delete the `.venv` folder (right-click it in VS Code's Explorer and choose **Delete**).
3. Run `python ex2.py`. What happens, and why?
4. Make a new `.venv`, activate it, and run `python -m pip list`. Is cowsay there?
5. Install everything from your list with one command. What's the last line pip prints?
6. Run `python ex2.py` again.

At step 1, `requirements.txt` should contain:

```
cowsay==6.1
```

(Or a newer version number.) At step 3 you should see:

```
ModuleNotFoundError: No module named 'cowsay'
```

At step 6, the fox is back.

Finally, answer this in a comment: why is sharing `requirements.txt` better than sharing the `.venv` folder? Give two reasons.

<details>
<summary>Hint 1</summary>

At step 3, which Python is running your file once the environment is gone? Exercise 1 can tell you.

</details>

<details>
<summary>Hint 2</summary>

For step 5, look for the pip option that means "read the package names from this file".

</details>

<details>
<summary>Hint 3</summary>

For the last question, think about size, and about what the environment remembers about the computer it was made on.

</details>

---

## Exercise 4 (Medium): Bug hunt at the help desk

Your friend Maya is trying to set up her first project, and nothing works. She sends you her whole terminal session. Read it from top to bottom:

```
PS C:\Users\Maya\projects> python -m venv .venv
PS C:\Users\Maya\projects> cd quiz
PS C:\Users\Maya\projects\quiz> .venv\Scripts\Activate.ps1
.venv\Scripts\Activate.ps1: The module '.venv' could not be loaded. For more information, run 'Import-Module .venv'.
PS C:\Users\Maya\projects\quiz> python -m pip install cowsay
Successfully installed cowsay-6.1
PS C:\Users\Maya\projects\quiz> python
>>> pip install requests
SyntaxError: invalid syntax
>>> exit()
PS C:\Users\Maya\projects\quiz> python cowsay.py
AttributeError: module 'cowsay' has no attribute 'cow' (consider renaming 'C:\Users\Maya\projects\quiz\cowsay.py' if it has the same name as a library you intended to import)
```

Maya's `cowsay.py` contains:

```python
import cowsay

cowsay.cow("Quiz night is Thursday!")
```

(Some of pip's output was left out to keep it short.) There are **four** separate mistakes in that session (one of them doesn't show an error at all). In `ex4.py`, write a comment for each one: what went wrong, and the command or change that fixes it. Then write the corrected list of commands Maya should type, in order, from making the environment to seeing the cow, as comments too.

Finally, prove the fix works: put Maya's program in a file with a better name in your own folder, and run it. You should see:

```
  _______________________
| Quiz night is Thursday! |
  =======================
                       \
                        \
                          ^__^
                          (oo)\_______
                          (__)\       )\/\
                              ||----w |
                              ||     ||
```

<details>
<summary>Hint 1</summary>

Look at the folder in each prompt. Where did Maya make `.venv`, and where is she when she tries to activate it?

</details>

<details>
<summary>Hint 2</summary>

The silent mistake: look at the prompt in front of `python -m pip install cowsay`. What's missing? Where did cowsay end up?

</details>

<details>
<summary>Hint 3</summary>

The last two mistakes are both in the "Common mistakes" section of the notes.

</details>

---

## Exercise 5 (Challenge): The running club's morning banner

Sandip's running club wants a cheerful banner for its group chat every morning. Write `ex5.py`, which:

1. Imports `cowsay` inside a `try` block ([chapter 18](../18-error-handling/notes.md)). If it isn't installed, it prints the two lines below and stops with exit code 1, using `sys.exit(1)` from [chapter 19](../19-modules-and-standard-library/notes.md):

   ```
   cowsay is not installed. Activate .venv, then run:
   python -m pip install -r requirements.txt
   ```

2. Keeps the race day in a constant: `RACE_DAY = date(2026, 11, 15)` (pick a date in the future if that one has passed).
3. Has a function `make_message(today)` that **returns** the message, built from the day of the week and the number of days until the race ([chapter 22](../22-dates-and-times/notes.md)).
4. Picks a random character from `cowsay.char_names` ([chapter 05](../05-numbers-and-math/notes.md)) and prints its name.
5. Gets the drawing as a string with `cowsay.get_output_string(character, message)` (the same drawing, but returned instead of printed), and prints it.
6. Saves the drawing to `banner.txt` with `with open(...)` and `encoding="utf-8"` ([chapter 20](../20-files-and-folders/notes.md)), then prints how many lines it has.

Also make sure your `requirements.txt` lists cowsay with an exact version.

Here's a run on Friday 9 October 2026, when the random pick was the cow (your day and character will be different):

```
Today's mascot: cow
  ________________________________________________
| Run club meets on Friday! 37 days until the 10K. |
  ================================================
                                                \
                                                 \
                                                   ^__^
                                                   (oo)\_______
                                                   (__)\       )\/\
                                                       ||----w |
                                                       ||     ||
Saved banner.txt (10 lines)
```

Then test the error path: run `deactivate`, run `python ex5.py`, and check you get the two friendly lines instead of a traceback.

<details>
<summary>Hint 1</summary>

The `try` block can hold just the `import cowsay` line. The error to catch is the one you saw in the notes when cowsay was missing.

</details>

<details>
<summary>Hint 2</summary>

Subtracting two dates gives a `timedelta`, and its `.days` is a whole number. `strftime("%A")` gives the name of the day.

</details>

<details>
<summary>Hint 3</summary>

A string's `.splitlines()` gives you a list of its lines. Then you only need `len()`.

</details>

---

## Before you move on

Every command in this chapter came with extra words after it: `pip install cowsay`, `pip freeze`, `-r requirements.txt`. pip is a Python program, so how does it read those words? Could your own programs do the same, like `python greet.py --name Sandip`?

They can, and [chapter 24](../24-command-line-programs/notes.md) shows you how.
