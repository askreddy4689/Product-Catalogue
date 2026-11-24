/**
 * Checks the enquiry form in the browser, so customers get instant feedback.
 *
 * The API checks the same rules again (Backend/src/enquiries/enquirySchema.js),
 * and the API's check is the one that counts. Keep the two in step: if a rule
 * changes there, change it here too.
 */

export const ENQUIRY_LIMITS = { name: 100, email: 254, phone: 20, message: 2000 };

// Something@something.something: a light check; the API does a stricter one
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 7-20 digits, spaces, brackets or dashes, with an optional leading "+"
const PHONE_CHARACTERS = /^\+?[0-9 ()-]{7,20}$/;

/** A phone number must use only phone characters and have at least 7 digits. */
function isValidPhoneNumber(phone) {
  const digitCount = phone.replace(/\D/g, '').length;
  return PHONE_CHARACTERS.test(phone) && digitCount >= 7;
}

/**
 * @param {{ name: string, email: string, phone: string, message: string }} values
 * @returns {Record<string, string>} one message per invalid field; empty when all is well
 */
export function validateEnquiry(values) {
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();
  const errors = {};

  if (!name) {
    errors.name = 'Please enter your name';
  } else if (name.length > ENQUIRY_LIMITS.name) {
    errors.name = `Name must be ${ENQUIRY_LIMITS.name} characters or fewer`;
  }

  if (!email) {
    errors.email = 'Please enter your email address';
  } else if (email.length > ENQUIRY_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (phone && !isValidPhoneNumber(phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (message.length > ENQUIRY_LIMITS.message) {
    errors.message = `Message must be ${ENQUIRY_LIMITS.message} characters or fewer`;
  }

  return errors;
}
