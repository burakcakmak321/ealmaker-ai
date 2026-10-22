# 04 – Independent technical audit: Cable_Tank_Top_M_L_EN.pdf (12 Letter pages)

Auditor pass done from the PDF only (`pdftotext -layout` to `work/audit/text.txt`, pages rendered at 110 dpi and page 5 at 300 dpi in `work/audit_pages/`), plus the SVG sources for exact cell counts. Reviews 00–03 and `work/math/` were read only after this pass, to cross-check. Nothing was knitted; there was no physical test.

## Verdict: PASS WITH MINOR

You can follow every step for both sizes using only the information given. Every count, row number, cable phase, measurement, pick-up total and chart cell matches between the text, the tables, the charts and the schematics. The remaining findings are about wording and approximations. None of them breaks the instructions.

## Method and evidence labels

- **[C] computed**: my own scripts, run with `python3 -I`:
  - `work/audit/panel_audit.py` parses the written panel table and the "row 1 written out" example straight from the PDF text. It simulates the 54-st panel stitch by stitch for two 16-row repeats, using the cable definitions in section 03. It then decodes `chart-full.svg`, the three motif SVGs and the legend SVGs geometrically (cell fills, glyph frames, which strand polygon is drawn on top, and where the purl dots sit) and compares them cell by cell with the simulation.
  - `work/audit/size_audit.py` checks counts, row parity, pattern-row phases, which motif stitches end up on each shoulder, cm and inch values, and the pick-up rules.
  - `work/audit/seam_audit.py` checks that the rib and the seed stitch stay continuous around the body once 1 st of each piece goes into each mattress seam.
- **[R] checked by reading**: I followed the text as a knitter would, and inspected the rendered pages visually.
- **[J] judgement**: design or fit opinion. Not an error.

## Findings

| ID | Page / section | Instruction (quote) | Reason | Required fix | Severity |
|---|---|---|---|---|---|
| A1 | p.11, 10 Neckline band | "Along row-end edges, distribute approximately 3 stitches for every 4 rows. The totals … are matched to the stated 18-st / 24-row gauge." with "5 along each back-neck side + 17 (19) along each front-neck slope" | [C] Back-neck side = rows 127–134 = 8 rows; ×3/4 = 6 sts, but 5 are printed. Front slope = rows 111–134 (115–140) = 24 (26) rows; ×3/4 = 18 (19.5), but 17 (19) are printed, and the slope also contains a diagonal of 4 decreases. Strictly applying the stated rule gives M 28+20+2×6+2×18 = 96, not 92. The printed totals are workable (multiples of 4, and slight under-picking suits a neck rib), but the sentence contradicts the numbers. | Reword, for example: "Along row-end edges pick up slightly fewer than 3 sts per 4 rows, as given in the table, so the band does not flare." Alternatively change the counts to M 6/18, total 96, and L 6/20, total 108. Rewording is preferred because no count changes. | Minor |
| A2 | p.5, 04 Motif charts | "Numbers under each chart are the stitch numbers within the motif." | [R] In the motif charts, "1" is the leftmost column. On RS rows, which are read right to left, that is the LAST stitch worked, so a knitter can take "stitch 1" to mean the first stitch worked. The full chart (p.6) uses the correct wording: "column numbers … start at column 54". | Change to "Numbers under each chart are column numbers (1 = leftmost); RS rows start at the highest number." | Minor |
| A3 | p.4, 03 Panel map | "The panel is symmetrical, so it reads the same in working order." | [R/C] This is true only of the block layout (p3, Rope 6 … Rope 6, p3). The crossings are not mirror-symmetric. For example, Honeycomb row 1 in working order is C4B, C4F, so the chart read left to right shows C4F, C4B. A reader could generalise the sentence to the cables. | Change to "The block layout is symmetrical, so the motif order is the same in working order; work the cables exactly as charted/written." | Minor (wording) |
| A4 | p.2, Materials | "Approx. 900 m / 985 yd" | [C] 900 m = 984.25 yd. L: 1050 m = 1148.29 yd, printed 1148. The two sizes are rounded differently. Harmless (approx.). | Optionally print 984 yd. | Cosmetic |
| A5 | p.2/p.3/p.8 lengths | "Body length 55.8 (58.3) cm", "Armhole 20.0 (21.7) cm" | [C] Both are measured to the last WS row 134 (140): 134/2.4 = 55.83 and 48/2.4 = 20.0; L 140/2.4 = 58.33 and 52/2.4 = 21.67. The shoulder BO row (about +0.4 cm) is not included. The text, tables and schematic all use this same convention, so it is consistent. | None required. Optionally add "measured before the shoulder bind-off". | Info |
| A6 | p.1/p.2 sizing | "Finished chest after side seams 86.7 cm / 34.1 in" (M) | [J] This is close-fitting or negative ease against common women's M bust ranges. The pattern does correctly tell the knitter to choose by finished measurement. | None. | Info |
| A7 | p.2 Gauge | "18 sts and 24 rows … over seed stitch and cable texture combined" | [J] One gauge is used for the whole width, but a 54-st panel with a full-cable honeycomb and ropes normally pulls in more than seed stitch. The pattern already covers this with the piece-width check after 2 repeats and its advice to change needle size, not stitch counts. | None. | Info |

I found no errors of major or critical severity.

## Verified items (no finding)

**Panel and charts [C]**
- The written table parsed from the PDF and the printed row-1 example are identical, token for token.
- The panel has 54 sts on every row. Every T3B meets P-K-K and every T3F meets K-K-P in working order. C4 and C6 always meet knit sts.
- Diamond = 4 k + 6 p on every row. Rope and Honeycomb are all knit on every row. The 16-row repeat closes after 1 and after 2 repeats.
- `chart-full.svg`: every one of rows 1–16 covers columns 1–54, and there are 0 mismatches against the simulation (all k/p cells, all glyph positions and widths). Odd rows are read with column = 55 − working position. WS rows are compared with the state after the RS row below.
- Glyph counts per repeat: C4F 6, C4B 4, C6F 4, T3F 12, T3B 12 (38 glyphs).
- T3 purl dots sit exactly at the purl's position before and after the cross.
- The motif charts are identical to the full-chart slices (Rope cols 4–9, Diamond 12–21, Honeycomb 24–31), and the second Rope and Diamond occurrences equal the first.
- Symbol lean, decoded from which polygon is drawn on top:
  - C4F, C6F and T3F: top strand runs lower right to upper left.
  - C4B and T3B: top strand runs lower left to upper right.
  - This matches the definitions (front cross moves the held stitches left, back cross moves them right) and the key text on p.4. Confirmed visually at 300 dpi.
- The PDF uses these SVG files (`pattern.html` src).

**Rib and seed across the side seams [C]**
- Front `*k2, p2*` / back `*p2, k2*`, with 1 st of each piece in each seam, gives k2/p2 runs around the whole body for M and L (both seams show p1+p1 and k1+k1).
- Row 13 seed set-ups (front (k1,p1)…(p1,k1); back (p1,k1)…(k1,p1); selvedges in the seams): both seams alternate unbroken (`kpkpkp` / `pkpkpk`). The fields mirror each other at the panel edges.

**Knitter walk-through [R]**
- Every abbreviation used (approx., BO, CO, cn, dec, DPNs, k, k2tog, p, pm, rep, RS, sm, ssk, st(s), WS, *, seed st, C4F/C4B/C6F/T3F/T3B, cm/mm/m, in/yd) is defined. Every referenced section and chart (03, 05, 06, 01) is present.
- The needle change at row 13 and the band needles are given.
- The BO "stitch on the right needle" convention is stated.
- Yarn rejoin positions are correct: the held first shoulder is rejoined with WS facing at the neck edge.
- Decreases mirror correctly: ssk at the start and k2tog at the end of RS rows.
- The no-crossing rule on the split row is stated. Partial-motif notes are given for both sizes.

**Schematic [C]**
- Decoding the SVG polygons back to sts and rows gives:
  - M: width 80 sts, steps at 4/8 sts, shoulder 18, neck 28, rows 86/88/95/126/134.
  - L: width 92 sts, shoulder 22, neck 32, rows 88/90/97/132/140.
  - Front neck: BO 20/24 at row 110/114 + 4 decs to row 119/123.
- Both axes are at 1.25 mm per cm (true scale). All labels equal the computed values, and inches are correct to 0.1 in.

## Per-size checkpoint table (from `work/audit/size_audit.py`)

| Checkpoint | M | L |
|---|---|---|
| CO / after rib row 12 | 80 | 92 |
| Side field incl. selvedge / panel / side field | 13 / 54 / 13 | 19 / 54 / 19 |
| Piece width / chest after 1-st seams | 44.44 / 86.67 cm | 51.11 / 100.00 cm |
| Last straight row (WS) / pattern row | 86 / 10 | 88 / 12 |
| After underarm BO rows | 76 (r87), 72 (r88) | 88 (r89), 84 (r90) |
| After 4 RS decs | 64 (r95), 5 outside each marker | 76 (r97), 11 outside each marker |
| Front split row / pattern row | 111 / 3 (RS) | 115 / 7 (RS) |
| Front keep / BO / keep | 22 / 20 / 22 | 26 / 24 / 26 |
| Front neck decs (RS) | 113, 115, 117, 119 → 18 | 117, 119, 121, 123 → 22 |
| Front neck width at top (sts) = back BO | 28 = 28 | 32 = 32 |
| Back split row / pattern row | 127 / 3 (RS) | 133 / 9 (RS) |
| Back keep / BO / keep | 18 / 28 / 18 | 22 / 32 / 22 |
| Diamond sts left on each shoulder (front and back) | 2 (stated) | 0 (stated) |
| Shoulder BO row / pattern row | 135 / 11 | 141 / 1 |
| To underarm / length / armhole | 35.83 / 55.83 / 20.00 cm | 36.67 / 58.33 / 21.67 cm |
| Front / back neck depth | 10.00 / 3.33 cm | 10.83 / 3.33 cm |
| Shoulder / back neck | 10.00 / 15.56 cm | 12.22 / 17.78 cm |
| Armhole pick-up: printed, (4+36)×2 or (4+40)×2, 3:4 estimate per half | 80, 80, 40 | 88, 88, 43 |
| Neck pick-up total (multiple of 4) | 92 (yes) | 104 (yes) |
| Neck back-side / front-slope: printed vs 3:4 rule | 5 vs 6 / 17 vs 18 | 5 vs 6 / 19 vs 19.5 (see A1) |

## Cross-check after my pass

I read `00-decisions.md` only after completing everything above. All decisions D1–D19 are reflected in the PDF, and I found no inconsistency introduced by the corrections:
- The row map, the pp.8–10 tables, the QC checklist, section 01 and the schematic all carry the same numbers.
- The charts are generated from the written table, and my independent decode agrees with it.
- The new front/back rib and seed set-ups work across the seams.
- A1–A3 are pre-existing wording points that the earlier reviews did not raise.
