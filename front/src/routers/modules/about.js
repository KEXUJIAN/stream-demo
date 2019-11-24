export default {
  path: '/about',
  name: 'about',
  meta: {
    title: "About-Router"
  },
  component: () => import(/* webpackChunkName: "about" */ '@/pages/About.vue')
}