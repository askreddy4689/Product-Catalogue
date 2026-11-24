const fs = require('node:fs');
const path = require('node:path');
const { config } = require('./config');

/**
 * Builds the plain-text enquiry email for the sales inbox from the template in
 * DataStore/emailTemplates/enquiryToSales.json: a JSON object whose "subject" and
 * "body" strings contain {{placeholders}} (listed in DataStore/README.md).
 *
 * @returns {{ subject: string, text: string }}
 */
function generateEnquiryEmail({ enquiry, product }) {
  const values = {
    product: {
      id: product.id,
      title: product.title,
      price: `${product.price.currency} ${product.price.amount.toFixed(2)}`, // e.g. "GBP 55.99"
      link: `${config.webAppUrl}/products/${encodeURIComponent(product.id)}`,
    },
    customer: {
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone || 'Not given',
      message: enquiry.message || 'No message given.',
    },
  };

  const template = readTemplate('enquiryToSales.json');
  return {
    subject: fillPlaceholders(template.subject, values),
    text: fillPlaceholders(template.body, values),
  };
}

/** Reads a template file; it is read on every email, so edits apply straight away. */
function readTemplate(fileName) {
  const filePath = path.join(config.emailTemplatesFolder, fileName);
  let template;
  try {
    template = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read the email template ${filePath}: ${error.message}`, {
      cause: error,
    });
  }
  if (typeof template.subject !== 'string' || typeof template.body !== 'string') {
    throw new Error(`The email template ${filePath} needs a "subject" and a "body" string`);
  }
  return template;
}

// Matches {{product.title}}, also written with spaces: {{ product.title }}
const PLACEHOLDER = /{{\s*([\w.]+)\s*}}/g;

/**
 * Replaces each {{placeholder}} with its value. An unknown placeholder is a mistake in
 * the template (often a typo), so it stops with an error that names it.
 */
function fillPlaceholders(text, values) {
  return text.replace(PLACEHOLDER, (placeholder, name) => {
    const value = findValue(values, name);
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(`The email template uses ${placeholder}, which is not a known placeholder`);
    }
    return String(value);
  });
}

/** Finds "customer.name" in { customer: { name: 'Jane' } }. Only the values' own fields count. */
function findValue(values, name) {
  let current = values;
  for (const key of name.split('.')) {
    if (current === null || typeof current !== 'object' || !Object.hasOwn(current, key)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

module.exports = { generateEnquiryEmail };
