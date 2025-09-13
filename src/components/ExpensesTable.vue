<template>
  <div class="expenses-table">
    <DataTable
      :value="expenses"
      :paginator="true"
      :rows="perPage"
      stripedRows
      :filters="filters"
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

      <Column field="category" header="Category" sortable>
        <template #filter>
          <Dropdown
            v-model="filters['category'].value"
            :options="categoryOptions"
            optionLabel="name"
            optionValue="name"
            placeholder="All Categories"
            class="p-column-filter w-full"
            showClear
          />
        </template>
      </Column>

      <Column field="amount" header="Amount" sortable>
        <template #body="slotProps">
          <span
            :class="
              slotProps.data.amount < 0 ? 'text-red-500' : 'text-green-500'
            "
          >
            {{ formatAmount(slotProps.data.amount) }}
          </span>
        </template>
      </Column>

      <Column header="Actions" style="width: 8rem">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-text p-button-sm"
            @click="editExpense(slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-text p-button-sm p-button-danger"
            @click="deleteExpense(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useExpenseStore } from "../stores/expenseStore";
import { FilterMatchMode } from "primevue/api";

const props = defineProps({
  expenses: {
    type: Array,
    default: () => [],
  },
  perPage: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(["edit", "delete"]);
const expenseStore = useExpenseStore();

// Setup filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS },
});

// Get unique categories from expenses
const categoryOptions = computed(() => {
  const categories = new Set();
  props.expenses.forEach((expense) => {
    if (expense.category) {
      categories.add(expense.category);
    }
  });
  return Array.from(categories).map((cat) => ({ name: cat }));
});

// Format date to local date string
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format amount with currency
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
};

// Edit expense
const editExpense = (expense) => {
  emit("edit", expense);
};

// Delete expense
const deleteExpense = (expense) => {
  if (
    confirm(
      `Are you sure you want to delete this expense: ${expense.description}?`
    )
  ) {
    emit("delete", expense);
  }
};
</script>
