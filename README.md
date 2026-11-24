# Product Catalogue: proof of concept

A responsive web catalogue: browse products by category, search, view details and send an enquiry
that is emailed to the sales inbox.

## Folders

```
Backend/     The API (Node.js + Express): products from the Fake Store API, enquiry emails
FrontEnd/    The website (React + MUI), works on phones and desktops
DataStore/   The enquiry email template (JSON)
docs/        Plan, API reference, decisions + assumptions, and the prompts that shaped the build
```

## Run it

You need [Node.js](https://nodejs.org) 22.12 or newer. Use two terminals.

**Backend** (http://localhost:4000)

```bash
cd Backend
npm install
cp .env.example .env    # then fill in SALES_INBOX_EMAIL, SMTP_USER and SMTP_PASSWORD
npm run dev
```

**FrontEnd** (http://localhost:5173)

```bash
cd FrontEnd
npm install
npm run dev
```

Open http://localhost:5173.

## Test

Run in `Backend` or `FrontEnd`:

```bash
npm test          # tests only
npm run check     # lint, formatting check and tests
```
