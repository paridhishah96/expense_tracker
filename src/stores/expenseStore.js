import { defineStore } from "pinia";
import localStorageService from "../services/localStorageService";
import { v4 as uuidv4 } from "uuid";

export const useExpenseStore = defineStore("expense", {
  state: () => ({
    expenses: [],
    categories: [],
    isLoading: false,
  }),

  actions: {
    loadInitialData() {
      this.categories = localStorageService.getCategories();
      this.expenses = localStorageService.getExpenses();
    },

    addExpense(expenseData) {
      const expense = {
        id: uuidv4(),
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.expenses.push(expense);
      localStorageService.saveExpenses(this.expenses);
      return expense;
    },

    addExpenses(expenseDataArray) {
      const newExpenses = expenseDataArray.map((data) => ({
        id: uuidv4(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      this.expenses = [...this.expenses, ...newExpenses];
      localStorageService.saveExpenses(this.expenses);
      return newExpenses;
    },

    updateExpense(id, updateData) {
      const index = this.expenses.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.expenses[index] = {
          ...this.expenses[index],
          ...updateData,
          updatedAt: new Date(),
        };
        localStorageService.saveExpenses(this.expenses);
      }
    },

    deleteExpense(id) {
      this.expenses = this.expenses.filter(e => e.id !== id);
      localStorageService.saveExpenses(this.expenses);
      }
  },
});
