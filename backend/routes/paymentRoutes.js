const express = require('express');
const {
  getBookingQuote,
  initiatePaytmPayment,
  getPaytmPaymentStatus,
  handlePaytmCallback,
  getPaytmConfigStatus,
} = require('../controllers/paymentController');

const router = express.Router();

router.get('/paytm/config', getPaytmConfigStatus);
router.get('/paytm/booking-quote', getBookingQuote);
router.post('/paytm/initiate', initiatePaytmPayment);
router.get('/paytm/status/:orderId', getPaytmPaymentStatus);
router.post('/paytm/callback', handlePaytmCallback);

module.exports = router;
