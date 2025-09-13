<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card class="bg-blue-50">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Income</h3>
            <p class="text-2xl font-bold text-green-600">{{ formatAmount(totalIncome) }}</p>
          </div>
        </template>
      </Card>
     
      <Card class="bg-red-50">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Expenses</h3>
            <p class="text-2xl font-bold text-red-600">{{ formatAmount(totalExpenses) }}</p>
          </div>
        </template>
      </Card>
     
      <Card :class="netTotal >= 0 ? 'bg-green-50' : 'bg-red-50'">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Net Total</h3>
            <p class="text-2xl font-bold" :class="netTotal >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatAmount(netTotal) }}
            </p>
          </div>
        </template>
      </Card>
    </div>
   
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <template #title>Income vs. Expenses</template>
        <template #content>
          <Chart type="bar" :data="incomeVsExpenseData" :options="chartOptions" />
        </template>
      </Card>
     
      <Card>
        <template #title>Expense Breakdown</template>
        <template #content>
          <Chart type="pie" :data="categoryPieData" :options="pieChartOptions" />
        </template>
      </Card>
    </div>
   
    <Card class="mb-6">
      <template #title>Expense Trends</template>
      <template #content>
        <div class="mb-3 flex justify-end">
          <Dropdown
            v-model="selectedPeriod"
            :options="periodOptions"
            optionLabel="name"
            placeholder="Select Period"
            class="w-auto"
          />
        </div>
        <Chart type="line" :data="trendChartData" :options="lineChartOptions" />
      </template>
    </Card>
   
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <template #content>
          <RecurringTransactions title="Recurring Expenses" type="expense" />
        </template>
      </Card>
     
      <Card>
        <template #content>
          <RecurringTransactions title="Recurring Income" type="income" />
        </template>
      </Card>
    </div>
   
    <Card>
      <template #title>Recent Transactions</template>
      <template #content>
        <ExpensesTable
          :expenses="recentExpenses"
          :perPage="10"
          @edit="onEditExpense"
          @delete="onDeleteExpense"
        />
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';
import ExpensesTable from '../components/ExpensesTable.vue';
import RecurringTransactions from '../components/RecurringTransaction.vue';

const expenseStore = useExpenseStore();

// Period selection for trend chart
const periodOptions = [
  { name: 'Last 30 Days', value: 30 },
  { name: 'Last 3 Months', value: 90 },
  { name: 'Last 6 Months', value: 180 },
  { name: 'Last Year', value: 365 }
];
const selectedPeriod = ref(periodOptions[0]);

// Computed values for summary cards
const totalIncome = computed(() => expenseStore.getTotalIncome);
const totalExpenses = computed(() => expenseStore.getTotalExpenses);
const netTotal = computed(() => expenseStore.getNetTotal);

// Format amount with currency
const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount);
};

// Income vs. Expense data for bar chart
const incomeVsExpenseData = computed(() => {
  // Group expenses by month for the last 6 months
  const months = [];
  const incomeData = [];
  const expenseData = [];
 
  // Get date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
 
  // Group expenses by month
  for (let i = 0; i <= 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
   
    const monthName = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const monthLabel = `${monthName} ${year}`;
   
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
   
    // Get expenses for this month
    const monthExpenses = expenseStore.expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });
   
    // Calculate income and expenses
    const income = monthExpenses
      .filter(exp => exp.amount > 0)
      .reduce((sum, exp) => sum + exp.amount, 0);
     
    const expenses = monthExpenses
      .filter(exp => exp.amount < 0)
      .reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
   
    // Add to arrays in reverse order (most recent first)
    months.unshift(monthLabel);
    incomeData.unshift(income);
    expenseData.unshift(expenses);
  }
 
  return {
    labels: months,
    datasets: [
      {
        label: 'Income',
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        data: incomeData
      },
      {
        label: 'Expenses',
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        data: expenseData
      }
    ]
  };
});

// Pie chart for expense categories
const categoryPieData = computed(() => {
  // Get categories with expenses
  const categories = {};
  const categoryColors = {};
 
  // Get all expense categories and their colors
  expenseStore.categories.forEach(cat => {
    categories[cat.name] = 0;
    categoryColors[cat.name] = cat.color;
  });
 
  // Sum expenses by category (only include negative amounts/expenses)
  expenseStore.expenses
    .filter(exp => exp.amount < 0)
    .forEach(exp => {
      if (exp.category && categories[exp.category] !== undefined) {
        categories[exp.category] += Math.abs(exp.amount);
      } else {
        categories['Other'] = (categories['Other'] || 0) + Math.abs(exp.amount);
      }
    });
 
  // Filter out categories with no expenses
  const labels = Object.keys(categories).filter(cat => categories[cat] > 0);
  const data = labels.map(cat => categories[cat]);
  const backgroundColors = labels.map(cat => categoryColors[cat] || '#858585');
 
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: backgroundColors,
      hoverBackgroundColor: backgroundColors.map(color => {
        // Make hover color slightly darker
        return color.replace(/[^#]/, match => {
          const val = parseInt(match, 16);
          return Math.max(0, val - 1).toString(16);
        });
      })
    }]
  };
});

// Trend chart for expenses over time
const trendChartData = computed(() => {
  // Get period in days
  const days = selectedPeriod.value.value;
 
  // Calculate start date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
 
  // Determine grouping (daily, weekly, monthly)
  let grouping = 'daily';
  if (days > 60) {
    grouping = 'weekly';
  }
  if (days > 180) {
    grouping = 'monthly';
  }
 
  // Filter expenses within period
  const periodExpenses = expenseStore.expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= startDate;
  });
 
  // Group by date
  const dateGroups = {};
 
  periodExpenses.forEach(exp => {
    let dateKey;
    const expDate = new Date(exp.date);
   
    if (grouping === 'daily') {
      dateKey = exp.date; // YYYY-MM-DD
    } else if (grouping === 'weekly') {
      // Get week start (Sunday)
      const weekStart = new Date(expDate);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - day);
      dateKey = weekStart.toISOString().split('T')[0];
    } else {
      // Monthly
      dateKey = `${expDate.getFullYear()}-${(expDate.getMonth() + 1).toString().padStart(2, '0')}`;
    }
   
    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = {
        expenses: 0,
        income: 0
      };
    }
   
    if (exp.amount < 0) {
      dateGroups[dateKey].expenses += Math.abs(exp.amount);
    } else {
      dateGroups[dateKey].income += exp.amount;
    }
  });
 
  // Sort dates
  const sortedDates = Object.keys(dateGroups).sort();
 
  // Format labels
  const labels = sortedDates.map(date => {
    if (grouping === 'daily') {
      return new Date(date).toLocaleDateString();
    } else if (grouping === 'weekly') {
      const weekStart = new Date(date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    } else {
      // Monthly
      const [year, month] = date.split('-');
      return `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;
    }
  });
 
  // Prepare datasets
  const expenseData = sortedDates.map(date => dateGroups[date].expenses);
  const incomeData = sortedDates.map(date => dateGroups[date].income);
 
  return {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      },
      {
        label: 'Expenses',
        data: expenseData,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1
      }
    ]
  };
});

// Chart options
const chartOptions = {
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${formatAmount(context.raw)}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return formatAmount(value).replace(/\.00$/, '');
        }
      }
    }
  }
};

// Pie chart options
const pieChartOptions = {
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = formatAmount(context.raw);
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((context.raw / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};

// Line chart options
const lineChartOptions = {
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${formatAmount(context.raw)}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return formatAmount(value).replace(/\.00$/, '');
        }
      }
    }
  }
};

// Recent expenses
const recentExpenses = computed(() => {
  return expenseStore.expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
});

// Event handlers
const onEditExpense = (expense) => {
  // In a real app, you'd open a dialog to edit the expense
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
