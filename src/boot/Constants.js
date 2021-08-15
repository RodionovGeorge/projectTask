// Себе на будущее подумал:
// Если API не снимает session-token в cookie, то
// Фрон не может снять CSRF токен

// Еще: на /server-error отправлять только при маршрутизации между страницами
// На отклонение действий на самой странице показывать всплывающие окна
// При этом /server-error имеет приоритет при маршрутизации (проходит без всяких приверок)

const Constants = {
  SERVER_URL: 'http://localhost',
  TASK_DISCIPLINES: [
    'Дискретная математика',
    'Алгебра и геометрия',
    'Математический анализ',
    'Математическая логика и теория алгоритмов'
  ],
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
    'Internal Server Error': 'Внутренняя ошибка сервера.',
    'user already exists': 'Аккаунт с такой почтой уже существует'
  },
  PATHS_WITHOUT_AUTHENTICATION: [
    '/login',
    '/registration',
    '/account-recovery'
  ],
  GET_INIT: {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json; */*; q=0.01',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache'
    }
  },
  HEADERS: {
    'Content-Type': 'application/json; charset=UTF-8',
    Accept: 'application/json; */*; q=0.01'
  },
  DEV_MODE: true
}

export default async ({ Vue }) => {
  Vue.prototype.$Constants = Constants
}
export { Constants }
