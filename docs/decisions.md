# Decisions and assumptions

This page covers what was decided and why, what was assumed, the questions still open for the
entrepreneur, and how AI was used. The API itself is described in [api.md](api.md).

## 1. Decisions made

### The shape of the system

```
Browser ─► FrontEnd (React) ─── /api ───► Backend (Node + Express) ─► Fake Store API (products)
                                               │
                                               ├─► DataStore/emailTemplates (email wording)
                                               │
                                               └─► Email transporter ───► Sales inbox (SMTP)
```

The brief says three things will change: **the product data source, the look and feel, and the
email provider**. Each one sits behind its own boundary, so it can change without touching the rest.

| Will change         | Where it lives                                                          | To change it                                                       |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Product data source | `fetchAllProducts()` in `Backend/src/services/productService.js`        | Rewrite that one function to load from the new source              |
| Email provider      | Transporter classes in `Backend/src/utils/mailer.js` (strategy pattern) | Use `OutlookTransporter` instead of `GmailTransporter`, or add one |
| Look and feel       | MUI theme in `FrontEnd/src/theme.js`, store name in `siteConfig.js`     | Edit the theme; page layouts use `sx` styles with comments         |
| Email wording       | `DataStore/emailTemplates/enquiryToSales.json`                          | Edit its `subject` and `body` strings; no code change needed       |

### Tech stack used, and why

| Part                   | Choice                                                     | Why                                                                                                   |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Language               | JavaScript (no TypeScript)                                 | Run-time checks with Joi and JSDoc comments make up for the missing type checking                     |
| API                    | Node.js 22.12+ with Express 5                              | Small, widely known, and easy for reviewers to read. A future mobile app can use the same API         |
| Input checks           | Joi                                                        | One readable rule set per request, with customer-friendly messages                                    |
| Email                  | nodemailer over SMTP                                       | Works with any email provider. Gmail and Outlook are ready-made                                       |
| Website                | React 19, built with Vite                                  | Widely known; Vite gives fast builds and a simple set-up                                              |
| Components and styling | MUI                                                        | Client choice. Ready-made accessible components, and the whole look is controlled from one theme file |
| Loading data           | TanStack Query                                             | Handles loading, errors, caching and retries without hand-written code on each page                   |
| Page addresses         | React Router 7                                             | Version 8 only ships ES modules, which Jest cannot load without extra set-up                          |
| Tests                  | Jest, Supertest, React Testing Library                     | Client choice: Jest everywhere. Tests are written per acceptance criterion as GIVEN / WHEN / THEN     |
| Code style             | ESLint and Prettier                                        | Keeps the code consistent; `npm run check` runs lint, the format check and the tests                  |
| Project layout         | `Backend`, `FrontEnd`, `DataStore`, no root `package.json` | Client choice. Each part has its own dependencies and can be deployed on its own                      |

### How the code is organised

- **Backend:** a request goes `routes/` → `middlewares/validateUser.js` (checks who is asking; for now
  it lets everyone through) → `middlewares/payloadValidator.js` (checks the input against a rule set in
  `schemas/`) → `controllers/` (send the reply, including error replies) → `services/` (business rules)
  → `utils/` (settings, search, email template, mailer). These folders are in `Backend/src/`.
  `server.js` (sets up Express) and `logger.js` sit at the top of `Backend/`, next to `package.json`. There is no central error handler (client choice).
- **FrontEnd:** one file per page in `pages/`, and four shared component files in `components/`:
  `Layout`, `ProductGrid`, `PageParts` and `EnquiryForm`. All API calls are in `api/`.
- **DataStore:** the email template as a JSON document. It is organised like a document database, so it
  could move into one later unchanged. No database is used for the PoC.
- **Product data** is fetched from Fake Store on every request (no caching), turned into our own
  `Product` and `Category` shapes, and filtered in the Backend. Fake Store's format never reaches the website.

### Security concerns taken care of

- **Every input is checked.** Route parameters, the search term and the enquiry are checked with Joi.
  Unknown fields are dropped.
- **Data from Fake Store is checked too.** Bad products are skipped, and only `http(s)` image
  addresses are accepted.
- **Request size is limited.** Request bodies are limited to 10 KB. Calls to Fake Store and the email
  service time out after a few seconds instead of hanging.
- **Security headers** are set on every API response by [helmet](https://helmetjs.github.io/).
- **Errors don't leak details.** Error replies never include stack traces or details from Fake Store or
  the email service; those go to the server log only. Customer details are not written to the log.
- **The email is safe from customer input:**
  - It is plain text, so customer input can't add HTML, links or scripts.
  - Line breaks of any kind in the name are rejected, including the Unicode line and paragraph
    separators, so a customer can't fake extra lines in the email.
  - The product details in the email come from our data, not from the browser.
- **Secrets stay on the server.** They live only in `Backend/.env`, which git ignores, and the website
  holds none. Email is sent over encrypted connections only.
- **Same address for the website and the API,** so cross-site access (CORS) is not turned on.
- **Place ready for user checks.** `validateUser` runs on every API request, ready for login checks
  later (see assumptions).

### Left out on purpose (and when to add it)

| Left out                                        | Why it can wait                                              | Add it when                                        |
| ----------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| User accounts and login                         | The website is public (see assumptions)                      | User-specific catalogues are needed                |
| Saving enquiries (database or CRM)              | Client decision: the acceptance criteria only need the email | Losing a lead when email is down is not acceptable |
| Rate limiting, CAPTCHA or other spam protection | Removed for the PoC (client choice)                          | Before a public launch, or as soon as spam appears |
| Caching product data                            | Removed for the PoC (client choice)                          | Page speed matters, or Fake Store is unreliable    |
| Paging, sorting and filters                     | Fake Store has only 20 products                              | The real catalogue arrives                         |
| Real-browser end-to-end tests                   | The acceptance tests cover the flows without a browser       | Before regular releases                            |
| Automatic checks on each push (CI)              | `npm run check` in each project runs the same checks by hand | The repository is on a shared git host             |
| Hosting, Docker and deployment pipeline         | Nothing is deployed yet                                      | A shared demo environment is needed                |
| Dependency vulnerability scanning               | Short-lived PoC                                              | Before launch                                      |
| Confirmation email to the customer              | Not in the acceptance criteria                               | The entrepreneur wants it (open question 4)        |

## 2. Assumptions

### About the product as a whole

1. **The website is public.** Customers don't log in, and everyone sees the same catalogue. There is
   no user-specific catalogue listing.
2. **User-specific catalogues may come later.** For that reason a user-check step
   (`middlewares/validateUser.js`) already runs on every API request. For now it lets every
   request through. Later it can check who is logged in, and the catalogue can then be filtered per user.
3. **The email provider must be easy to change.** Sending goes through transporter classes. Gmail is
   used now and Outlook is ready. Another provider is one more small class. The login details come from
   settings (`SMTP_USER`, `SMTP_PASSWORD`), not code.
4. **The product data source will change** (from Fake Store to a database or shop system), so only one
   function knows about Fake Store.
5. **The look will change** when the brand arrives, so colours, fonts and the store name are in two files.
6. **Enquiries are emailed only, not stored.** The email to the sales inbox is the only record. If
   sending fails, the customer is asked to try again.
7. Prices are in **GBP** (shown as £55.99). Fake Store prices have no currency, and the brief's British
   spelling suggests a UK business.
8. English only. Product data is fetched fresh on every request, so pages depend on Fake Store being up.

### Home and category pages

9. The home page's 5 featured products are chosen automatically: the 5 highest rated in the whole
   catalogue. They are not a hand-picked list.
10. "Top rated" in a category means the 5 products with the highest average rating (the
    `TOP_RATED_COUNT` setting). On a tie, the product with more reviews comes first. The rest of the
    category is listed as "additional products", in the data source's order.
11. With the top 5 rule, **Men's clothing and Jewelery have only 4 products each**, so they show no
    additional products.
12. The average rating is used as it is, so a product rated 5★ by one person would beat one rated
    4.8★ by 400 people. Fake Store data doesn't have this problem; real data will.

### Search

13. Search covers the whole catalogue and looks at **product titles only**. Upper/lower case doesn't
    matter.
14. Every word typed must match the start of a word in the title, in any order. For example, "shirt"
    finds "T-Shirts", but "men" does not find "Women's".
15. There is no spelling tolerance. Results come in the data source's order.
16. Empty searches are not allowed, and searches are limited to 100 characters.

### Product page and enquiry

17. The product page shows the picture, name, rating, price, description and category. Fake Store has
    no stock, sizes or variants.
18. The Enquire button opens a separate enquiry page. One enquiry covers one product.
19. The form needs a name and an email address. Phone and message are optional.
20. After sending, a thank-you message replaces the form. The customer gets no confirmation email.
21. The sales email shows the product, the customer's details and their message. Pressing Reply
    answers the customer directly.

### Open questions for the entrepreneur

| #   | Question                                                                                     | Why it matters                                       |
| --- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | Keep 5 top rated products, or use 3 so that every category also shows additional products?   | Assumption 11; it is one setting (`TOP_RATED_COUNT`) |
| 2   | Should a product need a minimum number of reviews before it can be "top rated"?              | Assumption 12                                        |
| 3   | Should search also look at descriptions or categories, and tolerate spelling mistakes?       | Assumptions 13–15                                    |
| 4   | Should customers get a confirmation email?                                                   | Assumption 20                                        |
| 5   | Does the sales team need anything else in the email, such as a reference number?             | Assumption 21; the wording is in `DataStore`         |
| 6   | Which email provider and sender address will be used?                                        | Needed before real emails go out                     |
| 7   | Which currency, or currencies, and which countries?                                          | Assumption 7                                         |
| 8   | The form collects personal data. What privacy notice or consent wording is needed? (UK GDPR) | Likely needed before launch                          |
| 9   | When will the brand (name, logo, colours, fonts) arrive?                                     | Re-skin happens in `theme.js` and `siteConfig.js`    |
| 10  | Will customers have accounts, with their own catalogue?                                      | Assumptions 1 and 2                                  |
| 11  | Where will the real product data come from (a database, Shopify, a supplier feed...)?        | Decides the next product source to build             |

## 3. Use of AI

An AI coding assistant (Claude Code, in VS Code) was used as a tool to finish the task faster and to
make the draft design. The developer directed it and made the decisions. Those include the
JavaScript-only stack, MUI, Jest everywhere, the folder layout, Joi, the mailer design, top 5 by rating,
title-only search and keeping the code simple. The assistant raised questions instead of assuming, and
each answer is recorded above.

Its output was checked:

- **Tests:** the automated tests, lint and the format check pass (`npm run check` in each project).
- **Libraries:** versions newer than the assistant's knowledge were checked against the installed
  packages.
- **Fake Store:** a run against the live Fake Store API found stray spaces in product titles, which are
  now trimmed.
- **Review:** a separate AI review looked for bugs and security gaps, and its findings were fixed with
  tests.

The developer reviews and owns the code.
