<template>
  <div class="recurring-transactions">
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-medium">{{ title }}</h2>
      <Button
        icon="pi pi-plus"
        label="Add New"
        class="p-button-sm"
        @click="showAddDialog = true"
      />
    </div>
   
    <DataTable
      :value="transactions"
      :paginator="transactions.length > 5"
      :rows="5"
      stripedRows
      class="p-datatable-sm"
    >
      <Column field="description" header="Description" />
      <Column field="amount" header="Amount">
        <template #body="slotProps">
          <span :class="slotProps.data.amount < 0 ? 'text-red-500' : 'text-green-500'">
            {{ formatAmount(slotProps.data.amount) }}
          </span>
        </template>
      </Column>
      <Column field="frequency" header="Frequency">
        <template #body="slotProps">
          {{ formatFrequency(slotProps.data.frequency) }}
        </template>
      </Column>
      <Column field="category" header="Category" />
      <Column field="nextDate" header="Next Date">
        <template #body="slotProps">
          {{ formatDate(getNextDate(slotProps.data)) }}
        </template>
      </Column>
      <Column field="actions" header="Actions">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-text p-button-sm"
            @click="editTransaction(slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-text p-button-sm p-button-danger"
            @click="deleteTransaction(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
   
    <!-- Add/Edit Dialog -->
    <Dialog
      v-model:visible="showAddDialog"
      :header="editingTransaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'"
      :style="{width: '450px'}"
      modal
    >
      <RecurringTransactionForm
        :transaction="editingTransaction"
        @save="onSaveTransaction"
        @cancel="closeDialog"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';
import RecurringTransactionForm from './RecurringTransactionForm.vue';
import Dialog from 'primevue/dialog';
import RecurringTransaction from '../models/recurringTransaction';

const props = defineProps({
  title: {
    type: String,
    default: 'Recurring Transactions'
  },
  type: {
    type: String,
    default: 'all' // 'all', 'expense', or 'income'
  }
});

const expenseStore = useExpenseStore();
const showAddDialog = ref(false);
const editingTransaction = ref(null);

const transactions = computed(() => {
  if (props.type === 'all') {
    return expenseStore.recurringTransactions;
  } else {
    return expenseStore.recurringTransactions.filter(t => t.type === props.type);
  }
});

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount);
};

const formatFrequency = (frequency) => {
  const map = {
    'weekly': 'Weekly',
    'biweekly': 'Bi-weekly',
    'monthly': 'Monthly'
  };
  return map[frequency] || frequency;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getNextDate = (transaction) => {
  const recurringTrans = new RecurringTransaction(transaction);
  const nextDates = recurringTrans.getNextOccurrences(1);
  return nextDates.length > 0 ? nextDates[0] : null;
};

const editTransaction = (transaction) => {
  editingTransaction.value = { ...transaction };
  showAddDialog.value = true;
};

const deleteTransaction = (transaction) => {
  if (confirm(`Are you sure you want to delete this recurring transaction: ${transaction.description}?`)) {
    expenseStore.deleteRecurringTransaction(transaction.id);
  }
};

const onSaveTransaction = (transactionData) => {
  if (editingTransaction.value) {
    expenseStore.updateRecurringTransaction(editingTransaction.value.id, transactionData);
  } else {
    expenseStore.addRecurringTransaction(transactionData);
  }
  closeDialog();
};

const closeDialog = () => {
  showAddDialog.value = false;
  editingTransaction.value = null;
};
</script>
