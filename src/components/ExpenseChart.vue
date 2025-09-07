<template>
  <div class="expense-chart">
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-medium">{{ title }}</h2>
      <div class="chart-options">
        <Dropdown
          v-model="selectedPeriod"
          :options="periodOptions"
          optionLabel="name"
          placeholder="Select Period"
          class="w-auto mr-2"
        />
      </div>
    </div>
   
    <div class="chart-container" style="position: relative; height: 300px;">
      <Chart v-if="chartData" type="bar" :data="chartData" :options="chartOptions" />
      <div v-else class="flex justify-center items-center h-full bg-gray-50">
        <p class="text-gray-500">No data available for the selected period</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';

const props = defineProps({
  title: {
    type: String,
    default: 'Expense Chart'
  },
  type: {
    type: String,
    default: 'category' // 'category' or 'time'
  }
});

const expenseStore = useExpenseStore();

// Chart period options
const periodOptions = [
  { name: 'This Month', value: 'month' },
  { name: 'Last 3 Months', value: 'quarter' },
  { name: 'This Year', value: 'year' },
  { name: 'All Time', value: 'all' }
];

const selectedPeriod = ref(periodOptions[0]);

// Get filtered expenses based on period
const filteredExpenses = computed(() => {
  const now = new Date();
  let startDate = new Date();
 
  switch (selectedPeriod.value.value) {
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date(0); // Start from epoch
      break;
  }
 
  return expenseStore.expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= now;
  });
});

// Generate chart data based on type and filtered expenses
const chartData = computed(() => {
  if (props.type === 'category') {
    return getCategoryChartData();
  } else {
    return getTimeChartData();
  }
});

// Chart options
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(Math.abs(context.raw));
            return label;
          }
        }
      }
    }
  };
});

// Generate data for category chart
const getCategoryChartData = () => {
  const categories = {};
  const categoryColors = {};
 
  // Get all categories and their colors
  expenseStore.categories.forEach(cat => {
    categories[cat.name] = 0;
    categoryColors[cat.name] = cat.color;
  });
 
  // Sum expenses by category (use absolute values for visualization)
  filteredExpenses.value.forEach(exp => {
    if (exp.category && categories[exp.category] !== undefined) {
      categories[exp.category] += Math.abs(exp.amount);
    } else {
      categories['Other'] = (categories['Other'] || 0) + Math.abs(exp.amount);
    }
  });
 
  // Prepare chart data
  const labels = Object.keys(categories).filter(cat => categories[cat] > 0);
  const data = labels.map(cat => categories[cat]);
  const backgroundColors = labels.map(cat => categoryColors[cat] || '#858585');
 
  return {
    labels,
    datasets: [{
      label: 'Expenses',
      data,
      backgroundColor: backgroundColors,
      borderWidth: 1
    }]
  };
};

// Generate data for time chart
const getTimeChartData = () => {
  // Group by month if period is year or all, else group by day
  const groupByMonth = ['year', 'all'].includes(selectedPeriod.value.value);
  const dateGroups = {};
 
  // Group expenses by date
  filteredExpenses.value.forEach(exp => {
    let dateKey;
    const expDate = new Date(exp.date);
   
    if (groupByMonth) {
      dateKey = `${expDate.getFullYear()}-${expDate.getMonth() + 1}`;
    } else {
      dateKey = exp.date;
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
    if (groupByMonth) {
      const [year, month] = date.split('-');
      return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  });
 
  // Prepare datasets
  const expenseData = sortedDates.map(date => dateGroups[date].expenses);
  const incomeData = sortedDates.map(date => dateGroups[date].income);
 
  return {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };
};
</script>
