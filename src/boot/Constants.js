// Себе на будущее подумал:
// Если API не снимает session-token в cookie, то
// Фронт не может снять CSRF токен

// Еще: на /server-error отправлять только при маршрутизации между страницами
// На отклонение действий на самой странице показывать всплывающие окна
// При этом /server-error имеет приоритет при маршрутизации (проходит без всяких приверок)

// Еще: Магические константы на размер одного pdf для раскраски учителями: 794 на 1224

// Еще: На каждый опасный для данных запрос не забыть обновить CSRF токен (когда уже авторизован)

const AT_404 = '/error-404'

const Constants = {
  SERVER_URL: 'http://192.168.100.5',
  TASK_DISCIPLINES: [
    'Дискретная математика',
    'Алгебра и геометрия',
    'Математический анализ',
    'Математическая логика и теория алгоритмов'
  ],
  LENGTHS: {
    commentaryToProblem: 400,
    commentaryToTeacherFeedback: 400
  },
  SOLUTION_DEGREES: [
    {
      label: 'Пока не решена',
      value: 'Пока не решена'
    },
    {
      label: 'Есть идея',
      value: 'Есть идея'
    },
    {
      label: 'Почти решена',
      value: 'Почти решена'
    },
    {
      label: 'Полностью решена',
      value: 'Полностью решена'
    }
  ],
  /*
    Ошибки ниже являются сообщениями, которые могут прийти с сервера или возникнуть при работе некоторых компонентов.
    Если путь стоит 'error-400', то для всех ошибок, кроме 'bad request', это путь-заглушка.
    При нормальном функционировании клиент-серверного взаимодействия при инициализации страниц
    прийти с ответом сервера не может.
   */
  ERROR_MESSAGES: {
    'account not found': { message: 'Аккаунт не найден!', path: AT_404 },
    // 'time interval has not passed' Эта ошибка обрабатывается отдельно прямо в компонентах
    'wrong code': { message: 'Неверный код.', path: '/error-400' },
    'code expired': { message: 'Код устарел. Пожалуйста, запросите новый код.', path: '/error-400' },
    'wrong login': { message: 'Пользователя с такой почтой не существует.', path: '/error-400' },
    'wrong password': { message: 'Неверный пароль.', path: '/error-400' },
    'database error': { message: 'Внутренняя ошибка сервера.', path: '/server-error' },
    'SMTP error': { message: 'Внутренняя ошибка сервера.', path: '/server-error' },
    'incorrect email': { message: 'Неправильный адрес почты.', path: '/error-400' },
    'internal error': { message: 'Внутренняя ошибка сервера.', path: '/server-error' },
    'Internal Server Error': { message: 'Внутренняя ошибка сервера.', path: '/server-error' },
    'user already exists': { message: 'Аккаунт с такой почтой уже существует.', path: '/error-400' },
    'tex conversion failed': { message: 'Не удалось преобразовать ваш tex-файл в PDF.', path: '/error-400' },
    'user is not a teacher': { message: 'У вас нет роли преподавателя.', path: '/permission-error' },
    'problem deleted': { message: 'Задача была удалена.', path: AT_404 },
    'incorrect request': { message: 'Некорректный запрос.', path: '/error-400' },
    'not author': { message: 'Вы не являетесь автором этой задачи.', path: '/permission-error' },
    'problem not found': { message: 'Задача не найдена.', path: AT_404 },
    'not admin': { message: 'Вы не являетесь администратором.', path: '/permission-error' },
    'problem already admitted': { message: 'Проблема уже была оценена.', path: '/error-400' },
    'permission denied': { message: 'Нет доступа.', path: '/permission-error' },
    'need authentication': { message: 'Ошибка авторизации. Пожалуйста, перезайдите на сайт.', path: '/login' },
    // Ошибка ниже вообще не может прийти с сервера. Путь на всякий случай
    'file preparing error': { message: 'Не удалось подготовить ваш файл к передаче.', path: '/error-400' },
    'commentary not found': { message: 'Комментарий не найден.', path: AT_404 },
    'attempt already checked': { message: 'Попытка уже была проверена.', path: '/error-400' },
    'pdf creating failed': { message: 'Не удалось обработать проверенное решение.', path: '/server-error' },
    'Failed to fetch': { message: 'Нет соединения.', path: '/connection-error' },
    'session not found': { message: 'Ученик не найден. Возможно попытка была удалена.', path: AT_404 },
    'user not found': { message: 'Пользователь не найден.', path: AT_404 },
    'user already admin': { message: 'У пользователя может быть или администратором, или его помощником.', path: '/error-400' },
    'session status not found': { message: 'Такой статус не найден', path: AT_404 }
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

/*
  Декоратор, который призван обрабатывать исключения, которые будут выбрасывать обработчики разных событий
  В качестве аргументов ожидает:
  Массив, состоящий из следующей тройки:
    Первым аргументов идет сама функция. Она будет вызвана как метод компонента, с которым будет связан сам декоратор
      при вызове
    Вторым аргументов идет флаг. Если он true, то это означает, что ошибки следует обрабатывать перенаправлением по
      соответствующему ошибке пути. В противном случае ожидается наличия в компоненте двух переменных:
      errorMessage и errorDialogShow. В первую из них будет записано соответствующее сообщение об ошибке. Вторая
      отвечает за отображение диалогового окна
    Третьим идет объект для расширения стандартного набора исключений. Этот объект должен отображать сообщение в
      исключении на обработчик. Обработчик также будет вызван как метод компонента.
   Псевдомассив флагов, который необходим для корректной работы интерфейса
 */
function exceptionHandlerDecorator ([f, redirectingMode = false, customHandlers = {}], ...flags) {
  return async (...args) => {
    try {
      // console.log(f)
      await f.call(this, ...args)
    } catch (e) {
      console.log(e)
      for (const flag of flags) {
        this[flag] = false
      }
      if (e.message in customHandlers) {
        await customHandlers[e.message].call(this, e)
      } else if (e.message in Constants.ERROR_MESSAGES) {
        if (redirectingMode) {
          await this.$router.push(Constants.ERROR_MESSAGES[e.message].path)
        } else {
          this.errorMessage = Constants.ERROR_MESSAGES[e.message].message
          this.errorDialogShow = true
        }
      } else {
        throw e
      }
    }
  }
}

function toBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('file preparing error'))
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

function roleCheckDecorator (...roles) {
  return async function (to, from, next) {
    if (!Constants.DEV_MODE) {
      try {
        const getParameters = new URLSearchParams()
        for (let i = 0; i < roles.length; i++) {
          getParameters.append('r' + i, roles[i])
        }
        const response = await fetch(Constants.SERVER_URL + '/api/role-check?' + getParameters.toString(), Constants.GET_INIT)
        const data = await response.json()
        if (data.message === 'success') {
          if (data.roleCheck) {
            next()
          } else {
            next('/permission-error')
          }
        } else {
          next('/server-error')
        }
      } catch (e) {
        next('/connection-error')
      }
    } else {
      next()
    }
  }
}

export default async ({ Vue }) => {
  Vue.prototype.$Constants = Constants
}
export { Constants, toBase64, toLocalDate, roleCheckDecorator, exceptionHandlerDecorator }
