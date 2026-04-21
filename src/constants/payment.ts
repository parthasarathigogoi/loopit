export const LOOPIT_BOOKING_SERVICE_FEE = 100;

const roundToNearestTen = (value: number) => Math.max(100, Math.round(value / 10) * 10);

export const getBookingBreakdown = (productPrice: number) => {
  const refundableAmount = roundToNearestTen(productPrice * 0.2);
  const totalBookingAmount = refundableAmount + LOOPIT_BOOKING_SERVICE_FEE;

  return {
    refundableAmount,
    serviceFee: LOOPIT_BOOKING_SERVICE_FEE,
    totalBookingAmount,
  };
};
