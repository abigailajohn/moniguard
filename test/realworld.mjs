// Real-world style test pack. Each scam is modelled on a pattern from an official
// Mauritian warning (source noted). Wording is reconstructed, not copied: the notices
// describe the scams but mostly do not publish the full message text.
export const PACK = [
  {
    id: 'mra-refund', expect: ['high', 'suspicious'],
    source: 'MRA scam alert, "Refund of Income Tax: Fake Request for Bank Account Number" (16 Sep 2020), mra.mu/scam-alerts',
    text: 'From: refunds@mra-taxrefund.com\nSubject: Income Tax Refund\n\nDear Taxpayer, after the annual calculation of your fiscal activity you are eligible to receive a tax refund of Rs 12,450. Please submit your bank account number and card details within 48 hours to receive your refund.\nMauritius Revenue Authority',
  },
  {
    id: 'mra-spoofed', expect: ['suspicious', 'inconclusive'],
    source: 'MRA alert "FATCA CPS Online: Phishing Email" (29 Nov 2018): subject "Your Invoice for billing period Oct 2018" from Fatcacrsunit@mra.mu (a forged MRA address). Also MRA "Spoofed eMails" (07 May 2026).',
    text: 'From: Fatcacrsunit@mra.mu\nSubject: Your Invoice for billing period Oct 2018\n\nPlease find attached your invoice. Open the attachment and log in to view the amount due.',
  },
  {
    id: 'bom-reward', expect: ['high'],
    source: 'Bank of Mauritius public notices (21 Sep 2023, 13 May 2026): messages in the name of the Bank offering rewards or financial support in exchange for a payment.',
    text: 'BANK OF MAURITIUS - Financial Support Programme. Congratulations, you have been selected to receive Rs 75,000. To release the funds, pay the administrative fee of Rs 2,500 today via the link http://bom-support.online/claim',
  },
  {
    id: 'post-parcel', expect: ['high', 'suspicious'],
    source: 'Mauritius Post communiqué: fraudulent emails claiming a parcel is held and asking for payment for delivery or Customs clearance.',
    text: 'From: delivery@mauritiuspost-track.com\nYour parcel MU77812 is held at Customs. Pay the clearance fee of Rs 145 within 24 hours or it will be returned: https://bit.ly/mupost-fee',
  },
  {
    id: 'bank-sms-secure', expect: ['high', 'suspicious'],
    source: 'Police cybercrime figures reported by L\'Express via AllAfrica (26 Dec 2025): fake bank messages asking to "confirmer un achat" or "sécuriser un compte", leading to OTP theft.',
    text: 'MCB: Une transaction de Rs 18 900 est en attente. Si ce n\'est pas vous, sécurisez votre compte immédiatement: https://mcb-securite.com/verif et saisissez le code OTP reçu.',
  },
  {
    id: 'whatsapp-hacked', expect: ['suspicious', 'high'],
    source: 'Bank of Mauritius notice 13 May 2026: messages from people whose email or phone accounts may have been hacked, asking for transfers.',
    text: 'Hi, it\'s me, I changed my number. I\'m stuck and need you to send Rs 20,000 urgently to this new account 000445566778, I will pay you back tomorrow. Please don\'t call, I can\'t talk now.',
  },
  {
    id: 'fake-job', expect: ['suspicious', 'high'],
    source: 'MRA scam alert "Fake Recruitment" (13 May 2025).',
    text: 'MRA Recruitment 2026: You have been pre-selected for the post of Tax Officer. To confirm your interview, pay the processing fee of Rs 1,500 before Friday at http://mra-jobs.site/apply',
  },
  {
    id: 'maubank-social', expect: ['high', 'suspicious'],
    source: 'MauBank communiqué (14 May 2026): fraudulent social media profiles claiming to represent the bank.',
    text: 'MauBank Customer Care here (official page). We noticed unusual activity. To avoid your account being blocked, reply with your login details and the OTP we just sent.',
  },
  {
    id: 'kreol-supplier', expect: ['high'],
    source: 'Invoice / payment-diversion pattern (Bank of Mauritius notices), in Kreol Morisien.',
    text: 'From: compta@pltraders-mu.com\nBonzour, nou finn sanz nou kont labank. Pey fakir Rs 42,000 zordi mem lor nouvo kont 000123987654. Si ou pa pey, nou pou aret livrezon.',
  },
  {
    id: 'fr-bill-cutoff', expect: ['suspicious', 'high'],
    source: 'Common French-language SMS theme (unpaid electricity bill, "coupure imminente"), listed by iarnaque.fr for 2026; adapted to Mauritius.',
    text: "CEB: Votre facture d'électricité est impayée. Régularisez sous 24h pour éviter une coupure imminente : http://ceb-paiement.info/regler",
  },
  {
    id: 'fr-parcel-fee', expect: ['suspicious', 'high'],
    source: 'Common French-language SMS theme (parcel blocked, small customs or re-delivery fee), iarnaque.fr 2026; matches the Mauritius Post warning.',
    text: 'Mauritius Post : votre colis est en attente. Payez les frais de dédouanement de Rs 95 ici : https://mupost-livraison.com',
  },
  {
    id: 'fr-tax-refund', expect: ['high'],
    source: 'Common French-language SMS theme (tax refund available, enter bank details), iarnaque.fr 2026; matches the MRA refund warning.',
    text: "MRA : Un remboursement d'impôt de Rs 8 300 est disponible. Saisissez vos coordonnées bancaires sur http://mra-remboursement.com avant vendredi.",
  },
  // Controls: these should NOT be flagged as high risk
  {
    id: 'legit-mra', expect: ['safe', 'inconclusive'],
    source: 'Control: genuine-style reminder linking only to the official site.',
    text: 'Reminder: the deadline for filing your income tax return is approaching. File online at https://www.mra.mu',
  },
  {
    id: 'legit-supplier', expect: ['safe'],
    source: 'Control: invoice from a saved supplier, normal wording.',
    text: 'From: accounts@pltraders.mu\nInvoice 2231 for Rs 18,000, October print order. Payment to our usual MCB account within 30 days. Thank you.',
  },
  {
    id: 'legit-meeting', expect: ['inconclusive'],
    source: 'Control: ordinary message.',
    text: 'Bonjour, est-ce que la livraison de jeudi est toujours prévue pour 10h ? Merci.',
  },
]
