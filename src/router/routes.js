
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/login', component: () => import('pages/Login.vue') },
      { path: '/my', component: () => import('pages/MainPage') },
      { path: '/my/task', component: () => import('pages/Task') },
      { path: '/my/newTask', component: () => import('pages/OpeningTaskPage') },
      { path: '/editTask', component: () => import('pages/EditPage') }
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
