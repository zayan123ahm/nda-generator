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

This project uses ES modules, so it must be served over HTTP rather than opened
directly as a `file://` path (browsers block module loading from disk).

1. Open a terminal in the project directory.
2. Start a static server:

   ```bash
   python3 -m http.server 8000
   ```

3. Open <http://localhost:8000> in your browser.

Any static file server works, for example `npx serve` or the VS Code Live
Server extension. No build step or installation is required. The page loads
jsPDF from a CDN, so an internet connection is needed on first load.

## How to use the form

1. **Disclosing Party** — enter the party's name, then their address. The
   address can span multiple lines.
2. **Receiving Party** — enter the receiving party's name and address.
3. **Effective Date** — pick the date the agreement takes effect.
4. **Term (years)** — enter a whole number from 1 to 100.
5. **Governing Law / State** — enter the state whose law will govern, for
   example `California`.
6. Click **Generate PDF**. The file
   `mutual-non-disclosure-agreement.pdf` is downloaded with the clauses,
   page footers, and signature blocks filled in.

All fields are required. Whitespace-only entries, impossible dates (such as
February 30), and out-of-range terms are rejected with an inline message. Long
names and addresses wrap automatically, and an unbroken token (for example a
long email address) is split across lines so it stays inside the margins.


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