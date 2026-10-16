# 05 – Layout & PDF review

File: `output/Cable_Tank_Top_M_L_EN.pdf`. Pages rendered at 120 dpi to `work/layout_pages/p-01..12.png`; chart pages 5–6 also rendered at 200 dpi with crops in `work/layout_pages/crops/`.

## Technical checks

- **pdfinfo:** 12 pages, PDF 1.4 (Chromium/Skia). Pages 1–5 and 7–12 are Letter portrait (612×792 pt). Page 6 is Letter landscape (792×612 pt), as intended.
- **pdffonts:** only Carlito Regular, Bold and Italic are used. All are embedded and subset with Unicode maps. There are no Type 3 fonts and no fallback fonts.
- **pdfimages:** there is one raster image, the cover (1024×1024 px, about 243 ppi as placed). That is fine for print. All charts, schematics and symbols are vector SVG.
- **pdftotext:** I found no U+FFFD, no tofu and no stray "?". The non-ASCII characters are × (2), – (41), “ ” (3+3), − (1) and → (4), and all of them come out correctly. One minor point: the schematic SVG text is extracted with the ligature "ﬁ" (U+FB01), as in "seed-stitch side ﬁelds". It looks correct, but copy and search give the ligature character.

## Page-by-page

| Page | Severity | Issue | Evidence (what is visible) | Fix for the editor |
|---|---|---|---|---|
| 1 | Low | Bottom ~25 % of the page is empty | The design-reference note ends at about y=73 %; the space below is empty down to the footer. | Optional: `.cover-photo { width: 135mm; }` (from 118mm) to balance the page. The photo is 243 ppi at 118mm, so 135mm still gives about 212 ppi, which is acceptable. |
| 2 | – | No issues | Tables, Materials and Gauge are clean. Nothing is clipped and no heading is orphaned. | – |
| 3 | Medium | Schematic label text is below 8 pt | `fsz = 2.5` (mm) in `build_figures.py` line 411, placed at the native 92mm width, comes to about 7.1 pt. The "54-st cable panel / seed-stitch side fields" labels are 2.38–2.62mm (6.7–7.4 pt). They are readable on screen but small in print. | `build_figures.py` line 411: set `fsz = 2.85` (about 8.1 pt). Then check that on Size M the "Back neck … wide" block and the "Shoulder" block still do not touch: the gap is only about 3mm now. If needed, increase the `-3` / `+2` x-offsets on lines 441–447 to `-4` / `+3`. |
| 3 | Low | Lower ~25 % of the page is empty | The IMPORTANT note ends at about 75 %. | See the page-count note below (let 03 follow 02 without a forced break). |
| 4 | – | No issues | All 7 symbols plus the repeat box are shown in the key table and match the chart drawings. The panel map is 8.2 pt, which is fine. The two-column abbreviation list is not clipped. | – |
| 5 | – | No issues (charts) | At 200 dpi, Rope 6, Diamond 10 and Honeycomb 8 are crisp. Row numbers are 10 pt bold: odd numbers 1–15 on the right and even numbers 2–16 on the left, all present. Column numbers 1–n are about 8.1 pt. The red repeat outline surrounds all 16 rows. The legend (k, p, C4F, C4B, C6F, T3F, T3B, repeat) is complete and matches the chart symbols. | – |
| 5 | Low | Column numbering convention | Column 1 is drawn at the left. RS rows are read right to left, so a knitter starts at the highest column number. The text says this explicitly on p5 and p6, so it is consistent, but it is not the usual convention (column 1 at the right edge). | Optional: in `draw_chart` (line 326), label columns as `c1 - c + 1` / `ncol - local + 1` so that column 1 is at the right. If you do, update the p6 intro text ("start at column 54" → "start at column 1"). |
| 6 (landscape) | **Medium** | Full-chart labels are below 8 pt | The chart is placed at its native 254mm width, so these SVG sizes are the printed sizes. Column numbers are 1.98mm, about **5.6 pt**. Block labels (p3/Rope 6/Diamond 10/…) are 2.1–2.35mm, **6.0–6.7 pt**. Row numbers are 2.48mm, **7.0 pt** bold. All are legible at 200 dpi, but the column numbers in particular are tiny on paper. Symbols, row-number sides (odd on the right, even on the left), the 1–16 repeat outline and the legend are all complete and correct. | `build_figures.py` `draw_chart`: separate the text size from the cell size, for example `fs = max(cs * 0.55, 3.0)` (line 286) for row numbers and labels (about 8.5 pt). Change the column-number size on line 326 from `fs * 0.8` to `max(fs * 0.8, 2.85)`. The chart cannot be scaled up, because 254mm already fills the 257mm usable landscape width. |
| 6 | Low | Bottom ~40 % of the landscape page is empty | Chart, legend and note end at about 60 % of the page height. | This is acceptable because the chart is limited by width. Optionally, move the p7 "Even pattern rows (WS)" paragraph and the NECKLINE RULE note onto this page under the chart (both are about 30mm tall). |
| 7 | Low | Half the page is empty | Content ends at about 49 %. | Remove the forced break before section 07, or merge as described in the page-count note. No overflow. |
| 8 | – | No issues | The row-13 set-up table (4 rows) is on one line per row and not clipped. The CHECKPOINT note is intact. | – |
| 9 | – | No issues | The shaping table is not split. Long cells wrap cleanly. "→" renders correctly. | – |
| 10 | Low | ~45 % of the page is empty | Content ends at about 55 %. | Optional: let 09 follow 08 with no forced break (keep `h2 { break-after: avoid; }` and `table, .note { break-inside: avoid; }`). |
| 11 | – | No issues | "2×2" renders correctly. The two pickup tables are intact. | – |
| 12 | – | No issues | Checklist table, bullets, SUPPORT note and licence line (8.8 pt) are all fine. | – |

## Cross-document consistency

- Heading levels are consistent: H2 is "NN TITLE" in 19 pt and H3 is 12.5 pt green.
- Table header styling is identical on every page.
- The footer ("MadeByShk | Cable Tank Top | M & L", plus "Page X of 12") is present on all pages, including the landscape page.
- No orphaned headings, no clipped text, no text running into margins or the footer, and no tables split across pages.

## Suggested CSS for page reduction (optional)

```css
section.page { break-before: auto; }               /* default: flow */
section.page.newpage { break-before: page; }       /* add class to: 01, 04, 05 (landscape), 07, 10 */
h2, h3 { break-after: avoid; }
table, .note, .schematics, .motifs { break-inside: avoid; }
```

Pages 1–12 each carry about 50–78 % content (one section per forced page). With the breaks above, 02+03, 06 (on the landscape page or after the motif charts), 08+09 and 10+11 can share pages.

**Final: 12 pages. They can be reduced to about 10 pages without hurting readability, by not forcing a page break before every section. The cover, the motif-chart page and the landscape full chart stay on their own pages. The current 12 pages are also acceptable as they are, because nothing is cramped or clipped.**
