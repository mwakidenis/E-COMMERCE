// Currency conversion utility
const INR_TO_KES_RATE = 3.5; // 1 INR = 3.5 KES

const convertINRToKES = (priceInINR) => {
  return Math.round(priceInINR * INR_TO_KES_RATE * 100) / 100; // Round to 2 decimal places
};

module.exports = {
  convertINRToKES,
  INR_TO_KES_RATE
};
