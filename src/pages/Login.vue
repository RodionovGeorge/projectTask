<template>
  <q-page
    class="row justify-center items-center"
  >
    <q-card
      square
      style="width:300px"
      class="content-background content-shadow"
    >
      <q-card-section>
        <h5
          class="q-pa-none q-ma-none text-center"
        >
          Войти
        </h5>
        <div
          class="q-gutter-y-sm"
        >
          <q-input
            v-model="login"
            ref="login"
            outlined
            label="Почта"
            :rules="[value=>value.length > 0 || 'Пожалуйста, введите почту']"
          />
          <q-input
            v-model="password"
            ref="password"
            outlined
            type="password"
            label="Пароль"
            :rules="[value=>value.length > 0 || 'Пожалуйста, введите пароль']"
          />
          <q-btn
            unelevated
            outline
            class="full-width"
            label="Вход"
            :loading="enterSubmitting"
            @click="onEnter"
          >
            <template
              v-slot:loading
            >
              <q-spinner
                :thickness="2"
              />
            </template>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section
        class="q-pt-none q-gutter-y-xs row justify-center"
      >
        <q-btn
          to="/registration"
          flat
          no-caps
          label="Регистрация"
        />
        <q-btn
          to="/account-recovery"
          flat
          no-caps
          label="Забыли пароль?"
        >
        </q-btn>
      </q-card-section>
    </q-card>
    <q-dialog
      v-model="errorDialogShow"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        class="bg-red text-white"
        style="width: 300px"
      >
        <q-card-section>
          <div
            class="text-h6 text-center"
          >
            Ошибка
          </div>
        </q-card-section>

        <q-card-section
          class="q-pt-none text-center"
        >
          {{errorMessage}}
        </q-card-section>

        <q-card-actions
          align="center"
          class="bg-white text-black"
        >
          <q-btn
            flat
            label="OK"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Constants } from 'boot/Constants'

export default {
  name: 'pageLogin',
  data () {
    return {
      enterSubmitting: false,
      errorDialogShow: false,
      errorMessage: '',
      login: '',
      password: ''
    }
  },
  methods: {
    onEnter () {
      const correctLoginEnter = this.$refs.login.validate()
      const correctPasswordEnter = this.$refs.password.validate()
      if (correctLoginEnter && correctPasswordEnter) {
        this.enterSubmitting = true
        const data = {
          login: this.login,
          password: this.password
        }
        fetch(Constants.SERVER_URL + '/api/login', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(response => {
          if (!response.ok) {
            switch (response.status) {
              case 403:
                this.errorMessage = 'Неверный логин или пароль!'
                break
              default:
                this.errorMessage = 'Внутренняя ошибка сервера!'
                break
            }
            this.errorDialogShow = true
            this.enterSubmitting = false
          } else {
            return response.json()
          }
        }).then(
          /**
           * @param {Object} data - Информация о текущем пользователе с сервера
           * @param {Array} data.roles - Массив ролей пользователя
           * @param {Boolean} data.isAdmin - Пользователь является администратором?
           * @param {Number} data.id - ID пользователя в базе данных
           * @param {String} data.email - Электронная почта пользователя (логин)
           * @param {String} data.avatarURL - URL аватара
           * @param {Boolean} data.accountActivated - Пользователь активировал свой аккаунт? (Подтверждение почты)
           * @param {String} data.firstName - Имя
           * @param {String} data.middleName - Отчество
           * @param {String} data.lastName - Фамилия
           * @param {String} data.accessToken - Токен аутентификации пользователя
           */
          data => {
            if (data !== undefined) {
              const userData = {
                roles: data.roles,
                isAdmin: data.isAdmin,
                id: data.id,
                email: data.email,
                avatarURL: data.avatarURL,
                accountActivated: data.accountActivated,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName
              }
              this.$store.dispatch('userDataStore/setUserInformation', userData)
              localStorage.setItem(Constants.ACCESS_TOKEN, data.accessToken)
              this.enterSubmitting = false
              this.$router.push('/')
            }
          }
        )
      }
    }
  }
}
</script>
