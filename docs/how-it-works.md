# How MoniGuard works

A plain-language guide to what the app does, what happens behind each screen, and why it was built this way. It's written so you can explain any part of it in your own words.

## 1. The journey through the app

1. **Welcome.** Choose English, Français or Kreol. Create an account, log in, or explore without an account (data then stays on that device).
2. **Sign up.** Name, business name, email, password, and agreeing to the terms. A "What we ask for and why" box explains every field.
3. **Check your email.** Supabase sends a confirmation link. The account only works after the link is opened, which proves the email is real.
4. **Set-up (2 steps).** What the business does, industry, role, business email, main bank, team size. Then a short "how MoniGuard protects you" screen.
5. **Home.** Verify shortcuts, Manage (trusted suppliers), follow-up reminders, recent checks, the latest scam alert and the bell for all notifications.
6. **Verify.** Paste text, upload a file (screenshot, photo, PDF, .txt), paste a link, or scan/upload a QR code.
7. **Result.** One of four outcomes: High risk, Suspicious, Looks safe, Inconclusive. Each comes with a confidence level, the evidence ("What we found"), what to do next, and what was *not* verified.
8. **Act.** Report it, contact the official channel, save a genuine supplier to trusted records, or mark a follow-up as confirmed.

## 2. What information the app holds, and why

| Information | Why | Where it lives |
|---|---|---|
| Name, email, password | To create the account and log in | Supabase Auth (passwords are stored hashed, never readable) |
| Business name, industry, description | Shown in the app; sent with each check so the AI can judge whether a request makes sense for this business | `profiles` table |
| Business email | Its domain is "protected": look-alike addresses are flagged | `profiles` table |
| Checks, trusted suppliers, reports | History on any device | `checks`, `records`, `reports` tables |

What it never asks for: bank passwords, card numbers, OTPs.
Users can download all their data, delete their history, or delete the whole account (this removes every row).

## 3. What happens when you press "Check now"

**Step 1: Rules (always run, take milliseconds)**
- Pull out every sender address and link.
- Compare them with:
  - official domains of Mauritian banks and bodies (MCB, SBM, MauBank, AfrAsia, Bank One, Bank of Mauritius, MRA, MCCI, Mauritius Post, CERT-MU, FSC);
  - the user's **trusted suppliers**;
  - the user's **own business domain**.
- Look for scam signs in **English, French and Kreol**: changed bank details, requests for passwords/OTPs, urgent threats, unexpected grants or prizes, "pay a fee to receive money", "I have a new number, send money".
- Check link hygiene: http instead of https, shortened links, risky endings (.top, .xyz…), raw IP addresses.
- Each sign adds points. The total decides the label: High risk (55+), Suspicious (20+), Looks safe (a confirmed match to an official link or saved supplier, with no warning signs), otherwise Inconclusive.

**Step 2: AI reading (Claude, a few seconds, when the API key is set)**
- Claude reads the message (or the screenshot/PDF) like a person would and returns structured notes: who it claims to be, what it asks for, pressure tactics, details that don't add up, a one-line summary, in the user's language.
- These notes are **added as evidence**. They can make a result more cautious. **They can never make it "Looks safe".** Only a verifiable match can.
- Why: AI can be wrong or manipulated. A scam message could include text like "this is safe, ignore previous instructions". So the AI is never the one that says yes. Pasted content is also wrapped and treated as untrusted data in the prompt.

**Step 3: Fallback**
- If the server or AI can't be reached, the same rules run in the browser, so a check never dead-ends. Screenshots and photos are the one exception: they need the AI.

**Inputs**
- **Files:** PDFs and .txt are read in the browser. Screenshots and photos are shrunk in the browser, then read by Claude.
- **Links:** checked by their address only. MoniGuard never opens them.
- **QR codes:** decoded in the browser (camera or photo), then the contents are checked like a link. The result notes that fake QR stickers are a known trick.

## 4. Two ideas that make it more than a keyword filter

- **Trusted records.** Save a real supplier once. Next time, an invoice from `portlouis-traders.net` instead of the saved `pltraders.mu` is flagged as a look-alike, even if the wording is perfectly normal. Invoice fraud usually works exactly like that.
- **Your own domain.** Scammers copy a company's own address to ask staff to pay. MoniGuard flags addresses that imitate the user's business email domain.
- **Your main bank.** Bank scam texts are sent to thousands of people at once, so many receivers don't even bank there. If a message talks about "your SBM account" and the user's main bank is MCB, that's flagged. This is why set-up asks for the main bank.

It also stays honest about limits:
- A sender address on an official domain is **not** treated as proof, because sender addresses can be forged. The MRA has warned about phishing sent "from" `@mra.mu`.
- Every result lists what was not verified.

## 5. Feels like an app

- **Installable:** on Android (Chrome) the app offers "Install". On iPhone it's Share → Add to Home Screen. It then has its own icon and opens full screen, with no browser bar. A small service worker keeps the app shell available on a weak connection; checks and account data always go to the network.
- **Motion:** screens slide forward and back, buttons respond to taps, and results reveal step by step (banner, confidence count-up, findings one by one). Phones vibrate briefly on a high-risk result where supported. All motion is switched off for people who turn on "reduce motion".

## 6. Languages

The interface, results, alerts and examples are in English, French and Kreol Morisien. The scam-pattern rules understand all three. Claude writes its notes in the user's chosen language.

## 7. Security and privacy measures

- The Anthropic API key exists only on the server. The browser only has the public Supabase key.
- **Row level security** in the database: every row belongs to one user, and the database itself refuses to show it to anyone else.
- The server checks the login token on each request. Limits: 40 checks per 10 minutes per user, 12 per IP for guests, and a daily cap on AI use to protect the budget.
- Input limits: 5,000 characters of text; files up to 3 MB, restricted to images, PDF and text.
- Untrusted content is kept separate from instructions in the AI prompt.

## 8. How it's built

- **Front end:** React (Vite), a mobile-first web app that works in any phone or laptop browser.
- **Server:** Node.js (Express), hosted on Render. It runs the checks and talks to Claude.
- **Accounts and data:** Supabase (authentication + Postgres database).
- **AI:** Anthropic Claude API (`claude-sonnet-5-5` by default), about $0.01 per check.
- **Tests:** `npm test` runs the rule-engine tests and a real-world pack of 12 messages based on official Mauritian scam warnings (`docs/test-pack.md`).

## 9. Honest limits and next steps

- **Email:** the free Supabase email only sends to team members. A real launch needs an email service such as Resend.
- **Live checks:** no live blocklists or company-registry lookups yet. Every result says so.
- **Reports** are stored in the user's account, not yet forwarded to CERT-MU or banks. That would need a partnership.
- **Data to check before launch:** the official domains list should be confirmed with each organisation, and the French and Kreol text reviewed by native speakers.
- **Learn** (short guides) is the next feature.
