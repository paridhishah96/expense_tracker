<template>
  <div class="file-uploader">
    <div class="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center cursor-pointer"
         @click="triggerFileInput"
         @dragover.prevent="onDragOver"
         @dragleave.prevent="onDragLeave"
         @drop.prevent="onFileDrop"
         :class="{'border-blue-500 bg-blue-50': isDragging}">
     
      <div v-if="isUploading">
        <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
        <p>Processing your file...</p>
      </div>
      <div v-else>
        <i class="pi pi-upload text-3xl text-gray-400 mb-2"></i>
        <p class="text-gray-600">
          Drag and drop your CSV file here or <span class="text-blue-500">click to browse</span>
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Supports CSV files from most banks and credit cards
        </p>
      </div>
     
      <input type="file"
             ref="fileInput"
             accept=".csv"
             class="hidden"
             @change="onFileSelected">
    </div>
   
    <div v-if="ignoredCount > 0" class="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
      <p>{{ ignoredCount }} transaction{{ ignoredCount !== 1 ? 's were' : ' was' }} ignored based on your keyword filters.</p>
      <Button
        label="Manage Ignored Keywords"
        class="p-button-text p-button-sm mt-2"
        @click="showKeywordManager"
      />
    </div>
   
    <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
      <p>{{ error }}</p>
      <button
        @click="showDebugInfo = !showDebugInfo"
        class="text-sm text-blue-600 hover:underline mt-2">
        {{ showDebugInfo ? 'Hide' : 'Show' }} Debug Info
      </button>
      <pre v-if="showDebugInfo" class="mt-2 p-3 bg-gray-100 text-xs overflow-auto rounded-md" style="max-height: 200px">{{ debugInfo }}</pre>
    </div>
   
    <!-- Keywords Manager Dialog -->
    <Dialog v-model:visible="keywordManagerVisible" header="Manage Ignored Keywords" :style="{width: '500px'}">
      <div class="p-fluid">
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            Transactions containing these keywords will be automatically ignored when uploading CSV files.
          </p>
         
          <div class="flex flex-col gap-2 mb-4">
            <div v-for="(keyword, index) in ignoredKeywords" :key="keyword.id" class="flex items-center p-2 bg-gray-50 rounded-md">
              <Checkbox v-model="keyword.active" :inputId="'keyword-' + keyword.id" :binary="true" class="mr-2" />
              <label :for="'keyword-' + keyword.id" class="flex-grow">{{ keyword.keyword }}</label>
              <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="removeKeyword(index)" />
            </div>
          </div>
         
          <div class="flex gap-2">
            <InputText v-model="newKeyword" placeholder="Add new keyword" class="flex-grow" @keyup.enter="addKeyword" />
            <Button label="Add" icon="pi pi-plus" @click="addKeyword" />
          </div>
        </div>
      </div>
     
      <template #footer>
        <Button label="Close" icon="pi pi-check" @click="saveKeywords" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { parseCSVData } from '../utils/csvParser';
import keywordService from '../services/keywordService';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';

const emit = defineEmits(['file-parsed']);
const fileInput = ref(null);
const error = ref(null);
const isDragging = ref(false);
const isUploading = ref(false);
const showDebugInfo = ref(false);
const debugInfo = ref('');
const ignoredCount = ref(0);

// Keyword manager
const keywordManagerVisible = ref(false);
const ignoredKeywords = ref(keywordService.getIgnoredKeywords());
const newKeyword = ref('');

const triggerFileInput = () => {
  fileInput.value.click();
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onFileDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

const onFileSelected = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

const processFile = async (file) => {
  try {
    error.value = null;
    debugInfo.value = '';
    ignoredCount.value = 0;
   
    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Please select a CSV file');
    }
   
    isUploading.value = true;
    console.log("Processing file:", file.name, "Size:", file.size);
   
    const reader = new FileReader();
   
    reader.onload = async (e) => {
      try {
        const csvData = e.target.result;
        console.log("CSV data loaded, length:", csvData.length);
       
        const result = await parseCSVData(csvData);
        console.log("Parsed expenses:", result.expenses.length, "Ignored:", result.ignoredCount);
       
        ignoredCount.value = result.ignoredCount;
        emit('file-parsed', result.expenses);
      } catch (err) {
        console.error("Error parsing CSV:", err);
        error.value = `Error parsing CSV: ${err.message}`;
        debugInfo.value = `File: ${file.name}\nSize: ${file.size} bytes\nError: ${err.stack || err}`;
      } finally {
        isUploading.value = false;
      }
    };
   
    reader.onerror = (e) => {
      console.error("File reading error:", e);
      error.value = 'Error reading the file';
      isUploading.value = false;
    };
   
    reader.readAsText(file);
  } catch (err) {
    console.error("File upload error:", err);
    error.value = err.message;
    isUploading.value = false;
  }
};

const showKeywordManager = () => {
  // Refresh keywords from storage
  ignoredKeywords.value = keywordService.getIgnoredKeywords();
  keywordManagerVisible.value = true;
};

const addKeyword = () => {
  if (!newKeyword.value.trim()) return;
 
  const keyword = {
    id: Date.now(), // Simple unique ID
    keyword: newKeyword.value.trim(),
    active: true
  };
 
  ignoredKeywords.value.push(keyword);
  newKeyword.value = '';
};

const removeKeyword = (index) => {
  ignoredKeywords.value.splice(index, 1);
};

const saveKeywords = () => {
  keywordService.saveIgnoredKeywords(ignoredKeywords.value);
  keywordManagerVisible.value = false;
};
</script>
