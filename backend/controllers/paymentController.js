const PaytmChecksum = require('paytmchecksum');

const PAYTM_MID = process.env.PAYTM_MID || '';
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || '';
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || 'WEBSTAGING';
const PAYTM_ENV = process.env.PAYTM_ENV || 'staging';
const PAYTM_CALLBACK_URL =
  process.env.PAYTM_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/payments/paytm/callback`;

const PAYTM_HOST =
  PAYTM_ENV === 'production' ? 'https://securegw.paytm.in' : 'https://securegw-stage.paytm.in';

const BOOKING_SERVICE_FEE = 100;

const roundToNearestTen = (value) => Math.max(100, Math.round(value / 10) * 10);

const calculateBookingBreakdown = (productPrice) => {
  const refundableAmount = roundToNearestTen(productPrice * 0.2);
  const totalBookingAmount = refundableAmount + BOOKING_SERVICE_FEE;

  return {
    refundableAmount,
    serviceFee: BOOKING_SERVICE_FEE,
    totalBookingAmount,
  };
};

const buildOrderId = (productId) => {
  const safeProductId = (productId || 'item').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'item';
  return `LOOPIT_${safeProductId}_${Date.now()}`;
};

const ensurePaytmConfig = () => PAYTM_MID && PAYTM_MERCHANT_KEY;

const parsePaytmResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const message = data?.body?.resultInfo?.resultMsg || 'Paytm request failed';
    throw new Error(message);
  }

  return data;
};

exports.getBookingQuote = (req, res) => {
  const productPrice = Number(req.query.productPrice || 0);

  if (!productPrice || productPrice <= 0) {
    return res.status(400).json({ message: 'Valid productPrice is required' });
  }

  res.json({
    success: true,
    data: calculateBookingBreakdown(productPrice),
  });
};

exports.initiatePaytmPayment = async (req, res) => {
  try {
    if (!ensurePaytmConfig()) {
      return res.status(500).json({
        message: 'Paytm is not configured on the backend. Add PAYTM_MID and PAYTM_MERCHANT_KEY first.',
      });
    }

    const {
      productId,
      productTitle,
      productPrice,
      customerId,
      customerEmail,
      customerName,
      customerPhone,
    } = req.body;

    const normalizedPrice = Number(productPrice || 0);
    if (!productId || !productTitle || !normalizedPrice || normalizedPrice <= 0) {
      return res.status(400).json({ message: 'productId, productTitle, and productPrice are required' });
    }

    const breakdown = calculateBookingBreakdown(normalizedPrice);
    const orderId = buildOrderId(productId);

    const body = {
      requestType: 'Payment',
      mid: PAYTM_MID,
      websiteName: PAYTM_WEBSITE,
      orderId,
      callbackUrl: PAYTM_CALLBACK_URL,
      txnAmount: {
        value: breakdown.totalBookingAmount.toFixed(2),
        currency: 'INR',
      },
      userInfo: {
        custId: customerId || `guest_${Date.now()}`,
        email: customerEmail || undefined,
        mobile: customerPhone || undefined,
        firstName: customerName || undefined,
      },
    };

    const signature = await PaytmChecksum.generateSignature(JSON.stringify(body), PAYTM_MERCHANT_KEY);

    const response = await fetch(
      `${PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${encodeURIComponent(PAYTM_MID)}&orderId=${encodeURIComponent(orderId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body,
          head: { signature },
        }),
      }
    );

    const data = await parsePaytmResponse(response);
    const resultInfo = data?.body?.resultInfo;

    if (resultInfo?.resultStatus !== 'S' || !data?.body?.txnToken) {
      return res.status(400).json({
        message: resultInfo?.resultMsg || 'Failed to initiate Paytm transaction',
        paytm: data,
      });
    }

    return res.json({
      success: true,
      data: {
        orderId,
        txnToken: data.body.txnToken,
        amount: breakdown.totalBookingAmount.toFixed(2),
        bookingBreakdown: breakdown,
        paytmMid: PAYTM_MID,
        paytmHost: PAYTM_HOST,
      },
    });
  } catch (error) {
    console.error('Paytm initiate payment error:', error);
    return res.status(500).json({
      message: error.message || 'Unable to initiate Paytm payment',
    });
  }
};

exports.getPaytmPaymentStatus = async (req, res) => {
  try {
    if (!ensurePaytmConfig()) {
      return res.status(500).json({
        message: 'Paytm is not configured on the backend. Add PAYTM_MID and PAYTM_MERCHANT_KEY first.',
      });
    }

    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const body = {
      mid: PAYTM_MID,
      orderId,
    };

    const signature = await PaytmChecksum.generateSignature(JSON.stringify(body), PAYTM_MERCHANT_KEY);

    const response = await fetch(`${PAYTM_HOST}/v3/order/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body,
        head: { signature },
      }),
    });

    const data = await parsePaytmResponse(response);
    const resultStatus = data?.body?.resultInfo?.resultStatus;
    const txnStatus = data?.body?.resultInfo?.resultCode === '01' || data?.body?.resultInfo?.resultStatus === 'TXN_SUCCESS'
      ? 'TXN_SUCCESS'
      : data?.body?.txnStatus || data?.body?.resultInfo?.resultStatus;

    return res.json({
      success: true,
      data: {
        orderId,
        txnStatus,
        isSuccess: txnStatus === 'TXN_SUCCESS' || resultStatus === 'TXN_SUCCESS',
        paytm: data.body,
      },
    });
  } catch (error) {
    console.error('Paytm payment status error:', error);
    return res.status(500).json({
      message: error.message || 'Unable to verify Paytm payment status',
    });
  }
};

exports.handlePaytmCallback = async (req, res) => {
  try {
    const callbackParams = { ...req.body };
    const checksumHash = callbackParams.CHECKSUMHASH;
    delete callbackParams.CHECKSUMHASH;

    const isValidChecksum = checksumHash
      ? await PaytmChecksum.verifySignature(callbackParams, PAYTM_MERCHANT_KEY, checksumHash)
      : false;

    return res.json({
      success: true,
      checksumValid: isValidChecksum,
      data: req.body,
    });
  } catch (error) {
    console.error('Paytm callback handling error:', error);
    return res.status(500).json({
      message: error.message || 'Unable to process Paytm callback',
    });
  }
};

exports.getPaytmConfigStatus = (req, res) => {
  res.json({
    success: true,
    data: {
      configured: ensurePaytmConfig(),
      environment: PAYTM_ENV,
      websiteName: PAYTM_WEBSITE,
      callbackUrl: PAYTM_CALLBACK_URL,
      merchantIdPreview: PAYTM_MID ? `${PAYTM_MID.slice(0, 6)}...` : '',
    },
  });
};
