/**
 * Format price to Vietnamese currency format
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Calculate discounted price
 * @param {number} originalPrice - Original price
 * @param {number} discount - Discount percentage
 * @returns {number} Price after discount
 */
export const calculateDiscountedPrice = (originalPrice, discount) => {
  if (!discount) return originalPrice;
  return originalPrice - Math.floor((originalPrice * discount) / 100);
};

/**
 * Format price with discount
 * @param {number} price - Original price
 * @param {number} discount - Discount percentage
 * @returns {Object} Object containing formatted original and discounted prices
 */
export const formatPriceWithDiscount = (price, discount) => {
  const discountedPrice = calculateDiscountedPrice(price, discount);
  return {
    originalPrice: formatPrice(price),
    discountedPrice: formatPrice(discountedPrice),
    discount
  };
}; 