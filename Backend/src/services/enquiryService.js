const { config } = require('../utils/config');
const logger = require('../../logger');
const { generateEnquiryEmail } = require('../utils/emailTemplate');
const { sendEmail } = require('../utils/mailer');

/**
 * Emails an enquiry to the sales inbox. Enquiries are not stored; the email is the record.
 * Throws if the email could not be sent.
 */
async function sendEnquiryEmail({ enquiry, product }) {
  const { subject, text } = generateEnquiryEmail({ enquiry, product });
  await sendEmail({
    to: config.salesInboxEmail,
    replyTo: { name: enquiry.name, address: enquiry.email }, // sales can just press Reply
    subject,
    text,
  });

  // The product only: customer details are personal data and stay out of the logs
  logger.info(`Enquiry email about product ${product.id} sent to the sales inbox`);
}

module.exports = { sendEnquiryEmail };
