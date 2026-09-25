#!/usr/bin/env python3
"""Turn one course from this learning folder into a single document.

    python build_doc.py <type> <course> [--hints back|inline|none] [--starter] [--out FILE]

type is docx, pdf, html or md. course is a subject folder such as
JavaScript (the case doesn't matter).

The course README.md sets the chapter order, and its "## Level ..." sections
become the parts of the book. Each chapter is its notes.md followed by its
exercises.md, with the headings moved down so they nest under the chapter.
Links between chapters become links inside the document. The exercise hints
move to a Hints section at the end for docx and pdf, and stay as
click-to-open boxes for html and md.

docx and html need pandoc. pdf also needs Microsoft Edge or Google Chrome,
which prints the html version to PDF. md needs nothing extra.
"""

import argparse
import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from collections import Counter
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from urllib.parse import quote, unquote

TYPES = ("docx", "pdf", "html", "md")
ALIASES = {"word": "docx", "doc": "docx", "markdown": "md", "web": "html", "htm": "html"}

# The lessons are written for GitHub and VS Code, so pandoc reads them as GFM.
# attributes and raw_attribute let this script add heading ids and Word page
# breaks. Dollar-sign math is off, so prices like $4.99 stay as they are.
READER = "gfm+attributes+raw_attribute-yaml_metadata_block-tex_math_dollars-tex_math_gfm"

ASSETS = Path(__file__).resolve().parent.parent / "assets"

FENCE = re.compile(r"^\s*(`{3,}|~{3,})")
HEADING = re.compile(r"^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$")
LINK = re.compile(r"(?<!!)\[([^\]]*)\]\(([^)\s]+)\)")
CODE_SPAN = re.compile(r"(?<!`)(`+)(?!`).+?(?<!`)\1(?!`)")
SUMMARY = re.compile(r"<summary>(.*?)</summary>", re.I)
ROADMAP_ITEM = re.compile(r"^\s*[-*]\s+(?:\[[ xX]\]\s+)?\[([^\]]+)\]\(([^)\s]+)\)")
CHAPTER_DIR = re.compile(r"^(\d+)-")
RULE = re.compile(r"^\s*([-*_])(\s*\1){2,}\s*$")
CODE_LINE_LINK = re.compile(r'<a href="#cb\d+-\d+" aria-hidden="true" tabindex="-1"></a>')
PAGE_BREAK = ["```{=openxml}", '<w:p><w:r><w:br w:type="page"/></w:r></w:p>', "```"]
# pandoc draws --- as a heavy grey bar in Word. This is a thin light line instead.
THIN_RULE = ["", "```{=openxml}",
             '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="C9D1D9"/></w:pBdr>'
             '<w:spacing w:before="120" w:after="240"/></w:pPr></w:p>', "```", ""]
CODE_LANG = {".js": "js", ".mjs": "js", ".ts": "ts", ".html": "html", ".css": "css", ".json": "json", ".md": "markdown"}


class BuildError(Exception):
    """A problem to show the user. code 2 means a tool is missing."""

    def __init__(self, message, code=1):
        super().__init__(message)
        self.code = code


@dataclass
class Part:
    title: str
    intro: list = field(default_factory=list)
    has_chapters: bool = False


@dataclass
class Chapter:
    slug: str      # the folder name, like "24-project-todo-app"
    folder: Path
    title: str     # from the H1 of notes.md, like "24 Project: To-Do List App"
    part: int | None


@dataclass(eq=False)
class Heading:
    level: int
    text: str
    id: str | None = None
    classes: tuple = ()
    page_break: bool = False


@dataclass(eq=False)
class HintGroup:
    """The hint boxes under one heading. They move to the back together."""
    chapter: Chapter
    heading: Heading
    kind: str      # "notes" or "exercises"
    id: str
    items: list = field(default_factory=list)   # (label, body lines)


@dataclass(eq=False)
class HintRef:
    """Marks where a moved hint group used to be."""
    group: HintGroup


def closes_fence(line, fence):
    s = line.strip()
    return len(s) >= len(fence) and set(s) == {fence[0]}


def trim(lines):
    """Drop blank lines and horizontal rules from both ends."""
    lines = list(lines)
    while lines and (not lines[0].strip() or RULE.match(lines[0])):
        lines.pop(0)
    while lines and (not lines[-1].strip() or RULE.match(lines[-1])):
        lines.pop()
    return lines


def join_names(names):
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


def collapse_blank_lines(lines):
    """Squeeze runs of blank lines outside code blocks down to one."""
    out, fence = [], None
    for line in lines:
        if fence:
            if closes_fence(line, fence):
                fence = None
        elif m := FENCE.match(line):
            fence = m.group(1)
        elif not line.strip() and (not out or not out[-1].strip()):
            continue
        out.append(line)
    return out


def chapter_number(folder):
    return int(CHAPTER_DIR.match(folder.name).group(1))


def first_h1(path):
    if path.exists():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            h = HEADING.match(line)
            if h and len(h.group(1)) == 1:
                return h.group(2)
    return None


def find_course(root, name):
    courses = [d for d in root.iterdir()
               if d.is_dir() and not d.name.startswith(".")
               and any(c.is_dir() and CHAPTER_DIR.match(c.name) for c in d.iterdir())]
    squash = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
    capitals = lambda s: re.sub(r"[^A-Z]", "", s).lower()   # JavaScript -> "js"
    for test in (lambda d: d.name.lower() == name.lower(),
                 lambda d: squash(d.name) == squash(name),
                 lambda d: len(name) > 1 and capitals(d.name) == name.lower(),
                 lambda d: squash(d.name).startswith(squash(name))):
        matches = [d for d in courses if test(d)]
        if len(matches) == 1:
            return matches[0]
    names = ", ".join(sorted(d.name for d in courses)) or "none"
    raise BuildError(f"there's no course called '{name}' in {root}. Courses found: {names}")


def read_roadmap(course_dir, warn):
    """Read the README: the course title, its intro, the parts, and the chapters in order."""
    folders = sorted((d for d in course_dir.iterdir() if d.is_dir() and CHAPTER_DIR.match(d.name)),
                     key=lambda d: (chapter_number(d), d.name))
    title, intro, sections, listed = course_dir.name, [], [], []
    readme = course_dir / "README.md"
    if readme.exists():
        seen_title = False
        for line in readme.read_text(encoding="utf-8-sig").splitlines():
            h = HEADING.match(line)
            if h and len(h.group(1)) == 1 and not seen_title:
                title, seen_title = h.group(2), True
                continue
            if h and len(h.group(1)) == 2:
                sections.append(Part(h.group(2)))
                continue
            item = ROADMAP_ITEM.match(line)
            target = Path(item.group(2)) if item else None
            if target and not target.as_posix().startswith(".."):
                slug = target.parent.name if target.suffix == ".md" else target.name
                if CHAPTER_DIR.match(slug):
                    listed.append((slug, item.group(1), len(sections) - 1 if sections else None))
                    if sections:
                        sections[-1].has_chapters = True
                    continue
            if not sections:
                intro.append(line)
            elif not sections[-1].has_chapters:
                sections[-1].intro.append(line)   # the text above the chapter list, like "*Goal: ...*"
    else:
        warn("there's no README.md, so the chapters go in by their numbers")

    parts = [s for s in sections if s.has_chapters]
    part_index = {sections.index(p): i for i, p in enumerate(parts)}
    by_name = {d.name: d for d in folders}
    chapters, used = [], set()
    for slug, text, section in listed:
        if slug in used:
            continue
        folder = by_name.get(slug)
        if folder is None:
            warn(f"the README lists {slug}, but that folder doesn't exist yet, so it's left out")
            continue
        chapters.append(Chapter(slug, folder, first_h1(folder / "notes.md") or text, part_index.get(section)))
        used.add(slug)
    for folder in folders:
        if folder.name in used:
            continue
        if listed:
            warn(f"{folder.name} isn't in the README roadmap, so it goes in by its number")
        before = [i for i, c in enumerate(chapters) if chapter_number(c.folder) < chapter_number(folder)]
        at = before[-1] + 1 if before else 0
        part = chapters[at - 1].part if before else (chapters[0].part if chapters else None)
        chapters.insert(at, Chapter(folder.name, folder, first_h1(folder / "notes.md") or folder.name, part))
    for c in list(chapters):
        if not (c.folder / "notes.md").exists() and not (c.folder / "exercises.md").exists():
            warn(f"{c.slug} has no notes.md or exercises.md, so it's left out")
            chapters.remove(c)
    if not chapters:
        raise BuildError(f"found no chapters in {course_dir}")
    return title, trim(intro), parts, chapters


class Book:
    """Builds the combined Markdown for one course and one output type."""

    def __init__(self, root, course_dir, fmt, hints, starter, out_path):
        self.root, self.course_dir, self.fmt = root, course_dir, fmt
        self.hints, self.starter, self.out_path = hints, starter, out_path
        self.warnings, self.stats = [], Counter()
        self.title, self.intro, self.parts, self.chapters = read_roadmap(course_dir, self.warnings.append)
        self.by_slug = {c.slug: c for c in self.chapters}
        self.chapter_level = 2 if self.parts else 1
        self.hint_groups, self.groups_by_heading = [], {}
        self.section_count = Counter()
        self.out = []

    # ----- small helpers -----

    def rel(self, path):
        try:
            return path.relative_to(self.root).as_posix()
        except ValueError:
            return str(path)

    def anchor(self, chapter, part=None):
        return f"ch-{chapter.slug}" + (f"-{part}" if part else "")

    def emit(self, *items):
        self.out.extend(items)

    # ----- links -----

    def fix_links(self, text, src):
        """Rewrite the Markdown links in one line of prose. Code spans are left alone."""
        spans = []

        def hide(m):
            spans.append(m.group(0))
            return f"\x00{len(spans) - 1}\x00"

        text = CODE_SPAN.sub(hide, text)
        text = LINK.sub(lambda m: self.link(m.group(1), m.group(2), src), text)
        return re.sub(r"\x00(\d+)\x00", lambda m: spans[int(m.group(1))], text)

    def fix_block(self, lines, src):
        out, fence = [], None
        for line in lines:
            if fence:
                if closes_fence(line, fence):
                    fence = None
            elif m := FENCE.match(line):
                fence = m.group(1)
            else:
                line = self.fix_links(line, src)
            out.append(line)
        return out

    def link(self, label, target, src):
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("#"):
            return f"[{label}]({target})"   # web links and same-page links stay as they are
        path, _, fragment = target.partition("#")
        dest = (src.parent / unquote(path)).resolve()

        # Another chapter of this course: jump to it inside the document.
        if dest.parent.parent == self.course_dir and dest.name in ("notes.md", "exercises.md"):
            chapter = self.by_slug.get(dest.parent.name)
            if chapter:
                self.stats["links_inside"] += 1
                to_exercises = dest.name == "exercises.md" and (chapter.folder / "exercises.md").exists()
                return f"[{label}](#{self.anchor(chapter, 'exercises' if to_exercises else None)})"

        # A starter folder that this document prints.
        if self.starter:
            for chapter in self.chapters:
                starter = chapter.folder / "starter"
                if dest == starter or starter in dest.parents:
                    self.stats["links_inside"] += 1
                    return f"[{label}](#{self.anchor(chapter, 'starter')})"

        if not dest.exists():
            self.warnings.append(f"{self.rel(src)} links to {target}, which doesn't exist")
            return label

        # A combined .md file lives in the course folder, so it can keep a relative link.
        if self.fmt == "md":
            new = os.path.relpath(dest, self.out_path.parent).replace("\\", "/")
            new += ("/" if dest.is_dir() else "") + (f"#{fragment}" if fragment else "")
            self.stats["links_kept"] += 1
            return f"[{label}]({quote(new, safe='/#.-_~')})"

        # Anything else can't be followed from inside the document, so keep the words.
        # For folders and code files, say where to find them on the computer.
        self.stats["links_plain"] += 1
        if dest.is_dir() or dest.suffix.lower() != ".md":
            return f"{label} (`{self.rel(dest)}{'/' if dest.is_dir() else ''}`)"
        return label

    # ----- hints -----

    def read_details(self, lines, start):
        """Read the <details> box that starts at lines[start].

        Returns (index of its </details> line, summary label, body lines).
        """
        depth, fence, label, body = 0, None, None, []
        for j in range(start, len(lines)):
            line = lines[j]
            if fence:
                body.append(line)
                if closes_fence(line, fence):
                    fence = None
                continue
            if m := FENCE.match(line):
                fence = m.group(1)
                body.append(line)
                continue
            low = line.strip().lower()
            if low.startswith("<details"):
                depth += 1
                if depth == 1:
                    if s := SUMMARY.search(line):
                        label = s.group(1)
                    continue
            if depth == 1 and label is None and (s := SUMMARY.search(line)):
                label = s.group(1)
                continue
            if low == "</details>":
                depth -= 1
                if depth == 0:
                    return j, re.sub(r"<[^>]+>", "", label or "Hint").strip() or "Hint", trim(body)
            body.append(line)
        self.warnings.append("a <details> box is never closed; the rest of that file is treated as its hint")
        return len(lines) - 1, label or "Hint", trim(body)

    def add_hint(self, label, body, src, chapter, kind, section):
        self.stats["hints"] += 1
        body = self.fix_block(body, src)
        if self.hints == "none":
            return
        if self.hints == "inline":
            if self.fmt in ("html", "md"):
                self.emit("", "<details>", f"<summary>{html.escape(label)}</summary>", "", *body, "", "</details>", "")
            else:
                quoted = [f"> {line}" if line.strip() else ">" for line in body]
                self.emit("", f"> **{label}**", ">", *quoted, "")
            return
        group = self.groups_by_heading.get(id(section))
        if group is None:
            if section.id is None:
                self.section_count[chapter.slug] += 1
                section.id = f"sec-{chapter.slug}-{self.section_count[chapter.slug]}"
            group = HintGroup(chapter, section, kind, f"hints-{section.id}")
            self.groups_by_heading[id(section)] = group
            self.hint_groups.append(group)
            self.emit(HintRef(group))
        group.items.append((label, body))

    def hint_ref_line(self, group):
        labels = [label for label, _ in group.items]
        all_hints = all(label.lower().startswith("hint") for label in labels)
        names = [("the hint" if label.lower() == "hint" else label) if label.lower().startswith("hint")
                 else f'"{label}"' for label in labels]
        text = join_names(names)
        verb = "is" if len(labels) == 1 else "are"
        sentence = f"{text[0].upper()}{text[1:]} {verb} in the [Hints section](#{group.id}) at the end."
        return f"*{'Stuck? ' if all_hints else ''}{sentence}*"

    # ----- the parts of the book -----

    def convert_file(self, path, chapter, kind, shift, top):
        """Copy one notes.md or exercises.md into the book, below the heading `top`."""
        lines = path.read_text(encoding="utf-8-sig").splitlines()
        section, fence, title_skipped, i = top, None, False, 0
        while i < len(lines):
            line = lines[i]
            if fence:
                self.emit(line)
                if closes_fence(line, fence):
                    fence = None
            elif m := FENCE.match(line):
                fence = m.group(1)
                self.emit(line)
            elif h := HEADING.match(line):
                level = len(h.group(1))
                if level == 1 and not title_skipped:
                    title_skipped = True   # the file's own title; the chapter heading replaces it
                else:
                    section = Heading(max(min(level + shift, 6), top.level + 1), self.fix_links(h.group(2), path))
                    self.emit(section)
            elif line.strip().lower().startswith("<details"):
                end, label, body = self.read_details(lines, i)
                self.add_hint(label, body, path, chapter, kind, section)
                i = end
            elif self.fmt == "docx" and RULE.match(line) and (i == 0 or not lines[i - 1].strip()):
                self.emit(*THIN_RULE)   # (a --- right under text would be a heading, so that's left alone)
            else:
                self.emit(self.fix_links(line, path))
            i += 1
        if fence:
            self.warnings.append(f"{self.rel(path)} has a code block that is never closed")

    def add_chapter(self, chapter, first_in_part):
        level = self.chapter_level
        heading = Heading(level, chapter.title, self.anchor(chapter), ("chapter",), page_break=not first_in_part)
        self.emit(heading)
        notes, exercises = chapter.folder / "notes.md", chapter.folder / "exercises.md"
        if notes.exists():
            self.convert_file(notes, chapter, "notes", level - 1, heading)
        if exercises.exists():
            heading = Heading(level + 1, "Exercises", self.anchor(chapter, "exercises"))
            self.emit(heading)
            self.convert_file(exercises, chapter, "exercises", level, heading)
        if self.starter:
            self.add_starter_files(chapter)
        self.stats["chapters"] += 1

    def add_starter_files(self, chapter):
        folder = chapter.folder / "starter"
        if not folder.is_dir():
            return
        self.emit(Heading(self.chapter_level + 1, "Starter files", self.anchor(chapter, "starter")),
                  f"These are the files in the `{self.rel(folder)}/` folder.", "")
        for file in sorted(p for p in folder.rglob("*") if p.is_file()):
            name = file.relative_to(folder).as_posix()
            try:
                code = file.read_text(encoding="utf-8-sig").rstrip("\n")
            except UnicodeDecodeError:
                self.emit(f"**{name}** isn't a text file, so it isn't shown here.", "")
                continue
            longest = max((len(run) for run in re.findall(r"`+", code)), default=0)
            fence = "`" * max(3, longest + 1)
            self.emit(f"**{name}**", "", fence + CODE_LANG.get(file.suffix.lower(), ""), code, fence, "")

    def add_about(self):
        readme = self.course_dir / "README.md"
        self.emit(Heading(1, "About this course", "about", ("chapter",), page_break=True))
        self.emit(*self.fix_block(self.intro, readme), "")
        if self.hint_groups:
            self.emit("The hints for the exercises are in the [Hints section](#hints) at the end. "
                      "Try each exercise on your own first, and read one hint at a time.", "")

    def add_hints_section(self):
        self.emit(Heading(1, "Hints", "hints", ("part",), page_break=True),
                  "Try each exercise on your own first. Come here only when you're stuck, "
                  "and read one hint at a time.", "")
        # pandoc leaves "unlisted" headings out of the html contents, but Word's contents
        # take every heading down to the chapter level, so in docx these sit one level lower.
        level = self.chapter_level + 1 if self.fmt == "docx" else 2
        current = None
        for group in self.hint_groups:
            if group.chapter is not current:
                current = group.chapter
                self.emit(Heading(level, current.title, f"hints-{current.slug}", ("unlisted",)))
            where = "exercise" if group.kind == "exercises" else "lesson"
            self.emit(Heading(level + 1, group.heading.text, group.id, ("unlisted",)),
                      f"[Back to the {where}](#{group.heading.id})", "")
            for label, body in group.items:
                self.emit(f"**{label}**", "", *body, "")

    def md_front_matter(self, subtitle, when):
        """The title and contents list for .md output. (pandoc makes these for the other types.)"""
        lines = [f"# {self.title}", "", f"*{subtitle}. {when}.*", "", "## Contents", "", "- [About this course](#about)"]
        current = object()
        for c in self.chapters:
            if c.part is not None and c.part != current:
                current = c.part
                lines.append(f"- **[{self.parts[c.part].title}](#part-{c.part + 1})**")
            lines.append(f"{'  ' if c.part is not None else ''}- [{c.title}](#{self.anchor(c)})")
        if self.hint_groups:
            lines.append("- [Hints](#hints)")
        return lines + [""]

    def heading_lines(self, h):
        hashes = "#" * h.level
        if self.fmt == "md":
            return ([f'<a id="{h.id}"></a>', ""] if h.id else []) + [f"{hashes} {h.text}"]
        attrs = ([f"#{h.id}"] if h.id else []) + [f".{c}" for c in h.classes]
        lines = []
        if h.page_break:
            if self.fmt == "docx":
                lines += PAGE_BREAK + [""]
            else:
                attrs.append(".page-break")
        return lines + [f"{hashes} {h.text}" + (f" {{{' '.join(attrs)}}}" if attrs else "")]

    def render(self, items):
        lines = []
        for item in items:
            if isinstance(item, Heading):
                lines += ["", *self.heading_lines(item), ""]
            elif isinstance(item, HintRef):
                lines += ["", self.hint_ref_line(item.group), ""]
            else:
                lines.append(item)
        return lines

    def markdown(self, subtitle, when):
        """Build the whole book. Chapters go first so the About page knows if there are hints."""
        self.out, current_part = [], object()
        for chapter in self.chapters:
            first_in_part = False
            if chapter.part is not None and chapter.part != current_part:
                current_part = chapter.part
                part = self.parts[chapter.part]
                self.emit(Heading(1, part.title, f"part-{chapter.part + 1}", ("part",), page_break=True),
                          *self.fix_block(trim(part.intro), self.course_dir / "README.md"), "")
                first_in_part = True
            self.add_chapter(chapter, first_in_part)
        body, self.out = self.out, []
        self.add_about()
        self.out += body
        if self.hint_groups:
            self.add_hints_section()
        lines = self.md_front_matter(subtitle, when) if self.fmt == "md" else []
        return "\n".join(collapse_blank_lines(lines + self.render(self.out))).strip() + "\n"


# ----- tools -----

def find_pandoc():
    if found := shutil.which("pandoc"):
        return found
    for base in (os.environ.get("LOCALAPPDATA"), os.environ.get("ProgramFiles")):
        if base and (exe := Path(base) / "Pandoc" / "pandoc.exe").exists():
            return str(exe)
    raise BuildError("pandoc isn't installed. On Windows, install it with:\n"
                     "    winget install --id JohnMacFarlane.Pandoc -e --scope user\n"
                     "(md output doesn't need it.)", code=2)


def find_browser():
    places = [(os.environ.get("ProgramFiles(x86)"), r"Microsoft\Edge\Application\msedge.exe"),
              (os.environ.get("ProgramFiles"), r"Microsoft\Edge\Application\msedge.exe"),
              (os.environ.get("ProgramFiles"), r"Google\Chrome\Application\chrome.exe"),
              (os.environ.get("ProgramFiles(x86)"), r"Google\Chrome\Application\chrome.exe"),
              (os.environ.get("LOCALAPPDATA"), r"Google\Chrome\Application\chrome.exe"),
              ("/Applications", "Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
              ("/Applications", "Google Chrome.app/Contents/MacOS/Google Chrome")]
    for base, rel in places:
        if base and (exe := Path(base) / rel).exists():
            return str(exe)
    for name in ("msedge", "google-chrome", "chrome", "chromium", "chromium-browser"):
        if found := shutil.which(name):
            return found
    raise BuildError("making a PDF needs Microsoft Edge or Google Chrome, and neither was found", code=2)


def run(cmd, what, timeout=600):
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    except subprocess.TimeoutExpired:
        raise BuildError(f"{what} took longer than {timeout // 60} minutes and was stopped")
    if result.returncode != 0:
        raise BuildError(f"{what} failed:\n{(result.stderr or result.stdout).strip()}")
    return [line for line in result.stderr.splitlines() if line.strip()]


def pandoc_command(pandoc, book, src, dest, to, meta):
    cmd = [pandoc, str(src), "-f", READER, "-t", to, "-o", str(dest),
           "--toc", f"--toc-depth={book.chapter_level}", "--resource-path", str(book.course_dir)]
    for key, value in meta.items():
        cmd += ["-M", f"{key}={value}"]
    return cmd


def find_word():
    if os.name != "nt":
        return None
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                            r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\Winword.exe") as key:
            exe = winreg.QueryValue(key, None)
        return exe if Path(exe).exists() else None
    except OSError:
        return None


# pandoc leaves the contents page empty for Word to fill in, and Word then asks
# "update the fields?" when the file opens. Doing it here saves that question and
# adds the page numbers. If Word is already open this may borrow it, so it leaves
# the window alone, puts the alerts setting back, and only quits when no documents are open.
WORD_SCRIPT = r"""
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$alerts = $word.DisplayAlerts
try {
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open('{path}', $false, $false, $false)
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Save()
    $doc.Close()
} finally {
    $word.DisplayAlerts = $alerts
    if ($word.Documents.Count -eq 0) { $word.Quit() }
}
"""


def fill_contents_with_word(docx_file):
    shell = shutil.which("pwsh") or shutil.which("powershell") or "powershell"
    script = WORD_SCRIPT.replace("{path}", str(docx_file).replace("'", "''"))
    run([shell, "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
        "filling in the contents with Word", timeout=300)


def print_pdf(browser, html_file, pdf_file, tmp, bookmarks):
    # The browser builds the bookmarks sidebar from accessibility tags, one per piece of
    # text. Every coloured word of code is a piece, so tags make the file about 4 times
    # bigger (8 MB -> 31 MB for the JavaScript course). They're off unless asked for.
    extra = ["--generate-pdf-document-outline"] if bookmarks else ["--disable-pdf-tagging"]
    run([browser, "--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
         "--disable-extensions", f"--user-data-dir={tmp / 'browser-profile'}",
         "--no-pdf-header-footer", *extra,
         f"--print-to-pdf={pdf_file}", html_file.as_uri()], "printing the PDF")
    if not pdf_file.exists() or pdf_file.stat().st_size == 0:
        raise BuildError("the browser finished without saving a PDF")


def build(args):
    fmt = ALIASES.get(args.type.lower(), args.type.lower())
    if fmt not in TYPES:
        raise BuildError(f"'{args.type}' isn't a type I can make. Pick one of: {', '.join(TYPES)}")
    root = args.root.resolve()
    course = find_course(root, args.course)
    hints = args.hints or ("back" if fmt in ("docx", "pdf") else "inline")
    out = (args.out or course / f"{course.name}-course.{fmt}").resolve()
    pandoc = find_pandoc() if fmt != "md" else None
    browser = find_browser() if fmt == "pdf" else None

    book = Book(root, course, fmt, hints, args.starter, out)
    subtitle = f"Notes and exercises for all {len(book.chapters)} chapters"
    today = date.today()
    when = f"Made on {today:%B} {today.day}, {today.year}"
    text = book.markdown(subtitle, when)
    meta = {"title": book.title, "subtitle": subtitle, "date": when, "toc-title": "Contents", "lang": "en-US"}
    warnings, notes = [], []   # warnings: something may be wrong. notes: good to know.

    with tempfile.TemporaryDirectory(prefix="create-doc-", ignore_cleanup_errors=True) as tmp:
        tmp = Path(tmp)
        src = tmp / "book.md"
        src.write_text(text, encoding="utf-8")
        if args.keep_md and fmt != "md":
            shutil.copyfile(src, out.with_name(out.stem + ".pandoc.md"))
        if fmt == "md":
            result = src
        elif fmt == "docx":
            result = tmp / "book.docx"
            warnings += run(pandoc_command(pandoc, book, src, result, "docx", meta)
                            + ["--reference-doc", str(ASSETS / "reference.docx")], "pandoc")
            ask_to_update = ("the contents page fills in when you open the file: "
                             "click Yes when Word asks to update the fields")
            if not args.no_word and find_word():
                try:
                    fill_contents_with_word(result)
                    book.stats["word_contents"] = 1
                except BuildError as e:
                    warnings.append(str(e))
                    notes.append(ask_to_update)
            else:
                notes.append(ask_to_update)
        else:
            style = tmp / "style.html"
            style.write_text("<style>\n" + (ASSETS / "book.css").read_text(encoding="utf-8") + "\n</style>\n",
                             encoding="utf-8")
            result = tmp / "book.html"
            warnings += run(pandoc_command(pandoc, book, src, result, "html5", meta | {"document-css": "false"})
                            + ["--standalone", "--include-in-header", str(style)], "pandoc")
            # pandoc gives every line of code an empty link to itself: about 11,000 of them
            # in the JavaScript course. They do nothing for a reader, so they go.
            page = result.read_text(encoding="utf-8")
            result.write_text(CODE_LINE_LINK.sub("", page), encoding="utf-8")
            if fmt == "pdf":
                html_file, result = result, tmp / "book.pdf"
                print_pdf(browser, html_file, result, tmp, args.bookmarks)
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            shutil.copyfile(result, out)
        except PermissionError:
            raise BuildError(f"couldn't save {book.rel(out)}. It may be open in Word or another program. "
                             "Close it and run this again.")

    report(book, out, warnings, notes)
    return 0


def plural(n, word):
    return f"{n} {word}" + ("" if n == 1 else "s")


def report(book, out, warnings, notes):
    s = book.stats
    size = out.stat().st_size
    shown = f"{size / 1_000_000:.1f} MB" if size >= 100_000 else f"{max(1, size // 1000)} KB"
    print(f"Made {book.rel(out)} ({shown})")
    parts = f" in {plural(len(book.parts), 'part')}" if book.parts else ""
    print(f"  {plural(s['chapters'], 'chapter')}{parts}")
    where = {"back": "moved to the Hints section at the end", "inline": "kept next to their exercises",
             "none": "left out"}[book.hints]
    print(f"  {plural(s['hints'], 'hint')} {where}")
    print(f"  {plural(s['links_inside'], 'link')} now jump to another part of the document")
    if s["word_contents"]:
        print("  contents page filled in with page numbers (by Word)")
    if s["links_kept"]:
        print(f"  {plural(s['links_kept'], 'link')} to other files kept (relative to the new file)")
    if s["links_plain"]:
        print(f"  {plural(s['links_plain'], 'link')} to other courses or files became plain text")
    for heading, items in (("Warnings", book.warnings + warnings), ("Notes", notes)):
        if items:
            print(f"{heading}:")
            for item in items:
                print(f"  - {item}")


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="Turn one course into a single document.")
    ap.add_argument("type", help="docx, pdf, html or md")
    ap.add_argument("course", help="the course folder, like JavaScript (any case)")
    ap.add_argument("--hints", choices=["back", "inline", "none"],
                    help="where exercise hints go (default: back for docx and pdf, inline for html and md)")
    ap.add_argument("--starter", action="store_true", help="also print the files in each project's starter/ folder")
    ap.add_argument("--out", type=Path, help="where to save it (default: <Course>/<Course>-course.<type>)")
    ap.add_argument("--root", type=Path, default=Path.cwd(),
                    help="the learning folder that holds the courses (default: the current folder)")
    ap.add_argument("--bookmarks", action="store_true",
                    help="pdf only: add a bookmarks sidebar (makes the file about 4 times bigger)")
    ap.add_argument("--no-word", action="store_true",
                    help="docx only: don't use Microsoft Word to fill in the contents page")
    ap.add_argument("--keep-md", action="store_true",
                    help="also save the combined Markdown given to pandoc, to debug how something looks")
    args = ap.parse_args(argv)
    try:
        return build(args)
    except BuildError as e:
        print(f"error: {e}", file=sys.stderr)
        return e.code


if __name__ == "__main__":
    sys.exit(main())
