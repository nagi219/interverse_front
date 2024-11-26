import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import { handleRedirect } from '@/plugins/axios'; // 攔截器
        handleRedirect(router);
import FontAwesomeIcon from './plugins/fontawesome'
import Vueform from '@vueform/vueform'
import vueformConfig from './plugins/vueform.config'
import naive from 'naive-ui'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
    .use(pinia)
    .use(router)
    .use(Vueform, vueformConfig)
    .use(naive)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount('#app')