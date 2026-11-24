const Joi = require('joi');

/**
 * Rules for an enquiry sent from the website's form (POST /api/enquiries), written with Joi.
 * The website repeats them for instant feedback (FrontEnd/src/utils/validateEnquiry.js),
 * but this check is the one that counts.
 */

// One line only: no line breaks of any kind (including the Unicode line and paragraph
// separators) and no invisible control characters, so nobody can fake extra lines in the email.
const SINGLE_LINE = /^[^\p{Cc}\p{Zl}\p{Zp}]*$/u;

// 7-20 digits, spaces, brackets or dashes, with an optional leading "+"
const PHONE_CHARACTERS = /^\+?[0-9 ()-]{7,20}$/;

/** A phone number must use only phone characters and have at least 7 digits. */
function checkPhoneNumber(phone, helpers) {
  const digitCount = phone.replace(/\D/g, '').length;
  return PHONE_CHARACTERS.test(phone) && digitCount >= 7 ? phone : helpers.error('any.invalid');
}

const enquirySchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[A-Za-z0-9_-]{1,64}$/)
    .required()
    .messages({
      'any.required': 'Product is missing',
      '*': 'Product is not valid',
    }),

  name: Joi.string().trim().max(100).pattern(SINGLE_LINE).required().messages({
    'any.required': 'Please enter your name',
    'string.empty': 'Please enter your name',
    'string.max': 'Name must be 100 characters or fewer',
    'string.pattern.base': 'Name contains characters that are not allowed',
    '*': 'Please enter your name',
  }),

  email: Joi.string()
    .trim()
    .max(254)
    .email({ tlds: { allow: false } }) // any domain ending is fine
    .required()
    .messages({
      'any.required': 'Please enter your email address',
      'string.empty': 'Please enter your email address',
      'string.max': 'Email address is too long',
      '*': 'Please enter a valid email address',
    }),

  // Optional: may be left out or empty
  phone: Joi.string()
    .trim()
    .allow('')
    .custom(checkPhoneNumber)
    .default('')
    .messages({ '*': 'Please enter a valid phone number' }),

  // Optional: may be left out or empty
  message: Joi.string().trim().allow('').max(2000).default('').messages({
    'string.max': 'Message must be 2000 characters or fewer',
    '*': 'Message is not valid',
  }),
});

module.exports = { enquirySchema };
