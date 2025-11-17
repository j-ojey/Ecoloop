// Carbon savings estimates in kg CO2 per item category
const CARBON_SAVINGS = {
  Electronics: 50,
  Furniture: 30,
  Clothing: 5,
  Clothes: 5,
  Books: 2,
  Toys: 3,
  'Home & Garden': 10,
  Sports: 8,
  Other: 5
};

/**
 * Calculate eco-points based on CO2 savings
 * @param {string} category - Item category
 * @param {string} action - 'create' or 'complete' (for sale/exchange)
 * @returns {number} Eco-points to award
 */
export const calculateEcoPoints = (category, action = 'create') => {
  const co2Saved = CARBON_SAVINGS[category] || 5; // Default to 5kg if category not found

  if (action === 'create') {
    // Award 1 point per 2kg of CO2 saved for creating items (smaller points)
    return Math.max(1, Math.floor(co2Saved / 2));
  } else if (action === 'complete') {
    // Award 1 point per kg of CO2 saved for completing transactions
    return Math.max(5, co2Saved); // Minimum 5 points for completion
  }

  return 0;
};

export { CARBON_SAVINGS };