<template>
  <div class="upload-view">
    <Card class="mb-6">
      <template #title>Upload Expenses</template>
      <template #content>
        <p class="mb-4">
          Upload a CSV file from your bank or credit card statement to import
          expenses. The system will attempt to auto-categorize your expenses,
          but you can modify the categories before saving.
        </p>
        <FileUploader @file-parsed="onFileParsed" />
      </template>
    </Card>

    <Card v-if="parsedExpenses.length > 0">
      <template #content>
        <ExpensesPreview
          :parsedExpenses="parsedExpenses"
          @expenses-saved="onExpensesSaved"
        />
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import FileUploader from "../components/FileUploader.vue";
import ExpensesPreview from "../components/ExpensesPreview.vue";

const parsedExpenses = ref([]);

const onFileParsed = (expenses) => {
  parsedExpenses.value = expenses;
};

const onExpensesSaved = () => {
  parsedExpenses.value = [];
  // Show success message
  alert("Expenses saved successfully!");
};
</script>
