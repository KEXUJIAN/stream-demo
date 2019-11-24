export default {
  path: '/',
  name: 'home',
  meta: {
    title: "Router"
  },
  component: () => import(/* webpackChunkName: "home" */ '@/pages/Home.vue')
}