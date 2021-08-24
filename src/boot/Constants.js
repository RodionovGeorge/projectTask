// Себе на будущее подумал:
// Если API не снимает session-token в cookie, то
// Фрон не может снять CSRF токен

// Еще: на /server-error отправлять только при маршрутизации между страницами
// На отклонение действий на самой странице показывать всплывающие окна
// При этом /server-error имеет приоритет при маршрутизации (проходит без всяких приверок)

// Еще: Магические константы на размер одного pdf для раскраски учителями: 793 на 1221

// Еще: На каждый опасный для данных запрос не забыть обновить CSRF токен (когда уже авторизован)

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
    'user already exists': 'Аккаунт с такой почтой уже существует.',
    'tex conversion failed': 'Не удалось преобразовать ваш tex-файл в PDF.',
    'user is not a teacher': 'У вас нет роли преподавателя.',
    'problem deleted': 'Задача была удалена.',
    'incorrect request': 'Некорректный запрос.',
    'not author': 'Вы не являетесь автором этой задачи.',
    'problem not found': 'Задача не найдена.',
    'not admin': 'Вы не являетесь администратором.',
    'problem already admitted': 'Проблема уже была оценена'
  },
  PATHS_WITHOUT_AUTHENTICATION: [
    '/login',
    '/registration',
    '/account-recovery'
  ],
  ERROR_PATHS: [
    '/server-error',
    '/connection-error'
  ],
  ROWS_PER_PAGE: 3,
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
  DEV_MODE: false,
  DIFFICULTY_LEVELS: [
    'Простая',
    'Средняя',
    'Сложная'
  ]
}

function toBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

function toLocalDate (UTCDate) {
  const date = new Date(UTCDate)
  let day = date.getDate()
  let month = date.getMonth() + 1
  day = (day < 10 ? '0' : '') + day.toString()
  month = (month < 10 ? '0' : '') + month.toString()
  return day + '.' + month + '.' + date.getFullYear().toString()
}

export default async ({ Vue }) => {
  Vue.prototype.$Constants = Constants
}
export { Constants, toBase64, toLocalDate }
