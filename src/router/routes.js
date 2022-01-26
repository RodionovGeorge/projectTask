import { roleCheckDecorator } from 'boot/Constants'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      /* { path: '', component: () => import('pages/Index.vue') }, */
      { path: '/login', component: () => import('pages/Login.vue') },
      { path: '', component: () => import('pages/MainPage') },
      {
        path: '/task-opening/:task_id',
        component: () => import('pages/OpeningTaskPage'),
        beforeEnter: roleCheckDecorator('Администратор', 'Помощник администратора')
      },
      {
        path: '/check-attempt/:task_id/:session_id/:attempt_id',
        component: () => import('pages/EditPage'),
        beforeEnter: roleCheckDecorator('Учитель')
      },
      { path: '/my/tasks', component: () => import('pages/AllUserTasks') },
      { path: '/help/:mode', component: () => import('pages/EntireHelp') },
      { path: '/admin/help/:mode', component: () => import('pages/AdminEntireHelp') },
      { path: '/task/:task_id', component: () => import('pages/UserTaskPage') },
      /* { path: '/my/profile', component: () => import('pages/UserProfilePage') }, */
      { path: '/registration', component: () => import('pages/RegistrationPage') },
      { path: '/account-recovery', component: () => import('pages/ForgotPasswordPage') },
      { path: '/account-activating', component: () => import('pages/AccountActivatingPage') },
      {
        path: '/new-task',
        component: () => import('pages/NewTaskPage'),
        beforeEnter: roleCheckDecorator('Учитель')
      },
      {
        path: '/admin',
        component: () => import('pages/AdminTablePage'),
        beforeEnter: roleCheckDecorator('Администратор', 'Помощник администратора')
      },
      {
        path: '/admin/user/:user_id',
        component: () => import('pages/AdminUserProblemTable'),
        beforeEnter: roleCheckDecorator('Администратор', 'Помощник администратора')
      },
      {
        path: '/admin/task/:task_id/:session_id',
        component: () => import('pages/AdminTaskPage'),
        beforeEnter: roleCheckDecorator('Администратор', 'Помощник администратора')
      },
      { path: '/connection-error', component: () => import('pages/ConnectionErrorPage') },
      { path: '/server-error', component: () => import('pages/Error500') },
      { path: '/permission-error', component: () => import('pages/Error403') },
      {
        path: '/task-opening',
        component: () => import('pages/OpeningTaskTablePage'),
        beforeEnter: roleCheckDecorator('Администратор', 'Помощник администратора')
      },
      { path: '/error-400', component: () => import('pages/Error400') },
      { path: '*', component: () => import('pages/Error404.vue') }
    ]
  }
]

export default routes
