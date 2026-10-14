# MoniGuard

Verify today. Safer tomorrow. A mobile-first web app that helps small businesses in Mauritius check suspicious invoices, messages, links and QR codes before they pay. Built for the Money Minds App Challenge 2026 (Cybersecurity – Phishing Awareness).

## Run it on your computer
1. Install Node.js (LTS) from nodejs.org.
2. In this folder: `npm install`, then `npm run dev`.
3. Open http://localhost:5173 (F12 → phone icon to see it at phone size).

## Settings (`.env`)
Copy `.env.example` to `.env` and fill it in. Never commit `.env`.

| Setting | What it does | Needed? |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude reads messages, screenshots and PDFs and adds what it spots. Billed separately from Claude Pro (prepaid credits at console.anthropic.com). About $0.01 per check on Sonnet. | Optional. Without it, rule-based checks still work; screenshots and photos don't. |
| `ANTHROPIC_MODEL` | `claude-haiku-5-5` is about 20x cheaper. Default `claude-sonnet-5-5`. | Optional |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Accounts: sign up, email confirmation, log in, password reset, data saved online. | Optional. Without them the app runs in guest mode (data on the device). |
| `AI_DAILY_LIMIT` | Max AI checks per day (protects your credit). Default 400. | Optional |

## Accounts (Supabase)
1. Create a free project at supabase.com.
2. SQL Editor → paste `supabase/schema.sql` → Run. This creates the tables and locks every row to its owner (row level security).
3. Authentication → URL Configuration: set **Site URL** to your app's address and add it to **Redirect URLs** (e.g. `http://localhost:5173/**` and your Render URL `https://xxx.onrender.com/**`).
4. Put the Project URL and publishable key in `.env`.

Note: Supabase's built-in email only sends to members of your Supabase team, about 2 emails an hour. For real users, add an email service (Resend, Brevo…) under Authentication → Emails → SMTP.

## Put it online (Render)
1. render.com → New → Web Service → pick this GitHub repo.
2. Build command `npm install && npm run build`, start command `npm start`.
3. Environment: add `ANTHROPIC_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the VITE ones must be there before the build runs).
4. Add the Render URL to Supabase's Site URL / Redirect URLs.
Free Render services sleep: open the link a few minutes before you present.

## How a check works
1. **Rules (always, instant):** pulls out sender addresses and links; compares them with official domains (`ORGS` in `lib/engine.js`), your trusted suppliers and your own business domain; looks for scam wording in English, French and Kreol (changed bank details, password/OTP requests, urgency, unexpected grants); checks link hygiene (http, shorteners, risky endings, raw IPs). Points decide High risk / Suspicious / Looks safe / Inconclusive.
2. **AI reading (if a key is set):** Claude reads the text, screenshot or PDF and adds pressure tactics and inconsistencies it finds, in the user's language. It can push a result towards risky but can never make it "safe".
3. If the server can't be reached, the same rules run in the browser.

## Security notes
- API key stays on the server. The browser only gets the public Supabase key.
- Row level security: each user can only read and change their own rows.
- Pasted content is treated as untrusted data in the AI prompt.
- Rate limits: 40 checks / 10 min per user, 12 per IP for guests; daily AI cap.
- Users can download or delete their data and delete their account.

## Before the demo
- Verify the official domains in `lib/engine.js` (search for TODO).
- Have a native speaker review the French and Kreol text in `src/i18n.js`, `lib/messages.js`, `src/alerts.js`, `src/labels.js`.
- Create your demo account in advance; test the link on another device.
- `npm test` runs the rule-engine tests.

## What works / what's next
Works: accounts, onboarding, paste text, file upload (screenshot, photo, PDF, .txt), link check, QR scan/upload, results, follow-ups, reports, scam alerts, business profile, trusted suppliers, data download/delete, English/French/Kreol.
Coming soon: Learn guides.
