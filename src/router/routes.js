import { Constants } from 'boot/Constants'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      /* { path: '', component: () => import('pages/Index.vue') }, */
      { path: '/login', component: () => import('pages/Login.vue') },
      { path: '', component: () => import('pages/MainPage') },
      { path: '/my/task', component: () => import('pages/TaskS') },
      { path: '/task-opening/:task_id', component: () => import('pages/OpeningTaskPage') },
      { path: '/editTask', component: () => import('pages/EditPage') },
      { path: '/my/Ttask', component: () => import('pages/TaskT') },
      { path: '/my/profile', component: () => import('pages/UserProfilePage') },
      { path: '/registration', component: () => import('pages/RegistrationPage') },
      { path: '/account-recovery', component: () => import('pages/ForgotPasswordPage') },
      { path: '/account-activating', component: () => import('pages/AccountActivatingPage') },
      { path: '/new-task', component: () => import('pages/NewTaskPage') },
      { path: '/connection-error', component: () => import('pages/ConnectionErrorPage') },
      { path: '/server-error', component: () => import('pages/Error500') },
      {
        path: '/task-opening',
        component: () => import('pages/OpeningTaskTablePage'),
        beforeEnter: async (to, from, next) => {
          if (!Constants.DEV_MODE) {
            try {
              const response = await fetch(Constants.SERVER_URL + '/api/admin-status-check', Constants.GET_INIT)
              const data = await response.json()
              if (data.message === 'success') {
                if (data.adminCheck) {
                  next()
                } else {
                  next(false)
                }
              } else {
                next(false)
              }
            } catch (e) {
              next('/connection-error')
            }
          } else {
            next()
          }
        }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
