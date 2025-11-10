import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import VueProgressBar from "@aacassandra/vue3-progressbar";
import App from './App.vue'

const options = {
  color: "#7AC954",
  failedColor: "#CC421C",
  thickness: "5px",
  transition: {
    speed: "0.2s",
    opacity: "0.6s",
    termination: 300,
  },
  autoRevert: true,
  location: "top",
  inverse: false,
};

const app = createApp(App)
    .use(ElementPlus)
    .use(VueProgressBar, options)
    .use(router);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

export const eventBus = new Vue();

app.mount('#app');




