#!/usr/bin/env python3
"""Build ../assets/reference.docx, the style sheet for Word output.

pandoc copies the styles, margins and footer of this file into every .docx
it makes. This script starts from pandoc's own default and restyles it so a
course reads like a book: clear headings, grey boxes for code, a blue bar
beside tips, bordered tables and page numbers.

You only need to run it again after changing a style below:
    python make_reference_docx.py
It needs pandoc and python-docx (pip install python-docx).
"""

import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Inches

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_doc import find_pandoc  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "assets" / "reference.docx"

FONT, MONO = "Calibri", "Consolas"
INK, MUTED, NAVY, BLUE, LINK = "1F2328", "59636E", "0B3D6E", "1F4E79", "0B5CAD"
CODE_BG, CODE_LINE, TIP_BG, GRID, HEAD_BG = "F3F5F7", "D8DEE4", "F2F7FC", "C9D1D9", "EEF2F6"


def fonts(name):
    return f'<w:rFonts w:ascii="{name}" w:hAnsi="{name}" w:eastAsia="{name}" w:cs="{name}"/>'


def size(points):
    half = round(points * 2)
    return f'<w:sz w:val="{half}"/><w:szCs w:val="{half}"/>'


def color(hex_value):
    return f'<w:color w:val="{hex_value}"/>'


def spacing(before, after, line=None):
    extra = f' w:line="{line}" w:lineRule="auto"' if line else ""
    return f'<w:spacing w:before="{before}" w:after="{after}"{extra}/>'


def edge(side, eighths, hex_value, space=4):
    return f'<w:{side} w:val="single" w:sz="{eighths}" w:space="{space}" w:color="{hex_value}"/>'


def shade(hex_value):
    return f'<w:shd w:val="clear" w:color="auto" w:fill="{hex_value}"/>'


def restyle(doc, name, ppr="", rpr=""):
    """Replace a style's paragraph (pPr) and run (rPr) properties.

    The XML strings must list their children in the order Word expects,
    or Word may refuse to open the file.
    """
    el = doc.styles[name].element
    for tag in ("w:pPr", "w:rPr"):
        if (old := el.find(qn(tag))) is not None:
            el.remove(old)
    anchor = next((c for c in el if c.tag in {qn("w:tblPr"), qn("w:trPr"), qn("w:tcPr"), qn("w:tblStylePr")}), None)
    for tag, inner in (("w:pPr", ppr), ("w:rPr", rpr)):
        if inner:
            new = parse_xml(f"<{tag} {nsdecls('w')}>{inner}</{tag}>")
            el.append(new) if anchor is None else anchor.addprevious(new)


def add_style(doc, style_id, name, based_on):
    if name not in [s.name for s in doc.styles]:
        doc.styles.element.append(parse_xml(
            f'<w:style {nsdecls("w")} w:type="paragraph" w:customStyle="1" w:styleId="{style_id}">'
            f'<w:name w:val="{name}"/><w:basedOn w:val="{based_on}"/><w:qFormat/></w:style>'))


def main():
    pandoc = find_pandoc()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([pandoc, "-o", str(OUT), "--print-default-data-file", "reference.docx"], check=True)
    doc = Document(str(OUT))

    # Text
    restyle(doc, "Normal", rpr=fonts(FONT) + color(INK) + size(11))
    # Space above too, so a paragraph doesn't touch the list or table before it
    restyle(doc, "Body Text", ppr=spacing(80, 100, 276))
    restyle(doc, "Compact", ppr=spacing(20, 40, 264))
    restyle(doc, "Hyperlink", rpr=color(LINK) + '<w:u w:val="single"/>')

    # Title page and contents
    restyle(doc, "Title", ppr=spacing(2400, 160) + '<w:jc w:val="center"/>',
            rpr=fonts(FONT) + "<w:b/><w:bCs/>" + color(NAVY) + size(30))
    restyle(doc, "Subtitle", ppr=spacing(0, 120) + '<w:jc w:val="center"/>',
            rpr='<w:b w:val="0"/><w:bCs w:val="0"/>' + color(MUTED) + size(15))
    restyle(doc, "Date", ppr=spacing(240, 0) + '<w:jc w:val="center"/>',
            rpr='<w:b w:val="0"/><w:bCs w:val="0"/>' + color(MUTED) + size(11))
    restyle(doc, "TOC Heading", ppr="<w:keepNext/><w:pageBreakBefore/>" + spacing(0, 240) + '<w:outlineLvl w:val="9"/>',
            rpr=fonts(FONT) + "<w:b/><w:bCs/>" + color(NAVY) + size(20))

    # Headings: 1 = part (a Level of the course), 2 = chapter, 3 and below = inside a chapter
    headings = {
        1: (0, 240, NAVY, 22, f"<w:pBdr>{edge('bottom', 12, GRID, 6)}</w:pBdr>"),
        2: (360, 160, NAVY, 18, ""),
        3: (320, 100, BLUE, 14, ""),
        4: (260, 80, INK, 12, ""),
        5: (220, 60, INK, 11, ""),
        6: (200, 60, MUTED, 11, ""),
    }
    for level, (before, after, hue, points, border) in headings.items():
        italic = "<w:i/><w:iCs/>" if level == 6 else ""
        restyle(doc, f"Heading {level}",
                ppr=f"<w:keepNext/><w:keepLines/>{border}{spacing(before, after)}<w:outlineLvl w:val=\"{level - 1}\"/>",
                rpr=fonts(FONT) + "<w:b/><w:bCs/>" + italic + color(hue) + size(points))

    # Code: inline code and code blocks share one grey, so tokens inside blocks don't show boxes
    restyle(doc, "Verbatim Char", rpr=fonts(MONO) + size(9.5) + shade(CODE_BG))
    add_style(doc, "SourceCode", "Source Code", "Normal")
    box = "".join(edge(side, 4, CODE_LINE, 4) for side in ("top", "left", "bottom", "right"))
    restyle(doc, "Source Code",
            ppr=f"<w:pBdr>{box}</w:pBdr>{shade(CODE_BG)}{spacing(120, 160, 240)}<w:ind w:left=\"115\" w:right=\"115\"/>",
            rpr=fonts(MONO) + size(9.5))

    # Tips (block quotes): a blue bar on the left and a pale blue background
    restyle(doc, "Block Text",
            ppr=f"<w:pBdr>{edge('left', 24, LINK, 8)}</w:pBdr>{shade(TIP_BG)}{spacing(60, 60, 276)}"
                '<w:ind w:left="240" w:right="120"/>')

    # Tables: thin grey lines, a shaded and bold header row
    table = doc.styles["Table"].element
    tbl_pr = table.find(qn("w:tblPr"))
    grid = "".join(edge(side, 4, GRID, 0) for side in ("top", "left", "bottom", "right", "insideH", "insideV"))
    tbl_pr.find(qn("w:tblCellMar")).addprevious(parse_xml(f"<w:tblBorders {nsdecls('w')}>{grid}</w:tblBorders>"))
    for side in ("top", "bottom"):
        tbl_pr.find(qn("w:tblCellMar")).find(qn(f"w:{side}")).set(qn("w:w"), "40")
    for old in table.findall(qn("w:tblStylePr")):
        table.remove(old)
    table.append(parse_xml(
        f'<w:tblStylePr {nsdecls("w")} w:type="firstRow"><w:rPr><w:b/><w:bCs/></w:rPr>'
        f'<w:tcPr><w:tcBorders>{edge("bottom", 8, GRID, 0)}</w:tcBorders>{shade(HEAD_BG)}'
        '<w:vAlign w:val="bottom"/></w:tcPr></w:tblStylePr>'))

    # Page: US Letter with 1 inch margins, and the page number at the bottom
    section = doc.sections[0]
    section.page_width, section.page_height = Inches(8.5), Inches(11)
    for side in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(section, side, Inches(1))
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer._p.append(parse_xml(
        f'<w:fldSimple {nsdecls("w")} w:instr="PAGE"><w:r><w:rPr>{color(MUTED)}{size(9)}</w:rPr>'
        '<w:t>1</w:t></w:r></w:fldSimple>'))

    doc.save(str(OUT))
    print(f"Saved {OUT}")


if __name__ == "__main__":
    main()
