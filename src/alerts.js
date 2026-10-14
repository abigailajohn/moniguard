// Scam alerts shown on Home and under the bell.
// DEMO CONTENT: these describe common scam patterns, not specific confirmed
// incidents. In a full version they would come from a verified source
// (for example CERT-MU advisories or partner banks) and be reviewed before publishing.
// Each text field is { en, fr, mcr }. Kreol drafts need a native speaker's review.
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export const ALERTS = [
  {
    id: 'grant-2026',
    level: 'high',
    ts: daysAgo(1),
    sample: 'grant',
    title: { en: 'Fake SME grant offers circulating', fr: 'Fausses offres de subvention PME en circulation', mcr: 'Fos lofer sibvansion PME pe sirkile' },
    short: {
      en: 'Messages claim your business was "pre-selected" for a grant and ask for bank details.',
      fr: 'Des messages disent que votre entreprise a été « présélectionnée » et demandent vos coordonnées bancaires.',
      mcr: 'Bann mesaz dir ou biznes finn "preselekte" pou enn sibvansion ek demann ou detay labank.',
    },
    body: {
      en: 'Messages and emails claim to come from a business support body, saying your company has been pre-selected for a grant. They link to a look-alike website and ask for your business and bank details "to secure your allocation".',
      fr: "Des messages et e-mails prétendent venir d'un organisme d'appui aux entreprises et annoncent que votre société a été présélectionnée pour une subvention. Ils renvoient vers un faux site et demandent vos coordonnées bancaires « pour sécuriser votre allocation ».",
      mcr: 'Bann mesaz ek email dir zot sorti kot enn lorganizasion ki ed biznes, ek dir ou konpani finn preselekte pou enn sibvansion. Zot amenn ou lor enn fos sit ek demann ou detay biznes ek labank "pou sekiriz ou alokasion".',
    },
    signs: {
      en: ['You did not apply for the grant', "The link is not the organisation's official website", 'A short deadline, such as "before Friday"', 'Asks for bank or login details'],
      fr: ["Vous n'avez pas demandé de subvention", "Le lien n'est pas le site officiel de l'organisme", 'Un délai très court, comme « avant vendredi »', 'Demande vos coordonnées bancaires ou identifiants'],
      mcr: ['Ou pa finn fer demann pou sibvansion-la', 'Lien-la pa sit ofisiel lorganizasion-la', 'Enn delai kourt, kouma "avan vandredi"', 'Demann detay labank ou login'],
    },
    todo: {
      en: ['Do not click the link or send any details', "Look up the organisation's real website yourself", 'Check the message in MoniGuard and report it'],
      fr: ["Ne cliquez pas et n'envoyez aucune information", "Cherchez vous-même le vrai site de l'organisme", 'Vérifiez le message dans MoniGuard et signalez-le'],
      mcr: ['Pa klik lien-la ni avoy okenn detay', 'Rod vre sit lorganizasion-la ou mem', 'Verifie mesaz-la dan MoniGuard ek rapor li'],
    },
  },
  {
    id: 'bank-change',
    level: 'high',
    ts: daysAgo(3),
    sample: 'invoice',
    title: { en: 'Supplier "change of bank details" invoices', fr: 'Factures « changement de coordonnées bancaires »', mcr: 'Fakir "sanzman kont labank"' },
    short: {
      en: 'Invoices that look real but ask you to pay into a new account.',
      fr: 'Des factures crédibles qui demandent de payer sur un nouveau compte.',
      mcr: 'Fakir ki paret vre me ki demann ou pey lor enn nouvo kont.',
    },
    body: {
      en: "Fraudsters copy a real supplier's invoice, change the bank account number and send it from an address that looks almost the same as the supplier's. The amount is usually normal, so it does not stand out.",
      fr: "Les fraudeurs copient la facture d'un vrai fournisseur, changent le numéro de compte et l'envoient depuis une adresse presque identique. Le montant est souvent normal, donc rien n'attire l'attention.",
      mcr: 'Eskro kopie fakir enn vre fourniser, sanz nimero kont labank ek avoy li depi enn adres ki pres parey. Montan-la souvan normal, alor narien pa atir latansion.',
    },
    signs: {
      en: ['"Our bank details have changed"', "Sender address is one letter or word different", 'Pressure to pay today'],
      fr: ['« Nos coordonnées bancaires ont changé »', "L'adresse diffère d'une lettre ou d'un mot", "Pression pour payer aujourd'hui"],
      mcr: ['"Nou finn sanz nou kont labank"', 'Adres-la diferan par enn let ou enn mo', 'Presion pou pey zordi mem'],
    },
    todo: {
      en: ['Phone the supplier on a number you already have, not one in the email', 'Never change payment details because of an email alone', 'Save your real suppliers in Trusted records so look-alikes are flagged'],
      fr: ["Appelez le fournisseur sur un numéro que vous avez déjà, pas celui de l'e-mail", 'Ne changez jamais de RIB sur la seule base d’un e-mail', 'Enregistrez vos vrais fournisseurs pour que les imitations soient signalées'],
      mcr: ['Telefonn fourniser-la lor enn nimero ki ou deza ena, pa seki dan email-la', 'Zame sanz detay peyman akoz zis enn email', 'Sov ou vre fourniser pou ki bann imitasion sorti an rouz'],
    },
  },
  {
    id: 'bank-sms',
    level: 'medium',
    ts: daysAgo(6),
    sample: 'fr',
    title: { en: '"Account suspended" bank SMS', fr: 'SMS bancaire « compte suspendu »', mcr: 'SMS labank "kont sispann"' },
    short: {
      en: 'Text messages say your bank account is blocked and link to a fake login page.',
      fr: 'Des SMS disent que votre compte est bloqué et renvoient vers une fausse page de connexion.',
      mcr: 'Bann SMS dir ou kont labank bloke ek amenn ou lor enn fos paz login.',
    },
    body: {
      en: "Text messages pretending to be from a bank say your account has been suspended or will be closed in 24 hours, with a link to \"verify your details\". The page copies the bank's login screen to steal your login and one-time codes.",
      fr: "Des SMS se faisant passer pour une banque annoncent que votre compte est suspendu ou sera fermé sous 24 heures, avec un lien pour « vérifier vos informations ». La page copie l'écran de connexion pour voler vos identifiants et codes.",
      mcr: 'Bann SMS ki fer semblan sorti kot labank dir ou kont finn sispann ou pou ferme dan 24er, avek enn lien pou "verifie ou detay". Paz-la kopie ekran login labank pou kokin ou login ek kod OTP.',
    },
    signs: {
      en: ["A link to a website that is not the bank's own", 'Threat of closure within hours', 'Asks for your login, PIN or OTP'],
      fr: ["Un lien vers un site qui n'est pas celui de la banque", 'Menace de fermeture sous quelques heures', 'Demande vos identifiants, PIN ou code OTP'],
      mcr: ['Enn lien ki pa sit labank', 'Menas ferm kont dan enn de-trwa er', 'Demann ou login, PIN ou OTP'],
    },
    todo: {
      en: ['Do not open the link', 'Call your bank using the number on your card', 'If you entered details, call your bank immediately'],
      fr: ["N'ouvrez pas le lien", 'Appelez votre banque au numéro inscrit sur votre carte', 'Si vous avez saisi vos informations, appelez votre banque immédiatement'],
      mcr: ['Pa ouver lien-la', 'Apel ou labank lor nimero ki lor ou kart', 'Si ou finn met ou detay, apel ou labank tousuit'],
    },
  },
  {
    id: 'qr-sticker',
    level: 'medium',
    ts: daysAgo(10),
    sample: null,
    title: { en: 'Fake QR codes on payment notices', fr: 'Faux QR codes sur des avis de paiement', mcr: 'Fos QR code lor avi peyman' },
    short: {
      en: 'QR stickers placed over real ones send payments or logins to scammers.',
      fr: 'Des autocollants QR collés sur les vrais envoient paiements ou identifiants aux escrocs.',
      mcr: 'Stiker QR ki kole lor vre QR avoy peyman ou login kot eskro.',
    },
    body: {
      en: 'Scammers print QR codes that lead to fake payment or login pages, and stick them on posters, parking meters or printed notices. The page looks real but the money or details go to the scammer.',
      fr: "Les escrocs impriment des QR codes menant à de fausses pages de paiement ou de connexion et les collent sur des affiches, horodateurs ou avis imprimés. La page semble réelle mais l'argent part chez l'escroc.",
      mcr: 'Eskro inprim QR code ki amenn lor fos paz peyman ou login, ek kol zot lor poster, meter parking ou avi inprime. Paz-la paret vre me larzan ou detay al kot eskro.',
    },
    signs: {
      en: ['A sticker placed on top of another code', 'The link opens a site you do not recognise', 'Asks you to log in or pay straight away'],
      fr: ['Un autocollant posé sur un autre code', 'Le lien ouvre un site inconnu', 'Demande de vous connecter ou de payer tout de suite'],
      mcr: ['Enn stiker lor enn lot kod', 'Lien-la ouver enn sit ki ou pa rekonet', 'Demann ou login ou pey tousuit'],
    },
    todo: {
      en: ['Scan suspicious codes with the MoniGuard QR check first', 'Type the official website address yourself instead'],
      fr: ['Scannez d’abord les codes suspects avec MoniGuard', "Tapez plutôt vous-même l'adresse du site officiel"],
      mcr: ['Scan bann kod sispe avek MoniGuard avan', 'Tap adres sit ofisiel-la ou mem plito'],
    },
  },
]
