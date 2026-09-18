# NDA Generator

A simple, client-side web app that generates a formatted Mutual Non-Disclosure
Agreement (NDA) as a downloadable PDF. Built as a class assignment with plain
HTML, CSS, and JavaScript — no backend required.

## What it does

- Collects party details from a form:
  - Disclosing Party: name + address
  - Receiving Party: name + address
  - Effective date
  - Term (in years)
  - Governing law / state
- Builds an NDA document with numbered clauses:
  1. Definition of Confidential Information
  2. Obligations of the Receiving Party
  3. Exclusions from Confidential Information
  4. Term
  5. Governing Law
- Includes signature blocks with date lines for both parties.
- Downloads the finished agreement as a PDF.

> Disclaimer: the generated document is a template for educational purposes and
> is not legal advice.

## How to run

This project uses ES modules, so open it through a local static server rather
than `file://` (modules are blocked by CORS in some browsers when loaded
directly from disk).

```bash
# from the project directory
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Alternatively, any static file server
works (e.g. `npx serve`).

## Tech used

- Plain HTML, CSS, and JavaScript (ES modules)
- [jsPDF](https://github.com/parallax/jsPDF) loaded from a CDN for PDF
  generation
- No build step, no dependencies to install

## File structure

```
index.html        Form, disclaimer, and script/module includes
styles.css        Form styling
script.js         Form handling + PDF generation (wrapping, page breaks)
templates/nda.js  NDA clause text with {{placeholders}} and render logic
```