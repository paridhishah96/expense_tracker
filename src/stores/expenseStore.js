import { defineStore } from 'pinia';
import localStorageService from '../services/localStorageService';
import { v4 as uuidv4 } from 'uuid';
import RecurringTransaction from '../models/recurringTransaction';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    categories: [],
    recurringTransactions: [],
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
   
    getTotalsByCategory: (state) => {
      const totals = {};
      state.categories.forEach(cat => {
        const catExpenses = state.expenses.filter(exp => exp.category === cat.name);
        totals[cat.name] = catExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      });
      return totals;
    },
   
    getTotalIncome: (state) => {
      return state.expenses
        .filter(exp => exp.amount < 0)
        .reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
    },
   
    getTotalExpenses: (state) => {
      return state.expenses
        .filter(exp => exp.amount > 0)
        .reduce((sum, exp) => sum + exp.amount, 0);
    },

    getCategoryColorByName(categoryName) {
      const category = this.categories.find(c => c.name === categoryName);
      return category ? category.color : '#858585';
    },
   
    getNetTotal: (state) => {
      console.log(state.expenses);
      return state.expenses.reduce((sum, exp) => sum - exp.amount, 0);
    },
   
    getUpcomingRecurringTransactions: (state) => {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
     
      const upcoming = [];
     
      state.recurringTransactions.forEach(trans => {
        const transaction = new RecurringTransaction(trans);
        const nextDates = transaction.getNextOccurrences(3);
       
        nextDates.forEach(date => {
          const occurrenceDate = new Date(date);
          if (occurrenceDate >= today && occurrenceDate <= nextMonth) {
            upcoming.push({
              ...trans,
              nextDate: date
            });
          }
        });
      });
     
      return upcoming.sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
    }
  },
 
  actions: {
    loadInitialData() {
      console.log("Loading initial data from localStorage");
      try {
        this.categories = localStorageService.getCategories();
        this.expenses = localStorageService.getExpenses();
        this.recurringTransactions = localStorageService.getRecurringTransactions();
        this.processRecurringTransactions();
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
   
    addRecurringTransaction(data) {
      const transaction = new RecurringTransaction(data);
      this.recurringTransactions.push(transaction);
      localStorageService.saveRecurringTransactions(this.recurringTransactions);
      return transaction;
    },
   
    updateRecurringTransaction(id, updateData) {
      const index = this.recurringTransactions.findIndex(t => t.id === id);
      if (index !== -1) {
        this.recurringTransactions[index] = {
          ...this.recurringTransactions[index],
          ...updateData,
          updatedAt: new Date()
        };
        localStorageService.saveRecurringTransactions(this.recurringTransactions);
        return this.recurringTransactions[index];
      }
      return null;
    },
   
    deleteRecurringTransaction(id) {
      this.recurringTransactions = this.recurringTransactions.filter(t => t.id !== id);
      localStorageService.saveRecurringTransactions(this.recurringTransactions);
    },
   
    processRecurringTransactions() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
     
      this.recurringTransactions.forEach(trans => {
        const transaction = new RecurringTransaction(trans);
        const lastProcessed = transaction.lastProcessed ? new Date(transaction.lastProcessed) : null;
       
        // If never processed or last processed is in the past
        if (!lastProcessed || lastProcessed < today) {
          const nextDates = transaction.getNextOccurrences();
         
          if (nextDates.length > 0) {
            const nextDate = nextDates[0];
            const nextDateObj = new Date(nextDate);
           
            // Only process if the next date is today or in the past
            if (nextDateObj <= today) {
              // Create the transaction
              this.addExpense({
                date: nextDate,
                description: `${transaction.description} (Recurring)`,
                amount: transaction.amount,
                category: transaction.category,
                isRecurring: true,
                recurringId: transaction.id
              });
             
              // Update the last processed date
              this.updateRecurringTransaction(transaction.id, {
                lastProcessed: nextDate
              });
            }
          }
        }
      });
    },
   
    getCategoryColorByName(categoryName) {
      const category = this.categories.find(c => c.name === categoryName);
      return category ? category.color : '#858585';
    }
  }
});
