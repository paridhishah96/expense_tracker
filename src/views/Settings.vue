<template>
  <div>
    <Card class="mb-6">
      <template #title>Settings</template>
      <template #content>
        <p class="mb-4">
          Customize your expense tracker settings and preferences.
        </p>
      </template>
    </Card>
   
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <Card>
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-filter mr-2"></i>
              <span>Ignored Transaction Keywords</span>
            </div>
          </template>
          <template #content>
            <p class="text-gray-600 mb-4">
              Transactions containing these keywords will be automatically ignored when uploading CSV files.
              This is useful for filtering out transactions like "Payment Received" that you don't want to track.
            </p>
           
            <div class="mb-4">
              <div class="flex gap-2 mb-3">
                <InputText v-model="newKeyword" placeholder="Add new keyword" class="flex-grow" @keyup.enter="addKeyword" />
                <Button label="Add" icon="pi pi-plus" @click="addKeyword" />
              </div>
             
              <DataTable
                :value="ignoredKeywords"
                class="p-datatable-sm"
                :paginator="ignoredKeywords.length > 10"
                :rows="10"
              >
                <Column field="keyword" header="Keyword">
                  <template #body="slotProps">
                    <InputText v-model="slotProps.data.keyword" class="w-full p-inputtext-sm" />
                  </template>
                </Column>
                <Column header="Active" style="width:100px" bodyClass="text-center">
                  <template #body="slotProps">
                    <Checkbox v-model="slotProps.data.active" :binary="true" />
                  </template>
                </Column>
                <Column style="width:80px" bodyClass="text-center">
                  <template #body="slotProps">
                    <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="removeKeyword(slotProps.index)" />
                  </template>
                </Column>
              </DataTable>
            </div>
           
            <div class="flex justify-end">
              <Button label="Save Keywords" icon="pi pi-save" @click="saveKeywords" />
            </div>
          </template>
        </Card>
      </div>
     
      <div>
        <Card>
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-cog mr-2"></i>
              <span>General Settings</span>
            </div>
          </template>
          <template #content>
            <div class="mb-4">
              <label for="currency" class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <Dropdown
                id="currency"
                v-model="selectedCurrency"
                :options="currencies"
                optionLabel="name"
                optionValue="code"
                class="w-full"
              />
            </div>
           
            <div class="mb-4">
              <label for="dateFormat" class="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <Dropdown
                id="dateFormat"
                v-model="selectedDateFormat"
                :options="dateFormats"
                optionLabel="name"
                optionValue="format"
                class="w-full"
              />
            </div>
           
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <div class="flex gap-2">
                <div
                  class="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
                  :class="{'ring-2 ring-blue-500': selectedTheme === 'light'}"
                  style="background-color: #f8fafc"
                  @click="selectedTheme = 'light'"
                ></div>
                <div
                  class="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
                  :class="{'ring-2 ring-blue-500': selectedTheme === 'dark'}"
                  style="background-color: #1e293b"
                  @click="selectedTheme = 'dark'"
                ></div>
              </div>
            </div>
           
            <div class="flex justify-end">
              <Button label="Save Settings" icon="pi pi-save" @click="saveGeneralSettings" />
            </div>
          </template>
        </Card>
       
        <Card class="mt-6">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-database mr-2"></i>
              <span>Data Management</span>
            </div>
          </template>
          <template #content>
            <Button label="Export All Data" icon="pi pi-download" class="w-full mb-2" @click="exportAllData" />
            <Button label="Import Data" icon="pi pi-upload" class="w-full mb-2 p-button-outlined" @click="importData" />
            <Button label="Clear All Data" icon="pi pi-trash" class="w-full p-button-danger" @click="confirmClearData" />
           
            <input type="file" ref="fileInput" accept=".json" class="hidden" @change="onFileSelected">
          </template>
        </Card>
      </div>
    </div>
   
    <!-- Confirm Clear Data Dialog -->
    <Dialog v-model:visible="clearConfirmVisible" header="Clear All Data" :style="{width: '450px'}" :modal="true">
      <div class="p-fluid">
        <p class="text-red-600 font-medium mb-2">Warning: This action cannot be undone!</p>
        <p>All your expenses, categories, and settings will be permanently deleted.</p>
      </div>
     
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="clearConfirmVisible = false" />
        <Button label="Clear All Data" icon="pi pi-trash" class="p-button-danger" @click="clearAllData" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useExpenseStore } from '../stores/expenseStore';
import keywordService from '../services/keywordService';

const expenseStore = useExpenseStore();
const fileInput = ref(null);
const ignoredKeywords = ref([]);
const newKeyword = ref('');
const clearConfirmVisible = ref(false);

// General settings
const selectedCurrency = ref('USD');
const selectedDateFormat = ref('MM/dd/yyyy');
const selectedTheme = ref('light');

// Lists for dropdowns
const currencies = [
  { name: 'US Dollar', code: 'USD' },
  { name: 'Euro', code: 'EUR' },
  { name: 'British Pound', code: 'GBP' },
  { name: 'Canadian Dollar', code: 'CAD' },
  { name: 'Australian Dollar', code: 'AUD' },
  { name: 'Japanese Yen', code: 'JPY' }
];

const dateFormats = [
  { name: 'MM/DD/YYYY', format: 'MM/dd/yyyy' },
  { name: 'DD/MM/YYYY', format: 'dd/MM/yyyy' },
  { name: 'YYYY-MM-DD', format: 'yyyy-MM-dd' }
];

onMounted(() => {
  // Load ignored keywords
  ignoredKeywords.value = keywordService.getIgnoredKeywords();
});

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
  alert('Ignored keywords saved successfully!');
};

const saveGeneralSettings = () => {
  // In a real app, you would save these settings to localStorage or your state store
  alert('Settings saved successfully!');
};

const exportAllData = () => {
  const data = {
    expenses: expenseStore.expenses,
    categories: expenseStore.categories,
    recurringTransactions: expenseStore.recurringTransactions,
    ignoredKeywords: ignoredKeywords.value,
    settings: {
      currency: selectedCurrency.value,
      dateFormat: selectedDateFormat.value,
      theme: selectedTheme.value
    }
  };
 
  // Create and download JSON file
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const importData = () => {
  fileInput.value.click();
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;
 
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
     
      // Validate data structure
      if (!data.expenses || !data.categories) {
        throw new Error('Invalid data format');
      }
     
      // Import data to store
      expenseStore.importData(data);
     
      // Import keywords if available
      if (data.ignoredKeywords) {
        keywordService.saveIgnoredKeywords(data.ignoredKeywords);
        ignoredKeywords.value = data.ignoredKeywords;
      }
     
      alert('Data imported successfully!');
    } catch (error) {
      alert(`Error importing data: ${error.message}`);
    }
  };
  reader.readAsText(file);
};

const confirmClearData = () => {
  clearConfirmVisible.value = true;
};

const clearAllData = () => {
  expenseStore.clearAllData();
  ignoredKeywords.value = keywordService.getDefaultIgnoredKeywords();
  keywordService.saveIgnoredKeywords(ignoredKeywords.value);
  clearConfirmVisible.value = false;
  alert('All data has been cleared.');
};
</script>
