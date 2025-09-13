<template>
  <div>
    <Card class="mb-6">
      <template #title>Welcome to Your Expense Tracker</template>
      <template #content>
        <p class="mb-4">
          This application helps you track and analyze your expenses by importing
          CSV files from your bank or credit card statements.
        </p>
        <div class="flex justify-between gap-3 flex-wrap">
          <Button
            label="Upload New Expenses"
            icon="pi pi-upload"
            @click="$router.push('/upload')"
          />
          <Button
            label="View Dashboard"
            icon="pi pi-chart-bar"
            class="p-button-outlined"
            @click="$router.push('/dashboard')"
          />
        </div>
      </template>
    </Card>
   
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <template #title>Recent Expenses</template>
        <template #content>
          <ExpensesTable
            :expenses="recentExpenses"
            :perPage="5"
            @edit="onEditExpense"
            @delete="onDeleteExpense"
          />
        </template>
        <template #footer>See all</template>

      </Card>
     
      <Card>
        <template #title>Expense Breakdown</template>
        <template #content>
          <ExpenseChart title="" type="category" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';
import ExpensesTable from '../components/ExpensesTable.vue';
import ExpenseChart from '../components/ExpenseChart.vue';

const expenseStore = useExpenseStore();

const recentExpenses = computed(() => {
  return expenseStore.expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
});

const onEditExpense = (expense) => {
  // In a real app, you'd open a dialog to edit the expense
  console.log('Edit expense:', expense);
 
  // For now, let's use a simple prompt
  const newCategory = prompt('Enter new category:', expense.category);
  if (newCategory !== null) {
    expenseStore.updateExpense(expense.id, {
      category: newCategory
    });
  }
};

const onDeleteExpense = (expense) => {
  expenseStore.deleteExpense(expense.id);
};
</script>
