const express = require('express');
const enquiryController = require('../controllers/enquiryController');
const { validateUser } = require('../middlewares/validateUser');
const { payloadValidator } = require('../middlewares/payloadValidator');
const { enquirySchema } = require('../schemas/enquirySchema');

/**
 * The enquiry address: POST /api/enquiries.
 * Each request goes: validateUser → payloadValidator → controller.
 */
const router = express.Router();

router.post('/', validateUser, payloadValidator(enquirySchema), enquiryController.createEnquiry);

module.exports = router;
