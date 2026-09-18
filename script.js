import { renderTemplate } from './templates/nda.js';

const form = document.getElementById('nda-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = {
    disclosingParty: form.disclosingParty.value.trim(),
    disclosingAddress: form.disclosingAddress.value.trim(),
    receivingParty: form.receivingParty.value.trim(),
    receivingAddress: form.receivingAddress.value.trim(),
    effectiveDate: formatDate(form.effectiveDate.value),
    term: renderTerm(form.term.value),
    state: form.state.value.trim()
  };

  generatePdf(renderTemplate(data));
});

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

const TERM_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty'
];

function renderTerm(value) {
  const n = parseInt(value, 10);
  if (n === 1) return 'one (1) year';
  const word = TERM_WORDS[n - 1];
  return word ? `${word} (${n}) years` : `${n} years`;
}

function generatePdf(parts) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const FONT = 'times';
  const margin = 25;
  const bodySize = 11;
  const lineHeight = 6;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - margin;
  let y = margin;

  const newPage = () => {
    doc.addPage();
    y = margin;
  };

  const ensureSpace = (needed) => {
    if (y + needed > bottomLimit) newPage();
  };

  const setFont = (style, size = bodySize) => {
    doc.setFont(FONT, style);
    doc.setFontSize(size);
  };

  const addParagraph = (text, options = {}) => {
    const size = options.size || bodySize;
    const spacing = options.lineHeight || lineHeight;
    setFont(options.style || 'normal', size);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line) => {
      if (y + spacing > bottomLimit) {
        newPage();
        setFont(options.style || 'normal', size);
      }
      doc.text(line, margin, y);
      y += spacing;
    });
    y += options.spaceAfter || 0;
  };

  const addRunsParagraph = (runs, options = {}) => {
    const size = options.size || bodySize;
    const spacing = options.lineHeight || lineHeight;
    setFont('normal', size);
    const spaceWidth = doc.getTextWidth(' ');
    const lines = [];
    let line = [];
    let lineWidth = 0;

    runs.forEach((run) => {
      const style = run.bold ? 'bold' : 'normal';
      setFont(style, size);
      run.text
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word) => {
          const wordWidth = doc.getTextWidth(word);
          const gap = line.length ? spaceWidth : 0;
          if (line.length && lineWidth + gap + wordWidth > contentWidth) {
            lines.push(line);
            line = [];
            lineWidth = 0;
          }
          lineWidth += (line.length ? spaceWidth : 0) + wordWidth;
          line.push({ text: word, style });
        });
    });
    if (line.length) lines.push(line);

    lines.forEach((currentLine) => {
      if (y + spacing > bottomLimit) newPage();
      let x = margin;
      currentLine.forEach((word) => {
        setFont(word.style, size);
        doc.text(word.text, x, y);
        x += doc.getTextWidth(word.text) + spaceWidth;
      });
      y += spacing;
    });
    y += options.spaceAfter || 0;
  };

  const addParty = (party) => {
    const indent = 8;
    const header = `${party.role}: ${party.name}`;
    setFont('bold', bodySize);
    const addressLines = (() => {
      setFont('normal', bodySize);
      return doc.splitTextToSize(party.address, contentWidth - indent);
    })();

    ensureSpace(lineHeight * (addressLines.length + 2));

    setFont('bold', bodySize);
    doc.text(header, margin + indent, y);
    y += lineHeight;

    setFont('normal', bodySize);
    addressLines.forEach((line) => {
      if (y + lineHeight > bottomLimit) {
        newPage();
        setFont('normal', bodySize);
      }
      doc.text(line, margin + indent, y);
      y += lineHeight;
    });
    y += 3;
  };

  const addSection = (section) => {
    y += 3;
    ensureSpace(lineHeight * 3);
    setFont('bold', bodySize);
    doc.text(section.heading, margin, y);
    y += lineHeight;
    addParagraph(section.body, { spaceAfter: 6 });
  };

  const addSignatures = () => {
    const columnGap = 12;
    const columnWidth = (contentWidth - columnGap) / 2;
    const leftX = margin;
    const rightX = margin + columnWidth + columnGap;
    const blockHeight = lineHeight * 6 + 10;

    if (y + blockHeight > bottomLimit) newPage();

    setFont('bold', bodySize);
    doc.text(parts.signatureHeader[0], leftX, y);
    doc.text(parts.signatureHeader[1], rightX, y);
    y += lineHeight + 5;

    parts.signatureRows.forEach(([left, right]) => {
      setFont('normal', bodySize);
      doc.text(left, leftX, y);
      doc.text(right, rightX, y);
      y += lineHeight + 3;
    });
  };

  const addFooters = () => {
    const total = doc.getNumberOfPages();
    const footerY = pageHeight - 12;
    for (let page = 1; page <= total; page += 1) {
      doc.setPage(page);
      doc.setTextColor(110);
      setFont('normal', 8);
      doc.text(`Page ${page} of ${total}`, pageWidth / 2, footerY, {
        align: 'center'
      });
      setFont('normal', 7);
      doc.text(
        'Template for educational purposes, not legal advice.',
        pageWidth / 2,
        footerY + 4,
        { align: 'center' }
      );
    }
    doc.setTextColor(0);
  };

  doc.setProperties({
    title: parts.title,
    subject: 'Mutual Non-Disclosure Agreement',
    creator: 'NDA Generator'
  });

  setFont('bold', 16);
  const titleLines = doc.splitTextToSize(parts.title, contentWidth);
  titleLines.forEach((line) => {
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 7;
  });

  y += 2;
  doc.setLineWidth(0.4);
  doc.setDrawColor(60);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setDrawColor(0);
  y += 12;

  addRunsParagraph(parts.preamble.intro, { spaceAfter: 6 });
  parts.preamble.parties.forEach(addParty);
  addParagraph(parts.preamble.recital, { spaceAfter: 4 });
  parts.sections.forEach(addSection);

  y += 6;
  ensureSpace(lineHeight * 3);
  addParagraph(parts.closing, { style: 'italic', spaceAfter: 12 });
  addSignatures();
  addFooters();

  doc.save('mutual-non-disclosure-agreement.pdf');
}