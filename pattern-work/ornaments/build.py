#!/usr/bin/env python3
"""Builds pattern.json for the ten crochet hanging ornaments (one folder each).

Every piece is defined here from stitch counts; rows/rounds carry `ops` where the
skill's auditor can execute them, and `inc`/`dec` so the PDF builder checks counts.
Run:  python3 -I build.py   -> writes NN-name/pattern.json
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))

# --- yarn use estimate (DK cotton, 2.5 mm hook), cm of yarn per stitch -----------
YARN_CM = {"sc": 2.2, "hdc": 3.0, "dc": 3.8, "tr": 4.8, "ch": 0.9, "sl": 1.0}
M_PER_G = 2.3          # DK cotton, about 115 m per 50 g
MARGIN = 1.15

def metres(tally):
    return sum(YARN_CM[k] * v for k, v in tally.items()) / 100.0

def amount(m):
    m = m * MARGIN
    m = max(m, 3)
    g = max(1, math.ceil(m / M_PER_G))
    return (f"approx. {math.ceil(m)} m ({math.ceil(m * 1.0936)} yd), about {g} g — "
            f"1 ball of 50 g (about 115 m) is enough")

# --- small helpers -------------------------------------------------------------------
def st(label, text, count, ops=None, inc=0, dec=0, reset=False, **kw):
    d = {"label": label, "text": text, "count": count}
    if ops:
        d["ops"] = ops if isinstance(ops, list) else [ops]
    if inc:
        d["inc"] = inc
    if dec:
        d["dec"] = dec
    if reset:
        d["reset"] = True
    d.update(kw)
    return d

def note(label, text, tone="note"):
    return {"type": "step", "label": "", "text": f"{label}{text}", "count": ""}

def instr(text):
    return {"label": "", "text": text, "count": ""}

def spread(m, k):
    """k increases spread evenly over m stitches -> token list ('sc n' / 'inc')."""
    if k == 0:
        return [f"sc {m}"] if m else []
    pos = sorted({int((i + 0.5) * m / k) for i in range(k)})
    assert len(pos) == k
    toks, last = [], 0
    for p in pos:
        if p - last:
            toks.append(f"sc {p - last}")
        toks.append("inc")
        last = p + 1
    if m - last:
        toks.append(f"sc {m - last}")
    return toks

def compress(toks):
    """Write repeats as (a, b) xN where possible; keep it short and exact."""
    out, i = [], 0
    while i < len(toks):
        best = None
        for L in (2, 1):
            unit = toks[i:i + L]
            if len(unit) < L:
                continue
            n = 1
            while toks[i + n * L:i + (n + 1) * L] == unit:
                n += 1
            if n >= 2 and (best is None or n * L > best[0] * best[1]):
                best = (n, L)
        if best:
            n, L = best
            unit = toks[i:i + L]
            out.append(f"({', '.join(unit)}) x{n}" if L > 1 else f"{unit[0]} x{n}")
            i += n * L
        else:
            out.append(toks[i])
            i += 1
    return ", ".join(out)

def seq_count(toks):
    used = made = 0
    for t in toks:
        if t == "inc":
            used += 1; made += 2
        elif t == "sc2tog":
            used += 2; made += 1
        else:
            n = int(t.split()[1]); used += n; made += n
    return used, made

# --- common text ----------------------------------------------------------------------
GAUGE = ("22 sc and 24 rows/rnds = 10 cm (4 in) in single crochet with a 2.5 mm hook. "
         "Gauge is not critical for an ornament, but work firmly so that stuffing does not show "
         "and flat pieces keep their shape; sizes depend on your tension.")
SWATCH = ("Optional density check: ch 12, then work 10 rows of sc on 11 sts. The square should "
          "measure about 5 cm (2 in) wide and 4 cm (1.6 in) tall. If it is larger or you see gaps "
          "between stitches, use a smaller hook.")

BASE_ABBR = {
    "ch": "chain", "sl st": "slip stitch", "sc": "single crochet",
    "hdc": "half double crochet", "dc": "double crochet", "tr": "treble crochet (yo twice)",
    "inc": "2 sc in the same stitch", "dec": "invisible decrease (sc2tog through the front loops)",
    "sc2tog": "single crochet 2 together", "MR": "magic ring",
    "BLO": "back loop only", "FLO": "front loop only", "st(s)": "stitch(es)",
    "rnd(s)": "round(s)", "sp": "space", "rep": "repeat", "yo": "yarn over", "WS": "wrong side",
    "( ) xN": "work the sequence in brackets N times",
}

TECH = {
    "bump": {"name": "Working in the back bumps of a chain",
             "how": "Turn the chain over: each chain has a small horizontal bar (the back bump) on the back. Insert "
                    "the hook under that bar only. The front of the chain stays as a neat V edge, and later you can "
                    "work along the other side of the chain into the remaining loops."},
    "MR": {"name": "Magic ring (MR)",
           "how": "Wrap the yarn twice around two fingers, insert the hook under both strands, "
                  "pull up a loop and ch 1 (does not count as a stitch). Work the stitches of "
                  "Rnd 1 over both strands, then pull the tail firmly to close the centre."},
    "spiral": {"name": "Spiral rounds",
               "how": "Do not join or turn. Place a stitch marker in the first stitch of each round "
                      "and move it up as you go."},
    "dec": {"name": "Invisible decrease (dec)",
            "how": "Insert the hook in the front loop of the next st and in the front loop of the "
                   "following st (3 loops on hook), yo and draw through 2 loops, yo and draw "
                   "through the remaining 2 loops."},
    "sc2tog": {"name": "sc2tog (flat pieces)",
               "how": "Insert the hook in the next st, yo and pull up a loop; insert in the "
                      "following st, yo and pull up a loop (3 loops on hook); yo and draw through all 3."},
    "colour": {"name": "Colour change",
               "how": "Work the last stitch in the old colour until 2 loops remain on the hook, "
                      "complete it with the new colour. Cut the old colour leaving a 10 cm tail "
                      "and weave it in on the wrong side."},
    "join_sc": {"name": "Joining two pieces with sc",
                "how": "Hold the pieces wrong sides together with the edges matching. Insert the "
                       "hook through the stitch or row-end of BOTH pieces at once and work the sc "
                       "as usual, so one round of sc joins and edges them."},
    "standing": {"name": "Joining new yarn with a standing sc",
                 "how": "Make a slip knot on the hook, insert the hook in the stitch, yo, pull up "
                        "a loop, yo and draw through both loops. This sc counts as the first stitch."},
    "picot": {"name": "Picot",
              "how": "Ch 3, then sl st into the 3rd ch from the hook (the first of the three chains)."},
    "surface": {"name": "Surface slip stitch",
                "how": "Hold the yarn behind the work. Insert the hook from the front between two "
                       "stitches, pull up a loop; insert one round higher, pull up a loop and draw it "
                       "through the loop on the hook. Repeat, keeping the line straight and loose "
                       "enough that the fabric does not pucker."},
    "chainstitch": {"name": "Surface chain (embroidered)",
                    "how": "Bring the needle out where the line starts. Insert it back into the same hole and "
                           "bring it out one round (about 4 mm) higher with the yarn under the needle tip; pull "
                           "through to form a loop. Repeat, each stitch starting inside the previous loop. Anchor "
                           "the last loop with a tiny stitch."},
    "embroider": {"name": "Embroidered vein (surface chain)",
                  "how": "Thread a tapestry needle with the vein colour. Bring it up at the base, "
                         "make a chain stitch along the centre line (each stitch about 4 mm long) "
                         "and finish at the tip; secure both ends on the back."},
    "tassel": {"name": "Tassel neck wrap",
               "how": "Lay a 5 cm loop of the wrapping strand along the tassel, pointing down. "
                      "Wrap the long end tightly around tassel and loop, from the top down. Pass "
                      "the end through the loop, then pull the short tail at the top until the loop "
                      "disappears under the wraps. Trim both ends and hide them in the skirt."},
}

TASSEL_TAIL = ("Tassel neck: cut a 70 cm length of {neck}. Measure {head} cm down from the top fold "
               "and wrap it tightly {wraps} times around the bundle (see Tassel neck wrap in Techniques).")

def tassel_section(spec, cord_cm):
    L = spec["length"]
    card = L + 1
    wraps_text = spec["wraps_text"]
    steps = [
        st("Step 1", f"Cut a piece of stiff card {card} cm ({card / 2.54:.1f} in) tall. "
                     f"{wraps_text}", "", reset=False),
        st("Step 2", f"Cut the hanging cord: one {cord_cm} cm ({cord_cm / 2.54:.0f} in) length of "
                     f"{spec['cord']}. Slide it under all the wraps along the top edge of the card "
                     f"so that its middle sits there, and tie it in a tight square knot around the "
                     f"wraps. Both cord ends now point upwards.", ""),
        st("Step 3", "Cut through all the wraps along the bottom edge of the card and remove the card. "
                     "Let the strands hang down from the cord knot.", ""),
        st("Step 4", TASSEL_TAIL.format(neck=spec["neck"], head=spec["head"], wraps=8), ""),
        st("Step 5", f"Trim the skirt evenly to {L} cm ({L / 2.54:.1f} in) from the top fold. "
                     f"Hold it over steam (or dampen it) and comb the strands straight with your "
                     f"fingers; let it dry hanging.", ""),
    ]
    return {"title": "Tassel", "kicker": spec["kicker"], "shape": "none",
            "blocks": [{"type": "paragraph", "text":
                        "Make the tassel when the crochet pieces are finished. The hanging cord is tied "
                        "into its top, so it runs up through the whole ornament and is anchored in the tassel."},
                       {"type": "steps", "steps": steps}]}

def assembly_section(stack, through, finishing=None, extra_blocks=None):
    order = " → ".join(stack)
    bullets = [
        "Thread both cord ends together through a large-eye tapestry needle (or a bead needle "
        "with a big eye). Work upwards from the tassel.",
        f"String, from the tassel upwards: {order}.",
    ] + through + [
        "Push everything down snugly onto the tassel so there are no gaps. Holding both cord ends "
        "together, tie one overhand knot right above the top bead to lock the stack.",
        "Hanging loop: tie the two cord ends together with a square knot so that the loop measures "
        "8 cm (3 in) from the overhand knot to the top. Trim the ends to 5 mm and add a drop of "
        "fabric glue to the knot if you like.",
    ]
    blocks = [{"type": "bullets", "items": bullets}]
    if extra_blocks:
        blocks = extra_blocks + blocks
    if finishing:
        blocks.append({"type": "bullets", "items": finishing})
    blocks.append({"type": "note", "label": "Safety", "tone": "warning",
                   "text": "This is a decoration, not a toy, and not suitable for children under "
                           "3 years. Beads and cords are a choking and strangling hazard: hang it out "
                           "of reach of babies, young children and pets."})
    return {"title": "Assembly & Finishing", "shape": "none", "blocks": blocks}

def bead_item(gold, wood, wood10=0):
    parts = []
    if gold:
        parts.append(f"{gold} gold-tone beads 6 mm (hole at least 2.5 mm)")
    if wood:
        parts.append(f"{wood} natural wooden beads 12 mm (hole at least 3 mm)")
    if wood10:
        parts.append(f"{wood10} natural wooden bead 10 mm (hole at least 3 mm)")
    return {"item": "Beads", "detail": "; ".join(parts) +
            ". Both cord strands must pass through each bead together — test before you start."}

COMMON_NOTES = [
    "Terms: US crochet terms are used throughout; UK makers: US sc is the UK double crochet.",
    "Stitch counts: the number in parentheses at the end of a row or round is the number of stitches you "
    "have when it is finished. Tick the box when you finish each step.",
    "Spiral rounds (magic-ring pieces with no \"Join\"): do not join or turn; mark the first stitch of each "
    "round and move the marker up.",
    "Joined rounds (the round says \"Join\"): unless the round says otherwise, start with ch 1 (does not count "
    "as a stitch) and finish with a sl st into the first stitch.",
    "Rows: ch 1 at the end of a row, before turning, does not count as a stitch.",
    "Right side: for pieces in rounds, the outside of the rounds; for pieces in rows, choose the neater side "
    "and mark it. \"Wrong sides together\" means the marked right sides face out.",
    "Tails: leave a 20 cm (8 in) tail on pieces that will be sewn; weave in all other ends as you go.",
]

def base(title, subtitle, desc, size_text, yarn_summary, materials, abbr_keys, tech_keys,
         sections, measurements, photo_analysis, notes_extra=()):
    for m in materials:
        if m["item"] == "Beads":
            g = re.search(r"(\d+) gold", m["detail"]); w = re.findall(r"(\d+) natural wooden", m["detail"])
            gn = int(g.group(1)) if g else 0; wn = sum(int(x) for x in w)
            photo_analysis["visual_review"] += [
                vr("Gold beads", f"{gn} in the bead stacks", f"{gn}", "Yes", gn, gn, "count"),
                vr("Wooden beads", f"{wn} in the bead stacks", f"{wn}", "Yes", wn, wn, "count")]
    abbr = [[k, BASE_ABBR[k]] for k in abbr_keys]
    pieces = [x["title"] for x in sections if x["title"] not in ("Tassel", "Assembly & Finishing")]
    order = ["Read Before You Begin and gather the beads; check that both cord strands pass through every bead."]
    order += [f"Crochet: {p}." for p in pieces]
    order += ["Make the tassel and tie the hanging cord into it (Tassel).",
              "String beads and pieces on the cord, tie the knot and the hanging loop (Assembly & Finishing)."]
    sections.insert(0, {"title": "Order of Work", "shape": "none",
                        "blocks": [{"type": "bullets", "items": order}]})
    rows = []
    for sec in sections:
        for b in sec["blocks"]:
            if b.get("type") != "steps":
                continue
            st_ = [x for x in b["steps"] if x.get("label") and x.get("count") not in ("", None)]
            for k, x in enumerate(st_):
                last = k == len(st_) - 1 or st_[k + 1].get("reset")
                if x.get("reset") or last:
                    rows.append([b.get("title") or sec["title"], x["label"], str(x["count"])])
    sections.append({"title": "Checkpoints & Troubleshooting", "shape": "none", "blocks": [
        {"type": "paragraph", "text": "Count your stitches at these points; the numbers match the rows above."},
        {"type": "table", "headers": ["Piece", "After", "Stitches"], "rows": rows, "col_widths_cm": [6, 4, 3]},
        {"type": "bullets", "items": [
            "One stitch too many or too few: check the last increase or decrease round, and that you did not "
            "work into the slip-stitch join or the ch 1 at the start of a row.",
            "Piece cups or ripples: your tension differs from the gauge; change hook size by 0.25–0.5 mm rather "
            "than the stitch counts.",
            "Stuffing shows through: use a smaller hook, or stuff a little less firmly.",
            "Flat pieces curl: pin them out, mist with water (or starch) and let them dry flat.",
            "Cord will not pass through a bead: thread one strand at a time with a fine needle, or use beads with larger holes."]}]})
    if not title.startswith("Pink Tulip"):
        sections[0]["new_page"] = True
    sections[1]["new_page"] = False
    return {
        "title": title, "subtitle": subtitle, "craft": "crochet", "terminology": "US",
        "designer": "", "copyright": "",
        "cover_image": "src/hero.png", "cover_crop": "auto", "gallery_images": [],
        "skill_level": "Intermediate",
        "finished_size": size_text,
        "yarn_summary": yarn_summary,
        "tools_summary": "2.5 mm hook (US B/1–C/2)",
        "description": desc,
        "glance": [["SKILL LEVEL", "Intermediate"], ["FINISHED SIZE", size_text],
                   ["YARN", yarn_summary], ["HOOK", "2.5 mm (US B/1–C/2)"]],
        "checkboxes": True,
        "checkpoints": False,
        "size_guide": "One size. For a larger ornament use light worsted (#4) cotton and a 3 mm hook; "
                      "for a smaller one use sport-weight cotton and a 2 mm hook. Beads and tassel "
                      "length can be changed freely.",
        "gauge_numbers": {"sts_per_10cm": 22, "rows_per_10cm": 24},
        "gauge": GAUGE, "swatch": SWATCH,
        "materials": materials,
        "measurements": measurements,
        "abbreviations": abbr,
        "special_stitches": [],
        "techniques": [TECH[k] for k in tech_keys],
        "notes": COMMON_NOTES + list(notes_extra),
        "sections": sections,
        "photo_analysis": photo_analysis,
        "closing_note": "Thank you for making this ornament. Happy crocheting!",
        "yarn_evidence": "area estimate",
    }

def pa(summary, obs, review, assumptions, conf="Medium", conf_text=None):
    return {
        "summary": summary,
        "observations": obs,
        "visual_review": review,
        "accuracy": {"confidence": conf, "text": conf_text or (
            "Sizes are scaled from the photo using the 12 mm wooden beads as the reference; the "
            "photos look like rendered images, so stitch counts are a design reconstruction, not a "
            "count from a real sample. Make the piece once and compare before selling the pattern.")},
        "assumptions": assumptions,
    }

def ob(feature, evidence, conclusion, basis="Inferred", confidence="Medium"):
    return {"feature": feature, "evidence": evidence, "conclusion": conclusion,
            "basis": basis, "confidence": confidence}

def vr(feature, photo, pattern, match="Yes", pv=None, tv=None, kind=None, reason=None):
    d = {"feature": feature, "photo": photo, "pattern": pattern, "match": match}
    if pv is not None:
        d.update({"photo_value": pv, "pattern_value": tv, "kind": kind})
    if reason:
        d["reason"] = reason
    return d

CORD_OBS = ob("Hanging cord and beads", "Cream cord loop above a gold–wood–gold bead stack; same "
              "stack below the piece", "Cord tied into the tassel top and threaded up through "
              "beads and piece", "Inferred", "Medium")
TASSEL_OBS = ob("Tassel", "Long full tassel with a rounded head and a wrapped neck",
                "Wrapped-card tassel, about 40 wraps, neck wrapped 8 times", "Inferred", "Medium")

def tassel_spec(length, colour_name, cord_name, neck_name, head=2, wraps_text=None, kicker=None):
    return {"length": length, "cord": cord_name, "neck": neck_name, "head": head,
            "wraps_text": wraps_text or f"Wrap {colour_name} around the card 40 times, keeping the "
                                         f"wraps side by side and not too tight. Cut the yarn at the bottom edge.",
            "kicker": kicker or colour_name}

def tassel_tally(length, wraps=40):
    return (wraps * 2 * (length + 1) + 70) / 100.0  # metres: each wrap = 2 card heights

# ======================================================================================
# 1. HEART
# ======================================================================================
def heart():
    steps = [
        st("Row 1", "Ch 2, 3 sc in 2nd ch from hook. Ch 1, turn.", 3, reset=True, piece="Heart piece", flattened=True),
        st("Row 2", "inc, sc 1, inc. Ch 1, turn.", 5, ops="inc, sc 1, inc", inc=2),
        st("Row 3", "inc, sc 3, inc. Ch 1, turn.", 7, ops="inc, sc 3, inc", inc=2),
        st("Row 4", "inc, sc 5, inc. Ch 1, turn.", 9, ops="inc, sc 5, inc", inc=2),
        st("Rows 5–6", "sc 9. Ch 1, turn (2 rows).", 9, ops=["sc 9", "sc 9"], rounds=2),
        st("Row 7 (lobe 1)", "First lobe: sc 4; leave the remaining 5 sts unworked. Ch 1, turn.", 4, dec=5),
        st("Row 8 (lobe 1)", "sc2tog twice. Fasten off.", 2, ops="sc2tog x2", dec=2),
        st("Row 7 (lobe 2)", "Second lobe: skip the next (centre) st of Row 6 and join the yarn in the "
                    "following st with a standing sc; sc in the last 3 sts. Ch 1, turn.", 4, reset=True),
        st("Row 8 (lobe 2)", "sc2tog twice. Fasten off and weave in the ends.", 2, ops="sc2tog x2", dec=2),
    ]
    join = [
        st("Rnd 1", "Place the two pieces wrong sides together, lobes at the top. Join the yarn at "
                    "the centre dip and work through both layers: sc in the skipped centre st, sc in "
                    "each of 2 row-ends up the inner side of the first lobe, inc in each of its 2 top "
                    "sts, sc in each of 2 row-ends down its outer side, sc in each of 6 row-ends down "
                    "the side, 3 sc in the bottom point, sc in each of 6 row-ends up the other side, "
                    "sc in each of 2 row-ends up the outer side of the second lobe, inc in each of its "
                    "2 top sts, sc in each of 2 row-ends down its inner side.", 32, reset=True),
        instr("Stuff the heart firmly through the last 6–8 sts before you work them, pushing "
              "stuffing into the lobes and the point first. Join with a sl st to the first sc and "
              "fasten off; hide the end inside the heart."),
    ]
    sections = [
        {"title": "Heart", "kicker": "Yarn A · make 2 pieces, then join", "shape": "flat",
         "blocks": [{"type": "paragraph", "text":
                     "Each heart piece is worked in rows from the bottom point upwards, then the two "
                     "lobes are finished separately. The two pieces are joined with a round of sc "
                     "and stuffed before closing."},
                    {"type": "steps", "title": "Heart piece (make 2)", "steps": steps},
                    {"type": "steps", "title": "Joining round", "steps": join}]},
    ]
    ts = tassel_spec(9, "Yarn A (dusty rose)", "Yarn B (cream)", "Yarn A", kicker="Yarn A + Yarn B for the cord")
    sections.append(tassel_section(ts, 100))
    sections.append(assembly_section(
        ["1 gold bead", "1 wooden bead", "1 gold bead", "the heart", "1 gold bead", "1 wooden bead", "1 gold bead"],
        ["To pass through the heart: push the needle in at the centre of the bottom point and bring "
         "it out at the centre dip between the lobes, keeping it in the stuffing. Pull the cords "
         "through gently so the heart is not squashed."]))
    a = metres({"sc": 54 * 2 + 32}) + tassel_tally(9)
    b = 1.0 + 0.2
    mats = [
        {"item": "Yarn A (heart, tassel)", "detail": f"DK (#3) cotton, dusty rose — {amount(a)}"},
        {"item": "Yarn B (hanging cord)", "detail": f"DK (#3) cotton, cream — {amount(b)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(4, 2),
        {"item": "Notions", "detail": "fiberfill (a small handful), tapestry needle, stiff card "
                                       "for the tassel, scissors, stitch marker"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Heart (stuffed)", "≈ 4.5 cm (1.8 in)", "≈ 4 cm (1.6 in)"],
                     ["Tassel", "–", "9 cm (3.5 in)"],
                     ["Whole ornament without loop", "–", "≈ 18 cm (7 in)"]]}
    photo = pa("One product photo (rendered look) plus an infographic with step images; no scale "
               "reference other than the beads.",
               [ob("Craft", "Short x-shaped stitches stacked like bricks", "Crochet, sc", "Seen", "High"),
                ob("Heart construction", "Puffy heart with a seam ridge around the edge; step image shows two flat hearts",
                   "Two flat sc pieces joined with sc and stuffed", "Seen", "High"),
                ob("Heart size", "Heart ≈ 3.9 × the 12 mm wooden bead wide", "≈ 4.7 × 3.9 cm", "Inferred", "Medium"),
                CORD_OBS, TASSEL_OBS],
               [vr("Heart width : height", "1.20", "≈ 4.5 / 3.9 cm stuffed = 1.15", "Yes", 1.20, 1.15, "ratio"),
                vr("Tassel : heart height", "≈ 2.3", "9 / 4 = 2.25", "Yes", 2.3, 2.25, "ratio"),
                vr("Edge", "Raised seam ridge around the heart", "sc joining round through both layers", "Yes")],
               ["Bead sizes taken from the materials list (8–12 mm); the large wooden beads are taken as 12 mm.",
                "Stitch counts are designed to give the photographed proportions; the photo is not a countable sample."])
    return base("Rose Heart Tassel Ornament",
                "A stuffed crochet heart on a beaded cord with a full tassel",
                "A plump heart made from two single-crochet pieces joined with a round of sc and "
                "stuffed, strung on a cord with wooden and gold beads above a full tassel. Worked "
                "flat in rows; the tassel is tied directly onto the hanging cord.",
                "≈ 18 cm (7 in) plus an 8 cm loop", "DK cotton · 2 colours", mats,
                ["ch", "sc", "inc", "sc2tog", "sl st", "st(s)", "rnd(s)", "( ) xN"],
                ["sc2tog", "standing", "join_sc", "tassel"], sections, meas, photo)

# ======================================================================================
# 2. LEAF (ribbed BLO leaf worked around a chain)
# ======================================================================================
def ribbed_leaf_rows(ch, rows, piece):
    U = ch - 1
    s1, s2 = U - 1, U - 1
    out = [st("Row 1", f"Foundation: make a chain of {ch}. Sc in 2nd ch from hook and in next {U - 2} ch, 3 sc in last ch; "
                       f"working along the other side of the chain, sc in next {U - 1} ch. Ch 1, turn.",
              s1 + 3 + s2, reset=True, piece=piece, flattened=True)]
    for r in range(2, rows + 1):
        a = s2 + 1
        b = s1 + 1 - 3
        prev = s1 + 3 + s2
        cnt = a + 3 + b
        out.append(st(f"Row {r}", f"Working in BLO: sc in next {a} sts, 3 sc in next st (the centre "
                                   f"tip st), sc in next {b} sts; leave the last 3 sts unworked. Ch 1, turn.",
                      cnt, inc=2, dec=3))
        assert prev + 2 - 3 == cnt
        s1, s2 = a, b
    return out

def leaf():
    main = ribbed_leaf_rows(12, 6, "Main leaf")
    main[-1]["text"] = main[-1]["text"].replace("Ch 1, turn.", "Do not turn.")
    main.append(instr("Stem: ch 5, sl st in 2nd ch from hook and in next 3 ch. Sl st into the base "
                      "of the leaf and fasten off."))
    small = ribbed_leaf_rows(7, 4, "Accent leaf")
    small[-1]["text"] = small[-1]["text"].replace("Ch 1, turn.", "Do not turn.")
    small.append(instr("Stem: ch 4, sl st in 2nd ch from hook and in next 2 ch. Sl st into the base "
                       "of the leaf and fasten off."))
    sections = [
        {"title": "Main Leaf", "kicker": "Yarn A (dark green) · make 1", "shape": "flat",
         "blocks": [{"type": "paragraph", "text":
                     "The leaf is worked in rows around both sides of a foundation chain. Each row "
                     "goes up one side, round the tip and down the other side, and stops 3 sts short, "
                     "so the base becomes pointed and the back-loop rows form chevron ridges."},
                    {"type": "steps", "steps": main},
                    {"type": "note", "label": "Tip", "text":
                     "Mark the centre tip st (the middle of each 3-sc group) with a stitch marker and "
                     "move it up every row; it is the st that gets 3 sc in the next row."}]},
        {"title": "Accent Leaf", "kicker": "Yarn B (light green) · make 1", "shape": "flat",
         "blocks": [{"type": "steps", "steps": small}]},
        {"title": "Leaf Veins", "kicker": "Yarn C (cream)", "shape": "none",
         "blocks": [{"type": "paragraph", "text":
                     "On the right side of each leaf, embroider a vein in surface chain (see Techniques) "
                     "along the foundation chain, from the base of the stem to 5 mm below the tip."}]},
    ]
    ts = tassel_spec(9, "Yarn C (cream)", "Yarn C", "Yarn C")
    sections.append(tassel_section(ts, 110))
    sections.append(assembly_section(
        ["1 wooden bead 12 mm", "1 gold bead", "the accent leaf (tip down)", "1 wooden bead 10 mm",
         "1 gold bead", "the main leaf (tip down)", "1 gold bead", "1 wooden bead 12 mm"],
        ["To pass through a leaf: with the wrong side facing, run the needle under the stitches "
         "along the foundation chain on the back, entering at the tip and coming out at the stem, "
         "so the cord is hidden behind the vein. The leaves hang with the tip down and the stem up."]))
    def rows_sts(ch, rows):
        n = 2 * (ch - 2) + 3
        return sum(n - i for i in range(rows))
    a = metres({"sc": rows_sts(12, 6), "ch": 17, "sl": 5})
    b = metres({"sc": rows_sts(7, 4), "ch": 11, "sl": 4})
    c = tassel_tally(9) + 1.1 + 0.6
    mats = [
        {"item": "Yarn A (main leaf)", "detail": f"DK (#3) cotton, dark sage green — {amount(a)}"},
        {"item": "Yarn B (accent leaf)", "detail": f"DK (#3) cotton, light sage green — {amount(b)}"},
        {"item": "Yarn C (veins, tassel, cord)", "detail": f"DK (#3) cotton, cream — {amount(c)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(3, 2, 1),
        {"item": "Notions", "detail": "tapestry needle, stiff card for the tassel, 2 stitch markers, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Length"],
            "rows": [["Main leaf (without stem)", "≈ 5 cm (2 in)", "≈ 7.5 cm (3 in)"],
                     ["Accent leaf (without stem)", "≈ 3.4 cm (1.3 in)", "≈ 4.4 cm (1.7 in)"],
                     ["Tassel", "–", "9 cm (3.5 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Craft and stitch", "Dense short stitches in diagonal ridges on both halves", "Crochet, sc in back loops", "Seen", "Medium"),
                ob("Construction", "Ridges run parallel to the edge on each half, pointed base", "Rows worked around a foundation chain, stopping short each row", "Inferred", "Medium"),
                ob("Vein", "Cream line along the centre", "Surface chain embroidery", "Seen", "High"),
                ob("Main leaf size", "≈ 4.3 × 6.4 bead widths", "≈ 5 × 7.6 cm", "Inferred", "Medium"),
                CORD_OBS, TASSEL_OBS],
               [vr("Main leaf length : width", "1.49", "7.45 / 5.0 = 1.49", "Yes", 1.49, 1.49, "ratio"),
                vr("Accent : main leaf length", "0.56", "4.4 / 7.45 = 0.59", "Close", 0.56, 0.59, "ratio",
                   "one chain shorter would make the accent leaf too narrow for its 4 rows"),
                vr("Leaves", "2 leaves, dark above light", "Main leaf above accent leaf", "Yes", 2, 2, "count")],
               ["The infographic text suggests sc/hdc/dc/tr; the photographed ridged texture is reproduced with "
                "back-loop sc rows instead (design choice).",
                "Leaves hang tip down as in the photo."])
    return base("Sage Leaf Hanging Ornament",
                "Two ribbed crochet leaves with embroidered veins on a beaded cord",
                "Two leaves worked in back-loop single-crochet rows around a foundation chain, which "
                "gives the chevron ridges, finished with an embroidered vein and strung with wooden "
                "and gold beads above a cream tassel.",
                "≈ 27 cm (10.6 in) plus an 8 cm loop", "DK cotton · 3 colours", mats,
                ["ch", "sc", "sl st", "BLO", "st(s)"],
                ["embroider", "tassel"], sections, meas, photo)

# ======================================================================================
# 3. STAR (also used in the moon ornament)
# ======================================================================================
def star_steps(piece="Star"):
    return [
        st("Rnd 1", "10 sc in MR. Join.", 10, ops="10 sc in MR", reset=True, piece=piece, flattened=True),
        st("Rnd 2", "(sc 1, inc) x5. Join. Do not fasten off; continue with the points.", 15, ops="(sc 1, inc) x5", inc=5),
        instr("Points: each point is worked in rows over 3 sts of Rnd 2; after each point you slip "
              "stitch down its side and start the next point in the next st."),
        st("Row 1", "Point: ch 1, sc in each of the next 3 sts (for the first point, start in the same st as the join); "
                    "leave the rest of the round unworked. Ch 1, turn.", 3, reset=True, piece="Star point", flattened=True),
        st("Row 2", "sc2tog, sc 1. Ch 1, turn.", 2, ops="sc2tog, sc 1", dec=1),
        st("Row 3", "sc2tog. Ch 1; sl st in each of the 2 row-ends down the side of the point, then sl st "
                    "in the last st used for Row 1 of this point.", 1, ops="sc2tog", dec=1),
        instr("Repeat Rows 1–3 four more times, starting each point in the next st of Rnd 2 (5 points)."),
        st("Edge", "Sl st evenly around the whole star: 1 sl st in each st and row-end, (sl st, ch 1, "
                   "sl st) in the top of each point. Fasten off and weave in.", ""),
    ]

def star_section(kicker):
    return {"title": "Star", "kicker": kicker, "shape": "none",
            "blocks": [{"type": "paragraph", "text":
                        "A small sc circle is worked first; the five points are then worked one after "
                        "the other directly on its edge, without cutting the yarn, and a slip-stitch "
                        "edge sharpens the outline."},
                       {"type": "steps", "steps": star_steps()},
                       {"type": "note", "label": "Tip", "text":
                        "Pin the star flat, spray it lightly with water or starch and let it dry so the points stay straight."}]}

STAR_STS = {"sc": 10 + 15 + 5 * (3 + 2 + 1), "sl": 5 * 3 + 60, "ch": 15}

def star():
    sections = [star_section("Yarn A (mustard) · make 1")]
    ts = tassel_spec(9, "Yarn B (cream)", "Yarn B", "Yarn B")
    sections.append(tassel_section(ts, 90))
    sections.append(assembly_section(
        ["1 wooden bead", "1 gold bead", "the star", "1 gold bead", "1 wooden bead", "1 gold bead"],
        ["To pass through the star: hang it with one point up. Enter at the base of the bottom "
         "'valley' between the two lower points, run the needle up through the back of the stitches "
         "(across the centre ring) and out at the tip of the top point."]))
    a = metres(STAR_STS)
    b = tassel_tally(9) + 0.9
    mats = [
        {"item": "Yarn A (star)", "detail": f"DK (#3) cotton, mustard gold — {amount(a)}"},
        {"item": "Yarn B (tassel, cord)", "detail": f"DK (#3) cotton, cream — {amount(b)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(3, 2),
        {"item": "Notions", "detail": "tapestry needle, stiff card for the tassel, pins, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Star (point to point)", "≈ 4.2 cm (1.7 in)", "≈ 4 cm (1.6 in)"],
                     ["Tassel", "–", "9 cm (3.5 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Craft", "Short stitches in rounds around a centre hole", "Crochet in the round from a magic ring", "Seen", "High"),
                ob("Centre", "Infographic: magic ring with 10 sc", "Rnd 1 = 10 sc", "Seen", "High"),
                ob("Points", "5 points with straight edges", "Points worked in rows over 3 sts", "Inferred", "Medium"),
                ob("Star size", "≈ 4.4 × 4.2 cm from the bead scale", "R ≈ 2.2 cm", "Inferred", "Medium"),
                CORD_OBS, TASSEL_OBS],
               [vr("Points", "5", "5", "Yes", 5, 5, "count"),
                vr("Star width : height", "1.05", "4.2 / 4.0 = 1.05", "Yes", 1.05, 1.05, "ratio"),
                vr("Centre circle : star width", "0.42", "1.9 / 4.2 = 0.45", "Close", 0.42, 0.45, "ratio",
                   "two-round centre; a third round would make the star too large")],
               ["Point shaping (rows over 3 sts) is a design choice; the infographic does not give counts."])
    return base("Mustard Star Tassel Ornament",
                "A flat crochet star on a beaded cord with a cream tassel",
                "A flat five-point star: two rounds of sc from a magic ring, then each point worked "
                "in short rows on the edge, finished with a slip-stitch outline. It hangs on a cord "
                "with wooden and gold beads above a full tassel.",
                "≈ 17 cm (6.7 in) plus an 8 cm loop", "DK cotton · 2 colours", mats,
                ["ch", "sc", "inc", "sc2tog", "sl st", "MR", "st(s)", "rnd(s)", "( ) xN"],
                ["MR", "sc2tog", "tassel"], sections, meas, photo)

# ======================================================================================
# 4. FLOWER
# ======================================================================================
def flower():
    fl = [
        st("Rnd 1", "With Yarn D, 6 sc in MR. Join.", 6, ops="6 sc in MR", reset=True, piece="Flower", flattened=True),
        st("Rnd 2", "inc x6. Join and fasten off Yarn D.", 12, ops="inc x6", inc=6),
        st("Rnd 3", "Inner petals: join Yarn B with a sl st in any st. *(sc, hdc, dc) in next st, (dc, hdc, sc) in next st*; "
                    "rep from * 5 more times. Join with a sl st to the first sc. Fasten off Yarn B.",
           36, inc=24),
        st("Rnd 4", "Petal base loops, worked behind Rnd 3: fold the pink petals forwards. Join Yarn A "
                    "with a sl st around the post of a Rnd 2 st at the gap between two petals. "
                    "*Ch 5, sl st around the post of the Rnd 2 st at the next gap between petals*; "
                    "rep from * 5 more times, the last sl st in the first sl st.", "6 ch-5 loops", reset=True, piece="Petal loops", flattened=True),
        st("Rnd 5", "Outer petals: in each ch-5 loop work (sc, hdc, 2 dc, tr, 2 dc, hdc, sc). Join with a "
                    "sl st to the first sc and fasten off.", 54, reset=True, piece="Outer petals", flattened=True),
    ]
    lf = [
        st("Leaf", "Leaving a 20 cm starting tail, make a chain of 7. Working in the back bumps: sl st in 2nd ch from hook, sc in next ch, hdc in "
                   "next ch, dc in next 2 ch, 3 sc in last ch; working along the other side of the "
                   "chain: dc in next 2 ch, hdc in next ch, sc in next ch, sl st in the last ch (the tip). "
                   "Ch 2, sl st in 2nd ch from hook (tiny point). Fasten off and weave in this end.",
           13, reset=True, piece="Leaf", flattened=True),
    ]
    sections = [
        {"title": "Flower", "kicker": "Yarns D, B and A · make 1", "shape": "none",
         "blocks": [{"type": "paragraph", "text":
                     "The flower is worked in joined rounds: a yellow centre, a ring of six pink "
                     "petals, then a round of chain loops behind them that carries the six large cream petals."},
                    {"type": "steps", "steps": fl}]},
        {"title": "Leaves", "kicker": "Yarn C (sage green) · make 2", "shape": "none",
         "blocks": [{"type": "steps", "steps": lf},
                    {"type": "paragraph", "text":
                     "Place the two leaves with their 3-sc bases touching and the tips pointing down and "
                     "outwards (an upside-down V). Sew the bases together over 5 mm with the starting tails."}]},
    ]
    ts = tassel_spec(8, "Yarn A (cream)", "Yarn A", "Yarn A")
    sections.append(tassel_section(ts, 110))
    sections.append(assembly_section(
        ["1 gold bead", "1 wooden bead", "1 gold bead", "the leaves", "1 gold bead", "the flower",
         "1 gold bead", "1 wooden bead", "1 gold bead"],
        ["Leaves: pass the needle up through the sewn bases of the two leaves.",
         "Flower: enter at the base of the lowest outer petal, run the needle up behind the stitches on "
         "the back, through the centre, and out at the top of the highest outer petal."]))
    a = metres({"sc": 12 + 12, "hdc": 12, "dc": 24, "tr": 6, "ch": 30, "sl": 8}) + tassel_tally(8) + 1.1
    b = metres({"sc": 12, "hdc": 12, "dc": 12, "sl": 2})
    c = metres({"sc": 2 * 4, "hdc": 4, "dc": 8, "sl": 6, "ch": 18}) + 0.4
    d = metres({"sc": 18, "sl": 2})
    mats = [
        {"item": "Yarn A (outer petals, tassel, cord)", "detail": f"DK (#3) cotton, cream — {amount(a)}"},
        {"item": "Yarn B (inner petals)", "detail": f"DK (#3) cotton, blush pink — {amount(b)}"},
        {"item": "Yarn C (leaves)", "detail": f"DK (#3) cotton, sage green — {amount(c)}"},
        {"item": "Yarn D (centre)", "detail": f"DK (#3) cotton, mustard yellow — {amount(d)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(5, 2),
        {"item": "Notions", "detail": "tapestry needle, stiff card for the tassel, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Flower", "≈ 4.6 cm (1.8 in)", "≈ 4.6 cm (1.8 in)"],
                     ["Leaf (each)", "≈ 1.7 cm (0.7 in)", "≈ 2.7 cm (1.1 in)"],
                     ["Tassel", "–", "8 cm (3.1 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Construction", "Yellow centre, 6 pink petals, 6 larger cream petals behind", "Layered flower in joined rounds", "Seen", "High"),
                ob("Centre", "Infographic: 6 sc in MR, increase to 12", "Rnds 1–2", "Seen", "High"),
                ob("Leaves", "Two green leaves in a V below the flower", "Two small leaves worked around a chain", "Seen", "High"),
                CORD_OBS, TASSEL_OBS],
               [vr("Inner petals", "6", "6", "Yes", 6, 6, "count"),
                vr("Outer petals", "6", "6", "Yes", 6, 6, "count"),
                vr("Flower width / bead", "≈ 3.8", "46 / 12 = 3.8", "Yes", 3.8, 3.8, "ratio")],
               ["Petal stitch groups are a design choice that gives the photographed petal sizes."])
    return base("Blush Flower Tassel Ornament",
                "A layered crochet flower with two leaves on a beaded cord",
                "A flat layered flower — yellow centre, six pink petals and six large cream petals "
                "worked on chain loops behind them — with two small leaves below, strung on a beaded "
                "cord above a cream tassel.",
                "≈ 21 cm (8.3 in) plus an 8 cm loop", "DK cotton · 4 colours", mats,
                ["ch", "sc", "inc", "sl st", "hdc", "dc", "tr", "MR", "st(s)", "rnd(s)", "rep"],
                ["MR", "bump", "tassel"], sections, meas, photo)

# ======================================================================================
# 5. RAINBOW & CLOUD
# ======================================================================================
def arc_rows(first, incs, colours, piece, taper=False):
    rows = [st("Row 1", f"With {colours[0]}, ch {first + 1}. Sc in 2nd ch from hook and in each ch across. "
                        f"Change to {colours[1]} in the last st; ch 1, turn.", first, ops=[f"ch {first + 1}", f"sc {first}"] if False else None,
               reset=True, piece=piece, flattened=True)]
    n = first
    for r, k in enumerate(incs, start=2):
        if taper:
            mid = n - 4
            toks = ["sc2tog"] + spread(mid, k) + ["sc2tog"]
        else:
            legs = 4 if n >= 15 else 3
            mid = n - 2 * legs
            toks = [f"sc {legs}"] + spread(mid, k) + [f"sc {legs}"]
        merged = []
        for t in toks:
            if t.startswith("sc ") and merged and merged[-1].startswith("sc "):
                merged[-1] = f"sc {int(merged[-1][3:]) + int(t[3:])}"
            else:
                merged.append(t)
        toks = merged
        used, made = seq_count(toks)
        assert used == n, (used, n)
        seq = compress(toks)
        tail = (f" Change to {colours[r]} in the last st; ch 1, turn." if r < len(colours)
                else " Fasten off.")
        rows.append(st(f"Row {r}", f"{seq}.{tail}", made, ops=seq, inc=k, dec=(2 if taper else 0)))
        n = made
    return rows

def rainbow():
    cols = ["Yarn E (blue)", "Yarn D (mint)", "Yarn C (yellow)", "Yarn B (peach)", "Yarn A (pink)"]
    rb = arc_rows(15, [3, 3, 3, 3], cols, "Rainbow")
    cl = [
        st("Row 1", "Foundation: make a chain of 14. Sc in 2nd ch from hook and in each ch across. Ch 1, turn.", 13, reset=True, piece="Cloud", flattened=True),
        st("Rows 2–4", "sc 13. Ch 1, turn (3 rows).", 13, ops=["sc 13"] * 3, rounds=3),
        st("Row 5", "Bumps: sl st in first st, (skip 1 st, 7 dc in next st, skip 1 st, sl st in next st) x3. "
                    "Fasten off.", 25, inc=12),
    ]
    join = [
        st("Rnd 1", "Hold the two cloud pieces wrong sides together, bumps at the top, and slide the "
                    "rainbow legs 1.5 cm (0.6 in) down between them, centred. With Yarn F, work through "
                    "both layers (and through the legs where they sit): 3 sc in the first corner of the "
                    "foundation edge, sc in each of the next 11 foundation ch, 3 sc in the last corner, "
                    "sc in each of 4 row-ends up the side, sc in each sl st and dc across the bumps, sc "
                    "in each of 4 row-ends down the other side.", 50, reset=True),
        instr("Before closing the last 10 sts, stuff the cloud lightly so it stays flat. Join with a sl st "
              "to the first sc and fasten off."),
    ]
    sections = [
        {"title": "Rainbow Arch", "kicker": "Yarns E, D, C, B, A · make 1", "shape": "none",
         "blocks": [{"type": "paragraph", "text":
                     "The arch is worked in one piece in rows, starting with the inner (blue) arc. "
                     "Each row adds 3 sts in the middle while the first and last 5–6 sts stay straight, "
                     "so the strip curves into an arch with straight legs. Change colour at the end of "
                     "every row."},
                    {"type": "steps", "steps": rb},
                    {"type": "note", "label": "Tip", "text":
                     "Weave the colour tails into the row they belong to on the back. Pin the arch "
                     "into an even semicircle and steam it lightly before joining it to the cloud."}]},
        {"title": "Cloud", "kicker": "Yarn F (cream) · make 2 pieces, then join", "shape": "none",
         "blocks": [{"type": "steps", "title": "Cloud piece (make 2)", "steps": cl},
                    {"type": "steps", "title": "Joining round", "steps": join}]},
    ]
    ts = tassel_spec(10, "the rainbow colours", "Yarn F (cream)", "Yarn F",
                     wraps_text="Wrap each of Yarns A, B, C, D, E and G around the card 7 times, one colour "
                                "next to the other in rainbow order (42 wraps). Cut the yarn at the bottom edge.",
                     kicker="Yarns A–E, G; Yarn F for neck and cord")
    sections.append(tassel_section(ts, 100))
    sections.append(assembly_section(
        ["1 wooden bead", "1 gold bead", "the cloud and rainbow", "1 wooden bead"],
        ["Cloud and rainbow: push the needle up through the cloud from the centre of its bottom edge "
         "to the top of the middle bump, take the cord up through the opening of the arch "
         "and out through the top of the arch at the 14th (centre) st of Row 5."]))
    tal = lambda n: metres({"sc": n, "ch": 1})
    rows = [15, 18, 21, 24, 27]
    per = {c: tal(n) + tassel_tally(10, 7) - 0.6 for c, n in zip("EDCBA", rows)}
    f = metres({"sc": 2 * (13 * 4), "dc": 2 * 21, "sl": 8, "ch": 30}) + metres({"sc": 50}) + 1.0 + 0.7
    g = tassel_tally(10, 7) - 0.6
    mats = [
        {"item": "Yarn A (pink)", "detail": f"DK (#3) cotton — {amount(per['A'])}"},
        {"item": "Yarn B (peach)", "detail": f"DK (#3) cotton — {amount(per['B'])}"},
        {"item": "Yarn C (yellow)", "detail": f"DK (#3) cotton — {amount(per['C'])}"},
        {"item": "Yarn D (mint)", "detail": f"DK (#3) cotton — {amount(per['D'])}"},
        {"item": "Yarn E (blue)", "detail": f"DK (#3) cotton — {amount(per['E'])}"},
        {"item": "Yarn F (cloud, cord, tassel neck)", "detail": f"DK (#3) cotton, cream — {amount(f)}"},
        {"item": "Yarn G (tassel only)", "detail": f"DK (#3) cotton, lilac — {amount(g)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(1, 2),
        {"item": "Notions", "detail": "fiberfill (a little), tapestry needle, stiff card for the tassel, pins, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Rainbow arch", "≈ 5.3 cm (2.1 in)", "≈ 4.7 cm (1.9 in)"],
                     ["Cloud (lightly stuffed)", "≈ 6.7 cm (2.6 in)", "≈ 3.4 cm (1.3 in)"],
                     ["Tassel", "–", "10 cm (4 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Arch colours", "Pink, peach, yellow, mint, blue from outside in", "5 rows, one colour each", "Seen", "High"),
                ob("Arch construction", "Infographic shows 5 separate strips sewn together", "Worked as one piece in rows with a colour change per row (design choice: neater and no sewing)", "Design choice", "Medium"),
                ob("Cloud", "Puffy cream cloud with bumps along the top, edge ridge", "Two flat pieces joined with sc and lightly stuffed", "Seen", "High"),
                ob("Tassel colours", "Pink, peach, yellow, mint, blue, lilac stripes", "6 colours × 7 wraps", "Seen", "High"),
                CORD_OBS],
               [vr("Arch bands", "5", "5", "Yes", 5, 5, "count"),
                vr("Cloud width : arch width", "1.10", "6.7 / 5.3 = 1.26", "Close", 1.10, 1.26, "ratio",
                   "arch kept narrow so the inner opening stays small, as photographed"),
                vr("Tassel colours", "6", "6", "Yes", 6, 6, "count")],
               ["Arch made in one piece instead of five sewn strips; the finished look is the same."])
    return base("Pastel Rainbow Cloud Ornament",
                "A crochet rainbow arch and puffy cloud on a beaded cord with a rainbow tassel",
                "A five-colour rainbow arch worked in one piece in rows, set into a lightly stuffed "
                "cloud made from two joined pieces, hanging above a striped rainbow tassel.",
                "≈ 20 cm (7.9 in) plus an 8 cm loop", "DK cotton · 7 colours", mats,
                ["ch", "sc", "inc", "sl st", "dc", "st(s)", "rnd(s)", "( ) xN"],
                ["colour", "join_sc", "tassel"], sections, meas, photo)

# ======================================================================================
# 6. TULIP
# ======================================================================================
def tulip():
    cup = [
        st("Rnd 1", "With Yarn A, 6 sc in MR.", 6, ops="6 sc in MR", reset=True, piece="Tulip cup"),
        st("Rnd 2", "inc x6.", 12, ops="inc x6", inc=6),
        st("Rnd 3", "(sc 1, inc) x6.", 18, ops="(sc 1, inc) x6", inc=6),
        st("Rnd 4", "sc 1, inc, (sc 2, inc) x5, sc 1.", 24, ops="sc 1, inc, (sc 2, inc) x5, sc 1", inc=6),
        st("Rnds 5–6", "sc in each st around (2 rnds). Sl st in the next st; do not fasten off.", 24, ops=["sc in each st around"] * 2, rounds=2),
        instr("Petals: the 24 sts are divided into 3 groups of 8; place a marker in every 8th st so the groups "
              "are clear. Each petal is worked in rows over one group."),
        st("Row 1", "First petal: ch 1; starting in the same st as the sl st, sc2tog, sc 4, sc2tog over the first "
                    "group of 8 sts. Ch 1, turn.", 6, reset=True, piece="Petal"),
        st("Row 2", "sc2tog, sc 2, sc2tog. Ch 1, turn.", 4, ops="sc2tog, sc 2, sc2tog", dec=2),
        st("Row 3", "sc2tog x2. Ch 1, turn.", 2, ops="sc2tog x2", dec=2),
        st("Row 4", "sc2tog. Fasten off, leaving a 20 cm tail for sewing.", 1, ops="sc2tog", dec=1),
        instr("Second and third petals: join Yarn A with a standing sc… no — join with a sl st in the next "
              "unworked st of Rnd 6, ch 1 and work Rows 1–4 over the next 8 sts. Repeat for the last 8 sts."),
        instr("Stuff the cup firmly. Using the tails (sew down from each tip), sew the edges of neighbouring petals together along "
              "Rows 1–2 only, so the cup closes over the stuffing and the petal tips stay free."),
    ]
    # tidy the second/third petal sentence
    cup[-2] = instr("Second and third petals: join Yarn A with a sl st in the next unworked st of Rnd 6, "
                    "ch 1 and work Rows 1–4 over the next 8 sts. Repeat once more over the last 8 sts.")
    front = [
        st("Rnd 1", "With Yarn A, ch 6. Sc in 2nd ch from hook, sc in next 3 ch, 3 sc in last ch; working "
                    "along the other side of the chain, sc in next 3 ch, 2 sc in the first ch (the same ch "
                    "as the first sc).", 12, reset=True, piece="Front petal", flattened=True),
        st("Rnd 2", "inc, sc 3, inc x3, sc 3, inc x2.", 18, ops="inc, sc 3, inc x3, sc 3, inc x2", inc=6),
        st("Rnd 3", "Sl st in each st around, working (sl st, ch 2, sl st) in the 4th of the 6 sts made by "
                    "the inc x3 at the rounded end (this becomes the top point). Fasten off, leaving a 30 cm tail.", "18"),
    ]
    stem = [
        st("Rnd 1", "With Yarn B, 5 sc in MR.", 5, ops="5 sc in MR", reset=True, piece="Stem"),
        st("Rnds 2–8", "sc in each st around (7 rnds). Do not stuff. Fasten off, leaving a 20 cm tail.", 5,
           ops=["sc in each st around"] * 7, rounds=7),
    ]
    leaf = [
        st("Leaf", "With Yarn B, make a chain of 10. Working in the back bumps: sl st in 2nd ch from hook, sc in next ch, "
                   "hdc in next ch, dc in next 4 ch, hdc in next ch, 3 sc in last ch; working along the other "
                   "side of the chain: hdc in next ch, dc in next 4 ch, hdc in next ch, sc in next ch, sl st in "
                   "the last ch (the tip). Fasten off, leaving a 20 cm tail.", 19, reset=True, piece="Leaf", flattened=True),
    ]
    sections = [
        {"title": "Tulip Cup", "kicker": "Yarn A (pink) · make 1", "shape": "round",
         "blocks": [{"type": "paragraph", "text":
                     "The cup is worked in spiral rounds from the bottom; the three pointed petals are "
                     "then worked in rows on its top edge."},
                    {"type": "steps", "steps": cup}]},
        {"title": "Front Petal", "kicker": "Yarn A (pink) · make 1", "shape": "none",
         "blocks": [{"type": "steps", "steps": front},
                    {"type": "paragraph", "text":
                     "Pin the front petal on the front of the cup, point up, covering the seam between "
                     "two cup petals, with its lower end 2 rnds above the magic ring. Whipstitch all the "
                     "way round except the top third, so its tip stands free."}]},
        {"title": "Stem and Leaf", "kicker": "Yarn B (sage green) · make 1 each", "shape": "none",
         "blocks": [{"type": "steps", "title": "Stem", "steps": stem},
                    {"type": "steps", "title": "Leaf", "steps": leaf},
                    {"type": "paragraph", "text":
                     "Sew the magic-ring end of the stem to the centre of the cup base. Sew the base of "
                     "the leaf (the 3-sc end) to the side of the stem at Rnd 6, tip pointing up and out; "
                     "tack the leaf to the stem 1 cm higher so it stays upright."}]},
    ]
    ts = tassel_spec(9, "Yarn C (cream)", "Yarn C", "Yarn C")
    sections.append(tassel_section(ts, 110))
    sections.append(assembly_section(
        ["1 wooden bead", "1 gold bead", "the tulip with its stem", "1 gold bead",
         "1 wooden bead", "1 gold bead"],
        ["Tulip: push the needle up through the open end of the stem tube, through the stem, the cup "
         "base and the stuffing, and out between the three petal tips at the top."],
        extra_blocks=[{"type": "schematic", "title": "Pieces at a glance",
                       "caption": "Approximate sizes; the cup is stuffed, the other pieces are flat.",
                       "pieces": [{"label": "Cup", "shape": "ellipse", "w": 3.4, "h": 3.9},
                                  {"label": "Front petal", "shape": "ellipse", "w": 2.2, "h": 4.0},
                                  {"label": "Stem", "shape": "rect", "w": 0.8, "h": 3.4},
                                  {"label": "Leaf", "shape": "ellipse", "w": 1.7, "h": 4.0}]}]))
    a = metres({"sc": 6 + 12 + 18 + 24 * 3 + 3 * (6 + 4 + 2 + 1) + 12 + 18, "sl": 22, "ch": 10})
    b = metres({"sc": 5 * 8 + 3, "hdc": 4, "dc": 8, "sl": 2, "ch": 10}) + 0.4
    c = tassel_tally(9) + 1.1
    mats = [
        {"item": "Yarn A (tulip)", "detail": f"DK (#3) cotton, pink — {amount(a)}"},
        {"item": "Yarn B (stem, leaf)", "detail": f"DK (#3) cotton, sage green — {amount(b)}"},
        {"item": "Yarn C (tassel, cord)", "detail": f"DK (#3) cotton, cream — {amount(c)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(3, 2),
        {"item": "Notions", "detail": "fiberfill (a small handful), stitch marker, pins, tapestry needle, stiff card, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Tulip (stuffed, with front petal)", "≈ 4 cm (1.6 in)", "≈ 4 cm (1.6 in)"],
                     ["Stem", "≈ 0.8 cm", "≈ 3.4 cm (1.3 in)"],
                     ["Leaf", "≈ 1.7 cm", "≈ 4 cm (1.6 in)"],
                     ["Tassel", "–", "9 cm (3.5 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Tulip head", "Stuffed pink cup with a large oval petal in front and two pointed tips behind",
                   "Stuffed cup in rounds with 3 petals in rows, plus a sewn-on front petal", "Inferred", "Medium"),
                ob("Infographic", "Shows three separate petals sewn into a cup", "Replaced by one cup piece + front petal (design choice: firmer, easier to stuff)", "Design choice", "Medium"),
                ob("Stem and leaf", "Green stem with one leaf on the left", "5-st tube stem, leaf worked around a chain", "Seen", "High"),
                CORD_OBS, TASSEL_OBS],
               [vr("Tulip width : height", "1.0", "4 / 4 = 1.0", "Yes", 1.0, 1.0, "ratio"),
                vr("Petal tips at top", "3 (front + 2 behind)", "3 cup petals + front petal", "Yes"),
                vr("Leaves", "1", "1", "Yes", 1, 1, "count")],
               ["Cup and petal counts are a design reconstruction of the photographed shape."])
    return base("Pink Tulip Hanging Ornament",
                "A stuffed crochet tulip with stem and leaf on a beaded cord",
                "A small stuffed tulip — a cup worked in spiral rounds with three pointed petals, "
                "plus an oval front petal — on a tube stem with one leaf, strung with beads above a "
                "cream tassel. The cord runs through the stem tube.",
                "≈ 21 cm (8.3 in) plus an 8 cm loop", "DK cotton · 3 colours", mats,
                ["ch", "sc", "inc", "sc2tog", "sl st", "hdc", "dc", "MR", "st(s)", "rnd(s)", "( ) xN"],
                ["MR", "spiral", "sc2tog", "bump", "tassel"], sections, meas, photo)

# ======================================================================================
# 7. SNOWFLAKE
# ======================================================================================
def snowflake():
    sf = [
        st("Rnd 1", "Ch 3 (counts as the first dc), 11 dc in MR. Join with a sl st to the top of the ch-3.",
           12, reset=True, piece="Snowflake", flattened=True),
        st("Rnd 2", "Ch 5 (counts as dc + ch 2), *dc in next dc, ch 2*; rep from * 10 more times. Join with a "
                    "sl st to the 3rd ch of the ch-5.", "12 dc, 12 ch-2 sps"),
        st("Rnd 3", "Sl st into the first ch-2 sp. *In this ch-2 sp work the arm: sc, ch 6, sl st in 4th ch from "
                    "hook, (ch 3, sl st in the same ch) twice, sl st in each of the next 2 ch, sc in the same ch-2 sp. "
                    "In the next ch-2 sp work a small point: sc, picot, sc*; rep from * 5 more times. "
                    "Join with a sl st to the first sc and fasten off.", "6 arms, 6 small points"),
    ]
    sections = [
        {"title": "Snowflake", "kicker": "Yarn A (cream) · make 1", "shape": "none",
         "blocks": [{"type": "paragraph", "text":
                     "Three joined rounds: a dc ring, a round of dc and ch-2 spaces, and a round with six "
                     "arms (each ending in a three-picot tip) alternating with six small picot points."},
                    {"type": "steps", "steps": sf},
                    {"type": "note", "label": "Blocking", "text":
                     "Pin the snowflake on a board, pinning every arm tip and each tip picot. Spray with "
                     "fabric starch (or dab on a mix of 1 part white craft glue and 1 part water) and let "
                     "it dry completely before unpinning."}]},
    ]
    ts = tassel_spec(9, "Yarn A (cream)", "Yarn A", "Yarn A")
    sections.append(tassel_section(ts, 90))
    sections.append(assembly_section(
        ["1 wooden bead", "1 gold bead", "the snowflake", "1 gold bead", "1 wooden bead", "1 gold bead"],
        ["Snowflake: hang it with one arm pointing up. Pass the needle through the chain stem of the "
         "bottom arm, weave through 3 dc of the centre ring on the back, and out through the chain "
         "stem of the top arm."]))
    a = metres({"dc": 24, "ch": 3 + 24 + 6 * 12 + 6 * 3, "sc": 24, "sl": 6 * 6 + 6 + 3}) + tassel_tally(9) + 0.9
    mats = [
        {"item": "Yarn A", "detail": f"DK (#3) cotton, cream or white — {amount(a)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(3, 2),
        {"item": "Notions", "detail": "fabric starch or white craft glue, rust-proof pins, blocking board, tapestry needle, stiff card, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Snowflake (blocked, tip to tip)", "≈ 5.6 cm (2.2 in)", "≈ 6.4 cm (2.5 in)"],
                     ["Tassel", "–", "9 cm (3.5 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Centre", "Infographic: ch 3 + 11 dc in MR (12 dc)", "Rnd 1 as given", "Seen", "High"),
                ob("Second round", "Infographic text is inconsistent (first st gets 2 dc)", "Corrected: 12 dc each followed by ch 2", "Inferred", "High"),
                ob("Arms", "6 arms with clustered picot tips and small points between them", "6 arms with a 3-picot tip + 6 small picot points; the infographic's 12-space/6-point mismatch is resolved by alternating", "Inferred", "Medium"),
                CORD_OBS, TASSEL_OBS],
               [vr("Arms", "6", "6", "Yes", 6, 6, "count"),
                vr("Height : width", "1.10", "6.4 / 5.6 = 1.14", "Yes", 1.10, 1.14, "ratio")],
               ["The photographed side branches on each arm are simplified to a three-picot tip."])
    return base("Cream Snowflake Hanging Ornament",
                "A starched lace crochet snowflake on a beaded cord with a tassel",
                "A six-arm lace snowflake in three joined rounds — dc ring, dc and chain spaces, then "
                "picot-tipped arms — starched flat and hung on a beaded cord above a cream tassel.",
                "≈ 20 cm (7.9 in) plus an 8 cm loop", "DK cotton · 1 colour", mats,
                ["ch", "sc", "sl st", "dc", "MR", "sp", "st(s)", "rnd(s)", "rep"],
                ["MR", "picot", "tassel"], sections, meas, photo)

# ======================================================================================
# 8. BUTTERFLY
# ======================================================================================
def butterfly():
    up = [
        st("Rnd 1", "With Yarn B, make a MR, ch 2 (does not count). In the ring work sc 1, hdc 1, dc 2, tr 3, "
                    "dc 2, hdc 1, sc 1. Pull the ring closed and join with a sl st to the first sc. Fasten off Yarn B.",
           11, reset=True, piece="Upper wing", flattened=True),
        st("Rnd 2", "Join Yarn A with a standing sc in the first sc; sc 1, (inc, sc 1) x3, inc, sc 2. "
                    "Join with a sl st to the first sc. Fasten off, leaving a 20 cm tail.", 15, inc=4),
    ]
    lo = [
        st("Rnd 1", "With Yarn B, make a MR, ch 2 (does not count). In the ring work sc 1, hdc 1, dc 4, hdc 1, "
                    "sc 1. Pull the ring closed and join with a sl st to the first sc. Fasten off Yarn B.",
           8, reset=True, piece="Lower wing", flattened=True),
        st("Rnd 2", "Join Yarn A with a standing sc in the first sc; (inc, sc 1) x3, sc 1. Join with a sl st to "
                    "the first sc. Fasten off, leaving a 20 cm tail.", 11, inc=3),
    ]
    sections = [
        {"title": "Wings", "kicker": "Yarn B (pink) and Yarn A (cream)", "shape": "none",
         "blocks": [{"type": "paragraph", "text":
                     "Each wing is a fan of graded stitches worked into a magic ring and pulled into a "
                     "teardrop, then edged with one round of cream sc."},
                    {"type": "steps", "title": "Upper wings (make 2)", "steps": up},
                    {"type": "steps", "title": "Lower wings (make 2)", "steps": lo}]},
        {"title": "Body and Antennae", "kicker": "Yarn A (cream)", "shape": "none",
         "blocks": [{"type": "steps", "steps": [
             st("Step 1", "Lay the wings right side up: the two upper wings with their pointed (ring) ends "
                          "meeting at the centre and tilted up, the two lower wings below them with their "
                          "points also at the centre. Sew all four points together with the tails.", ""),
             st("Step 2", "Body: fold a 12 cm strand of Yarn A into a 3 cm bundle of 4 strands and lay it "
                          "vertically over the centre on the front. Wrap a 1 m length of Yarn A tightly "
                          "round the bundle and the wing centres, from top to bottom, each wrap next to the "
                          "last, until the wraps cover 2.4 cm (about 12–14 wraps). Sew the end into the back.", ""),
             st("Step 3", "Antennae: thread a 15 cm strand of Yarn A under the top wrap of the body so both "
                          "halves stand up. Tie an overhand knot in each half 1.5 cm from the body and trim "
                          "2 mm above the knot. A drop of fabric glue keeps the antennae upright.", ""),
         ]}]},
    ]
    ts = tassel_spec(9, "Yarns A and B", "Yarn A", "Yarn B",
                     wraps_text="Wrap Yarn A around the card 28 times, then Yarn B 12 times spread across the "
                                "card between the cream wraps (40 wraps). Cut the yarn at the bottom edge.",
                     kicker="Yarn A (cream) and Yarn B (pink)")
    sections.append(tassel_section(ts, 90))
    sections.append(assembly_section(
        ["1 wooden bead", "1 gold bead", "the butterfly", "1 gold bead", "1 wooden bead", "1 gold bead"],
        ["Butterfly: push the needle up through the body wraps from the bottom to the top, between the "
         "antennae."]))
    a = metres({"sc": 2 * 15 + 2 * 11}) + 0.12 + 1.0 + 0.15 + (28 * 20) / 100 + 0.9
    b = metres({"sc": 4 * 2, "hdc": 4 * 2, "dc": 2 * 4 + 2 * 4, "tr": 2 * 3, "ch": 8, "sl": 4}) + (12 * 20 + 70) / 100
    mats = [
        {"item": "Yarn A (wing edges, body, tassel, cord)", "detail": f"DK (#3) cotton, cream — {amount(a)}"},
        {"item": "Yarn B (wing centres, tassel)", "detail": f"DK (#3) cotton, dusty pink — {amount(b)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(3, 2),
        {"item": "Notions", "detail": "fabric glue (optional), tapestry needle, stiff card, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Butterfly (wingspan)", "≈ 5.5 cm (2.2 in)", "≈ 4.5 cm (1.8 in) with antennae"],
                     ["Tassel", "–", "9 cm (3.5 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Wings", "Two large and two small teardrop wings, pink centres from a ring, cream edge", "Fan of graded sts in a MR + 1 cream sc round", "Seen", "High"),
                ob("Body", "Wrapped cream body down the centre", "Yarn wrapped over a small bundle", "Seen", "High"),
                ob("Antennae", "Two short antennae with knots/balls at the tips", "Strand with overhand knots", "Seen", "Medium"),
                ob("Tassel", "Cream tassel with pink strands mixed in", "28 cream + 12 pink wraps", "Seen", "High"),
                CORD_OBS],
               [vr("Wings", "4", "4", "Yes", 4, 4, "count"),
                vr("Wingspan : height", "1.24", "5.5 / 4.5 = 1.22", "Yes", 1.24, 1.22, "ratio")],
               ["Wing stitch groups are a design reconstruction of the photographed shapes."])
    return base("Blush Butterfly Hanging Ornament",
                "A two-colour crochet butterfly on a beaded cord with a striped tassel",
                "Four teardrop wings worked as stitch fans in a magic ring and edged in cream, joined "
                "with a wrapped body and knotted antennae, and hung on a beaded cord above a "
                "cream-and-pink tassel.",
                "≈ 18 cm (7 in) plus an 8 cm loop", "DK cotton · 2 colours", mats,
                ["ch", "sc", "inc", "sl st", "hdc", "dc", "tr", "MR", "st(s)", "rnd(s)", "( ) xN"],
                ["MR", "standing", "tassel"], sections, meas, photo)

# ======================================================================================
# 9. MOON & STAR
# ======================================================================================
def moon():
    rows = arc_rows(14, [4, 3, 3, 3], ["Yarn A"] * 5, "Moon piece", taper=True)
    rows[0]["text"] = "With Yarn A, ch 15. Sc in 2nd ch from hook and in each ch across. Ch 1, turn."
    for r in rows[1:-1]:
        r["text"] = r["text"].replace(" Change to Yarn A in the last st; ch 1, turn.", " Ch 1, turn.")
    join = [
        st("Rnd 1", "Hold the two pieces wrong sides together. Join Yarn A in the last st of Row 5 and work "
                    "through both layers: sc in each of 5 row-ends down the side, 3 sc in the first foundation ch "
                    "(tip), sc in each of the next 12 foundation ch along the inner curve, 3 sc in the last "
                    "foundation ch (other tip), sc in each of 5 row-ends up the side, sc in each of the 19 sts "
                    "of Row 5 along the outer curve.", 47, reset=True),
        instr("Stuff the moon firmly, tips first, before you close the last 8 sts. Join with a sl st to the "
              "first sc and fasten off; hide the end inside."),
    ]
    sections = [
        {"title": "Moon", "kicker": "Yarn A (cream) · make 2 pieces, then join", "shape": "none",
         "blocks": [{"type": "paragraph", "text":
                     "Each crescent piece is worked in rows from the inner curve outwards. Increases in "
                     "the middle of each row make the piece curve, and the sc2tog at both ends of each row "
                     "shape the pointed tips."},
                    {"type": "steps", "title": "Moon piece (make 2)", "steps": rows},
                    {"type": "steps", "title": "Joining round", "steps": join}]},
        star_section("Yarn B (mustard) · make 1"),
    ]
    ts = tassel_spec(9, "Yarn A (cream)", "Yarn A", "Yarn A")
    sections.append(tassel_section(ts, 120))
    sections.append(assembly_section(
        ["1 wooden bead", "1 gold bead", "the star", "1 gold bead", "the moon", "1 gold bead",
         "1 wooden bead", "1 gold bead"],
        ["Star: hang it with one point up and pass the needle from the bottom valley up through the back "
         "of the stitches and out at the top point.",
         "Moon: hang it with the opening facing right. Pass the needle up through the lower tip from its "
         "underside, across the opening, and up through the upper tip, so the moon hangs level."]))
    a_moon = metres({"sc": 2 * (14 + 16 + 17 + 18 + 19) + 47, "ch": 30})
    a = a_moon + tassel_tally(9) + 1.3
    b = metres(STAR_STS)
    mats = [
        {"item": "Yarn A (moon, tassel, cord)", "detail": f"DK (#3) cotton, cream — {amount(a)}"},
        {"item": "Yarn B (star)", "detail": f"DK (#3) cotton, mustard gold — {amount(b)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(4, 2),
        {"item": "Notions", "detail": "fiberfill (a small handful), tapestry needle, stiff card, pins, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Moon (stuffed)", "≈ 4.5 cm (1.8 in)", "≈ 6.5 cm (2.6 in)"],
                     ["Star", "≈ 4.2 cm (1.7 in)", "≈ 4 cm (1.6 in)"],
                     ["Tassel", "–", "9 cm (3.5 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Moon", "Stuffed cream crescent with a sc edge seam", "Two flat crescent pieces joined with sc and stuffed", "Seen", "High"),
                ob("Crescent shaping", "Thick middle, pointed tips", "Rows curved by middle increases, tips by sc2tog at row ends", "Inferred", "Medium"),
                ob("Star", "Mustard five-point star below the moon", "Same star as the star ornament", "Seen", "High"),
                CORD_OBS, TASSEL_OBS],
               [vr("Moon height : width", "1.20", "6.5 / 4.5 = 1.44", "Close", 1.20, 1.44, "ratio",
                   "the photographed crescent is slightly wider; one more row would make the tips blunt"),
                vr("Star : moon height", "0.66", "4.0 / 6.5 = 0.62", "Close", 0.66, 0.62, "ratio")],
               ["Crescent row counts are calculated from the photographed curve, not counted from a sample."],
               conf_text="Sizes are scaled from the 12 mm beads. The crescent geometry is calculated, so "
                         "check the curve after Row 3 of the first piece; the photo looks rendered.")
    return base("Cream Moon & Star Ornament",
                "A stuffed crochet crescent moon and flat star on a beaded cord",
                "A plump crescent moon made from two curved pieces joined with sc and stuffed, with a "
                "flat mustard star below, strung on a beaded cord above a cream tassel.",
                "≈ 24 cm (9.4 in) plus an 8 cm loop", "DK cotton · 2 colours", mats,
                ["ch", "sc", "inc", "sc2tog", "sl st", "MR", "st(s)", "rnd(s)", "( ) xN"],
                ["MR", "sc2tog", "join_sc", "tassel"], sections, meas, photo)

# ======================================================================================
# 10. LANTERN
# ======================================================================================
def lantern():
    body = [
        st("Rnd 1", "With Yarn A, 6 sc in MR.", 6, ops="6 sc in MR", reset=True, piece="Lantern"),
        st("Rnd 2", "(sc 1, inc) x3.", 9, ops="(sc 1, inc) x3", inc=3),
        st("Rnd 3", "(sc 2, inc) x3.", 12, ops="(sc 2, inc) x3", inc=3),
        st("Rnd 4", "(sc 1, inc) x6.", 18, ops="(sc 1, inc) x6", inc=6),
        st("Rnd 5", "sc in each st around.", 18, ops="sc in each st around"),
        st("Rnd 6", "Working in BLO, sc in each st around (the free front loops of Rnd 5 carry the top rim).", 18, ops="sc in each st around"),
        st("Rnd 7", "(sc 2, inc) x6.", 24, ops="(sc 2, inc) x6", inc=6),
        st("Rnd 8", "sc 1, inc, (sc 3, inc) x5, sc 2.", 30, ops="sc 1, inc, (sc 3, inc) x5, sc 2", inc=6),
        st("Rnd 9", "(sc 4, inc) x6.", 36, ops="(sc 4, inc) x6", inc=6),
        st("Rnds 10–15", "sc in each st around (6 rnds).", 36, ops=["sc in each st around"] * 6, rounds=6),
        st("Rnd 16", "(sc 4, dec) x6.", 30, ops="(sc 4, dec) x6", dec=6),
        st("Rnd 17", "sc 1, dec, (sc 3, dec) x5, sc 2. Begin stuffing.", 24, ops="sc 1, dec, (sc 3, dec) x5, sc 2", dec=6),
        st("Rnd 18", "(sc 2, dec) x6.", 18, ops="(sc 2, dec) x6", dec=6),
        st("Rnd 19", "Working in BLO, sc in each st around (the free front loops of Rnd 18 carry the bottom rim).", 18, ops="sc in each st around"),
        st("Rnd 20", "sc in each st around. Stuff the body firmly.", 18, ops="sc in each st around"),
        st("Rnd 21", "(sc 1, dec) x6.", 12, ops="(sc 1, dec) x6", dec=6),
        st("Rnd 22", "(sc 2, dec) x3.", 9, ops="(sc 2, dec) x3", dec=3),
        st("Rnd 23", "(sc 1, dec) x3. Finish stuffing, fasten off and close the hole.", 6, ops="(sc 1, dec) x3", dec=3),
    ]
    rims = [
        st("Rnd 1", "Top rim: hold the lantern with the magic ring at the top. Join Yarn B with a standing sc in "
                    "a free front loop of Rnd 5; working in the free front loops: sc 1, inc, (sc 1, inc) x8 — "
                    "that is, (sc 1, inc) all round.", 27, reset=True, piece="Top rim"),
        st("Rnd 2", "sc in each st around. Join with a sl st to the first sc and fasten off.", 27, ops="sc in each st around"),
        st("Rnd 1", "Bottom rim: join Yarn B with a standing sc in a free front loop of Rnd 18 and work "
                    "inc in the next st, then (sc 1, inc) x8, working in the free front loops as for the top rim.", 27, reset=True, piece="Bottom rim"),
        st("Rnd 2", "sc in each st around. Join with a sl st to the first sc and fasten off.", 27, ops="sc in each st around"),
    ]
    # fix text of rim rnd 1 (keep it simple and exact)
    rims[0]["text"] = ("Top rim: hold the lantern with the magic ring at the top. Join Yarn B with a standing "
                       "sc in a free front loop of Rnd 5 (this is the first sc); working in the free front "
                       "loops: inc in the next st, then (sc 1, inc) x8.")
    sections = [
        {"title": "Lantern Body", "kicker": "Yarn A (cream) · make 1", "shape": "round",
         "blocks": [{"type": "paragraph", "text":
                     "The lantern is worked in one piece in spiral rounds from the top cap down to the "
                     "bottom point. Two back-loop rounds leave free front loops for the mustard rims."},
                    {"type": "steps", "steps": body}]},
        {"title": "Rims and Ribs", "kicker": "Yarn B (mustard)", "shape": "none",
         "blocks": [{"type": "steps", "title": "Rims", "steps": rims},
                    {"type": "paragraph", "text":
                     "Ribs: mark 6 columns spaced 6 sts apart around Rnd 12 of the body. Thread a tapestry needle "
                     "with a 60 cm length of Yarn B. Bring it out under the bottom rim at the first column and "
                     "embroider a line of surface chain (see Techniques) straight up the column, one chain stitch "
                     "per round, to just under the top rim (Rnds 18 to 6). Take the needle back into the body and "
                     "out at the next column; repeat for all 6 ribs. Hide the ends inside the stuffing."}]},
    ]
    ts = tassel_spec(8, "Yarn A (cream)", "Yarn A", "Yarn A")
    sections.append(tassel_section(ts, 110))
    sections.append(assembly_section(
        ["1 gold bead", "1 wooden bead", "1 gold bead", "the lantern", "1 gold bead", "1 wooden bead", "1 gold bead"],
        ["Lantern: push a long needle in at the bottom point (Rnd 23) and out at the centre of the magic "
         "ring at the top, straight through the stuffing."]))
    a = metres({"sc": 6 + 9 + 12 + 18 * 2 + 24 + 30 + 36 * 7 + 30 + 24 + 18 * 3 + 12 + 9 + 6}) + tassel_tally(8) + 1.1
    b = metres({"sc": 27 * 4, "sl": 6 * 13 + 2})
    mats = [
        {"item": "Yarn A (body, tassel, cord)", "detail": f"DK (#3) cotton, cream — {amount(a)}"},
        {"item": "Yarn B (rims, ribs)", "detail": f"DK (#3) cotton, mustard gold — {amount(b)}"},
        {"item": "Hook", "detail": "2.5 mm (US B/1–C/2)"},
        bead_item(4, 2),
        {"item": "Notions", "detail": "fiberfill (about 8 g), stitch markers, long doll needle or tapestry needle, stiff card, scissors"},
    ]
    meas = {"headers": ["Part", "Width", "Height"],
            "rows": [["Lantern (stuffed)", "≈ 5.2 cm (2 in) body, rims ≈ 4.3 cm", "≈ 8 cm (3.1 in)"],
                     ["Tassel", "–", "8 cm (3.1 in)"]]}
    photo = pa("One product photo plus infographic steps; scale from the wooden beads.",
               [ob("Shape", "Dome cap, round body with vertical mustard ribs, mustard rims top and bottom, cone base",
                   "One-piece body in rounds, rims on free loops, ribs in surface sl st", "Seen", "High"),
                ob("Infographic", "Shows the body, cap and base as separate pieces", "Worked in one piece (design choice: no sewing)", "Design choice", "Medium"),
                ob("Ribs", "6 vertical mustard ribs visible on the front half (3–4 seen)", "6 ribs", "Inferred", "Medium"),
                CORD_OBS, TASSEL_OBS],
               [vr("Height : width", "1.54", "8 / 5.2 = 1.54", "Yes", 1.54, 1.54, "ratio"),
                vr("Rims", "2", "2", "Yes", 2, 2, "count")],
               ["Rib count assumed 6 around (3–4 visible from the front)."])
    return base("Golden Lantern Hanging Ornament",
                "A stuffed crochet lantern with mustard rims and ribs on a beaded cord",
                "A stuffed lantern worked in one piece in spiral rounds — dome top, round body and "
                "pointed base — with mustard rims on free front loops and six surface slip-stitch "
                "ribs, hung on a beaded cord above a cream tassel.",
                "≈ 21 cm (8.3 in) plus an 8 cm loop", "DK cotton · 2 colours", mats,
                ["ch", "sc", "inc", "dec", "sl st", "MR", "BLO", "st(s)", "rnd(s)", "( ) xN"],
                ["MR", "spiral", "dec", "standing", "chainstitch", "tassel"], sections, meas, photo)

ITEMS = {"01-heart": heart, "02-leaf": leaf, "03-star": star, "04-flower": flower,
         "05-rainbow": rainbow, "06-tulip": tulip, "07-snowflake": snowflake,
         "08-butterfly": butterfly, "09-moon": moon, "10-lantern": lantern}

if __name__ == "__main__":
    which = sys.argv[1:] or list(ITEMS)
    for k in which:
        spec = ITEMS[k]()
        with open(os.path.join(HERE, k, "pattern.json"), "w", encoding="utf-8") as f:
            json.dump(spec, f, indent=1, ensure_ascii=False)
        print("wrote", k, spec["title"])
