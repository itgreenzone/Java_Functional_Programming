# Material generators

Sources used to build each lesson's materials (not needed to run the course code).

* `L01/` … `L07/` – one folder per lesson.
* `L01/build_l01.js` – slide deck (pptxgenjs). Run `node build_l01.js L01_WhyFP_Slides.pptx`.
  It applies theme colours with an `applyTheme` helper; replace that import if you rebuild outside the original environment.
* `L01/cheatsheet.html`, `L01/sketch.html` – A4 pages rendered to PDF with headless Chromium (`common/topdf.py`).
  Fonts expected next to the HTML: Carlito, Caladea, Liberation Mono, Caveat and Patrick Hand (all SIL OFL / Apache).
