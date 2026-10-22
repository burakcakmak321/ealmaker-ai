# 00 – Manager decisions (authoritative for the editor)

Sources: 01-visual-structure.md (V*), 02-math.md (M*), manager's own read (G*).
Principle: keep design, sizes M & L, all stitch counts, row map and measurements. No count in the size table, row map, pp.8–9 tables, QC checklist or pick-up tables changes.

| ID | Location | Problem | Decision | Verification | Update in |
|---|---|---|---|---|---|
| D1 (M1,V1) | p.4 + p.5 charts, Diamond rows 3–13 | T3B/T3F labels mirrored; read RS R→L they land on wrong stitch types | Written p.6 is the source of truth. REBUILD all charts as SVG generated from ONE data model = written instructions. Chart col 1 = leftmost; RS rows read R→L. | panel_sim.py (math) – written order is the only valid one | motif charts, full chart |
| D2 (M2,V2) | Honeycomb rows 1,5,9,13 | C4B/C4F mirrored vs written | Same as D1 (written wins). | panel_sim.py | both charts |
| D3 (V3,V5) | charts | non-standard symbol lean; row numbers all on left; row 16 unnumbered | Standard symbols: front-crossing (C4F, C6F, T3F) top strand runs lower-right→upper-left; back-crossing (C4B, T3B) top strand runs lower-left→upper-right. RS (odd) row numbers on the RIGHT, WS (even) on the LEFT, all 16 rows numbered. Column numbers under the full chart (1–54, label every 5th or motif boundaries). Legend with every symbol drawn as in the chart. | visual | charts + key |
| D4 (V4) | p.6 full chart | cut off at page edge (53/54 sts visible) | Full chart must fit the page width (landscape page or split into two halves with overlap clearly marked). Prefer a landscape page or a single full-width chart with readable cells. | layout check | full chart page |
| D5 (M6,V10–V12) | p.2 schematic | sloped armhole/shoulder, scoop back neck, not to scale, front neck missing | Redraw TO SCALE from the numbers, separate FRONT and BACK outlines per size (or one outline with front neck dashed): straight sides to underarm, 4-st BO step, 4 decreases over 8 rows, vertical armhole, flat shoulder BO, back neck flat notch 8 rows deep (3.3 cm), front neck 20/24 BO + 4 decs, depth 10.0/10.8 cm. Label: width 44.4/51.1, length 55.8/58.3, armhole 20.0/21.7, shoulder 10.0/12.2, back neck 15.6/17.8, front neck depth 10.0/10.8, length to underarm 35.8/36.7 cm (86/88 rows ÷ 2.4). | numbers from size_model.py | schematic |
| D6 (M3) | p.7 Row 1 rib | rib breaks to k1/p1 at both side seams | FRONT Row 1 (RS): *k2, p2* to end. BACK Row 1 (RS): *p2, k2* to end. Explain in one sentence why (continuous rib across the seams). No count change. | rib_seam.py | hem section, back section mention, seam note |
| D7 (M4) | p.7 seed fields | seed meets k|k at seams | FRONT row 13: first seed field (k1, p1) ×n, second field (p1, k1) ×n (as original). BACK row 13: first field (p1, k1) ×n, second field (k1, p1) ×n. Mirror at panel edges preserved; seed continuous across seams. (manager-verified by hand) | manual | set-up table |
| D8 (M5) | p.9 front split row | crossings on split row undefined | "From the split row on (including the split row), work any Diamond that has lost stitches in its knit/purl texture without crossings. Rope cables stay complete and are crossed normally." | size_model.py | front section + neckline rule |
| D9 (M7) | p.8 partial motifs box | applies only to M | Add: "Size M only: 2 sts of each Diamond remain on each back shoulder. Size L: the back-neck BO removes both Diamonds completely." Front: "M: 2 Diamond sts remain on each shoulder; L: the neck decreases remove the cut Diamond completely." | size_model.py | back + front |
| D10 (G) | "left side" wording p.7 | RS working order starts at the right edge of the fabric; "left side" is confusing | Use "row start / row end" (first field / second field). | – | set-up table, seed text |
| D11 (G) | needles | no instruction to change from rib needle to body needle; no US sizes; no circular length | CO and rib with 4.0 mm (US 6); change to 4.5 mm (US 7) on row 13. Bands: 4.0 mm (US 6) 40 cm (16 in) circular, or DPNs / magic loop. | – | materials, hem, bands |
| D12 (G) | abbreviations | none defined (CO, BO, RS, WS, k, p, st(s), k2tog, ssk, pm/marker, sl, cn, rep, approx., seed st) | Add complete abbreviation table; define only abbreviations used. Define seed stitch. | – | new section |
| D13 (G) | split rows wording | "work 22; place on holder; BO centre 20" unclear about the st left after BO | "Work 22 sts and slip them to a holder; BO the next 20 sts (the st on the right needle after the last BO counts as the first of the remaining sts); work to end – 22 sts." Same for back and L. | counts unchanged | front + back |
| D14 (G) | measurements | no length-to-underarm check | Add approx. length at end of straight body (M 35.8 cm / 14.1 in, L 36.7 cm / 14.4 in) as a check; rows rule (keep the row numbers; if row gauge differs, length changes). | 86/2.4, 88/2.4 | body section |
| D15 (V6–V8,V13,V14) | cover photo | photo likely a render; shows extra ropes beside honeycomb, seed-filled diamonds, wider honeycomb, wider neck | Do NOT redesign. Keep photo on cover; add caption: "Cover image is a styling illustration; texture details may differ slightly from the charted design. Work from the charts and written instructions." | visual | cover |
| D16 (M8) | yarn | estimate generous | Keep 900 m / 1050 m (generous is safe; not verifiable). Add "Buy by meterage; amount includes a swatch." – no, do not add claims. Keep as is. | judgement | – |
| D17 (M9) | honeycomb | agent called it not a true honeycomb | REJECTED – C4B,C4F / C4F,C4B over 8 sts with 4-row offset is the standard 8-st honeycomb cable. Keep name. | manager | – |
| D18 (G) | gauge section | measuring area undefined | Gauge: "18 sts and 24 rows = 10 cm / 4 in over seed stitch and cable texture combined, on 4.5 mm needles, after washing and drying flat." Keep the existing piece-width check after 2 repeats. Add: if the piece is narrower/wider than the table, change needle size, not stitch counts. | – | gauge |
| D19 (G) | finishing | weaving in ends missing; band BO; final blocking | Add: weave in ends on WS along seams; light steam/wet block bands. | – | finishing |

Everything else (size table, row map, cable definitions, written panel table, pp.8–9 tables, pick-ups, QC checklist, problem solving, support/licence text, footer "MadeByShk | Cable Tank Top | M & L") is kept, with copy-edits only.

## Round 2 (from 04-audit.md and 05-layout.md)
| ID | Source | Decision |
|---|---|---|
| D20 | A1 | Keep pick-up counts (92/104). Reword: "Along row-end edges pick up slightly fewer than 3 sts for every 4 rows, as given in the table, so the band sits snugly." Remove the claim that totals are "matched to the stated gauge". |
| D21 | A2 + layout | Renumber chart columns conventionally: column 1 = RIGHTMOST cell (first stitch worked on RS rows). Update all text: "RS rows: read right to left starting at column 1". Motif charts and full chart. |
| D22 | A3 | "The block layout is symmetrical; work the cables exactly as charted/written (cable directions are not mirrored)." |
| D23 | A4 | 900 m / 984 yd. |
| D24 | A5 | Add once (size table note): "Lengths are measured before the shoulder bind-off row." |
| D25 | layout p.3, p.6 | Minimum label size ≈ 8 pt on schematic and charts (column numbers ≥ ~7 pt); check no label collisions after enlarging. |
| D26 | layout page count | Force page breaks only where sensible (cover, 01, 04 charts, 05 landscape chart, and where a section would otherwise split badly); let other sections flow; keep headings with following content; no split tables/notes/figures. Target ~10 pages. Optional: cover photo width 135 mm. |
