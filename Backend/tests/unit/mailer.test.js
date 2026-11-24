const nodemailer = require('nodemailer');
const {
  sendEmail,
  EmailSender,
  GmailTransporter,
  OutlookTransporter,
} = require('../../src/utils/mailer');

// Replace nodemailer, so no real email is sent and the connection settings can be checked
jest.mock('nodemailer');

describe('Mailer', () => {
  let sendMail;

  beforeEach(() => {
    sendMail = jest.fn().mockResolvedValue({});
    nodemailer.createTransport.mockReturnValue({ sendMail });
  });

  const payload = {
    to: 'sales@shop.test',
    replyTo: { name: 'Jane Smith', address: 'jane@example.com' },
    subject: 'New enquiry: Mens Cotton Jacket',
    text: 'Hello',
  };

  test('sendEmail sends through Gmail, logged in with SMTP_USER and SMTP_PASSWORD', async () => {
    await sendEmail(payload);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: 'catalogue@gmail.test', pass: 'test-app-password' },
      }),
    );
    expect(sendMail).toHaveBeenCalledWith({ from: 'catalogue@gmail.test', ...payload });
  });

  test('the Outlook transporter connects to Outlook, requiring encryption', async () => {
    await new EmailSender(new OutlookTransporter()).send(payload);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.office365.com', port: 587, requireTLS: true }),
    );
  });

  test('refuses to send without SMTP_USER and SMTP_PASSWORD', async () => {
    const password = process.env.SMTP_PASSWORD;
    delete process.env.SMTP_PASSWORD;

    await expect(new EmailSender(new GmailTransporter()).send(payload)).rejects.toThrow(
      'SMTP_USER and SMTP_PASSWORD must be set in Backend/.env',
    );
    expect(sendMail).not.toHaveBeenCalled();

    process.env.SMTP_PASSWORD = password;
  });

  test('passes on a sending failure, so the enquiry can report it', async () => {
    sendMail.mockRejectedValue(new Error('Invalid login'));

    await expect(sendEmail(payload)).rejects.toThrow('Invalid login');
  });
});
