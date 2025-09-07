<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-800">Expense Tracker</h1>
        <nav>
          <ul class="flex space-x-4">
            <li>
              <router-link to="/" class="text-blue-600 hover:text-blue-800">Home</router-link>
            </li>
            <li>
              <router-link to="/dashboard" class="text-blue-600 hover:text-blue-800">Dashboard</router-link>
            </li>
            <li>
              <router-link to="/upload" class="text-blue-600 hover:text-blue-800">Upload</router-link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
   
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
   
    <footer class="bg-white border-t mt-10 py-4">
      <div class="container mx-auto px-4 text-center text-gray-500">
        Personal Expense Tracker &copy; {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useExpenseStore } from './stores/expenseStore';

const expenseStore = useExpenseStore();

onMounted(() => {
  expenseStore.loadInitialData();
});
</script>
