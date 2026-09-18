export const NDA_TEMPLATE = {
  title: 'MUTUAL NON-DISCLOSURE AGREEMENT',
  preamble: {
    intro: [
      { text: 'This Mutual Non-Disclosure Agreement (the "Agreement") is made and entered into as of ' },
      { text: '{{effectiveDate}}', bold: true },
      { text: ' (the "Effective Date"), by and between the parties identified below.' }
    ],
    parties: [
      {
        role: 'Disclosing Party',
        name: '{{disclosingParty}}',
        address: '{{disclosingAddress}}'
      },
      {
        role: 'Receiving Party',
        name: '{{receivingParty}}',
        address: '{{receivingAddress}}'
      }
    ],
    recital: 'The Parties intend to explore a possible business relationship (the "Purpose"). In connection with the Purpose, the Disclosing Party may disclose Confidential Information to the Receiving Party. This Agreement sets forth the terms governing the disclosure and use of such information.'
  },
  sections: [
    {
      heading: '1. Definition of Confidential Information',
      body: '"Confidential Information" means any non-public information, technical data, or know-how, including but not limited to trade secrets, inventions, business plans, customer and supplier lists, financial data, pricing, marketing plans, and other proprietary information disclosed by or on behalf of the Disclosing Party to the Receiving Party, whether orally, in writing, or by any other means, and designated as confidential at the time of disclosure. All information disclosed prior to the Effective Date is also deemed Confidential Information under this Agreement.'
    },
    {
      heading: '2. Obligations of the Receiving Party',
      body: 'The Receiving Party agrees to hold the Confidential Information in strict confidence and to take reasonable precautions to protect it. The Receiving Party shall use the Confidential Information solely for the Purpose and shall not disclose it to any third party without the prior written consent of the Disclosing Party. The Receiving Party may disclose Confidential Information only to its employees, officers, and advisors who have a legitimate need to know and who are bound by confidentiality obligations at least as protective as those set forth herein. The Receiving Party shall notify the Disclosing Party promptly upon becoming aware of any unauthorized use or disclosure of the Confidential Information. Nothing in this Agreement grants the Receiving Party any license or rights in or to the Confidential Information.'
    },
    {
      heading: '3. Exclusions from Confidential Information',
      body: 'Confidential Information does not include information that (a) is or becomes generally available to the public other than as a result of a disclosure by the Receiving Party in violation of this Agreement; (b) was available to the Receiving Party on a non-confidential basis prior to its disclosure to the Receiving Party; (c) becomes available to the Receiving Party on a non-confidential basis from a source other than the Disclosing Party, provided that such source is not bound by a confidentiality obligation to the Disclosing Party; or (d) is independently developed by the Receiving Party without reference to or reliance upon the Confidential Information. The Receiving Party shall bear the burden of proving that any information falls within one of the foregoing exclusions.'
    },
    {
      heading: '4. Term',
      body: 'This Agreement shall become effective on the Effective Date and shall remain in effect for a period of {{term}}. Upon the termination or expiration of this Agreement, the Receiving Party shall, upon request, return or destroy all Confidential Information and any copies thereof. The Receiving Party\'s obligations with respect to the Confidential Information shall survive the termination or expiration of this Agreement for a period of three (3) years thereafter, except that obligations relating to trade secrets shall survive in perpetuity.'
    },
    {
      heading: '5. Governing Law',
      body: 'This Agreement shall be governed by and construed in accordance with the laws of the State of {{state}}, without regard to its conflicts of laws principles. Any dispute arising out of or relating to this Agreement shall be resolved exclusively in the state or federal courts located in {{state}}.'
    }
  ],
  closing: 'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.',
  signatureHeader: [
    'Disclosing Party: {{disclosingParty}}',
    'Receiving Party: {{receivingParty}}'
  ],
  signatureRows: [
    ['By: ______________________________', 'By: ______________________________'],
    ['Title: ____________________________', 'Title: ____________________________'],
    ['Date: _____________________________', 'Date: _____________________________']
  ]
};

export function renderTemplate(data) {
  const fill = (text) =>
    text.replace(/\{\{(\w+)\}\}/g, (match, key) =>
      key in data ? data[key] : match
    );

  return {
    title: NDA_TEMPLATE.title,
    preamble: {
      intro: NDA_TEMPLATE.preamble.intro.map((run) => ({
        text: fill(run.text),
        bold: Boolean(run.bold)
      })),
      parties: NDA_TEMPLATE.preamble.parties.map((party) => ({
        role: party.role,
        name: fill(party.name),
        address: fill(party.address)
      })),
      recital: fill(NDA_TEMPLATE.preamble.recital)
    },
    sections: NDA_TEMPLATE.sections.map((section) => ({
      heading: fill(section.heading),
      body: fill(section.body)
    })),
    closing: fill(NDA_TEMPLATE.closing),
    signatureHeader: NDA_TEMPLATE.signatureHeader.map(fill),
    signatureRows: NDA_TEMPLATE.signatureRows
  };
}