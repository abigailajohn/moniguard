# Real-world test pack

Twelve messages to paste into **Verify → Paste text**. The scams follow patterns from official Mauritian warnings (source under each). The notices describe the scams but mostly don't publish the full text, so the wording is reconstructed. Three are normal messages that should **not** be flagged.

Run them all at once with `npm test`.

## 1. mra-refund

**Expected:** high or suspicious  
**Pattern from:** MRA scam alert, "Refund of Income Tax: Fake Request for Bank Account Number" (16 Sep 2020), mra.mu/scam-alerts

```
From: refunds@mra-taxrefund.com
Subject: Income Tax Refund

Dear Taxpayer, after the annual calculation of your fiscal activity you are eligible to receive a tax refund of Rs 12,450. Please submit your bank account number and card details within 48 hours to receive your refund.
Mauritius Revenue Authority
```

## 2. mra-spoofed

**Expected:** suspicious or inconclusive  
**Pattern from:** MRA alert "FATCA CPS Online: Phishing Email" (29 Nov 2018): subject "Your Invoice for billing period Oct 2018" from Fatcacrsunit@mra.mu (a forged MRA address). Also MRA "Spoofed eMails" (07 May 2026).

```
From: Fatcacrsunit@mra.mu
Subject: Your Invoice for billing period Oct 2018

Please find attached your invoice. Open the attachment and log in to view the amount due.
```

## 3. bom-reward

**Expected:** high  
**Pattern from:** Bank of Mauritius public notices (21 Sep 2023, 13 May 2026): messages in the name of the Bank offering rewards or financial support in exchange for a payment.

```
BANK OF MAURITIUS - Financial Support Programme. Congratulations, you have been selected to receive Rs 75,000. To release the funds, pay the administrative fee of Rs 2,500 today via the link http://bom-support.online/claim
```

## 4. post-parcel

**Expected:** high or suspicious  
**Pattern from:** Mauritius Post communiqué: fraudulent emails claiming a parcel is held and asking for payment for delivery or Customs clearance.

```
From: delivery@mauritiuspost-track.com
Your parcel MU77812 is held at Customs. Pay the clearance fee of Rs 145 within 24 hours or it will be returned: https://bit.ly/mupost-fee
```

## 5. bank-sms-secure

**Expected:** high or suspicious  
**Pattern from:** Police cybercrime figures reported by L'Express via AllAfrica (26 Dec 2025): fake bank messages asking to "confirmer un achat" or "sécuriser un compte", leading to OTP theft.

```
MCB: Une transaction de Rs 18 900 est en attente. Si ce n'est pas vous, sécurisez votre compte immédiatement: https://mcb-securite.com/verif et saisissez le code OTP reçu.
```

## 6. whatsapp-hacked

**Expected:** suspicious or high  
**Pattern from:** Bank of Mauritius notice 13 May 2026: messages from people whose email or phone accounts may have been hacked, asking for transfers.

```
Hi, it's me, I changed my number. I'm stuck and need you to send Rs 20,000 urgently to this new account 000445566778, I will pay you back tomorrow. Please don't call, I can't talk now.
```

## 7. fake-job

**Expected:** suspicious or high  
**Pattern from:** MRA scam alert "Fake Recruitment" (13 May 2025).

```
MRA Recruitment 2026: You have been pre-selected for the post of Tax Officer. To confirm your interview, pay the processing fee of Rs 1,500 before Friday at http://mra-jobs.site/apply
```

## 8. maubank-social

**Expected:** high or suspicious  
**Pattern from:** MauBank communiqué (14 May 2026): fraudulent social media profiles claiming to represent the bank.

```
MauBank Customer Care here (official page). We noticed unusual activity. To avoid your account being blocked, reply with your login details and the OTP we just sent.
```

## 9. kreol-supplier

**Expected:** high  
**Pattern from:** Invoice / payment-diversion pattern (Bank of Mauritius notices), in Kreol Morisien.

```
From: compta@pltraders-mu.com
Bonzour, nou finn sanz nou kont labank. Pey fakir Rs 42,000 zordi mem lor nouvo kont 000123987654. Si ou pa pey, nou pou aret livrezon.
```

## 10. legit-mra

**Expected:** safe or inconclusive  
**Pattern from:** Control: genuine-style reminder linking only to the official site.

```
Reminder: the deadline for filing your income tax return is approaching. File online at https://www.mra.mu
```

## 11. legit-supplier

**Expected:** safe  
**Pattern from:** Control: invoice from a saved supplier, normal wording.

```
From: accounts@pltraders.mu
Invoice 2231 for Rs 18,000, October print order. Payment to our usual MCB account within 30 days. Thank you.
```

## 12. legit-meeting

**Expected:** inconclusive  
**Pattern from:** Control: ordinary message.

```
Bonjour, est-ce que la livraison de jeudi est toujours prévue pour 10h ? Merci.
```

## Finding more to test

- MRA scam alerts: https://www.mra.mu/scam-alerts
- Bank of Mauritius notices: https://www.bom.mu (Financial education menu)
- MauBank communiqués: https://www.maubank.mu
- Mauritius Post communiqués: https://www.mauritiuspost.mu/communique
- Scam screenshots people post on Facebook groups or WhatsApp: use **Upload file** (needs the AI key).

When you test a real one, note the result. If MoniGuard gets it wrong, send me the text (remove personal details) and I'll add a rule and a test for it.

MoniGuard checks whether a message is trying to get **money or details** from you. It doesn't judge whether a news story is true (fake news), so test it with scam messages, not news articles.
