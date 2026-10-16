# Cable Tank Top – editable source

Files
- `pattern.html` – all pattern text and tables (edit text here).
- `style.css` – layout and print settings (Letter pages, footer, page numbers, landscape page for the full chart).
- `build_figures.py` – the single data model (written 54-st panel + size numbers). It checks the panel
  (54 sts every row, T3B on P-K-K, T3F on K-K-P, 16-row repeat closes), the size numbers and that the
  written-panel table in `pattern.html` matches the model, then writes all charts, chart symbols and the
  schematics as SVG into `img/`. If a check fails, it stops with an error and writes nothing.
- `build_pdf.js` – renders `pattern.html` with Chromium (Playwright) to `../output/Cable_Tank_Top_M_L_EN.pdf`.
- `img/cover.png` – cover photo; all other files in `img/` are generated.

Rebuild (from this folder)

    python3 build_figures.py
    node build_pdf.js

To change a cable row, edit `WRITTEN` in `build_figures.py` AND the matching row of the
`written-panel` table in `pattern.html`; the build refuses to run if they differ.
