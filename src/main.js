import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import axios from 'axios'

import VueRouter from 'vue-router'
import routes from './router/index'



Vue.use(ElementUI)
Vue.use(VueRouter)

Vue.prototype.$ajax= axios


const router = new VueRouter({
  routes
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})


//test