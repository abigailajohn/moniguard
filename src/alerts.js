// Scam alerts shown on Home and under the bell.
// DEMO CONTENT: these describe common scam patterns, not specific confirmed
// incidents. In a full version they would come from a verified source
// (for example CERT-MU advisories or partner banks) and be reviewed before publishing.
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export const ALERTS = [
  {
    id: 'grant-2026',
    level: 'high',
    title: 'Fake SME grant offers circulating',
    short: 'Messages claim your business was "pre-selected" for a grant and ask for bank details.',
    ts: daysAgo(1),
    body: 'Messages and emails are claiming to come from a business support body, saying your company has been pre-selected for a grant. They link to a look-alike website and ask for your business and bank details "to secure your allocation".',
    signs: ['You did not apply for the grant', 'The link is not the organisation\'s official website', 'A short deadline, such as "before Friday"', 'Asks for bank or login details'],
    todo: ['Do not click the link or send any details', 'Look up the organisation\'s real website yourself', 'Check the message in MoniGuard and report it'],
    sample: 'grant',
  },
  {
    id: 'bank-change',
    level: 'high',
    title: 'Supplier "change of bank details" invoices',
    short: 'Invoices that look real but ask you to pay into a new account.',
    ts: daysAgo(3),
    body: 'Fraudsters copy a real supplier\'s invoice, change the bank account number and send it from an address that looks almost the same as the supplier\'s. The invoice amount is usually normal, so it does not stand out.',
    signs: ['"Our bank details have changed"', 'Sender address is one letter or word different', 'Pressure to pay today'],
    todo: ['Phone the supplier on a number you already have, not one in the email', 'Never change payment details because of an email alone', 'Save your real suppliers in Trusted records so look-alikes are flagged'],
    sample: 'invoice',
  },
  {
    id: 'bank-sms',
    level: 'medium',
    title: '"Account suspended" bank SMS',
    short: 'Text messages say your bank account is blocked and link to a fake login page.',
    ts: daysAgo(6),
    body: 'Text messages pretending to be from a bank say your account has been suspended or will be closed in 24 hours, with a link to "verify your details". The page copies the bank\'s login screen to steal your login and one-time codes.',
    signs: ['A link to a website that is not the bank\'s own', 'Threat of closure within hours', 'Asks for your login, PIN or OTP'],
    todo: ['Do not open the link', 'Call your bank using the number on your card', 'If you entered details, call your bank immediately'],
    sample: 'sms',
  },
  {
    id: 'qr-sticker',
    level: 'medium',
    title: 'Fake QR codes on payment notices',
    short: 'QR stickers placed over real ones send payments or logins to scammers.',
    ts: daysAgo(10),
    body: 'Scammers print QR codes that lead to fake payment or login pages, and stick them on posters, parking meters or printed notices. The page looks real but the money or details go to the scammer.',
    signs: ['A sticker placed on top of another code', 'The link opens a site you do not recognise', 'Asks you to log in or pay straight away'],
    todo: ['Scan suspicious codes with the MoniGuard QR check first', 'Type the official website address yourself instead'],
    sample: null,
  },
]
