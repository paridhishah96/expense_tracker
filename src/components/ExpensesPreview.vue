<script setup>
import { ref, computed, watch } from "vue";
import { useExpenseStore } from "../stores/expenseStore";
import { categorizeExpenses } from "../utils/categorizer";
import localStorageService from "../services/localStorageService";

const props = defineProps({
  parsedExpenses: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["expenses-saved"]);
const expenseStore = useExpenseStore();

// Get categories from store
const categories = computed(() => {
  return expenseStore.categories.map((cat) => ({
    name: cat.name,
    value: cat.name,
  }));
});

// Auto-categorize expenses when they come in
const expenses = ref([]);

// Watch for changes in parsedExpenses prop
watch(
  () => props.parsedExpenses,
  (newExpenses) => {
    if (newExpenses && newExpenses.length > 0) {
      expenses.value = categorizeExpenses(newExpenses);
    }
  },
  { immediate: true }
);

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

// Save expenses to store
const saveExpenses = () => {
  expenseStore.addExpenses(expenses.value);
  emit("expenses-saved");
  expenses.value = [];
};
</script>
