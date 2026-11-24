const nodemailer = require('nodemailer');

/*
 * Sending email, using the "strategy" pattern.
 *
 * Each email service (Gmail, Outlook) is a transporter class that knows how to connect
 * to that service. EmailSender works with any of them, so switching service means
 * choosing a different transporter class, nothing else.
 */

/** What every transporter does: open an SMTP connection to its service with a login. */
class SmtpTransporter {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  /** Where and how to connect. Each email service gives its own settings. */
  getConnectionSettings() {
    throw new Error(`The ${this.serviceName} transporter must define getConnectionSettings()`);
  }

  /** Opens an SMTP connection to the service, logged in with the given account. */
  createTransport({ user, password }) {
    return nodemailer.createTransport({
      ...this.getConnectionSettings(),
      auth: { user, pass: password },
      // Give up after seconds rather than minutes, so the customer isn't left waiting
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
}

/** Gmail: encrypted from the start on port 465. Needs a Google "app password", not the normal password. */
class GmailTransporter extends SmtpTransporter {
  constructor() {
    super('Gmail');
  }

  getConnectionSettings() {
    return { host: 'smtp.gmail.com', port: 465, secure: true };
  }
}

/** Outlook / Microsoft 365: port 587, switched to encrypted before logging in. */
class OutlookTransporter extends SmtpTransporter {
  constructor() {
    super('Outlook');
  }

  getConnectionSettings() {
    return { host: 'smtp.office365.com', port: 587, secure: false, requireTLS: true };
  }
}

/** Sends emails through whichever transporter (strategy) it is given. */
class EmailSender {
  constructor(transporter) {
    this.transporter = transporter;
  }

  async send({ to, replyTo, subject, text }) {
    // The email account to send from: SMTP_USER and SMTP_PASSWORD in Backend/.env
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    if (!user || !password) {
      throw new Error('SMTP_USER and SMTP_PASSWORD must be set in Backend/.env');
    }

    const connection = this.transporter.createTransport({ user, password });
    await connection.sendMail({
      from: process.env.EMAIL_FROM || user,
      to,
      replyTo,
      subject,
      text, // plain-text email
    });
  }
}

// For now all email goes through Gmail. To use Outlook, pass new OutlookTransporter() instead.
const emailSender = new EmailSender(new GmailTransporter());

/**
 * Sends one email. Services call this with the email's details (the "payload"):
 * { to, replyTo, subject, text }. Throws if the email could not be sent.
 */
function sendEmail(payload) {
  return emailSender.send(payload);
}

module.exports = { sendEmail, EmailSender, SmtpTransporter, GmailTransporter, OutlookTransporter };
