<template>
  <div class="recurring-transaction-form">
    <form @submit.prevent="saveTransaction" class="space-y-4">
      <div class="form-group">
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
        <div class="flex gap-4">
          <div class="flex items-center">
            <input type="radio" id="type-expense" v-model="form.type" value="expense" class="mr-2">
            <label for="type-expense">Expense</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="type-income" v-model="form.type" value="income" class="mr-2">
            <label for="type-income">Income</label>
          </div>
        </div>
      </div>
     
      <div class="form-group">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <InputText id="description" v-model="form.description" class="w-full" placeholder="e.g. Rent, Salary" />
      </div>
     
      <div class="form-group">
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <InputNumber
          id="amount"
          v-model="form.amount"
          mode="currency"
          currency="CAD"
          :min="0"
          class="w-full"
        />
      </div>
     
      <div class="form-group">
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <Dropdown
          id="category"
          v-model="form.category"
          :options="categoryOptions"
          optionLabel="name"
          optionValue="name"
          placeholder="Select a category"
          class="w-full"
        />
      </div>
     
      <div class="form-group">
        <label for="frequency" class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
        <Dropdown
          id="frequency"
          v-model="form.frequency"
          :options="frequencyOptions"
          optionLabel="name"
          optionValue="value"
          placeholder="Select frequency"
          class="w-full"
        />
      </div>
     
      <div class="form-group">
        <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <Calendar
          id="startDate"
          v-model="form.startDate"
          dateFormat="yy-mm-dd"
          class="w-full"
        />
      </div>
     
      <div class="form-group">
        <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
        <Calendar
          id="endDate"
          v-model="form.endDate"
          dateFormat="yy-mm-dd"
          class="w-full"
          placeholder="Leave blank for indefinite"
        />
      </div>
     
      <div class="form-actions flex justify-between">
        <Button
          type="button"
          label="Cancel"
          class="p-button-text"
          @click="$emit('cancel')"
        />
        <Button
          type="submit"
          label="Save"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';

const props = defineProps({
  transaction: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'cancel']);
const expenseStore = useExpenseStore();
const isSubmitting = ref(false);

const form = ref({
  description: '',
  amount: 0,
  category: '',
  frequency: 'monthly',
  startDate: new Date(),
  endDate: null,
  type: 'expense'
});

// Initialize form with transaction data if editing
onMounted(() => {
  if (props.transaction) {
    form.value = {
      ...props.transaction,
      startDate: new Date(props.transaction.startDate),
      endDate: props.transaction.endDate ? new Date(props.transaction.endDate) : null
    };
  }
});

// Watch for changes to type and update amount sign
watch(() => form.value.type, (newType) => {
  const amount = Math.abs(form.value.amount);
  form.value.amount = newType === 'expense' ? -amount : amount;
}, { immediate: true });

// Watch for changes to amount to ensure correct sign
watch(() => form.value.amount, (newAmount) => {
  if (form.value.type === 'expense' && newAmount > 0) {
    form.value.amount = -newAmount;
  } else if (form.value.type === 'income' && newAmount < 0) {
    form.value.amount = Math.abs(newAmount);
  }
});

const categoryOptions = computed(() => {
  return expenseStore.categories.map(cat => ({ name: cat.name }));
});

const frequencyOptions = [
  { name: 'Weekly', value: 'weekly' },
  { name: 'Bi-weekly', value: 'biweekly' },
  { name: 'Monthly', value: 'monthly' }
];

const saveTransaction = () => {
  try {
    isSubmitting.value = true;
   
    // Format dates
    const formattedData = {
      ...form.value,
      startDate: form.value.startDate.toISOString().split('T')[0],
      endDate: form.value.endDate ? form.value.endDate.toISOString().split('T')[0] : null
    };
   
    emit('save', formattedData);
  } catch (error) {
    console.error('Error saving transaction:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
