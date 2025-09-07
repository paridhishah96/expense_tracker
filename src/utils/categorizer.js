// Common expense patterns for auto-categorization
const categoryPatterns = {
  "Food & Dining": [
    /restaurant/i,
    /cafe/i,
    /coffee/i,
    /dining/i,
    /food/i,
    /grocery/i,
    /supermarket/i,
    /market/i,
    /bakery/i,
    /meal/i,
    /uber\s*eats/i,
    /doordash/i,
    /grubhub/i,
    /mcdonalds/i,
    /starbucks/i,
    /subway/i,
    /pizza/i,
    /taco/i,
    /burger/i,
  ],
  Transportation: [
    /gas/i,
    /presto/i,
    /fuel/i,
    /uber/i,
    /lyft/i,
    /taxi/i,
    /cab/i,
    /transport/i,
    /transit/i,
    /train/i,
    /metro/i,
    /subway/i,
    /bus/i,
    /parking/i,
    /toll/i,
    /air\s*fare/i,
    /airline/i,
    /flight/i,
    /car\s*rental/i,
  ],
  Housing: [
    /rent/i,
    /lease/i,
    /mortgage/i,
    /home/i,
    /house/i,
    /property/i,
    /real\s*estate/i,
    /condo/i,
    /apartment/i,
    /apt/i,
    /insurance/i,
  ],
  Utilities: [
    /electric/i,
    /bell/i,
    /water/i,
    /gas\s*bill/i,
    /hydro/i,
    /utility/i,
    /utilities/i,
    /internet/i,
    /wifi/i,
    /phone/i,
    /mobile/i,
    /telecom/i,
    /cable/i,
    /tv\s*service/i,
    /streaming/i,
    /netflix/i,
    /spotify/i,
    /apple/i,
    /amazon\s*prime/i,
    /hulu/i,
    /disney\+/i,
  ],
  Entertainment: [
    /movie/i,
    /cinema/i,
    /theater/i,
    /theatre/i,
    /concert/i,
    /event/i,
    /ticket/i,
    /show/i,
    /game/i,
    /sport/i,
    /recreation/i,
    /amusement/i,
    /netflix/i,
    /spotify/i,
    /apple/i,
    /amazon\s*prime/i,
    /hulu/i,
    /disney\+/i,
  ],
  Shopping: [
    /amazon/i,
    /walmart/i,
    /target/i,
    /costco/i,
    /shop/i,
    /store/i,
    /retail/i,
    /mall/i,
    /purchase/i,
    /buy/i,
    /clothing/i,
    /fashion/i,
    /apparel/i,
    /electronics/i,
    /hardware/i,
    /furniture/i,
    /decor/i,
  ],
  "Health & Fitness": [
    /doctor/i,
    /medical/i,
    /health/i,
    /hospital/i,
    /clinic/i,
    /pharmacy/i,
    /drug/i,
    /prescription/i,
    /gym/i,
    /fitness/i,
    /exercise/i,
    /workout/i,
    /sport/i,
    /training/i,
    /therapy/i,
    /dental/i,
    /dentist/i,
    /eye/i,
    /optical/i,
  ],
};

// Function to suggest a category based on transaction description
const suggestCategory = (description) => {
  if (!description) return "Other";

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(description)) {
        return category;
      }
    }
  }
  return "Other"; // Default category if no patterns match
};

// Function to categorize a list of expenses
const categorizeExpenses = (expenses) => {
  if (!expenses || !Array.isArray(expenses)) return [];

  return expenses.map((expense) => {
    if (!expense.category) {
      return {
        ...expense,
        category: suggestCategory(expense.description),
      };
    }
    return expense;
  });
};

export { suggestCategory, categorizeExpenses };
