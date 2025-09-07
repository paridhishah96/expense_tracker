<template>
  <div class="expenses-table">
    <DataTable
      :value="expenses"
      :paginator="true"
      :rows="perPage"
      stripedRows
      :filters="filters"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <!-- Search bar -->
      <template #header>
        <div class="flex justify-between">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Search expenses..."
            />
          </span>
          <div>
            <Button
              icon="pi pi-filter"
              class="p-button-text p-button-sm"
              @click="toggleFilters"
            />
          </div>
        </div>
      </template>

      <Column field="date" header="Date" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>

      <Column field="description" header="Description" sortable />

      <Column field="category" header="Category" sortable>
        <template #filter v-if="showCategoryFilter">
          <Dropdown
            v-model="filters['category'].value"
            :options="categoryOptions"
            optionLabel="name"
            optionValue="name"
            placeholder="All Categories"
            class="p-column-filter"
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
import { ref, computed, onMounted } from "vue";
import { useExpenseStore } from "../stores/expenseStore";
import { FilterMatchMode } from "primevue/api";
import InputText from "primevue/inputtext";

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
const showCategoryFilter = ref(false);

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
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format amount with currency
const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Toggle category filter
const toggleFilters = () => {
  showCategoryFilter.value = !showCategoryFilter.value;
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
