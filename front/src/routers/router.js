import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const routesReq = require.context('./modules', false, /\.js$/);
const routes = [];
routesReq.keys().forEach(key => routes.push(routesReq(key).default))

const router = new Router({
  mode: 'history',
  base: '/',
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title && document.title !== to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;