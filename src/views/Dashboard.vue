<template>
  <div>
    <Card class="mb-6">
      <template #title>Expense Dashboard</template>
      <template #content>
        <p class="mb-4">
          View and analyze your expenses with interactive charts and reports.
        </p>
      </template>
    </Card>
   
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <template #title>Expense by Category</template>
        <template #content>
          <ExpenseChart title="" type="category" />
        </template>
      </Card>
     
      <Card>
        <template #title>Expense Trends</template>
        <template #content>
          <ExpenseChart title="" type="time" />
        </template>
      </Card>
    </div>
   
    <Card>
      <template #title>All Expenses</template>
      <template #content>
        <ExpensesTable
          :expenses="allExpenses"
          :perPage="10"
          @edit="onEditExpense"
          @delete="onDeleteExpense"
        />
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';
import ExpensesTable from '../components/ExpensesTable.vue';
import ExpenseChart from '../components/ExpenseChart.vue';

const expenseStore = useExpenseStore();

const allExpenses = computed(() => {
  return expenseStore.expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
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
