const EXPENSES_KEY = 'expenses';
const CATEGORIES_KEY = 'categories';
const RECURRING_TRANSACTIONS_KEY = 'recurring_transactions';

export default {
  saveExpenses(expenses) {
    try {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
    }
  },
 
  getExpenses() {
    try {
      const expenses = localStorage.getItem(EXPENSES_KEY);
      return expenses ? JSON.parse(expenses) : [];
    } catch (error) {
      console.error('Error getting expenses from localStorage:', error);
      return [];
    }
  },
 
  saveCategories(categories) {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  },
 
  getCategories() {
    try {
      const categories = localStorage.getItem(CATEGORIES_KEY);
      return categories ? JSON.parse(categories) : this.getDefaultCategories();
    } catch (error) {
      console.error('Error getting categories from localStorage:', error);
      return this.getDefaultCategories();
    }
  },
 
  saveRecurringTransactions(transactions) {
    try {
      localStorage.setItem(RECURRING_TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving recurring transactions to localStorage:', error);
    }
  },
 
  getRecurringTransactions() {
    try {
      const transactions = localStorage.getItem(RECURRING_TRANSACTIONS_KEY);
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error('Error getting recurring transactions from localStorage:', error);
      return [];
    }
  },
 
  getDefaultCategories() {
    return [
      { id: 1, name: 'Food & Dining', color: '#FF5733' },
      { id: 2, name: 'Transportation', color: '#33A8FF' },
      { id: 3, name: 'Housing', color: '#33FF57' },
      { id: 4, name: 'Entertainment', color: '#D133FF' },
      { id: 5, name: 'Shopping', color: '#FFD133' },
      { id: 6, name: 'Utilities', color: '#4633FF' },
      { id: 7, name: 'Health & Fitness', color: '#FF3399' },
      { id: 8, name: 'Income', color: '#33FFEC' },
      { id: 9, name: 'Other', color: '#858585' }
    ];
  }
};

