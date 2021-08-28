import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index'

import routes from './routes'
import { Constants } from 'boot/Constants'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach(async (to, from, next) => {
    // Если все в порядке - то все в порядке
    // Если на сервере произошла ошибка (упала база или в токене неверный пароль)
    // то сервер сбросит cookie
    // а маршрутизатор сбросит CSRF токен
    if (!Constants.DEV_MODE) {
      if (!Constants.ERROR_PATHS.includes(to.path)) {
        try {
          const response = await fetch(Constants.SERVER_URL + '/api/authentication-check', Constants.GET_INIT)
          const data = await response.json()
          if (data.message === 'success') {
            if (Constants.PATHS_WITHOUT_AUTHENTICATION.includes(to.path)) {
              next('/')
            } else {
              if (!data.accountActivated) {
                to.path === '/account-activating' ? next() : next('/account-activating')
              } else {
                to.path === '/account-activating' ? next('/') : next()
              }
            }
          } else {
            if (!Constants.PATHS_WITHOUT_AUTHENTICATION.includes(to.path)) {
              localStorage.removeItem('csrfToken')
              await store().dispatch('userDataStore/dropUserInformation')
              next('/login')
            } else {
              next()
            }
          }
        } catch (err) {
          next('/connection-error')
        }
      } else {
        next()
      }
    } else {
      next()
    }
  })

  return Router
}
