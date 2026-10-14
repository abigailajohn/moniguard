# MoniGuard

Verify today. Safer tomorrow. Mobile-first web app that checks suspicious invoices, messages and links for SMEs (Money Minds App Challenge 2026, Phishing Awareness).

## Run it on your computer (Windows OK)
1. Install Node.js (LTS) from nodejs.org.
2. Open the project folder in a terminal and run:
   - `npm install`
   - `npm run dev`
3. Open http://localhost:5173 (view it in phone size: press F12, then the phone icon).

It works with NO API key: a rule-based checker decides the result for pasted text, links, QR codes, PDFs and .txt files.
Screenshots and photos need the AI layer (Claude reads the image). With a key, Claude also reads every check like a person would and adds what it spots. The AI can never mark something "safe"; only the rules can.

## Optional: turn on the AI layer
1. Copy `.env.example` to `.env`.
2. Put your key in: `ANTHROPIC_API_KEY=your-key` (from console.anthropic.com, needs credit).
3. Restart `npm run dev`. The terminal will say "AI layer: on".
4. Optional: `ANTHROPIC_MODEL=claude-haiku-5-5` makes checks about 20x cheaper. Default is `claude-sonnet-5-5` (about $0.01 per check).
The API is billed separately from a Claude Pro plan: buy prepaid credits at console.anthropic.com > Settings > Billing.
Never put the key in anything inside `src/` and never upload `.env`.

## Put it online (you need a link for the deck)
**Option A: Render (simplest, uses server.js)**
1. Upload this folder to a GitHub repository (do not include `.env`).
2. On render.com: New > Web Service > pick the repo.
3. Build command: `npm install && npm run build`. Start command: `npm start`.
4. Under Environment, add `ANTHROPIC_API_KEY` (optional).
Note: free Render services sleep. Open the link a few minutes before presenting.

**Option B: Vercel** (uses the `api/` folder)
1. Import the GitHub repo at vercel.com. Framework: Vite.
2. Add `ANTHROPIC_API_KEY` in Project Settings > Environment Variables (optional).

## Before the demo
- Open the link on another device and run all four example chips on the Verify screen.
- Test on the organisers' laptop browser if you can; have the localhost version as backup.
- In `lib/engine.js`, check the official domains in the ORGS list (search for TODO) against the real websites.
- Run `npm test` to check the rule engine.

## What works
- Verify: paste text, upload a file (screenshot, photo, PDF, .txt), check a link, scan or upload a QR code (camera needs https or localhost).
- Results with findings, follow-up reminders ("Confirmed it with the sender?"), report flow, history.
- Notifications: scam alerts (demo content in `src/alerts.js`) and checks that need a follow-up.
- Business profile (view and edit). Your business email domain is protected: look-alike addresses are flagged.
- Manage / Trusted records, Your data (download or delete), settings toggles.
Coming soon: Learn.
Examples for the demo: chips on each Verify tab, files in `public/samples/`.
Sample data (Port Louis Print Co., MCCI) is illustrative only.
