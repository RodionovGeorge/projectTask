const Constants = {
  SERVER_URL: 'http://192.168.100.5',
  TASK_DISCIPLINES: [
    'Дискретная математика',
    'Алгебра и геометрия',
    'Математический анализ',
    'Математическая логика и теория алгоритмов'
  ],
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  PATHS_WITHOUT_AUTHENTICATION: [
    '/login',
    '/registration',
    '/account-recovery'
  ]
}
export default async ({ Vue }) => {
  Vue.prototype.$Constants = Constants
}
export { Constants }
