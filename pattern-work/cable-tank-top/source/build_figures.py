#!/usr/bin/env python3
"""Build all charts, the chart legend symbols and the schematic for the
Cable Tank Top pattern from ONE data model.

Data model
  * PANEL_BLOCKS + WRITTEN  : the written 54-st panel instructions (section 06),
                              exactly as printed, in RS working order.
  * SIZES                   : the size numbers (stitch counts and row numbers).

Before anything is written the script
  * simulates the panel stitch by stitch for two full 16-row repeats and asserts:
    54 sts on every row, every T3B meets P-K-K and every T3F meets K-K-P in
    working order, every C4/C6 meets knit sts, and the 16-row repeat closes;
  * checks every size number (counts, row parity, cm values used as labels);
  * checks that the written-panel table in pattern.html matches WRITTEN.

Charts are drawn from the simulation, so chart and text cannot diverge.
Chart convention: column 1 = leftmost column. RS (odd) rows are read right to
left, so the first stitch worked on an RS row is chart column 54.

Usage:  python3 build_figures.py      (writes SVG files into img/)
"""
import os
import re
import sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "img")

# ----------------------------------------------------------------------------
# 1. DATA MODEL - written panel (section 06 of the pattern), RS working order
# ----------------------------------------------------------------------------
PANEL_BLOCKS = [  # (name, width, kind)
    ("p3", 3, "purl"), ("Rope 6", 6, "rope"), ("p2", 2, "purl"),
    ("Diamond 10", 10, "diamond"), ("p2", 2, "purl"), ("Honeycomb 8", 8, "honeycomb"),
    ("p2", 2, "purl"), ("Diamond 10", 10, "diamond"), ("p2", 2, "purl"),
    ("Rope 6", 6, "rope"), ("p3", 3, "purl"),
]
WRITTEN = {  # pattern row: {kind: written text}
    1:  {"rope": "k6",  "diamond": "p3, k4, p3",           "honeycomb": "C4B, C4F"},
    3:  {"rope": "k6",  "diamond": "p2, T3B, T3F, p2",     "honeycomb": "k8"},
    5:  {"rope": "C6F", "diamond": "p1, T3B, p2, T3F, p1", "honeycomb": "C4F, C4B"},
    7:  {"rope": "k6",  "diamond": "T3B, p4, T3F",         "honeycomb": "k8"},
    9:  {"rope": "k6",  "diamond": "T3F, p4, T3B",         "honeycomb": "C4B, C4F"},
    11: {"rope": "k6",  "diamond": "p1, T3F, p2, T3B, p1", "honeycomb": "k8"},
    13: {"rope": "C6F", "diamond": "p2, T3F, T3B, p2",     "honeycomb": "C4F, C4B"},
    15: {"rope": "k6",  "diamond": "p3, C4F, p3",          "honeycomb": "k8"},
}
CABLE_W = {"C4F": 4, "C4B": 4, "C6F": 6, "T3F": 3, "T3B": 3}
PANEL_W = 54
ROWS = 16

# ----------------------------------------------------------------------------
# 1b. DATA MODEL - sizes (gauge 18 sts x 24 rows = 10 cm)
# ----------------------------------------------------------------------------
STS_PER_CM, ROWS_PER_CM = 1.8, 2.4
SIZES = {
    "M": dict(co=80, side=13, last_straight=86, dec_rows=[89, 91, 93, 95],
              front_split=111, front_keep=22, front_bo=20, neck_dec=[113, 115, 117, 119],
              back_split=127, back_keep=18, back_bo=28, last_ws=134, bo_row=135),
    "L": dict(co=92, side=19, last_straight=88, dec_rows=[91, 93, 95, 97],
              front_split=115, front_keep=26, front_bo=24, neck_dec=[117, 119, 121, 123],
              back_split=133, back_keep=22, back_bo=32, last_ws=140, bo_row=141),
}
# Printed measurement labels (cm, in) - asserted against the model below.
PRINTED = {
    "M": dict(width=(44.4, 17.5), length=(55.8, 22.0), armhole=(20.0, 7.9), shoulder=(10.0, 3.9),
              back_neck=(15.6, 6.1), front_depth=(10.0, 3.9), underarm=(35.8, 14.1), back_depth=(3.3, 1.3)),
    "L": dict(width=(51.1, 20.1), length=(58.3, 23.0), armhole=(21.7, 8.5), shoulder=(12.2, 4.8),
              back_neck=(17.8, 7.0), front_depth=(10.8, 4.3), underarm=(36.7, 14.4), back_depth=(3.3, 1.3)),
}


# ----------------------------------------------------------------------------
# 2. Panel simulation and assertions
# ----------------------------------------------------------------------------
def parse(text):
    out = []
    for t in [x.strip() for x in text.split(",")]:
        m = re.fullmatch(r"([kp])(\d+)", t)
        if m:
            out += [m.group(1)] * int(m.group(2))
        elif t in CABLE_W:
            out.append(t)
        else:
            raise ValueError(f"unknown token {t!r}")
    return out


def row_tokens(r):
    """Full RS row r in working order (first stitch worked first)."""
    toks = []
    for name, w, kind in PANEL_BLOCKS:
        seg = ["p"] * w if kind == "purl" else parse(WRITTEN[r][kind])
        width = sum(CABLE_W.get(t, 1) for t in seg)
        assert width == w, f"row {r} {name}: written covers {width} sts, block has {w}"
        toks += seg
    return toks


def cross(op, seg, where):
    if op == "T3B":
        assert seg == ["p", "k", "k"], f"{where}: T3B meets {''.join(seg).upper()} (needs P-K-K)"
        return [seg[1], seg[2], seg[0]]
    if op == "T3F":
        assert seg == ["k", "k", "p"], f"{where}: T3F meets {''.join(seg).upper()} (needs K-K-P)"
        return [seg[2], seg[0], seg[1]]
    assert all(s == "k" for s in seg), f"{where}: {op} meets {''.join(seg)}"
    return list(seg)


def work_row(state, r):
    """Work RS row r on `state` (working order). Returns (new_state, elements)
    where elements = list of (op, start_pos, width, in_seg, out_seg)."""
    out, elems, i = [], [], 0
    for op in row_tokens(r):
        w = CABLE_W.get(op, 1)
        seg = state[i:i + w]
        where = f"row {r}, st {i + 1}"
        if op in ("k", "p"):
            assert seg == [op], f"{where}: written {op} but fabric shows {seg}"
            res = [op]
        else:
            res = cross(op, seg, where)
        elems.append((op, i, w, seg, res))
        out += res
        i += w
    assert i == len(state) == len(out) == PANEL_W, f"row {r}: {i}/{len(state)}/{len(out)} sts"
    return out, elems


def simulate():
    # Layout required by row 1 (plain tokens as written, cables need knit sts).
    start = [t if t in ("k", "p") else "k" for t in row_tokens(1) for _ in range(CABLE_W.get(t, 1))]
    state = start[:]
    model = {}
    for rep in range(2):
        for r in range(1, ROWS + 1, 2):
            before = state[:]
            state, elems = work_row(state, r)
            assert len(state) == PANEL_W
            # Diamond always 4 knit + 6 purl
            pos = 0
            for name, w, kind in PANEL_BLOCKS:
                if kind == "diamond":
                    blk = state[pos:pos + w]
                    assert blk.count("k") == 4 and blk.count("p") == 6, f"row {r}: diamond {blk}"
                pos += w
            if rep == 0:
                model[r] = ("rs", elems, before)
                model[r + 1] = ("ws", state[:])     # WS row r+1: work sts as they appear
        if rep == 0:
            assert state == start, "16-row repeat does not close"
    assert state == start, "second repeat does not close"
    return model


# ----------------------------------------------------------------------------
# 3. Chart grid in chart coordinates (column 1 = leftmost)
# ----------------------------------------------------------------------------
def col_of(pos):            # working-order index (0-based) -> chart column (1-based)
    return PANEL_W - pos


def chart_rows(model):
    """rows[r] = list of ('k'|'p', col) or (op, left_col, width, in_chart, out_chart)."""
    rows = {}
    for r in range(1, ROWS + 1):
        m = model[r]
        items = []
        if m[0] == "rs":
            for op, i, w, seg, res in m[1]:
                left = col_of(i + w - 1)
                if op in ("k", "p"):
                    items.append((op, left))
                else:
                    items.append((op, left, w, seg[::-1], res[::-1]))  # chart order L->R
        else:
            for i, s in enumerate(m[1]):
                items.append((s, col_of(i)))
        rows[r] = items
    # glyph-direction assertions (D3): knit strand of T3F travels left, T3B right
    for r, items in rows.items():
        for it in items:
            if len(it) == 5 and it[0].startswith("T3"):
                op, _, _, a, b = it
                kb = [j for j, s in enumerate(a) if s == "k"]
                kt = [j for j, s in enumerate(b) if s == "k"]
                if op == "T3F":
                    assert kt[0] < kb[0], f"row {r}: T3F strand must travel left"
                else:
                    assert kt[0] > kb[0], f"row {r}: T3B strand must travel right"
    return rows


# ----------------------------------------------------------------------------
# 4. SVG drawing
# ----------------------------------------------------------------------------
GREEN = "#124c3a"
PURL_BG = "#e3e8e5"
STRAND_FRONT = "#e4efe8"   # strand lying on top
STRAND_BACK = "#7fa892"    # strand passing behind
STRAND_T3 = "#d3e5da"      # travelling knit strand of a T3
GRID = "#9aa5a0"
REPEAT = "#b3261e"
FONT = "Carlito, 'DejaVu Sans', sans-serif"


def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


def strand(x0b, x1b, x0t, x1t, yb, yt, cs, fill=None, inset=0.22):
    """Ribbon (parallelogram) from bottom span [x0b,x1b] to top span [x0t,x1t],
    narrowed by `inset` cells on each side so crossing strands stay readable."""
    i = inset * cs
    x0b, x1b, x0t, x1t = x0b + i, x1b - i, x0t + i, x1t - i
    pts = [(x0b, yb), (x1b, yb), (x1t, yt), (x0t, yt)]
    p = " ".join(f"{f(a)},{f(b)}" for a, b in pts)
    return [f'<polygon points="{p}" fill="{fill or STRAND_FRONT}" stroke="{GREEN}" '
            f'stroke-width="{f(cs * 0.07)}" stroke-linejoin="round"/>']


def cell_svg(kind, x, y, cs):
    s = []
    if kind == "p":
        s.append(f'<rect x="{f(x)}" y="{f(y)}" width="{f(cs)}" height="{f(cs)}" fill="{PURL_BG}"/>')
        s.append(f'<circle cx="{f(x + cs / 2)}" cy="{f(y + cs / 2)}" r="{f(cs * 0.11)}" fill="#222"/>')
    else:
        s.append(f'<rect x="{f(x)}" y="{f(y)}" width="{f(cs)}" height="{f(cs)}" fill="#fff"/>')
    s.append(f'<rect x="{f(x)}" y="{f(y)}" width="{f(cs)}" height="{f(cs)}" fill="none" stroke="{GRID}" stroke-width="{f(cs * 0.03)}"/>')
    return s


def cable_svg(op, x, y, cs, a=None, b=None):
    """Cable glyph spanning len(a) cells. a/b = chart-order stitch types below/above."""
    w = CABLE_W[op]
    W = w * cs
    yb, yt = y + cs * 0.97, y + cs * 0.03
    s = [f'<rect x="{f(x)}" y="{f(y)}" width="{f(W)}" height="{f(cs)}" fill="{PURL_BG if op.startswith("T3") else "#fff"}"/>']
    if op.startswith("T3"):
        if a is None:
            a, b = (["p", "k", "k"], ["k", "k", "p"]) if op == "T3F" else (["k", "k", "p"], ["p", "k", "k"])
        kb = [j for j, t in enumerate(a) if t == "k"]
        kt = [j for j, t in enumerate(b) if t == "k"]
        pb = [j for j, t in enumerate(a) if t == "p"][0]
        pt = [j for j, t in enumerate(b) if t == "p"][0]
        # purl stitch moving behind the knit strand: small dots at its start and end
        s.append(f'<circle cx="{f(x + (pt + 0.5) * cs)}" cy="{f(y + cs * 0.25)}" r="{f(cs * 0.09)}" fill="#222"/>')
        s.append(f'<circle cx="{f(x + (pb + 0.5) * cs)}" cy="{f(y + cs * 0.75)}" r="{f(cs * 0.09)}" fill="#222"/>')
        s += strand(x + kb[0] * cs, x + (kb[-1] + 1) * cs, x + kt[0] * cs, x + (kt[-1] + 1) * cs, yb, yt, cs, STRAND_T3)
    else:
        h = w // 2
        front = op.endswith("F")   # front cross: strand running lower-right -> upper-left lies on top
        rising_right = strand(x, x + h * cs, x + h * cs, x + W, yb, yt, cs,
                              STRAND_BACK if front else STRAND_FRONT)          # lower-left -> upper-right
        rising_left = strand(x + h * cs, x + W, x, x + h * cs, yb, yt, cs,
                             STRAND_FRONT if front else STRAND_BACK)           # lower-right -> upper-left
        s += (rising_right + rising_left) if front else (rising_left + rising_right)
    s.append(f'<rect x="{f(x)}" y="{f(y)}" width="{f(W)}" height="{f(cs)}" fill="none" stroke="{GREEN}" stroke-width="{f(cs * 0.07)}"/>')
    return s


def text(x, y, t, size, anchor="middle", weight="normal", fill="#222", rotate=None):
    tr = f' transform="rotate({rotate} {f(x)} {f(y)})"' if rotate is not None else ""
    return (f'<text x="{f(x)}" y="{f(y)}" font-family="{FONT}" font-size="{f(size)}" '
            f'text-anchor="{anchor}" font-weight="{weight}" fill="{fill}"{tr}>{t}</text>')


def svg_doc(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{f(w)}mm" height="{f(h)}mm" '
            f'viewBox="0 0 {f(w)} {f(h)}">\n' + "\n".join(body) + "\n</svg>\n")


def draw_chart(rows, c0, c1, cs, title_blocks=True, col_numbers="all", repeat_box=True):
    """Chart columns c0..c1 inclusive. Returns SVG text."""
    ncol = c1 - c0 + 1
    gut = cs * 1.25                    # row-number gutter each side
    top = cs * 1.6 if title_blocks else cs * 0.4
    bottom = cs * 1.5
    W = 2 * gut + ncol * cs
    H = top + ROWS * cs + bottom
    s = [f'<rect width="{f(W)}" height="{f(H)}" fill="#fff"/>']
    gx = gut
    fs = cs * 0.55
    for r in range(1, ROWS + 1):
        y = top + (ROWS - r) * cs
        for it in rows[r]:
            if len(it) == 2:
                kind, c = it
                if c0 <= c <= c1:
                    s += cell_svg(kind, gx + (c - c0) * cs, y, cs)
            else:
                op, left, w, a, b = it
                if left >= c0 and left + w - 1 <= c1:
                    s += cable_svg(op, gx + (left - c0) * cs, y, cs, a, b)
                else:
                    assert left > c1 or left + w - 1 < c0, "cable straddles chart slice"
        # RS (odd) row numbers on the right, WS (even) on the left
        ty = y + cs * 0.72
        if r % 2:
            s.append(text(gx + ncol * cs + gut * 0.5, ty, str(r), fs, weight="bold"))
        else:
            s.append(text(gut * 0.5, ty, str(r), fs, weight="bold"))
    # outer frame / repeat box (whole 16-row chart is the repeat)
    s.append(f'<rect x="{f(gx)}" y="{f(top)}" width="{f(ncol * cs)}" height="{f(ROWS * cs)}" fill="none" '
             f'stroke="{REPEAT if repeat_box else GREEN}" stroke-width="{f(cs * 0.09)}"/>')
    # motif headings (block boundaries)
    if title_blocks:
        c = 1
        for name, w, kind in reversed(PANEL_BLOCKS):  # chart L->R is reverse of working order
            a, b = c, c + w - 1
            if a >= c0 and b <= c1:
                xa, xb = gx + (a - c0) * cs, gx + (b - c0 + 1) * cs
                s.append(text((xa + xb) / 2, top - cs * 0.55, name, fs * (0.95 if w > 2 else 0.85), weight="bold", fill=GREEN))
                s.append(f'<line x1="{f(xa + cs * 0.1)}" y1="{f(top - cs * 0.3)}" x2="{f(xb - cs * 0.1)}" y2="{f(top - cs * 0.3)}" stroke="{GREEN}" stroke-width="{f(cs * 0.05)}"/>')
            c += w
    # column numbers
    yb = top + ROWS * cs + cs * 0.75
    for c in range(c0, c1 + 1):
        local = c - c0 + 1
        show = col_numbers == "all" or (col_numbers == "every5" and (c == c0 or c == c1 or c % 5 == 0))
        if show:
            lab = str(c) if col_numbers == "every5" else str(local)
            s.append(text(gx + (c - c0 + 0.5) * cs, yb, lab, fs * 0.8))
    return svg_doc(W, H, s)


def legend_symbols():
    cs = 6.0
    out = {}
    out["k"] = svg_doc(cs, cs, cell_svg("k", 0, 0, cs))
    out["p"] = svg_doc(cs, cs, cell_svg("p", 0, 0, cs))
    for op in CABLE_W:
        w = CABLE_W[op] * cs
        out[op] = svg_doc(w, cs, cable_svg(op, 0, 0, cs))
    out["repeat"] = svg_doc(cs * 2, cs, [f'<rect x="0.4" y="0.4" width="{f(cs * 2 - 0.8)}" height="{f(cs - 0.8)}" fill="#fff" stroke="{REPEAT}" stroke-width="0.6"/>'])
    return out


# ----------------------------------------------------------------------------
# 5. Size checks and schematic
# ----------------------------------------------------------------------------
def r1(x):
    return round(x + 1e-9, 1)


def check_sizes():
    for S, d in SIZES.items():
        co = d["co"]
        assert co % 4 == 0, f"{S}: rib needs multiple of 4"
        assert 1 + (d["side"] - 1) + PANEL_W + (d["side"] - 1) + 1 == co
        assert (d["side"] - 1) % 2 == 0
        assert d["last_straight"] % 2 == 0
        n = co - 8
        for r in d["dec_rows"]:
            assert r % 2 == 1
            n -= 2
        assert d["side"] - 4 - len(d["dec_rows"]) >= 1, "panel must stay intact"
        d["after_arm"] = n
        assert 2 * d["front_keep"] + d["front_bo"] == n and 2 * d["back_keep"] + d["back_bo"] == n
        assert d["front_keep"] - len(d["neck_dec"]) == d["back_keep"]
        assert d["front_split"] % 2 == 1 and d["back_split"] % 2 == 1 and d["bo_row"] % 2 == 1
        assert d["last_ws"] + 1 == d["bo_row"]
        sh = d["back_keep"]
        p = PRINTED[S]
        calc = dict(width=co / STS_PER_CM, length=d["last_ws"] / ROWS_PER_CM,
                    armhole=(d["last_ws"] - d["last_straight"]) / ROWS_PER_CM,
                    shoulder=sh / STS_PER_CM, back_neck=d["back_bo"] / STS_PER_CM,
                    front_depth=(d["last_ws"] - d["front_split"] + 1) / ROWS_PER_CM,
                    underarm=d["last_straight"] / ROWS_PER_CM,
                    back_depth=(d["last_ws"] - d["back_split"] + 1) / ROWS_PER_CM)
        for k, v in calc.items():
            assert r1(v) == p[k][0], f"{S} {k}: model {r1(v)} printed {p[k][0]}"
            assert r1(r1(v) / 2.54) == p[k][1], f"{S} {k}: inches {r1(r1(v) / 2.54)} vs {p[k][1]}"


def schematic(S, scale, maxw, maxh):
    """Front/back outline to scale. Units: mm. x in sts, y in rows from hem."""
    d, p = SIZES[S], PRINTED[S]
    sx, sy = scale / STS_PER_CM, scale / ROWS_PER_CM   # mm per st / per row
    padL, padR, padT, padB = 13.0, 15.0, 21.0, 13.0
    W = maxw
    H = padT + maxh + padB
    ox = padL + (maxw - padL - padR - SIZES["L"]["co"] * sx) / 2 + (SIZES["L"]["co"] - d["co"]) * sx / 2
    base = padT + maxh                         # y of hem line

    def P(xs, yr):
        return (ox + xs * sx, base - yr * sy)

    co, top = d["co"], d["last_ws"]
    ls, n = d["last_straight"], len(d["dec_rows"])
    inset = 4 + n                              # sts removed each side
    sh = d["back_keep"]
    nl = inset + sh                            # neck left edge (sts)
    nr = co - inset - sh
    # back outline (solid)
    back = [(0, 0), (co, 0), (co, ls), (co - 4, ls), (co - 4, ls + 2), (co - inset, d["dec_rows"][-1]),
            (co - inset, top), (nr, top), (nr, d["back_split"] - 1), (nl, d["back_split"] - 1),
            (nl, top), (inset, top), (inset, d["dec_rows"][-1]), (4, ls + 2), (4, ls), (0, ls)]
    pts = " ".join(f"{f(a)},{f(b)}" for a, b in (P(*q) for q in back))
    s = [f'<polygon points="{pts}" fill="#f2f6f4" stroke="{GREEN}" stroke-width="0.6" stroke-linejoin="round"/>']
    # front neckline (dashed)
    fs_, fb = d["front_split"] - 1, d["front_bo"]
    fl, fr = (co - fb) / 2, (co + fb) / 2
    nd = d["neck_dec"]
    fneck = [(nl, top), (nl, nd[-1]), (fl, nd[0] - 1), (fl, fs_), (fr, fs_), (fr, nd[0] - 1), (nr, nd[-1]), (nr, top)]
    pts = " ".join(f"{f(a)},{f(b)}" for a, b in (P(*q) for q in fneck))
    s.append(f'<polyline points="{pts}" fill="none" stroke="{GREEN}" stroke-width="0.5" stroke-dasharray="1.4,1"/>')
    fsz = 2.5

    def arrow(x1, y1, x2, y2):
        out = [f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="#333" stroke-width="0.25" '
               f'marker-start="url(#a)" marker-end="url(#a)"/>']
        return out

    def cmin(k):
        return f"{p[k][0]:.1f} cm / {p[k][1]:.1f} in"

    s.insert(0, '<defs><marker id="a" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" '
                'orient="auto-start-reverse"><path d="M0,0.5 L5.5,3 L0,5.5 z" fill="#333"/></marker></defs>')
    # width
    x0, y0 = P(0, 0); x1, _ = P(co, 0)
    s += arrow(x0, y0 + 5, x1, y0 + 5)
    s.append(text((x0 + x1) / 2, y0 + 9.5, f"Width {cmin('width')}", fsz))
    # total length (left)
    _, yt = P(0, top)
    s += arrow(x0 - 5, y0, x0 - 5, yt)
    s.append(text(x0 - 6.3, (y0 + yt) / 2, f"Length {cmin('length')}", fsz, rotate=-90))
    # right side: hem to underarm, armhole
    xr = x1 + 4.5
    _, yu = P(co, ls)
    s += arrow(xr, y0, xr, yu)
    s.append(text(xr + 3.2, (y0 + yu) / 2, f"To underarm {cmin('underarm')}", fsz, rotate=90))
    s += arrow(xr, yu, xr, yt)
    s.append(text(xr + 3.2, (yu + yt) / 2, f"Armhole {cmin('armhole')}", fsz, rotate=90))
    # shoulder (top, right shoulder of drawing) and back neck
    xs0, _ = P(nr, top); xs1, _ = P(co - inset, top)
    s += arrow(xs0, yt - 3, xs1, yt - 3)
    s.append(text((xs0 + xs1) / 2 + 2, yt - 8.6, "Shoulder", fsz))
    s.append(text((xs0 + xs1) / 2 + 2, yt - 5.4, cmin("shoulder"), fsz))
    xn0, _ = P(nl, top); xn1, _ = P(nr, top)
    s += arrow(xn0, yt - 3, xn1, yt - 3)
    s.append(text((xn0 + xn1) / 2 - 3, yt - 11.8, "Back neck", fsz))
    s.append(text((xn0 + xn1) / 2 - 3, yt - 8.6, cmin("back_neck") + " wide", fsz))
    s.append(text((xn0 + xn1) / 2 - 3, yt - 5.4, cmin("back_depth") + " deep", fsz))
    # front neck depth: arrow at centre
    xc, yf = P(co / 2, fs_)
    s += arrow(xc, yt, xc, yf)
    s.append(text(xc, yf + 3.6, "Front neck depth", fsz))
    s.append(text(xc, yf + 6.6, cmin("front_depth"), fsz))
    # centre label
    xm, ym = P(co / 2, ls * 0.45)
    s.append(text(xm, ym, "54-st cable panel", fsz * 1.05, weight="bold", fill=GREEN))
    s.append(text(xm, ym + 3.4, "seed-stitch side fields", fsz * 0.95))
    # title
    s.append(text(W / 2, 4.2, f"SIZE {S}", 3.6, weight="bold", fill=GREEN))
    return svg_doc(W, H, s)


# ----------------------------------------------------------------------------
# 6. Cross-check against pattern.html
# ----------------------------------------------------------------------------
class TableGrab(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inside = False
        self.depth = 0
        self.rows, self.cell, self.cur = [], None, None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "table" and a.get("id") == "written-panel":
            self.inside = True
        if not self.inside:
            return
        if tag == "tr":
            self.cur = []
        if tag in ("td", "th"):
            self.cell = ""

    def handle_endtag(self, tag):
        if not self.inside:
            return
        if tag in ("td", "th") and self.cell is not None:
            self.cur.append(" ".join(self.cell.split()))
            self.cell = None
        if tag == "tr" and self.cur is not None:
            self.rows.append(self.cur)
            self.cur = None
        if tag == "table":
            self.inside = False

    def handle_data(self, data):
        if self.inside and self.cell is not None:
            self.cell += data


def check_html():
    path = os.path.join(HERE, "pattern.html")
    g = TableGrab()
    g.feed(open(path, encoding="utf-8").read())
    body = [r for r in g.rows if r and r[0].isdigit()]
    assert len(body) == 8, f"pattern.html written-panel table: {len(body)} rows found"
    for r in body:
        n = int(r[0])
        want = WRITTEN[n]
        got = dict(rope=r[1], diamond=r[2], honeycomb=r[3])
        for k in want:
            assert got[k] == want[k], f"pattern.html row {n} {k}: '{got[k]}' != model '{want[k]}'"


# ----------------------------------------------------------------------------
def main():
    model = simulate()
    rows = chart_rows(model)
    check_sizes()
    check_html()
    os.makedirs(IMG, exist_ok=True)

    def w(name, data):
        with open(os.path.join(IMG, name), "w", encoding="utf-8") as fh:
            fh.write(data)

    # full chart, landscape page: 4.5 mm cells
    w("chart-full.svg", draw_chart(rows, 1, PANEL_W, 4.5, col_numbers="every5"))
    # motif charts (columns taken from the full chart, left-hand occurrence)
    c = 1
    spans = {}
    for name, wd, kind in reversed(PANEL_BLOCKS):
        spans.setdefault(kind, (c, c + wd - 1))
        c += wd
    for kind in ("rope", "diamond", "honeycomb"):
        a, b = spans[kind]
        w(f"chart-{kind}.svg", draw_chart(rows, a, b, 6.5, title_blocks=False, col_numbers="all"))
    for k, v in legend_symbols().items():
        w(f"sym-{k}.svg", v)
    maxh = SIZES["L"]["last_ws"] / ROWS_PER_CM * 1.25
    for S in SIZES:
        w(f"schematic-{S}.svg", schematic(S, 1.25, 92.0, maxh))
    print("Panel model OK: 54 sts every row, T3B on P-K-K, T3F on K-K-P, 16-row repeat closes.")
    print("Size model OK; pattern.html written table matches model.")
    print("SVGs written to", IMG)
    return 0


if __name__ == "__main__":
    sys.exit(main())
