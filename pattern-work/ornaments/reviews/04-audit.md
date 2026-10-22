# 04 – Independent technical audit: 10 crochet ornaments (US terms, intermediate)

Auditor pass done blind: I followed the customer PDFs (`pdftotext -layout`) and the src images only. I read `build.py` afterwards, and only to confirm the cause of A1. Nothing was knitted or crocheted. "Computed" means my own scripts produced it: `work/audit/audit_counts.py` and `work/audit/audit_yarn_beads.py`, run with `python3 -I`. Their outputs are `work/audit/counts_out.txt` and `work/audit/yarn_out.txt`. "Read" means I checked it by reading the text or images. "Judgement" means a maker's opinion.

## Verdict

Overall: **FAIL**. One item (10 Lantern) has a step that can't be done as written. One systemic issue (tassel card and yardage) affects all 10 items. Every printed stitch count is arithmetically correct (each one recomputed).

| Item | Verdict |
|---|---|
| 01 Rose Heart | PASS WITH MINOR |
| 02 Sage Leaf | PASS WITH MINOR |
| 03 Mustard Star | PASS WITH MINOR |
| 04 Blush Flower | PASS WITH MINOR |
| 05 Rainbow Cloud | PASS WITH MINOR |
| 06 Pink Tulip | PASS WITH MINOR (A3 must be clarified) |
| 07 Snowflake | PASS WITH MINOR |
| 08 Butterfly | PASS WITH MINOR |
| 09 Moon & Star | PASS WITH MINOR |
| 10 Lantern | **FAIL** (A2) |

## Findings

| ID | Item / section | Faulty instruction (quote) | Reason (with arithmetic) | Required fix | Severity | Basis |
|---|---|---|---|---|---|---|
| A1 | ALL 10 / Tassel Step 1 + Materials | "Cut a piece of stiff card 19 cm (7.5 in) tall. Wrap … 40 times … Cut the yarn at the bottom edge" … "Trim the skirt evenly to 9 cm" (card 17 cm for the 8 cm tassels, 21 cm for the 10 cm one) | One wrap round an H cm card uses 2H of yarn. Cutting at the bottom and tying at the top leaves strands that hang H = 19 cm, so 10 cm × 80 ends = 8 m gets trimmed off. The yardage assumes only H per wrap (build.py `tassel_tally = wraps*(2L+1)`, card = 2L+1). As a result the stated yarn is too low everywhere. Heart A: needs ≈20.5 m, stated 14 m (the tassel alone is 15.2 m). Leaf C: 17.6 vs 12. Star B: 16.8 vs 11. Flower A: 18.3 vs 13. Tulip C: 17.0 vs 11. Snowflake: 20.9 vs 14. Butterfly A: 15.1 vs 10, B: 7.1 vs 6. Moon A: 23.9 vs 17. Lantern A: 30.0 vs 23. Rainbow A–E: ≈3.8–3.9 vs 3 each (G uses 2.94 of 3 m, so there is no allowance for tails). The "1 ball of 50 g is enough" line stays true. | Set the card height to the tassel length + 1 cm (10 cm for 9 cm, 9 cm for 8 cm, 11 cm for 10 cm). This matches the existing yardage model. Otherwise keep the card size and double the tassel term in the yardage. | Moderate (systemic) | Computed |
| A2 | 10 Lantern / Rims and Ribs, "Ribs" | "With Yarn B, work a line of surface slip stitch (see Techniques) up each column … (Rnds 18 to 6)". Technique: "Hold the yarn behind the work." | The ribs come after the body is finished: Rnd 23 says "Finish stuffing, fasten off and close the hole." Behind the work is now the inside of a closed, stuffed ball, so the working yarn can't be held there and the step can't be done as written. The rims are fine because they are worked on outside front loops. | Either (a) work the ribs as embroidery with a tapestry needle (surface chain or backstitch, one stitch per round from Rnd 18 to Rnd 6, travelling inside the stuffing; the "Embroidered vein (surface chain)" technique already exists in the generator), or (b) move the ribs before stuffing, i.e. after Rnd 18 and before "Begin stuffing" (which then has to move from Rnd 17). Option (a) is simpler. | **Major** | Read |
| A3 | 06 Tulip / Tulip Cup, petals | "Sl st in the next st; do not fasten off." … "Row 1 First petal: ch 1, sc2tog, sc 4, sc2tog" … "join Yarn A with a sl st in the next unworked st of Rnd 6, ch 1 and work Rows 1–4 over the next 8 sts" | It doesn't say whether Row 1 starts in the st that holds the sl st. If the maker reads "the next 8 sts" as the 8 after the sl st, the 3 petals use 1+8+1+8+1+8 = 27 sts of a 24-st round, so the 3rd petal runs 3 sts past the start. Each petal correctly uses 8 sts (2+4+2 → 6 → 4 → 2 → 1, verified). | Write "work Row 1 starting in the same st as the sl st (this st is the first of the 8)". Add a stitch marker every 8 sts before starting the petals. | Moderate | Computed |
| A4 | 08 Butterfly / Materials + Assembly | "2 gold-tone beads" … "1 wooden bead → 1 gold bead → the butterfly → 1 gold bead → 1 wooden bead." | Read bottom-up, src/hero.png shows wooden, gold, butterfly, gold (between the antennae), wooden, **gold**: 3 gold beads. Materials and Assembly agree with each other but not with the photo. | Add "→ 1 gold bead" at the top of the stack and change Materials to 3 gold beads, or state that the photo differs. | Minor | Read (image) |
| A5 | 04 Flower / Assembly | "the leaves → 1 gold bead → the flower" | The hero shows a second, smaller gold bead (or bead cap) partly hidden under the flower, above the 6 mm gold bead. 5 gold beads in the pattern vs 6 in the photo. | Optional: add a 4 mm gold bead or cap, or ignore it as a photo detail. | Minor | Read (image) |
| A6 | 09 Moon / Joining round | "sc in each of 5 row-ends down the side, 3 sc in the tip, sc in each of the 14 foundation ch … 3 sc in the other tip, sc in each of 5 row-ends up the side, sc in each of the 19 sts of Row 5" = 49 | The sum (5+3+14+3+5+19) is 49 ✓. The edge, however, only has 5+14+5+19 = 43 insertion points. The sequence needs 45, so each tip has to be a point that is neither a row-end nor one of the 14 ch (the skipped ch or turning-ch nub). A maker who follows the cloud convention ("3 sc in the first corner of the foundation edge" = a foundation ch) gets 5+3+12+3+5+19 = **47**. | Name the tip st, e.g. "3 sc in the corner (the end of the foundation chain), sc in each of the next 12 foundation ch, 3 sc in the other corner". Then recount (47), or keep 49 by stating "sc in each of 4 row-ends (Rows 5–2), 3 sc in the Row-1 row-end, sc in each of the 14 ch…". | Minor | Computed |
| A7 | 09 Moon / Assembly | "Pass the needle up through the lower tip from its underside, across the opening, and up through the upper tip" | In src/hero.png the cord runs vertically through the body of the moon at the roots of the horns (x≈165 px; the tips are at x≈300 px) and never crosses the opening. As written, the cord sits exposed across the open side and pulls both tips onto the cord line. | Change to "pass the needle vertically through the moon about 1 cm in from the inner curve, from the underside of the lower horn to the top of the upper horn". | Minor | Read (image) + judgement |
| A8 | 05 Rainbow / Assembly | "out through the top of the arch between the 2 middle sts of the last row" | Row 5 has 27 sts. That is odd, so the middle is a single st (st 14) and there are no "2 middle sts". | "…through the middle (14th) st of Row 5". | Minor | Computed |
| A9 | 05 Rainbow / Assembly | "to the centre of the dip between the bumps" | Row 5 makes 3 bumps, centred on sts 3, 7 and 11 of 13. The centre of the top edge is the middle of the **middle bump**, not a dip. | "…to the top of the middle bump" (hero: the cord comes out at the centre top of the cloud). | Minor | Computed |
| A10 | 05 Rainbow / intro | "the first and last 4 sts stay straight" | Rows 2–3 keep 5 sts and Rows 4–5 keep 6 sts straight at each end. | "the first and last 5–6 sts". | Minor | Read |
| A11 | 04 Flower / Leaves | "tips pointing down and outwards (a V)"; "Fasten off, leaving a 20 cm tail. … Sew the bases together … with the tails" | Bases touching at the top with the tips down and out is an inverted V (Λ). The fasten-off tail is at the tip, 2.7 cm from the base it should sew. The starting (slip-knot) tail is at the 3-sc base, but no length is given for it. | "(an upside-down V)". "Leave a 20 cm starting tail; use it to sew the bases." | Minor | Read |
| A12 | 07 Snowflake, 08 Butterfly / Techniques vs Rnd 1; Pattern Notes | MR technique: "pull up a loop and ch 1 (does not count)". Snowflake Rnd 1: "Ch 3 (counts as the first dc)". Butterfly: "make a MR, ch 2 (does not count)". Note: "Joined rounds … start the round with ch 1" | These conflict: should the maker do ch 1 and then ch 3 or ch 2? Snowflake Rnds 1–2 start with ch 3 and ch 5 that **count**, which contradicts the general note. | Add "unless the round says otherwise" to the note. In the MR technique write "pull up a loop and work the starting chain given in Rnd 1". | Minor | Read |
| A13 | ALL / Checkpoints & Troubleshooting | "every number is the stitch count on your **needle**"; "Lengths are worked to the measurement given, so measure the piece flat … and follow the cm" | "Needle" is knitting wording; crochet has one loop on the hook. No piece in any of the 10 patterns is worked to a length; all are worked by row or round count, so the advice misleads. | "…the number of stitches in the row/round after that step"; delete the "follow the cm" bullet. | Minor | Read |
| A14 | 01, 02, 05, 08, 09 / RS-WS | "On the right side of each leaf"; "with the wrong side facing"; "wrong sides together"; "Lay the wings right side up" | None of the patterns says which side is the RS. Turned-row pieces (heart, leaf, cloud, moon) have no natural RS. | Add a Pattern Note, e.g. "RS = the side facing you on Row 1 (mark it with a marker)"; for rounds, "RS = side facing you while working". | Minor | Read |
| A15 | 06 Tulip / Front Petal Rnd 3 | "(sl st, ch 2, sl st) in the centre st of the 3 incs" | The 3 incs of Rnd 2 make 6 sts, so there is no single centre st. | "…between the 3rd and 4th sts of the 6 made by the 3 incs" or "in the 2nd sc of the middle inc". | Minor | Computed |
| A16 | 06 Tulip / petals | "Fasten off." (Row 4) … "Using the tails, sew the edges of neighbouring petals together along Rows 1–2" | No tail length is given, and the fasten-off tail sits at the petal tip, about 1.7 cm from Rows 1–2. | "Fasten off leaving a 20 cm tail; take it down the petal edge to Row 2 and sew." | Minor | Read |
| A17 | 03 / 09 Star / start of points | Rnd 2 "Join." → Row 1 "sc in each of the next 3 sts" | No ch 1 before Row 1, and it doesn't say whether the first point starts in the join st. 5 × 3 = 15 sts fit exactly either way. | "Ch 1, sc in the same st as the join and the next 2 sts." | Minor | Read |
| A18 | 08 Butterfly / Body Step 2 | "14 times, each wrap next to the last, so the wraps cover 2.4 cm" | 24 mm / 14 = 1.7 mm per wrap. DK cotton is about 2–2.5 mm thick, so 14 wraps cover about 2.8–3.5 cm, which is longer than the body. | "Wrap closely until the 3 cm bundle is covered (about 12–14 wraps)." | Minor | Computed + judgement |
| A19 | 07 Snowflake / cover "≈ 17 cm" | Finished size | Tassel 9 + beads 1.2+0.6+0.6+1.2+0.6 + snowflake 6.4 = 19.6 cm, 13 % more than stated. All other items are within ±8 %. | "≈ 20 cm". | Minor | Computed |
| A20 | 06 Tulip / schematic "Front petal 2 cm × 3.5 cm" | Schematic label | From the stitches: 5 ch (2.3 cm) + 2 sc rnds + sl st rnd at each end + ch-2 point gives about 4.3 cm long; width is about 2.4 cm. | Re-check the label (≈2.4 × 4.2 cm) or call it "approx.". | Minor | Judgement |

What I checked and found OK (no finding):

- **All stitch counts:** every printed count (incs, decs, groups, partial rows, loops, petals, points) matches what its instruction produces, and every repeat fits exactly. Computed.
- **Leaf rows (3 sts left unworked each row):** each row's "before/after the tip" split is exactly n−c and c−4, so each row drops by 1. Main leaf: 23 → 22 → 21 → 20 → 19 → 18. Accent leaf: 13 → 12 → 11 → 10. Computed.
- **Rainbow arch rows:** in every row, stitches consumed = the previous row's count (15/18/21/24) and stitches made = the printed count. Computed.
- **Heart joining round (32):** the edge has 26 insertion points (1 centre + 2×(2+2+2) lobes + 2×6 sides + 1 point). Adding 6 extra stitches (4 lobe incs + 2 at the point) gives 32 ✓. Computed.
- **Cloud joining round (50):** the edge has 46 insertion points (13 ch + 4 + 25 + 4). Adding 4 extra corner stitches gives 50 ✓. Computed.
- **Moon joining round (49):** the arithmetic is correct; see A6 for the ambiguous tip stitch.
- **Abbreviations:** every abbreviation used is defined. Every technique referenced exists. Yarn letters and colours are consistent between Materials, pieces and tassels. Read.
- **Bead stacks vs Materials:** the counts match in all 10 items. Computed.
- **Bead stacks vs hero photo:** the order matches in 8 of 10 (exceptions A4, A5). Read.
- **Finished measurements:** within about 10 % of what gauge predicts for heart, leaf, star, flower, cloud/arch, stem, leaf, snowflake, moon and lantern. Moon: about 190° of curvature from the row increases and end decreases, so a deep crescent that matches the hero. Computed (geometric estimate).

## Per-item checkpoint table (computed by `work/audit/audit_counts.py`)

| Item | Step | Uses | Makes | Printed | OK |
|---|---|---|---|---|---|
| 01 Heart | R1 / R2 / R3 / R4 / R5–6 | 1 / 3 / 5 / 7 / 9 | 3 / 5 / 7 / 9 / 9 | 3 / 5 / 7 / 9 / 9 | ✓ |
| | R7 lobe 1 (+5 unworked) / R8 | 9 / 4 | 4 / 2 | 4 / 2 | ✓ |
| | R7 lobe 2 (skip 1, standing sc + 3) / R8 | 5 / 4 | 4 / 2 | 4 / 2 | ✓ |
| | Join Rnd 1 | 26 pts | 32 | 32 | ✓ |
| 02 Main leaf | R1 / R2 / R3 / R4 / R5 / R6 | ch12 / 23 / 22 / 21 / 20 / 19 | 23 / 22 / 21 / 20 / 19 / 18 | same | ✓ |
| 02 Accent leaf | R1 / R2 / R3 / R4 | ch7 / 13 / 12 / 11 | 13 / 12 / 11 / 10 | same | ✓ |
| 03 & 09 Star | Rnd 1 / Rnd 2 / 5 points × 3 sts | MR / 10 / 15 | 10 / 15 / 15 used | 10 / 15 | ✓ |
| | Point R1 / R2 / R3 | 3 / 3 / 2 | 3 / 2 / 1 | 3 / 2 / 1 | ✓ |
| 04 Flower | Rnd 1 / 2 / 3 / 4 / 5 | MR / 6 / 12 / 12 / 6 loops | 6 / 12 / 36 / 6 loops / 54 | same | ✓ |
| | Leaf (ch 7) | 5+1+5 ch | 13 | 13 | ✓ |
| 05 Arch | R1 / R2 / R3 / R4 / R5 | ch16 / 15 / 18 / 21 / 24 | 15 / 18 / 21 / 24 / 27 | same | ✓ |
| 05 Cloud | R1 / R2–4 / R5 | ch14 / 13 / 13 | 13 / 13 / 25 | same | ✓ |
| | Join Rnd 1 | 46 pts | 50 | 50 | ✓ |
| 06 Tulip cup | Rnd 1 / 2 / 3 / 4 / 5–6 | MR / 6 / 12 / 18 / 24 | 6 / 12 / 18 / 24 / 24 | same | ✓ |
| | Petal R1 / R2 / R3 / R4 (×3) | 8 / 6 / 4 / 2 | 6 / 4 / 2 / 1 | same | ✓ (A3) |
| 06 Front petal | Rnd 1 / 2 / 3 | ch6 / 12 / 18 | 12 / 18 / 18 | same | ✓ |
| 06 Stem / Leaf | Rnd 1 / Rnds 2–8 / Leaf (ch 10) | MR / 5 / 8+1+8 ch | 5 / 5 / 19 | same | ✓ |
| 07 Snowflake | Rnd 1 / Rnd 2 / Rnd 3 | MR / 12 / 12 sps | 12 / 12 dc + 12 sps / 6 arms + 6 points | same | ✓ |
| 08 Upper wing | Rnd 1 / Rnd 2 | MR / 11 | 11 / 15 | 11 / 15 | ✓ |
| 08 Lower wing | Rnd 1 / Rnd 2 | MR / 8 | 8 / 11 | 8 / 11 | ✓ |
| 09 Moon | R1 / R2 / R3 / R4 / R5 | ch15 / 14 / 16 / 17 / 18 | 14 / 16 / 17 / 18 / 19 | same | ✓ |
| | Join Rnd 1 | 43 pts (45 needed) | 49 | 49 | ✓ sum (A6) |
| 10 Lantern | Rnd 1 / 2 / 3 / 4 / 5 / 6 | MR / 6 / 9 / 12 / 18 / 18 | 6 / 9 / 12 / 18 / 18 / 18 | same | ✓ |
| | Rnd 7 / 8 / 9 / 10–15 | 18 / 24 / 30 / 36 | 24 / 30 / 36 / 36 | same | ✓ |
| | Rnd 16 / 17 / 18 / 19 / 20 | 36 / 30 / 24 / 18 / 18 | 30 / 24 / 18 / 18 / 18 | same | ✓ |
| | Rnd 21 / 22 / 23 | 18 / 12 / 9 | 12 / 9 / 6 | same | ✓ |
| | Top and bottom rim Rnd 1 (front loops of Rnd 5 / 18) | 18 | 27 | 27 | ✓ |
| | Ribs: 6 columns × 6 sts | 36 | — | 36 | ✓ |

### Yarn and beads (computed by `work/audit/audit_yarn_beads.py`)

Per-stitch yarn use is my estimate (sc 2.8 cm, dc 4.5 cm). The tassel figures are exact (wraps × 2 × card height).

| Item / yarn | Stated | Tassel | Cord + neck | Crochet ≈ | Total ≈ |
|---|---|---|---|---|---|
| 01 A | 14 | 15.2 | 0.7 | 4.6 | 20.5 |
| 02 C | 12 | 15.2 | 1.8 | 0.6 | 17.6 |
| 03 B | 11 | 15.2 | 1.6 | – | 16.8 |
| 04 A | 13 | 13.6 | 1.8 | 2.9 | 18.3 |
| 05 A / E / G | 3 | 2.94 | – | 0.96 / 0.81 / 0 | 3.9 / 3.75 / 2.94 |
| 06 C | 11 | 15.2 | 1.8 | – | 17.0 |
| 07 A | 14 | 15.2 | 1.6 | 4.1 | 20.9 |
| 08 A / B | 10 / 6 | 10.6 / 4.6 | 0.9 / 0.7 | 3.5 / 1.8 | 15.1 / 7.1 |
| 09 A | 17 | 15.2 | 1.9 | 6.8 | 23.9 |
| 10 A | 23 | 13.6 | 1.8 | 14.6 | 30.0 |

Bead counts, Materials vs Assembly: they match in all 10 items. Against the hero photo, two differ: 04 shows 6 gold beads (pattern has 5) and 08 shows 3 gold beads (pattern has 2).
