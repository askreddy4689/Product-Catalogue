const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { generateEnquiryEmail } = require('../../src/utils/emailTemplate');
const { config } = require('../../src/utils/config');

/*
 * These tests use the real template, DataStore/emailTemplates/enquiryToSales.json, so a
 * mistake made while editing it shows up here. They check the important details are in
 * the email, not its exact wording, so the wording can change freely.
 */
describe('Enquiry email (from the DataStore template)', () => {
  const product = {
    id: '3',
    title: 'Mens Cotton Jacket',
    price: { amount: 55.99, currency: 'GBP' },
  };

  function generate(enquiryChanges = {}) {
    const enquiry = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '07700 900123',
      message: 'Is this available in blue?',
      ...enquiryChanges,
    };
    return generateEnquiryEmail({ enquiry, product });
  }

  test('fills in the subject, and the product and customer details', () => {
    const email = generate();

    expect(email.subject).toBe('New enquiry: Mens Cotton Jacket');
    for (const detail of [
      'Mens Cotton Jacket',
      'GBP 55.99',
      'https://shop.test/products/3',
      'Jane Smith',
      'jane@example.com',
      '07700 900123',
      'Is this available in blue?',
    ]) {
      expect(email.text).toContain(detail);
    }
    expect(email.text).not.toContain('{{'); // every placeholder was filled in
  });

  test('says so when the optional phone and message were left empty', () => {
    const { text } = generate({ phone: '', message: '' });

    expect(text).toContain('Not given');
    expect(text).toContain('No message given.');
  });

  describe('with a broken template', () => {
    const realFolder = config.emailTemplatesFolder;
    let brokenFolder;
    const writeTemplate = (content) =>
      fs.writeFileSync(path.join(brokenFolder, 'enquiryToSales.json'), content);

    beforeEach(() => {
      brokenFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'email-templates-'));
      config.emailTemplatesFolder = brokenFolder;
    });
    afterEach(() => {
      config.emailTemplatesFolder = realFolder;
      fs.rmSync(brokenFolder, { recursive: true, force: true });
    });

    test('a misspelt placeholder stops with an error that names it', () => {
      writeTemplate(JSON.stringify({ subject: 'New enquiry', body: 'Hello {{customer.nmae}}' }));

      expect(() => generate()).toThrow(
        'The email template uses {{customer.nmae}}, which is not a known placeholder',
      );
    });

    test('a template without a body says what is missing', () => {
      writeTemplate(JSON.stringify({ subject: 'New enquiry' }));

      expect(() => generate()).toThrow(/needs a "subject" and a "body" string/);
    });

    test('a missing or broken file says which file', () => {
      expect(() => generate()).toThrow(/Could not read the email template .*enquiryToSales\.json/);

      writeTemplate('{ not json');
      expect(() => generate()).toThrow(/Could not read the email template .*enquiryToSales\.json/);
    });
  });
});
