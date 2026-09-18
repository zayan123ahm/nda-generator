# AGENTS.md

## Project description

A static, client-side web app that turns a form into a downloadable NDA PDF.
Class assignment project. No backend, no build step, no package manager.

## Conventions

- **Language/style**: Plain HTML, CSS, and vanilla JavaScript (ES modules).
  No frameworks, no TypeScript, no linters, no tests.
- **No comments in code** unless explicitly requested.
- **File layout**:
  - `index.html` — markup, form, CDN script tags, module entry point.
  - `styles.css` — all styling; plain CSS, no preprocessor.
  - `script.js` — form handling and PDF generation.
  - `templates/nda.js` — NDA clause text and rendering. Keep legal copy here,
    not in `script.js`.
- **Templates**: Static clause text uses `{{placeholder}}` tokens, replaced by
  `renderTemplate(data)` in `templates/nda.js`. Do not hardcode user values
  into clause text outside the template file.
- **PDF generation** (`script.js`):
  - jsPDF is loaded from CDN in `index.html` and accessed via the global
    `window.jspdf.jsPDF` (the UMD build).
  - Use `doc.splitTextToSize` for all text wrapping.
  - Position caret `y` at a top margin of 20 and add a page with `doc.addPage()`
    whenever `y` exceeds `pageHeight - margin` (auto page breaks).
  - Margins: 20pt on all sides. Signature blocks render in two columns.
- **Serving**: ES modules require a static server; run `python3 -m http.server`
  from the project root. Do not rely on `file://` loading.
- **Housekeeping**: Do not commit generated PDFs, IDE files, or secrets. See
  `.gitignore`. Only commit when explicitly asked.