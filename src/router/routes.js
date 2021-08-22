
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      /* { path: '', component: () => import('pages/Index.vue') }, */
      { path: '/login', component: () => import('pages/Login.vue') },
      { path: '', component: () => import('pages/MainPage') },
      { path: '/my/task', component: () => import('pages/TaskS') },
      { path: '/task-opening', component: () => import('pages/OpeningTaskPage') },
      { path: '/editTask', component: () => import('pages/EditPage') },
      { path: '/my/Ttask', component: () => import('pages/TaskT') },
      { path: '/my/profile', component: () => import('pages/UserProfilePage') },
      { path: '/registration', component: () => import('pages/RegistrationPage') },
      { path: '/account-recovery', component: () => import('pages/ForgotPasswordPage') },
      { path: '/account-activating', component: () => import('pages/AccountActivatingPage') },
      { path: '/new-task', component: () => import('pages/NewTaskPage') },
      { path: '/server-error', component: () => import('pages/Error500') }
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
