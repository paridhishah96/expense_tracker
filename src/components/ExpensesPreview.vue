<template>
  <div class="expenses-preview">
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-medium">Preview Expenses</h2>
      <div class="actions">
        <Button
          label="Save All Expenses"
          icon="pi pi-check"
          @click="saveExpenses"
          :disabled="!expenses.length"
        />
      </div>
    </div>
   
    <DataTable
      v-if="expenses.length > 0"
      :value="expenses"
      :paginator="true"
      :rows="10"
      stripedRows
      responsiveLayout="stack"
      class="p-datatable-sm"
      :rowHover="true"
    >
      <Column field="date" header="Date" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>
     
      <Column field="description" header="Description" sortable />
     
      <Column field="amount" header="Amount" sortable>
        <template #body="slotProps">
          <span :class="slotProps.data.amount < 0 ? 'text-red-500' : 'text-green-500'">
            {{ formatAmount(slotProps.data.amount) }}
          </span>
        </template>
      </Column>
     
      <Column field="category" header="Category" sortable>
        <template #body="slotProps">
          <Dropdown
            v-model="slotProps.data.category"
            :options="categoryOptions"
            optionLabel="name"
            optionValue="name"
            class="w-full"
            placeholder="Select Category"
          />
        </template>
      </Column>
    </DataTable>
   
    <div v-else class="text-center py-8 text-gray-500">
      No expenses to preview. Please upload a CSV file.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';
import { categorizeExpenses } from '../utils/categorizer';

const props = defineProps({
  parsedExpenses: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['expenses-saved']);
const expenseStore = useExpenseStore();

// Get category options from store
const categoryOptions = computed(() => {
  return expenseStore.categories.map(cat => ({ name: cat.name }));
});

// Auto-categorize expenses when they come in
const expenses = ref([]);

// Watch for changes in parsedExpenses prop
watch(() => props.parsedExpenses, (newExpenses) => {
  if (newExpenses && newExpenses.length > 0) {
    console.log("Got new parsed expenses:", newExpenses.length);
    expenses.value = categorizeExpenses(newExpenses);
  }
}, { immediate: true });

// Format date to local date string
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format amount with currency
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount);
};

// Save expenses to store
const saveExpenses = () => {
  console.log("Saving expenses:", expenses.value.length);
  expenseStore.addExpenses(expenses.value);
  emit('expenses-saved');
  expenses.value = [];
};
</script>
