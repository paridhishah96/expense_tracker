<script setup>
import { ref } from 'vue';
import csvParser from '../utils/csvParser.js'; // Make sure the path is correct

const emit = defineEmits(['file-parsed']);
const error = ref(null);

const expenses = await csvParser.parseCSVData(csvData);

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
        console.error(err);
      }
    };
   
    reader.onerror = () => {
      error.value = 'Error reading the file';
    };
   
    reader.readAsText(file);
  } catch (err) {
    error.value = err.message;
    console.error(err);
  }
};
</script>
