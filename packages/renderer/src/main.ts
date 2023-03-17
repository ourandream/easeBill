import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css'       //theme
import 'primevue/resources/primevue.min.css'                //core css
import 'primeicons/primeicons.css'                           //icons
import 'primeflex/primeflex.css'
import router from './router';
import i18n from './i18n';
import confirmdialog from 'primevue/confirmdialog'
import confirmpopup from 'primevue/confirmpopup'
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
createApp(App)
  .use(PrimeVue, {
    locale: {
      clear: '清除',
      apply: '应用',
      dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      today: 'Today',
      weekHeader: 'Wk',
      firstDayOfWeek: 0,
      dateFormat: 'mm/dd/yy'
    }
  })
  .use(i18n)
  .use(router)
  .use(ToastService)
  .component('ConfirmDialog', confirmdialog)
  .component('ConfirmPopup', confirmpopup)
  .component('Toast', Toast)
  .mount('#app')

