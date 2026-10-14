// Demo content. Names and domains are illustrative samples, not real businesses.
export const SAMPLES = [
  {
    id: 'invoice',
    chip: 'Fake supplier invoice',
    text: 'From: accounts@portlouis-traders.net\nSubject: Updated bank details - Invoice 1048\n\nDear customer, please note our bank details have changed. Kindly settle Rs 48,500 today into the new account 000123456789. Failure to pay within 24 hours will suspend your supply.\n\nPort Louis Traders',
  },
  {
    id: 'grant',
    chip: 'Grant offer',
    text: 'MCCI SME Grant Programme: your business has been pre-selected for a Rs 150,000 grant. Submit your business and bank details at http://mcci-sme-grants.com before Friday to secure your allocation.',
  },
  {
    id: 'sms',
    chip: 'Bank SMS',
    text: 'MCB: Your account has been suspended. Click here to verify your details: http://mcb-secure.mu Failure to update within 24 hours may result in account closure.',
  },
  {
    id: 'real',
    chip: 'Real supplier',
    text: 'From: accounts@pltraders.mu\nSubject: Invoice 2207\n\nHi, attached is invoice 2207 for Rs 32,000 for the March print order, payable to the same account as before. Thanks, Port Louis Print Co.',
  },
  {
    id: 'new',
    chip: 'New supplier',
    text: 'From: accounts@bluesky-packaging.mu\nSubject: Invoice 3310\n\nHello, please find invoice 3310 for Rs 21,400 for the packaging order. Payment terms are 30 days. Thank you, BlueSky Packaging.',
  },
]

export const SEED_RECORDS = [
  { id: 'seed-1', name: 'Port Louis Print Co.', domain: 'pltraders.mu', kind: 'supplier', savedAt: '2026-10-01T09:00:00Z', sample: true },
  { id: 'seed-2', name: 'MCCI', domain: 'mcci.org', kind: 'organisation', savedAt: '2026-10-01T09:00:00Z', sample: true },
]
