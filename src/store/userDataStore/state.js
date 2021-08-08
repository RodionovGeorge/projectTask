
export default function () {
  return {
    /**
     * @param {Object} userData - Объект с данными о текущем пользователе
     * @param {Array[]} roles - Массив строк, где каждая строка роль пользователя
     * @param {String} email - Адрес электронной почты текущего пользователя
     * @param {Boolean} isAdmin - Флаг, который показывает, является ли пользователь администратором
     * @param {Number} id - Уникальный ID пользователя в БД
     * @param {String} avatarURL - URL аватарки пользователя
     * @param {Boolean} accountActivated - Флаг, который показывает, подтвердил ли пользователь почту
     * @param {String} firstName - Имя пользователя
     * @param {String} middleName - Отчество пользователя
     * @param {String} lastName - Фамилия пользователя
     */
    userData: null
  }
}
