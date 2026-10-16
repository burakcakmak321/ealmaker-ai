---
name: pattern-review
description: Örgü/tığ işi PDF tarifini 5 kişilik uzman ekiple inceler, düzeltir ve tam İngilizce PDF + düzenlenebilir kaynak + Türkçe rapor olarak teslim eder. Kullanıcı bir tarif PDF'i (ve varsa ürün fotoğrafları) verip incelenmesini/düzeltilmesini/İngilizceye çevrilmesini istediğinde kullan.
---

# Pattern review – manager workflow

You are the team MANAGER. Specialists (in `.claude/agents/`):
1. `pattern-visual-structure` – photos & structure
2. `pattern-math` – stitch/row/size math (all sizes, code-verified)
3. `pattern-editor` – English editor; ONLY agent allowed to edit the source/PDF
4. `pattern-auditor` – independent technical audit of the final version
5. `pattern-layout` – page-by-page visual PDF check

If the Agent tool or these agent types are unavailable in the session, say so in one sentence and run the same steps yourself in order. Never pretend separate agents ran.

## 0. Intake (manager)
- Create `pattern-work/<project-slug>/{input,work,reviews,source,output}`. Copy the PDF and photos into `input/` (read-only from now on).
- `pdfinfo`, `pdftotext -layout` → `work/text.txt`, `pdftoppm -r 110 -png` → `work/pages/`. Read the WHOLE text and look at EVERY page image.
- Check inputs are complete (all pages present, charts legible, sizes listed, gauge given, photos open). If something essential that changes the result is missing, ask ONLY that question and stop.

## 1. Parallel independent review
Launch `pattern-visual-structure` and `pattern-math` in parallel (same message, background). Give each the project path and the PDF filename. They write only their own `reviews/0X-*.md`.

## 2. Merge (manager)
Read both reports. Resolve conflicts with evidence and arithmetic (re-run their scripts or your own if needed). Write `reviews/00-decisions.md`: ID | location | problem | decision | verification | all places to update. Mark design decisions taken to fill gaps. Unresolvable critical items → ask the user.

## 3. Edit
Launch `pattern-editor` with `00-decisions.md`. It produces `source/`, `output/<name>_EN.pdf`, `reviews/03-editor-log.md`.

## 4. Independent audit + layout (parallel)
Launch `pattern-auditor` and `pattern-layout` in parallel on the produced PDF.
- If findings exist: append them to `00-decisions.md`, send them to `pattern-editor` (SendMessage to keep context, or a new run), then re-run ONLY the affected checks (auditor for content changes, layout for visual changes). Stop iterating when there are no critical/major findings; do not loop without a reason.

## 5. Final checks (manager)
- Look at every page of the final PDF yourself once.
- Confirm no internal review notes / AI mentions in the PDF.
- A critical issue still open → do NOT present the file as finished; say what is blocking.

## 6. Delivery
- Final PDF + editable source (send with SendUserFile; commit & push to the working branch if in a repo).
- Short Turkish report: önemli düzeltmeler (konum/sorun/düzeltme/doğrulama), yapılan kontroller ayrı ayrı — **kodla hesap kontrolü**, **okuyarak/görsel inceleme**, **fiziksel örme testi (yapılmadı)** —, alınan tasarım kararları, çözülemeyen noktalar.
- Never claim a physical test, professional tech-edit approval or an error-free guarantee.
