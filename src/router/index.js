import Vue from 'vue'
import Router from 'vue-router'
import DataSearch from '@/components/DataSearch'
import MyArticles from '@/components/MyArticles'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'DataSearch',
      component: DataSearch
    },
    {
      path: '/my-articles',
      name: 'MyArticles',
      component: MyArticles
    }
  ]
})
