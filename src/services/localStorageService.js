const EXPENSES_KEY = "expenses";
const CATEGORIES_KEY = "categories";

export default {
  saveExpenses(expenses) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },

  getExpenses() {
    const expenses = localStorage.getItem(EXPENSES_KEY);
    return expenses ? JSON.parse(expenses) : [];
  },

  saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  getCategories() {
    const categories = localStorage.getItem(CATEGORIES_KEY);
    return categories ? JSON.parse(categories) : this.getDefaultCategories();
  },

  getDefaultCategories() {
    return [
      { id: 1, name: "Food & Dining", color: "#FF5733" },
      { id: 2, name: "Transportation", color: "#33A8FF" },
      { id: 3, name: "Housing", color: "#33FF57" },
      { id: 4, name: "Entertainment", color: "#D133FF" },
      { id: 5, name: "Shopping", color: "#FFD133" },
      { id: 6, name: "Utilities", color: "#4633FF" },
      { id: 7, name: "Health & Fitness", color: "#FF3399" },
      { id: 8, name: "Other", color: "#858585" },
    ];
  },
};
