import { renderTemplate } from './templates/nda.js';

const form = document.getElementById('nda-form');
const submitButton = form.querySelector('button[type="submit"]');

const FIELD_NAMES = [
  'disclosingParty',
  'disclosingAddress',
  'receivingParty',
  'receivingAddress',
  'effectiveDate',
  'term',
  'state'
];

const MIN_TERM = 1;
const MAX_TERM = 100;

const TERM_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty'
];

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const values = readValues();
  const errors = validate(values);

  FIELD_NAMES.forEach((name) => form.elements[name].setCustomValidity(''));

  if (errors.length) {
    errors.forEach((error) => {
      form.elements[error.name].setCustomValidity(error.message);
    });
    form.reportValidity();
    return;
  }

  submitButton.disabled = true;
  try {
    generatePdf(renderTemplate(toTemplateData(values)));
  } catch (error) {
    console.error(error);
    window.alert('Sorry, the PDF could not be generated. Please try again.');
  } finally {
    submitButton.disabled = false;
  }
});

function readValues() {
  const values = {};
  FIELD_NAMES.forEach((name) => {
    values[name] = sanitize(form.elements[name].value);
  });
  return values;
}

function validate(values) {
  const errors = [];
  const requiredFields = [
    ['disclosingParty', 'disclosing party name'],
    ['disclosingAddress', 'disclosing party address'],
    ['receivingParty', 'receiving party name'],
    ['receivingAddress', 'receiving party address'],
    ['effectiveDate', 'effective date'],
    ['state', 'governing law / state']
  ];

  requiredFields.forEach(([name, label]) => {
    if (!values[name]) {
      errors.push({ name, message: `Please enter the ${label}.` });
    }
  });

  if (values.effectiveDate && !parseIsoDate(values.effectiveDate)) {
    errors.push({
      name: 'effectiveDate',
      message: 'Please enter a valid effective date.'
    });
  }

  const term = Number(values.term);
  if (!Number.isInteger(term) || term < MIN_TERM || term > MAX_TERM) {
    errors.push({
      name: 'term',
      message: `Please enter a whole number of years between ${MIN_TERM} and ${MAX_TERM}.`
    });
  }

  return errors;
}

function toTemplateData(values) {
  return {
    disclosingParty: values.disclosingParty,
    disclosingAddress: values.disclosingAddress,
    receivingParty: values.receivingParty,
    receivingAddress: values.receivingAddress,
    effectiveDate: formatDate(values.effectiveDate),
    term: renderTerm(values.term),
    state: values.state
  };
}

function sanitize(value) {
  const normalized = String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

  return normalized
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDate(value) {
  const date = parseIsoDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function renderTerm(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return 'one (1) year';
  if (n === 1) return 'one (1) year';
  const word = TERM_WORDS[n - 1];
  return word ? `${word} (${n}) years` : `${n} years`;
}

function generatePdf(parts) {
  if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
    window.alert(
      'The PDF library failed to load. Check your internet connection and reload the page.'
    );
    return;
  }

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

  const breakWord = (word, width) => {
    if (!word || doc.getTextWidth(word) <= width) return word;
    const chunks = [];
    let chunk = '';
    for (const char of word) {
      if (chunk && doc.getTextWidth(chunk + char) > width) {
        chunks.push(chunk);
        chunk = char;
      } else {
        chunk += char;
      }
    }
    if (chunk) chunks.push(chunk);
    return chunks.join('\n');
  };

  const wrapText = (text, width) => {
    const hardBroken = String(text)
      .split('\n')
      .map((paragraph) =>
        paragraph
          .split(' ')
          .map((word) => breakWord(word, width))
          .join(' ')
      )
      .join('\n');
    return doc.splitTextToSize(hardBroken, width);
  };

  const addParagraph = (text, options = {}) => {
    const size = options.size || bodySize;
    const spacing = options.lineHeight || lineHeight;
    const style = options.style || 'normal';
    setFont(style, size);
    wrapText(text, contentWidth).forEach((line) => {
      if (y + spacing > bottomLimit) {
        newPage();
        setFont(style, size);
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

    const appendWord = (text, style, breakBefore) => {
      const wordWidth = doc.getTextWidth(text);
      const gap = line.length ? spaceWidth : 0;
      if (breakBefore || (line.length && lineWidth + gap + wordWidth > contentWidth)) {
        lines.push(line);
        line = [];
        lineWidth = 0;
      }
      lineWidth += (line.length ? spaceWidth : 0) + wordWidth;
      line.push({ text, style });
    };

    runs.forEach((run) => {
      const style = run.bold ? 'bold' : 'normal';
      setFont(style, size);
      run.text
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word) => {
          breakWord(word, contentWidth)
            .split('\n')
            .forEach((chunk, index) => appendWord(chunk, style, index > 0));
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
    const width = contentWidth - indent;

    setFont('bold', bodySize);
    const headerLines = wrapText(`${party.role}: ${party.name}`, width);

    setFont('normal', bodySize);
    const addressLines = wrapText(party.address, width);

    ensureSpace(lineHeight * (headerLines.length + addressLines.length + 1));

    setFont('bold', bodySize);
    headerLines.forEach((line) => {
      if (y + lineHeight > bottomLimit) {
        newPage();
        setFont('bold', bodySize);
      }
      doc.text(line, margin + indent, y);
      y += lineHeight;
    });

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
    const rowSpacing = lineHeight + 3;

    setFont('bold', bodySize);
    const headers = parts.signatureHeader.map((header) =>
      wrapText(header, columnWidth)
    );
    const headerLineCount = Math.max(...headers.map((lines) => lines.length));
    const blockHeight =
      headerLineCount * rowSpacing + 6 + parts.signatureRows.length * rowSpacing;

    if (y + blockHeight > bottomLimit) newPage();

    for (let index = 0; index < headerLineCount; index += 1) {
      setFont('bold', bodySize);
      if (headers[0][index]) doc.text(headers[0][index], leftX, y);
      if (headers[1][index]) doc.text(headers[1][index], rightX, y);
      y += rowSpacing;
    }

    y += 6;

    parts.signatureRows.forEach(([left, right]) => {
      setFont('normal', bodySize);
      doc.text(left, leftX, y);
      doc.text(right, rightX, y);
      y += rowSpacing;
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
  wrapText(parts.title, contentWidth).forEach((line) => {
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