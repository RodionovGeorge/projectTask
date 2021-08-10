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
  ERROR_MESSAGES: {
    'account not found': 'Аккаунт не найден!',
    'time interval has not passed':
      intervalLength => 'С предыдущей попытки нужно подождать ' + intervalLength / 60 + ' м.',
    'wrong code': 'Неверный код.',
    'code expired': 'Код устарел. Пожалуйста, запросите новый код.',
    'wrong login': 'Пользователя с такой почтой не существует.',
    'wrong password': 'Неверный пароль.',
    'database error': 'Внутренняя ошибка сервера.',
    'SMTP error': 'Внутренняя ошибка сервера.',
    'incorrect email': 'Неправильный адрес почты.',
    'internal error': 'Внутренняя ошибка сервера.',
    'user already exists': 'Аккаунт с такой почтой уже существует'
  },
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
