# 23 pip and Virtual Environments

## What is it?

A **package** is code that someone else wrote and shared, so you can use it in your own programs. **pip** is the tool that downloads and installs packages for you.

A **virtual environment** is a private shelf of packages that belongs to one project. Each project gets its own shelf, with exactly the packages it needs.

## Why does it matter?

The standard library from [chapter 19](../19-modules-and-standard-library/notes.md) is a big toolbox, but it doesn't have everything. Want to draw charts, fetch data from a website, or add colour to your terminal? Somebody has probably written that code already and shared it for free. There are more than half a million packages to pick from.

But if you try to use one before installing it, Python can't find it:

```python
import cowsay

cowsay.cow("Hello!")
```

You'll see:

```
ModuleNotFoundError: No module named 'cowsay'
```

So you need a way to install packages. That's pip's job.

There's a second problem too, and it's sneakier. Picture two projects on your computer:

- An old school project that was written for version 1 of a package.
- A brand-new project that needs version 2 of the same package.

If every package lives in one shared place, only one version can be installed at a time. Upgrade it for the new project, and the old one breaks. Go back to version 1 for the old project, and the new one breaks.

A virtual environment fixes this. Each project keeps its own packages in its own folder, so the two projects never fight.

## Real-world example

Think about an art school. There's one huge storeroom with every supply you can imagine. Each class has its own cupboard, filled with only what that class needs: paints for the painting class, clay for the pottery class. A helper fetches supplies from the storeroom and puts them in the right cupboard.

| Art school | Python |
|---|---|
| The huge storeroom with every supply | **PyPI**, the online warehouse of packages |
| One supply, like a box of paints | A package, like `cowsay` |
| The helper who fetches supplies | pip |
| Each class's own cupboard | A virtual environment (one per project) |
| Unlocking the cupboard before class | Activating the environment |
| The shopping list taped to the cupboard door | A `requirements.txt` file |

Because each class has its own cupboard, the pottery class can never run out of clay just because the painters took it all.

## How it works

### The words you'll meet

- **PyPI** (say "pie-P-I") is the **Py**thon **P**ackage **I**ndex, at [pypi.org](https://pypi.org). It's the free website where people publish their packages.
- **pip** downloads packages from PyPI and installs them. It comes with Python, so you already have it.
- **venv** is the standard library module that makes virtual environments. It also comes with Python.
- **Global** means the Python you installed in [chapter 01](../01-getting-started/notes.md). Anything installed there is shared by every project on your computer.

People often say "library" too. In everyday talk, a library and a package mean the same thing: code you can reuse.

### Step 1: Make a project folder and a virtual environment

Make a new folder for a small project, for example `cow-demo`. Open it in VS Code, and open a terminal in it (right-click the folder in the Explorer and choose **Open in Integrated Terminal**). Then type:

```
python -m venv .venv
```

Here's that command, piece by piece:

| Piece | What it means |
|---|---|
| `python` | Start Python... |
| `-m venv` | ...and run its built-in module called `venv`. The `-m` means "run a module". |
| `.venv` | The name of the folder to create. |

It prints nothing when it works, and it can take a few seconds. A new folder called `.venv` appears:

```
cow-demo/
├── .venv/
│   ├── Include/
│   ├── Lib/
│   │   └── site-packages/    <- installed packages go here
│   ├── Scripts/              <- python.exe and the activate scripts
│   ├── .gitignore
│   └── pyvenv.cfg
└── moo.py                    <- your own code goes here, next to .venv
```

(On Mac and Linux, `Scripts` is called `bin` and `Lib` is called `lib`.)

Why the name `.venv`? It's just a convention, but a very strong one. VS Code and most other tools look for a folder with exactly that name. The dot at the start also hides the folder on Mac and Linux, which is a hint that it's not your code.

> **Watch out:** Never put your own files inside `.venv`, and never edit what's in there. Treat it as Python's private storage. If it ever gets into a mess, you can delete the whole folder and make a new one in seconds.

### Step 2: Activate it

Making the folder isn't enough. You also have to **activate** the environment. Activating means: "in this terminal window, use the Python and the packages inside `.venv`". It lasts until you close the terminal or switch it off.

The command depends on which terminal you use. On Windows 11, VS Code's terminal is PowerShell unless you've changed it.

**Windows PowerShell:**

```
.venv\Scripts\Activate.ps1
```

When it works, `(.venv)` appears at the start of the prompt:

```
(.venv) PS C:\Users\Sandip\projects\cow-demo>
```

The first time you try this, PowerShell may refuse with a long red message. The important part says:

```
File C:\Users\Sandip\projects\cow-demo\.venv\Scripts\Activate.ps1 cannot be loaded because running scripts is disabled on this system.
```

That's PowerShell's **execution policy**: a safety setting that decides which script files are allowed to run. On a new Windows computer it blocks all of them, including the activate script. Run this command once to relax it a little:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

If PowerShell asks you to confirm, type `Y` and press Enter. Then try `.venv\Scripts\Activate.ps1` again.

What did that change? `RemoteSigned` lets scripts made on your own computer run, but still blocks scripts downloaded from the internet unless they are **signed** (stamped by a publisher who can be traced). `-Scope CurrentUser` means it only changes the setting for your own Windows account, so you don't need to be an administrator. You only ever do this once per computer.

> **Watch out:** On a work or school laptop, the IT team may lock this setting. If the command doesn't help, use Command Prompt instead (next), or ask them.

**Windows Command Prompt (cmd):**

```
.venv\Scripts\activate.bat
```

The prompt changes to something like `(.venv) C:\Users\Sandip\projects\cow-demo>`. Command Prompt has no execution policy, so this one always works. To open one in VS Code, click the small arrow next to the **+** in the terminal panel and choose **Command Prompt**.

**Mac and Linux:**

```
source .venv/bin/activate
```

Again, `(.venv)` appears at the start of the prompt.

### How to tell it's switched on

The quickest check is the `(.venv)` at the start of the prompt. If it's there, the environment is active.

You can also ask Python itself. `sys.executable` (from the `sys` module you met in [chapter 19](../19-modules-and-standard-library/notes.md)) is the full path of the Python that's running your file. Save this as `where_am_i.py`:

```python
import sys

print(sys.executable)  # the full path of the Python running this file
```

With the environment active, `python where_am_i.py` prints something like:

```
C:\Users\Sandip\projects\cow-demo\.venv\Scripts\python.exe
```

Without it, you get your global Python:

```
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\python.exe
```

Your paths will be different. What matters is whether `.venv` is in there.

### Step 3: Install a package

With the environment active, install `cowsay`, a small fun package that draws a cow saying whatever you like:

```
python -m pip install cowsay
```

You'll see something like this:

```
Collecting cowsay
  Downloading cowsay-6.1-py3-none-any.whl.metadata (5.6 kB)
Downloading cowsay-6.1-py3-none-any.whl (25 kB)
Installing collected packages: cowsay
Successfully installed cowsay-6.1
```

The last line is the one that matters. (By the time you try it, the version number may be newer.) A `.whl` file, called a **wheel**, is a package packed up and ready to install, like flat-pack furniture.

Sometimes pip adds a line like `[notice] A new release of pip is available`. That's just pip telling you it has a newer version. You can ignore it, or run the command it suggests to update pip inside this environment.

**Why `python -m pip` and not just `pip`?** Typing `pip` on its own runs whichever pip Windows finds first, and if you have more than one Python on your computer, that might be the wrong one. `python -m pip` means "the pip that belongs to this exact `python`". With the environment active, `python` is the one inside `.venv`, so the package lands in `.venv`. Plain `pip` usually works too once the environment is active, but `python -m pip` is never wrong. It's a good habit.

### Use it

Now use the package just like a standard library module. Save this as `moo.py`, next to the `.venv` folder (not inside it):

```python
import cowsay

cowsay.cow("Hello, Sandip!")
```

Run it with `python moo.py`:

```
  ______________
| Hello, Sandip! |
  ==============
              \
               \
                 ^__^
                 (oo)\_______
                 (__)\       )\/\
                     ||----w |
                     ||     ||
```

🐮 You just used code that somebody on the other side of the world wrote and shared.

The cow isn't the only character. `cowsay.char_names` is a list of all of them, and each one has a function with the same name:

```python
import cowsay

print(cowsay.char_names)
cowsay.tux("Packages are fun")
```

You'll see:

```
['beavis', 'cheese', 'cow', 'daemon', 'dragon', 'fox', 'ghostbusters', 'kitty', 'meow', 'miki', 'milk', 'octopus', 'pig', 'stegosaurus', 'stimpy', 'trex', 'turkey', 'turtle', 'tux']
  ________________
| Packages are fun |
  ================
                     \
                      \
                       \
                        .--.
                       |o_o |
                       |:_/ |
                      //   \ \
                     (|     | )
                    /'\_   _/`\
                    \___)=(___/
```

(Tux is the penguin mascot of Linux.)

Here's the proof that the package really is private to this project. Turn the environment off with `deactivate` (more on that below), then run `python moo.py` again:

```
ModuleNotFoundError: No module named 'cowsay'
```

Your global Python has never heard of `cowsay`. Only `.venv` has it.

### Looking after your packages

All of these commands work on whichever environment is active. Make sure you can see `(.venv)` first.

**See what's installed:**

```
python -m pip list
```

```
Package Version
------- -------
cowsay  6.1
pip     26.2.1
```

A brand-new environment only has pip in it. Everything else is something you chose to install. (Your version numbers may be different.)

**See the details of one package**, including where it was installed:

```
python -m pip show cowsay
```

```
Name: cowsay
Version: 6.1
Summary: The famous cowsay for GNU/Linux is now available for python
...
Location: C:\Users\Sandip\projects\cow-demo\.venv\Lib\site-packages
```

(The `...` stands for a few lines that were left out here.)

**Install one exact version** with `==`:

```
python -m pip install cowsay==6.0
```

pip swaps the versions for you. The output ends with:

```
    Uninstalling cowsay-6.1:
      Successfully uninstalled cowsay-6.1
Successfully installed cowsay-6.0
```

**Upgrade** to the newest version with `--upgrade`:

```
python -m pip install --upgrade cowsay
```

**Remove** a package:

```
python -m pip uninstall cowsay
```

pip lists the files it will delete and asks `Proceed (Y/n)?`. Type `y` and press Enter, and it ends with `Successfully uninstalled cowsay-6.0`.

> **Tip:** Version rules like "6 or newer" are written `cowsay>=6`. In PowerShell, put them in quotes: `python -m pip install "cowsay>=6"`. Without quotes, PowerShell reads `>` as "send the output to a file", and you end up with a strange file called `=6`.

### `requirements.txt`: the shopping list

Say you want to work on the project on another computer, or share it with a friend. Should you copy the `.venv` folder too? No. It's big, and it's tied to the exact paths and Python on your computer. Copied somewhere else, it may not work at all.

Instead, you write down **what** is installed, and the other computer installs the same things itself. That list is traditionally called `requirements.txt`.

`pip freeze` prints every installed package with its exact version, in a format pip can read back later:

```
python -m pip freeze
```

```
cowsay==6.1
```

To save that into a file instead of printing it, add `> requirements.txt`:

```
python -m pip freeze > requirements.txt
```

The `>` is a terminal feature, not a Python one. It means "send what this command prints into this file, instead of onto the screen". Now you have a `requirements.txt` next to `moo.py`, containing `cowsay==6.1`.

On the other computer (or in a fresh environment), rebuild everything in three commands (use the activate command for your terminal from Step 2):

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

The `-r` means "read the list of packages from this file". The output ends with `Successfully installed cowsay-6.1`, and `python moo.py` works again.

`pip freeze` lists *everything* in the environment, including the packages your packages need. Those are called **dependencies**. `cowsay` has none, but bigger packages do. For example, after installing `requests` (the package you'll use to talk to websites in [chapter 40](../40-working-with-apis/notes.md)), `pip freeze` shows six packages:

```
certifi==2026.7.22
charset-normalizer==3.5.2
cowsay==6.1
idna==3.20
requests==2.34.2
urllib3==2.8.0
```

You only asked for `requests`. pip fetched the other four because `requests` needs them. (The version numbers will be different by the time you read this.)

> **Watch out:** Run `pip freeze > requirements.txt` again every time you install or remove a package. Otherwise the list goes out of date, and the next person to use it gets a `ModuleNotFoundError`.

> **Tip:** In the older **Windows PowerShell 5.1**, `>` saves the file in a text encoding called UTF-16 instead of UTF-8. VS Code then shows `UTF-16 LE` in its status bar. Don't worry: pip reads it fine. PowerShell 7 and Command Prompt save UTF-8.

### Switching it off: `deactivate`

When you're done, type:

```
deactivate
```

The `(.venv)` disappears, and `python` means your global Python again. Closing the terminal does the same thing. Next time you open the project, activate it again before you install or run anything.

### Telling VS Code which Python to use

The terminal isn't the only thing that runs Python. VS Code's **Run** button and Pylance (the part of the Python extension that underlines mistakes) need to know about your environment too. Otherwise Pylance underlines `import cowsay` in yellow with `Import "cowsay" could not be resolved`, even though the program runs fine in your activated terminal.

To fix it, pick the environment's Python as the project's **interpreter** (the Python program that runs your code):

1. Press `Ctrl+Shift+P` to open the Command Palette.
2. Type **Python: Select Interpreter** and press Enter.
3. Pick the one with `.venv` in its name or path.

The interpreter VS Code is using now shows in the bottom-right corner of the window. Often VS Code spots the `.venv` folder by itself and picks it for you, and new terminals you open in that folder are activated for you too. (Exactly how this looks changes a little between versions of the Python extension, so if your screen looks different, look for "interpreter" or "environment".)

### Keep `.venv` out of Git

If you use Git (the tool that saves versions of your project), you never want `.venv` in it: it's big, it's tied to your computer, and `requirements.txt` already describes it. A file called `.gitignore` lists the things Git should ignore. Add this line to the `.gitignore` in your project folder:

```
.venv/
```

Python 3.13 and newer go one step further: they put a tiny `.gitignore` inside `.venv` that tells Git to ignore everything in that folder. Older Pythons don't, so add the line anyway. Do put `requirements.txt` in Git, though. It's small, and it's the recipe for rebuilding everything.

### A faster, newer tool: uv

You may see people use **uv** instead of pip and venv. It's a separate tool (you install it once, from its website) that does the same jobs, but much faster. For example, `uv venv` makes a `.venv` folder, and `uv pip install cowsay` installs a package into it. uv is newer and changes quickly, so check its own documentation for the details. Learn pip and venv first: they come with every Python, and you'll see them in tutorials, jobs and other people's projects for years to come.

## Common mistakes

**1. Installing before you activate**

```
PS C:\Users\Sandip\projects\cow-demo> python -m pip install cowsay
```

There's no `(.venv)` in front of the prompt, so this installs `cowsay` into your global Python. Later, inside the environment, `python moo.py` says:

```
ModuleNotFoundError: No module named 'cowsay'
```

Always look for `(.venv)` before you install. If you've already installed something globally by mistake, activate the environment and install it again there. (You can tidy up the global one with `python -m pip uninstall cowsay` while the environment is *off*.)

**2. Activating from the wrong folder**

```
.venv\Scripts\Activate.ps1: The module '.venv' could not be loaded. For more information, run 'Import-Module .venv'.
```

This confusing message really means "there's no `.venv` folder here". Your terminal is standing in a different folder from your project. Open the terminal from the project folder (or move there with `cd`, which stands for "change directory", like `cd cow-demo`), then activate again.

**3. Naming your file after a package**

Save a file as `cowsay.py`, with this inside:

```python
import cowsay

cowsay.cow("Moo")
```

You'll see:

```
AttributeError: module 'cowsay' has no attribute 'cow' (consider renaming 'C:\Users\Sandip\projects\cow-demo\cowsay.py' if it has the same name as a library you intended to import)
```

Python looks in your own folder first (remember [chapter 19](../19-modules-and-standard-library/notes.md)?), so `import cowsay` imported your file instead of the package. Python 3.13 even suggests the fix: rename your file, for example to `moo.py`.

**4. Typing pip commands into Python itself**

```
>>> pip install cowsay
SyntaxError: invalid syntax
```

pip commands go in the terminal, not in the Python REPL (the `>>>` prompt from chapter 01). Leave the REPL with `exit()` first, then run `python -m pip install cowsay`.

**5. Copying, moving or sharing the `.venv` folder**

The environment remembers the exact folder it was made in and the exact Python it was made from. Move or copy the project folder, and the old `.venv` may stop working, sometimes in confusing ways. The fix is always the same: delete `.venv`, make a new one, and run `python -m pip install -r requirements.txt`. Share `requirements.txt`, never `.venv`.

**6. Forgetting `requirements.txt` exists**

You install a new package, your program works, and you send the project to a friend. They run `python -m pip install -r requirements.txt`, then your program, and get `ModuleNotFoundError`. Your `requirements.txt` was saved before you installed the new package. Run `python -m pip freeze > requirements.txt` after every install or uninstall.

## Quick recap

- A package is code someone else shared. PyPI is the online warehouse, and pip installs packages from it.
- A virtual environment is a private set of packages for one project. Make one with `python -m venv .venv`.
- Activate it before you install or run anything: `.venv\Scripts\Activate.ps1` in PowerShell (run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once if PowerShell refuses), `.venv\Scripts\activate.bat` in cmd, `source .venv/bin/activate` on Mac and Linux. Look for `(.venv)` in the prompt. `deactivate` switches it off.
- Use `python -m pip install`, `list`, `show` and `uninstall`. Pin a version with `==`.
- `python -m pip freeze > requirements.txt` writes the shopping list. `python -m pip install -r requirements.txt` rebuilds from it.
- Pick the `.venv` interpreter in VS Code, put `.venv/` in `.gitignore`, and never copy or share `.venv` itself.

---

**Next:** try the [exercises](exercises.md), then move on to [24 Command-Line Programs](../24-command-line-programs/notes.md).
