<template>
  <div class="file-uploader">
    <FileUpload
      name="expense-csv"
      :customUpload="true"
      @uploader="onFileUpload"
      accept=".csv"
      :maxFileSize="1000000"
      chooseLabel="Select CSV File"
      class="w-full"
      :auto="true"
    >
      <template #empty>
        <p class="text-center py-6 text-gray-500">
          Drag and drop your CSV file here or click to browse
        </p>
      </template>
    </FileUpload>
   
    <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import parseCSVData from '../utils/csvParser';

const emit = defineEmits(['file-parsed']);
const error = ref(null);

const onFileUpload = async (event) => {
  try {
    error.value = null;
    const file = event.files[0];
   
    if (!file) {
      throw new Error('No file selected');
    }
   
    const reader = new FileReader();
   
    reader.onload = async (e) => {
      try {
        const csvData = e.target.result;
        const expenses = await parseCSVData(csvData);
        emit('file-parsed', expenses);
      } catch (err) {
        error.value = `Error parsing CSV: ${err.message}`;
        console.error(err); // Add this line to see detailed error in console
      }
    };
   
    reader.onerror = () => {
      error.value = 'Error reading the file';
    };
   
    reader.readAsText(file);
  } catch (err) {
    error.value = err.message;
    console.error(err); // Add this line to see detailed error in console
  }
};
</script>
