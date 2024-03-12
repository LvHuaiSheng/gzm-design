import {createApp} from 'vue'

import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
// CSS
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'
import './style.less'
import './mock';
import '@/utils/request';
// 额外引入图标库
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import IconFontPlugin from './plugins/iconFontPlugin';

import {createCore} from '@/views/Editor/core'
const core = createCore()
import { myPlugin } from '@/views/testPlugin'
core.use(myPlugin)
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ArcoVue);
app.use(core)
app.use(ArcoVueIcon);
app.use(IconFontPlugin);
app.mount('#app')
