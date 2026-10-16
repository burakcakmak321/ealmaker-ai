# 02 – Stitch, row & size math review — Cable Tank Top (M, L)

Scripts (run with `python3 -I`, in `work/math/`):
- `size_model.py` – stitch counts, RS/WS parity, pattern-row phase, gauge ↔ measurements, pick-ups, which panel stitches go to the neck or shoulders, yardage estimate.
- `panel_sim.py` – simulates the 54-st panel stitch by stitch from the written instructions on p.6 (using the cable definitions on p.3), compares the result with the chart transcription, and checks the chart read RS right-to-left.
- `rib_seam.py` – the 2x2 rib carried round the body across two 1-st mattress seams.

Conventions found: row 1 = RS, so odd rows are RS. Cable row = ((g−13) mod 16)+1. **Length convention: finished length = (BO row − 1) / 2.4.** The BO row is not counted, but the split rows are counted. The same convention holds for body length, armhole depth and front neck depth. Width = sts / 1.8. Chest = 2 × (CO − 2) / 1.8, which allows for one stitch taken into each mattress seam.

## 1. Checkpoints per size (all computed independently)

| Section | M printed | M computed | L printed | L computed | Status |
|---|---|---|---|---|---|
| CO / rib multiple of 4 | 80 | 80 (80 mod 4 = 0) | 92 | 92 (92 mod 4 = 0) | OK |
| Row 13 set-up 1+seed+54+seed+1 | 80 | 1+12+54+12+1 = 80 | 92 | 1+18+54+18+1 = 92 | OK |
| Last straight row is WS | 86 | even = WS, pattern row 10 | 88 | even = WS, pattern row 12 | OK |
| BO 4, RS row | 87 → 76 | 76 | 89 → 88 | 88 | OK |
| BO 4, WS row | 88 → 72 | 72 | 90 → 84 | 84 | OK |
| 4 RS decrease rows | 89–95 → 70/68/66/64 | same, all odd | 91–97 → 82/80/78/76 | same, all odd | OK |
| Side sts left of the panel per side | – | 13−4−4 = 5 | – | 19−4−4 = 11 | OK, panel intact |
| Back split (RS, pattern row) | 127, row 3 | RS, row 3 | 133, row 9 | RS, row 9 | OK |
| Back 18/28/18, 22/32/22 | 64 | 64 | 76 | 76 | OK |
| Front split (RS, pattern row) | 111, row 3 | RS, row 3 | 115, row 7 | RS, row 7 | OK |
| Front 22/20/22, 26/24/26 | 64 | 64 | 76 | 76 | OK |
| Neck decreases (RS) → shoulder | 113–119 → 18 | all odd → 18 | 117–123 → 22 | all odd → 22 | OK |
| Top front-neck width = back neck | 28 | 20+2×4 = 28 | 32 | 24+2×4 = 32 | OK |
| Last shoulder row WS / BO row RS | 134 / 135 | WS / RS (pattern row 11) | 140 / 141 | WS / RS (pattern row 1) | OK |
| Panel count, 16 rows × 2 repeats | 54 | 54 every row | 54 | 54 | OK |

## 2. Gauge ↔ measurements (18 sts × 24 rows = 10 cm)

| Measurement | M printed | M computed | L printed | L computed | Status |
|---|---|---|---|---|---|
| Piece width | 44.4 | 80/1.8 = 44.4 | 51.1 | 92/1.8 = 51.1 | OK |
| Chest after seams | 86.7 | 2×78/1.8 = 86.7 | 100 | 2×90/1.8 = 100.0 | OK (assumes 1 st per edge in seam) |
| Body length | 55.8 | 134/2.4 = 55.8 | 58.3 | 140/2.4 = 58.3 | OK (BO row not counted; 56.2/58.8 if counted) |
| Armhole depth | 20.0 | rows 87–134 = 48 → 20.0 | 21.7 | rows 89–140 = 52 → 21.7 | OK |
| Shoulder | 18 sts / 10.0 | 10.0 | 22 sts / 12.2 | 12.2 | OK |
| Back neck | 28 sts / 15.6 | 15.6 | 32 sts / 17.8 | 17.8 | OK |
| Front neck depth | 10.0 | rows 111–134 = 24 → 10.0 | 10.8 | rows 115–140 = 26 → 10.8 | OK |
| cm→in conversions (all, incl. schematic) | – | all within rounding | – | all within rounding | OK |
| 900 m → 985 yd, 1050 m → 1148 yd | – | 984.3 / 1148.3 | – | – | OK |

Not computed (judgement): the gauge is quoted for a mixed cable and seed swatch. The cable panel will very likely draw in more than the seed fields, so the real width depends on that swatch. The rib is worked on a smaller needle, but its 12 rows are counted at the body row gauge (5.0 cm).

## 3. Panel: written vs chart (`panel_sim.py`)

- **Written (p.6) is internally correct.** Every T3B meets P-K-K and every T3F meets K-K-P, on all 6 T3 rows in both diamonds. Every C4/C6 meets knit stitches. The count is 54 on every row. The layout after each RS row matches the chart's knit/purl cells on the following WS row for all 8 WS rows, and the 16-row repeat closes on itself (row 16 → row 1). The Diamond contains 4 knit and 6 purl stitches on every row.
- **Chart cable labels are mirrored (img-003 and img-005 both).** The labels are drawn in written order from left to right. Read RS right-to-left, as p.3 instructs, every T3 row puts the crossings in the wrong place. Diamond columns are numbered 1–10 from the left. In the full panel, Diamond A = chart columns 12–21, Honeycomb = 24–31, Diamond B = 34–43:

| Row | Chart shows (L→R) | Required by written + definitions (L→R) | Effect if chart is followed |
|---|---|---|---|
| 3 | T3B@3–5, T3F@6–8 | T3F@3–5, T3B@6–8 | T3F meets P-K-K, T3B meets K-K-P (4 errors) |
| 5 | T3B@2–4, T3F@7–9 | T3F@2–4, T3B@7–9 | 4 wrong-type crossings |
| 7 | T3B@1–3, T3F@8–10 | T3F@1–3, T3B@8–10 | 4 wrong-type crossings |
| 9 | T3F@1–3, T3B@8–10 | T3B@1–3, T3F@8–10 | 4 wrong-type crossings |
| 11 | T3F@2–4, T3B@7–9 | T3B@2–4, T3F@7–9 | 4 wrong-type crossings |
| 13 | T3F@3–5, T3B@6–8 | T3B@3–5, T3F@6–8 | 4 wrong-type crossings |
| 15 | C4F@4–7 | same | OK |
| HC 1, 9 | C4B@1–4, C4F@5–8 | C4F@1–4, C4B@5–8 | crosses lean the opposite way to the written version |
| HC 5, 13 | C4F@1–4, C4B@5–8 | C4B@1–4, C4F@5–8 | crosses lean the opposite way to the written version |
| Rope 5, 13 | C6F | C6F | OK |

The knit/purl cells, the drawn slant lines (they show the correct direction of travel) and the dots inside the boxes (they show the post-crossing result) are all correct. Only the text labels are swapped.

## 4. Neck and shoulder stitches vs motifs (`size_model.py`)

Panel order: p3, Rope 1–6, p2, Diamond A 1–10, p2, Honeycomb 1–8, p2, Diamond B 1–10, p2, Rope, p3.

| Piece | M | L |
|---|---|---|
| Back shoulder (each) | 5 side + p3, Rope, p2, **Diamond sts 1–2** | 11 side + p3, Rope, p2 – **no motif cut** |
| Back neck BO | Diamond A 3–10, HC, Diamond B 1–8 → **cuts both diamonds** | both whole Diamonds + HC → **clean** |
| Front shoulder at split | 5 + p3, Rope, p2, Diamond 1–6 | 11 + p3, Rope, p2, Diamond 1–4 |
| Front neck BO | Diamond A 7–10, HC, Diamond B 1–4 | Diamond A 5–10, HC, Diamond B 1–6 |
| Front shoulder after 4 decreases | as back (Diamond 1–2 remain) | as back (Diamond fully consumed by decreases) |

The Rope cables and side fields stay complete in every case, and the Honeycomb is always bound off whole. The partial-motif rules are correct for back M, front M and front L. For back L the back-neck PARTIAL MOTIFS box (p.8) never applies; that is harmless, but the text could say so.

## 5. Pick-ups

| Edge | M (rows/sts → ×3/4) | printed | L | printed | Status |
|---|---|---|---|---|---|
| Armhole half, row-ends | 47–48 rows → 35–36 | 36 | 51–52 → 38–39 | 40 | OK (L slightly dense: 40/52 = 0.77) |
| Armhole total | 2×(4+36) = 80 | 80 | 2×(4+40) = 88 | 88 | OK, mult. of 4 |
| Back-neck side | rows 128–134 = 7 → 5.25 | 5 | 7 → 5.25 | 5 | OK |
| Front slope | rows 112–134 = 23 → 17.25 | 17 | 25 → 18.75 | 19 | OK |
| Neck total | 28+20+10+34 = 92 | 92 | 32+24+10+38 = 104 | 104 | OK, mult. of 4 |

A 3:4 ratio equals the gauge ratio 18/24, so it is mathematically consistent.

## 6. Findings

| ID | Size | Page/section | Problem (quote) | Why (arithmetic) | Correction | Verified |
|---|---|---|---|---|---|---|
| M1 | both | p.4 motif charts (img-003) and p.5 full chart (img-005), Diamond rows 3,5,7,9,11,13 | Labels "T3B"/"T3F" placed e.g. row 3 `p2, T3B, T3F, p2` from left to right; p.3: "Read RS chart rows from right to left"; p.5: "written directions… match this chart row-for-row" | Read R→L, row 3 cols 8–6 = P-K-K are labelled T3F, which needs K-K-P. 24 wrong-type crossings per repeat (4 per T3 row). The texture is destroyed from row 3 on. | Swap every T3B↔T3F label on rows 3–13 in both Diamond charts and in both Diamonds of the full chart (positions in the table in section 3). Keep the cells and slant lines unchanged. | panel_sim.py |
| M2 | both | same charts, Honeycomb rows 1,5,9,13 | `C4B C4F` / `C4F C4B` drawn left to right in written order | Read R→L, the first C4 worked differs from the written version, so every honeycomb cross leans the opposite way. Counts are unaffected. | Swap the C4B↔C4F labels on rows 1, 5, 9 and 13 of the Honeycomb (motif and full chart). | panel_sim.py |
| M3 | both | p.7 Row 1 rib + p.10 "mattress stitch, one full stitch in from the edge" | Both pieces work `*k2, p2*` from the same end | Each seam takes 1 st from each piece, leaving 78/90 visible sts per piece (≡ 2 mod 4). With identical pieces both seams show `k2, p1, k1, p2`: the rib breaks into 1-st columns at both side seams. | Keep the CO. Front Row 1: `*k2, p2*`. **Back Row 1: `*p2, k2*`**. Both seams then read as continuous k2/p2 (156 and 180 sts round = 39 and 45 repeats). Alternative: CO 4n+2 and decrease 2 on row 12. | rib_seam.py |
| M4 | both | p.7 seed fields | Left field `(k1,p1)`, right field `(p1,k1)`, both even | The right field ends in k1 and the left field starts with k1, so at each seam the visible seed sts meet k|k (then p|p on the next row): a 2-st column breaks the seed pattern at both seams. | Minor (cosmetic). Accept, or note "seed pattern meets as a 2-st rib column at seams". To fix it on 12/18 sts you would lose the mirror at the panel edges, so judgement. | manual |
| M5 | both | p.9 front split row with cable on that row | M split at row 111 = pattern row 3; L at row 115 = pattern row 7 | M: the T3F at Diamond A sts 6–8 (and the T3B at Diamond B 3–5) straddles the BO boundary on the split row itself. L: the T3B at Diamond A 1–3 is complete within the kept 26 sts, but its Diamond is already partial. The text does not say whether to work crossings on the split row. | Add: "On the split row, work the kept Diamond stitches in their knit/purl texture without crossings." | size_model.py + manual |
| M6 | both | p.2 schematic (img-001) | Outline: sloped line from underarm to neck corner; deep scoop labelled "Back neck"; armhole arrow | The instructions give a straight armhole for 39/43 rows (16.3/17.9 cm) after shaping, and a flat 18/22-st shoulder BO. The back neck is a flat BO only 8 rows (3.3 cm) deep, but it is drawn as a scoop about 8 cm deep. The drawing is not to scale: the armhole arrow is about 24 % of the body-length arrow, against 20/55.8 = 36 %. Front neck depth and chest do not appear on the schematic. | Redraw: vertical armhole after the 4 decreases, horizontal shoulder segment labelled with the shoulder width, flat back neck, separate front neck depth 10.0/10.8 cm, chest/width line. Labels are already correct. | manual (pixel measure) |
| M7 | both | p.8 back PARTIAL MOTIFS | "If the back neck cuts into a Diamond motif" | M: it does (2 sts of each Diamond remain on each shoulder, pattern rows 3–10). L: it does not (BO of panel sts 12–43 removes both whole Diamonds). | Optional: "(applies to M only; in L the back neck BO removes both Diamonds completely)". | size_model.py |
| M8 | — | p.2 yarn | 900 m / 1050 m | Stitch total ≈ 20.8k (M) / 25.0k (L) including bands. At 1.6–2.4 cm of yarn per st that is about 330–500 m / 400–600 m. | Generous by roughly 50–80 %, so not short. Judgement, not computed precisely; the designer may keep it. | size_model.py (estimate) |
| M9 | both | p.6 "Honeycomb 8" | C4B,C4F / C4F,C4B always on the same two 4-st groups | A true honeycomb offsets the crossings by 2 sts on alternate cable rows. This version gives two stacked columns of alternating crosses. Counts are correct. | Naming/design note only (judgement). | panel_sim.py |

## 7. Places to update together
- M1/M2: img-003 (p.4) Diamond 10 and Honeycomb 8 charts, and img-005 (p.5) full panel for both Diamonds and the Honeycomb. The p.6 written table is already correct; the p.4 text "T3B only across P-K-K…" is correct.
- M3: p.7 Row 1 rib text, and the p.10 side-seam note if a front/back rib difference is introduced.
- M6: p.2 schematic for both sizes.
- No printed number in the size table, the row map, the p.8–p.9 tables, the QC checklist (p.11) or the pick-up tables needs changing.

## 8. Open question
- M4/M3: Does the designer want an unbroken 2x2 rib and seed pattern across the side seams (then use the back offset rib in M3), or are the seam breaks acceptable?
