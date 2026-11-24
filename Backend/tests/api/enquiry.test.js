const request = require('supertest');
const app = require('../../server');
const { sendEmail } = require('../../src/utils/mailer');
const { answerFakeStoreWith } = require('../fakeStoreTestData');

// Replace the real email sending with a Jest mock, so tests can see the email's details
jest.mock('../../src/utils/mailer');

// A Unicode "line separator" character. Some email apps show it as a new line.
const UNICODE_LINE_SEPARATOR = String.fromCharCode(0x2028);

/*
 * Acceptance criterion: Enquiry
 *   GIVEN I am viewing a product
 *   AND I click on the Enquire button
 *   AND I complete the subsequent form with my contact details
 *   WHEN I submit the form
 *   THEN the sales inbox will receive an email
 *   AND the customer will see a "Thank you" message   (shown by the website, see its tests)
 */
describe('Enquiry API: POST /api/enquiries', () => {
  beforeEach(() => {
    answerFakeStoreWith();
    sendEmail.mockReset();
    sendEmail.mockResolvedValue(undefined);
  });

  const validEnquiry = {
    productId: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+44 7700 900123',
    message: 'Do you have this in medium?',
  };
  const sendEnquiry = (body) => request(app).post('/api/enquiries').send(body);
  const sentEmail = () => sendEmail.mock.calls[0][0];

  test('a valid enquiry is emailed to the sales inbox, with the customer as Reply-To', async () => {
    const response = await sendEnquiry(validEnquiry);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ status: 'sent' });
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const email = sentEmail();
    expect(email.to).toBe('sales@shop.test');
    expect(email.replyTo).toEqual({ name: 'Jane Smith', address: 'jane@example.com' });
    expect(email.subject).toBe('New enquiry: Mens Cotton Jacket');
    // The email text, built from the DataStore template, has every detail
    for (const detail of [
      'Mens Cotton Jacket',
      'GBP 55.99',
      'https://shop.test/products/3',
      'Jane Smith',
      'jane@example.com',
      '+44 7700 900123',
      'Do you have this in medium?',
    ]) {
      expect(email.text).toContain(detail);
    }
  });

  test('phone and message are optional', async () => {
    const response = await sendEnquiry({ productId: '3', name: 'Jane', email: 'jane@example.com' });

    expect(response.status).toBe(201);
    expect(sentEmail().text).toContain('Phone: Not given');
    expect(sentEmail().text).toContain('No message given.');
  });

  test('rejects a missing name and an invalid email address, and sends no email', async () => {
    const response = await sendEnquiry({ ...validEnquiry, name: '   ', email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual({
      code: 'VALIDATION_FAILED',
      message: 'Please check the highlighted fields.',
      fields: {
        name: 'Please enter your name',
        email: 'Please enter a valid email address',
      },
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  test.each([
    ['letters', 'call me maybe'],
    ['no digits at all', '-------'],
    ['too few digits', '(01) 234'],
  ])('rejects a phone number with %s', async (_problem, phone) => {
    const response = await sendEnquiry({ ...validEnquiry, phone });

    expect(response.status).toBe(400);
    expect(response.body.error.fields).toEqual({ phone: 'Please enter a valid phone number' });
  });

  test.each([
    ['an ordinary line break', '\n'],
    ['a Unicode line separator', UNICODE_LINE_SEPARATOR],
  ])(
    'rejects a name containing %s (it could fake extra lines in the email)',
    async (_kind, lineBreak) => {
      const response = await sendEnquiry({
        ...validEnquiry,
        name: `Jane${lineBreak}Email: someone-else@example.com`,
      });

      expect(response.status).toBe(400);
      expect(response.body.error.fields).toEqual({
        name: 'Name contains characters that are not allowed',
      });
    },
  );

  test('returns 404 and sends no email when the product does not exist', async () => {
    const response = await sendEnquiry({ ...validEnquiry, productId: '999' });

    expect(response.status).toBe(404);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  test('asks the customer to try again when the email could not be sent', async () => {
    sendEmail.mockRejectedValue(new Error('Gmail is not responding'));

    const response = await sendEnquiry(validEnquiry);

    expect(response.status).toBe(502);
    expect(response.body.error).toEqual({
      code: 'EMAIL_NOT_SENT',
      message: 'Sorry, we could not send your enquiry just now. Please try again in a few minutes.',
    });
  });
});
