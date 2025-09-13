<template>
  <div>
    <Card class="mb-6">
      <template #title>All Transactions</template>
      <template #content>
        <p class="mb-4">
          View all your recorded transactions.
        </p>
      </template>
    </Card>
   
    <Card>
      <template #content>
        <!-- Simple search -->
        <div class="mb-4">
          <span class="p-input-icon-left w-full md:w-1/3">
            <i class="pi pi-search" />
            <InputText v-model="searchQuery" placeholder="Search..." class="w-full" />
          </span>
        </div>
       
        <!-- Basic DataTable -->
        <DataTable
          :value="displayTransactions"
          :paginator="true"
          :rows="50"
          :rowsPerPageOptions="[10, 25, 50, 100]"
          stripedRows
          :rowHover="true"
          class="p-datatable-sm"
          responsiveLayout="scroll"
          :totalRecords="totalRecords"
        >
          <Column field="date" header="Date">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
         
          <Column field="description" header="Description" />
         
          <Column field="category" header="Category" />
         
          <Column field="amount" header="Amount">
            <template #body="slotProps">
              <span :class="slotProps.data.amount < 0 ? 'text-red-500' : 'text-green-500'">
                {{ formatAmount(slotProps.data.amount) }}
              </span>
            </template>
          </Column>
         
          <Column header="Actions" style="width: 8rem">
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
       
        <!-- Edit Dialog -->
        <Dialog
          v-if="showEditDialog"
          v-model:visible="showEditDialog"
          :style="{width: '450px'}"
          header="Edit Transaction"
          :modal="true"
        >
          <div class="p-fluid">
            <div class="field mb-4">
              <label for="date">Date</label>
              <Calendar id="date" v-model="editingTransaction.date" dateFormat="yy-mm-dd" class="w-full" />
            </div>
           
            <div class="field mb-4">
              <label for="description">Description</label>
              <InputText id="description" v-model="editingTransaction.description" />
            </div>
           
            <div class="field mb-4">
              <label for="amount">Amount</label>
              <InputNumber id="amount" v-model="editingTransaction.amount" mode="currency" currency="USD" :minFractionDigits="2" />
            </div>
           
            <div class="field mb-4">
              <label for="category">Category</label>
              <Dropdown id="category" v-model="editingTransaction.category" :options="categoryOptions" optionLabel="name" optionValue="name" />
            </div>
          </div>
         
          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
            <Button label="Save" icon="pi pi-check" @click="saveTransaction" />
          </template>
        </Dialog>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';

const expenseStore = useExpenseStore();
const searchQuery = ref('');
const showEditDialog = ref(false);
const editingTransaction = ref({});

// Get all transactions from store
const allTransactions = computed(() => {
  return expenseStore.expenses;
});

// Simple filtering by search query
const displayTransactions = computed(() => {
  if (!searchQuery.value) {
    return allTransactions.value;
  }
 
  const query = searchQuery.value.toLowerCase();
  return allTransactions.value.filter(t => {
    return t.description.toLowerCase().includes(query) ||
           (t.category && t.category.toLowerCase().includes(query));
  });
});

const totalRecords = computed(() => displayTransactions.value.length);

const categoryOptions = computed(() => {
  return expenseStore.categories.map(cat => ({ name: cat.name }));
});

// Formatting helpers
const formatDate = (dateString) => {
  if (!dateString) return '';
 
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (err) {
    return dateString;
  }
};

const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '';
 
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Edit transaction
const editTransaction = (transaction) => {
  const transactionCopy = JSON.parse(JSON.stringify(transaction)); // Deep copy
 
  // Convert date string to Date object if it's a string
  if (typeof transactionCopy.date === 'string') {
    try {
      transactionCopy.date = new Date(transactionCopy.date);
    } catch (err) {
      console.error('Error converting date:', err);
    }
  }
 
  editingTransaction.value = transactionCopy;
  showEditDialog.value = true;
};

// Save transaction changes
const saveTransaction = () => {
  const updatedTransaction = { ...editingTransaction.value };
 
  // Convert Date object back to string if needed
  if (updatedTransaction.date instanceof Date) {
    updatedTransaction.date = updatedTransaction.date.toISOString().split('T')[0];
  }
 
  expenseStore.updateExpense(updatedTransaction.id, updatedTransaction);
  showEditDialog.value = false;
};

// Delete transaction
const deleteTransaction = (transaction) => {
  if (confirm(`Are you sure you want to delete this transaction: ${transaction.description}?`)) {
    expenseStore.deleteExpense(transaction.id);
  }
};
</script>
