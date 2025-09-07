import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import './style.css'

// Import PrimeVue components you'll need
import Button from 'primevue/button'
import Card from 'primevue/card'
import FileUpload from 'primevue/fileupload'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext';

// Import PrimeVue styles
import 'primevue/resources/themes/lara-light-blue/theme.css' // theme
import 'primevue/resources/primevue.min.css' // core CSS
import 'primeicons/primeicons.css' // icons

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, { ripple: true })

// Register PrimeVue components
app.component('Button', Button)
app.component('Card', Card)
app.component('FileUpload', FileUpload)
app.component('Chart', Chart)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Dropdown', Dropdown)
app.component('InputText', InputText);


app.mount('#app')
