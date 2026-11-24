# Prompts that improved the outcome

These are the three prompts given to the AI assistant that most improved the result. The prompts are
quoted with only spelling corrected.

## 1. Set the standard and the structure at the start

> We don't need a package.json in the root folder. Also make the folder structure look like this:
> the root has Backend, FrontEnd and DataStore folders. The DataStore should be like MongoDB.

**What it changed:**

- The project now has three clear folders: `Backend` (the API), `FrontEnd` (the website) and
  `DataStore` (the email template, organised like a document database). Each of `Backend` and
  `FrontEnd` is its own npm project with no shared root `package.json`, so they can be run and
  deployed separately.
- The follow-up questions settled what the DataStore holds: the email template only. Products come
  live from Fake Store, enquiries are not stored, and no real MongoDB is used.
- The assistant asked questions before deciding things the brief left open. Examples: what "top
  rated" means, what search matches, which enquiry fields are required, and the currency.
- The answers, and the remaining assumptions, were written down in [decisions.md](decisions.md)
  instead of being hidden in the code.
- Comments, including the ones on styling, are written in plain English for a non-specialist
  reviewer.

## 2. Remove over-engineering

> The Backend should have
> server.js, routes, controllers, services and utils. Email should be in utils: from the service, we
> just call send email with a payload. One function generates the email and another creates the SMTP
> connection and sends the mail. The sender gets the SMTP user and password from environment
> variables. The SMTP transporter should support two transporters, Google or Outlook: create a
> transporter class and methods using the strategy pattern. For now, only call the Gmail transporter.

**What it changed:**

- The first version had about 15 small frontend components and extra layers in the Backend. It now
  has a familiar layout: `routes` → `controllers` → `services` → `utils`, with 4 frontend component
  files.
- Email sending became one clear function with swappable Gmail and Outlook transporters, so the
  email provider can change without touching the rest of the code.
- The code is much easier for a customer to review.

## 3. Verify the user, then validate the payload with Joi

> Add a payloadValidator for the API. Add a middlewares folder and a schemas folder. Validate the
> user first (for now, just forward the request), then run the payloadValidator.

**What it changed:**

- Every API request now passes the same checkpoints in a fixed order: `validateUser`, then
  `payloadValidator` (when the request has input), then the controller.
- `middlewares/validateUser.js` lets everyone through for now. It is the ready-made place to add
  login checks when user-specific catalogues arrive, without changing any routes.
- All input rules are in `schemas/`, one readable Joi rule set per request, instead of being
  scattered through the controllers. Customers get friendly messages for each field.
- Controllers receive only checked, cleaned input, so they stay short and focused on the reply.
