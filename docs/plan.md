# Plan

## Goal

Build a product catalogue proof of concept (browse, search, enquire). It should be a foundation that
can grow, not a throwaway prototype.

## Stack

- **Website:** React 19 + MUI (Vite), JavaScript
- **API:** Node.js + Express 5, JavaScript (CommonJS)
- **Product data:** the Fake Store API, reached only through the API
- **Email:** nodemailer over SMTP (Gmail now; Outlook ready)
- **Email wording:** a JSON template in `DataStore/emailTemplates`
- **Run:** `npm run dev` in `Backend` and in `FrontEnd`, with settings in `Backend/.env` (copied from `.env.example`)

## Architecture

The API's layers are:

`routes` → `middlewares` (validateUser, payloadValidator) → `controllers` → `services` → `utils`

- **Product data:** `fetchAllProducts()` in `productService.js` is the only code that knows Fake
  Store. It turns Fake Store's data into our own `Product` and `Category` shapes, so Fake Store's
  format never leaks out.
- **Email:** `utils/mailer.js` uses the strategy pattern. Each email service is a transporter class
  (`GmailTransporter`, `OutlookTransporter`), and `EmailSender` sends through whichever one it is
  given.
- **Input checks:** Joi rule sets in `schemas/`, applied by `payloadValidator`.
- **Website:**
  - The API client (`api/apiClient.js`) is kept separate from the data-loading hooks
    (`api/queries.js`, using TanStack Query).
  - Pages live in `pages/` and shared parts in `components/`.
  - The look comes from one MUI theme file (`theme.js`).

## API

| Method | Path                                 | Purpose                                   |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | /api/products/top-rated              | The 5 featured products for the home page |
| GET    | /api/categories                      | List the categories                       |
| GET    | /api/categories/:categoryId/products | Top rated and additional products         |
| GET    | /api/products?search=term            | Search                                    |
| GET    | /api/products/:productId             | Product details                           |
| POST   | /api/enquiries                       | Send an enquiry email to the sales inbox  |

Full details are in [api.md](api.md).

## Assumptions

The full list, with open questions, is in
[assumptions-and-questions.md](assumptions-and-questions.md).

- **Featured 5:** chosen automatically as the 5 highest rated products in the whole catalogue (not a
  hand-picked list).
- **Top rated in a category:** the highest average rating, top 5. On a tie, the product with more
  reviews comes first. The rest of the category is listed as additional products.
- **Search:** done on the server, on titles only, ignoring upper/lower case. Every word typed must
  match the start of a word in the title.
- **Enquiry fields:**
  - Name, email and product are required; phone and message are optional.
  - The API checks them with Joi, and the website repeats the main checks so the customer gets
    instant feedback.
- **Enquiries:** emailed only, not stored. If the email fails, the customer is asked to try again.
- **Not in the PoC:** paging, login and caching.


## Testing

- **API** (Jest + Supertest):
  - one test file per acceptance criterion, run against the real app with fixed Fake Store data
  - unit tests for the search rule, the top rated rule, the email template and the transporters
  - the enquiry tests check validation and that `sendEmail` is called with the right content
- **Website** (Jest + React Testing Library):
  - one acceptance test file per criterion (home, category, search, product, enquiry)
  - component tests for the enquiry form and the search box
- **Not included:** real-browser end-to-end tests (for example Playwright).

## Cut for the PoC

These were cut: paging, real-browser tests, rate limiting, caching, a central error handler, CI and
a polished design. Each cut and the reason for it is recorded in [decisions.md](decisions.md),
under "Left out on purpose".
