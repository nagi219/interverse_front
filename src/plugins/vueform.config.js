import en from '@vueform/vueform/locales/en'
import zh_TW from '@vueform/vueform/locales/zh_TW'
import vueform from '@vueform/vueform/dist/vueform'
import { defineConfig } from '@vueform/vueform'
import axios from 'axios'

// You might place these anywhere else in your project
// import '@vueform/vueform/dist/vueform.css';
import '@/assets/custom_vueform_styles.css';

axios.defaults.headers.post = {
  'Content-Type': 'application/json'
}

export default defineConfig({
  axios,
  theme: vueform,
  locales: { en, zh_TW },
  locale: 'zh_TW',
})