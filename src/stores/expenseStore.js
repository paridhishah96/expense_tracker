import { defineStore } from 'pinia';
import localStorageService from '../services/localStorageService';
import { v4 as uuidv4 } from 'uuid';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    categories: [],
    isLoading: false,
    error: null
  }),
 
  getters: {
    getExpensesByCategory: (state) => {
      const result = {};
      state.categories.forEach(cat => {
        result[cat.name] = state.expenses.filter(exp => exp.category === cat.name);
      });
      return result;
    },
   
    getCategoryById: (state) => (id) => {
      return state.categories.find(cat => cat.id === id);
    },
   
    getCategoryByName: (state) => (name) => {
      return state.categories.find(cat => cat.name === name);
    },
   
    getExpensesByDate: (state) => (startDate, endDate) => {
      return state.expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startDate && expDate <= endDate;
      });
    },
   
    getTotalByCategory: (state) => {
      const totals = {};
      state.categories.forEach(cat => {
        const catExpenses = state.expenses.filter(exp => exp.category === cat.name);
        totals[cat.name] = catExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      });
      return totals;
    }
  },
 
  actions: {
    loadInitialData() {
      console.log("Loading initial data from localStorage");
      try {
        this.categories = localStorageService.getCategories();
        this.expenses = localStorageService.getExpenses();
      } catch (error) {
        console.error("Error loading initial data:", error);
        this.error = "Failed to load data";
      }
    },
   
    addExpense(expenseData) {
      const expense = {
        id: uuidv4(),
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
     
      this.expenses.push(expense);
      localStorageService.saveExpenses(this.expenses);
      return expense;
    },
   
    addExpenses(expenseDataArray) {
      if (!expenseDataArray || !Array.isArray(expenseDataArray) || expenseDataArray.length === 0) {
        console.error("Invalid expenses data provided");
        return [];
      }
     
      const newExpenses = expenseDataArray.map(data => ({
        id: uuidv4(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
     
      this.expenses = [...this.expenses, ...newExpenses];
      localStorageService.saveExpenses(this.expenses);
      return newExpenses;
    },
   
    updateExpense(id, updateData) {
      const index = this.expenses.findIndex(e => e.id === id);
      if (index !== -1) {
        this.expenses[index] = {
          ...this.expenses[index],
          ...updateData,
          updatedAt: new Date()
        };
        localStorageService.saveExpenses(this.expenses);
        return this.expenses[index];
      }
      return null;
    },
   
    deleteExpense(id) {
      this.expenses = this.expenses.filter(e => e.id !== id);
      localStorageService.saveExpenses(this.expenses);
    },
   
    addCategory(categoryData) {
      const category = {
        id: uuidv4(),
        ...categoryData
      };
     
      this.categories.push(category);
      localStorageService.saveCategories(this.categories);
      return category;
    },
   
    updateCategory(id, updateData) {
      const index = this.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          ...updateData
        };
        localStorageService.saveCategories(this.categories);
      }
    },
   
    deleteCategory(id) {
      this.categories = this.categories.filter(c => c.id !== id);
      localStorageService.saveCategories(this.categories);
    },
   
    // Clear all data (for testing)
    clearAllData() {
      this.expenses = [];
      this.categories = localStorageService.getDefaultCategories();
      localStorageService.saveExpenses([]);
      localStorageService.saveCategories(this.categories);
    }
  }
});
