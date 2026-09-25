---
name: create-doc
description: Turn one whole course from this learning folder (JavaScript/, TypeScript/, ...) into a single document (Word .docx, PDF, HTML web page, or one combined Markdown file) with the chapters in roadmap order, a contents page, links between chapters that still work, and the exercise hints moved to the back. Use it for /create-doc, and whenever the user asks to export, combine, merge, bundle, print or "make a book" out of a course's notes and exercises, even if they don't say which file type.
argument-hint: <docx|pdf|html|md> <Course>
---

# Create one document from a course

Arguments: `$ARGUMENTS`, meaning `<type> <Course>`, for example `docx javascript`.

- **type**: `docx` (Word), `pdf`, `html` (one web page) or `md` (one Markdown file). `word`, `markdown` and `web` work too.
- **Course**: a subject folder at the top of this learning folder. Any case works, and so do initials: `javascript`, `JavaScript` and `js` all mean `JavaScript/`.

If the type or course is missing, ask for it. Offer the course folders you can see and suggest `docx` as the type. Don't guess.

## Run the script

The script does all the work, the same way every time. Run it from the learning folder (the project root):

```
python .claude/skills/create-doc/scripts/build_doc.py <type> <Course>
```

It takes about 5 seconds for md or html, about 30 for docx and about a minute for pdf with a big course. It prints a short summary, then any **Warnings** (something may be wrong) and **Notes** (good to know).

Options, only when the user asks for them:

| Option | What it does |
|---|---|
| `--hints back` | Hints go to a Hints section at the end, with a "Stuck?" link where each one was. Default for docx and pdf. |
| `--hints inline` | Hints stay next to their exercise: click-to-open boxes in html and md (the default there), tip boxes in docx and pdf. |
| `--hints none` | Leave the hints out. |
| `--starter` | Also print the files from each project's `starter/` folder at the end of that chapter. |
| `--bookmarks` | pdf only: add a bookmarks sidebar. The file gets about 4 times bigger (JavaScript: 8 MB becomes 31 MB). |
| `--out FILE` | Save somewhere else. The default is `<Course>/<Course>-course.<type>`, next to the course README. |
| `--no-word` | docx only: skip the step that uses Microsoft Word to fill in the contents page. |
| `--keep-md` | Also save the combined Markdown given to pandoc, to find out why something looks wrong. |

## What it needs

- **md**: nothing extra.
- **docx and html**: [pandoc](https://pandoc.org), a free document converter. If it's missing, the script stops with exit code 2 and shows the install command. Ask the user before installing anything. On Windows: `winget install --id JohnMacFarlane.Pandoc -e --scope user`. The script finds pandoc even before the terminal is restarted.
- **pdf**: pandoc, plus Microsoft Edge or Google Chrome. The script makes the html version and has the browser print it to PDF.
- **docx, optional**: Microsoft Word. When Word is installed, the script opens the new file in Word and fills in the contents page with page numbers. Without Word, the contents page is empty until the user opens the file and clicks **Yes** when Word asks "update the fields?". Tell them that if the Notes mention it.

## What the script does

This is so you can explain the result, or fix the script when something goes wrong.

1. It reads the course `README.md`. The first `#` heading becomes the title. The text above the first `##` becomes the About page. Each `##` section that lists chapters (like "## Level 1: Foundations") becomes a part. The chapter list sets the order. Numbered folders missing from the README go in by their number, with a warning.
2. Each chapter becomes its `notes.md`, then an "Exercises" heading and its `exercises.md`. The chapter's own `#` titles are dropped, and every other heading moves down so it nests under the chapter. Code blocks are never touched.
3. Links to other chapters of the course (like `../20-dom-basics/notes.md`) become jumps inside the document. Links to other courses or files become plain text: their words stay, and folders and code files get their path added. In md output they stay real links instead, relative to the new file. Web links stay as they are.
4. The `<details>` hint boxes go wherever `--hints` says.
5. pandoc makes the final file. The look comes from `assets/reference.docx` (Word) and `assets/book.css` (html and pdf).

## Tell the user

Write the way this folder's CLAUDE.md asks: plain, friendly English for a beginner. Say:

- Where the file is, as a clickable link, and how big it is.
- What's inside: how many chapters and parts, where the hints went, and that the contents page and chapter links are clickable.
- Any warnings, in plain words, and whether they matter.
- That the file is a snapshot. After they edit their notes, running `/create-doc` again rebuilds it in seconds, so they don't need to edit the document by hand.

Don't commit the new file to git unless they ask. It can always be rebuilt from their notes.

## When something looks wrong

- **"couldn't save ... open in Word"**: the old copy is open. Ask them to close it, then run again.
- **Something renders badly** (a table, a heading, a link): don't edit the user's lesson files to work around it. Their notes are the source, and CLAUDE.md says not to change their files without asking. Run again with `--keep-md`, look at the saved `.pandoc.md` to find the cause, and fix `scripts/build_doc.py` instead.
- **Changing the look**: for Word, edit the styles in `scripts/make_reference_docx.py` and run it (it needs pandoc and `pip install python-docx`) to rebuild `assets/reference.docx`. For html and pdf, edit `assets/book.css`.
