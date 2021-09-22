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
            v-on:keydown.enter.prevent="onEnter"
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
          style="width: 40%"
          flat
          no-caps
          label="Регистрация"
        />
        <q-btn
          to="/account-recovery"
          style="width: 55%"
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
          headers: Constants.HEADERS,
          body: JSON.stringify(data)
        }).then(
          response => response.json()
        ).then(
          /**
           * @param {Object} data - Объект, содержащий ответ сервера
           * @param {String} data.message - Краткое описание результата запроса
           * @param {String} data.csrfToken - CSRF токен
           * @param {Object} data.userData - Объект с информацией о пользователе
           * @param {Array} data.userData.roles - Массив ролей пользователя
           * @param {Number} data.userData.id - ID пользователя в базе данных
           * @param {String} data.userData.email - Электронная почта пользователя (логин)
           * @param {String} data.userData.avatarURL - URL аватара
           * @param {Boolean} data.userData.accountActivated - Пользователь активировал свой аккаунт? (Подтверждение почты)
           * @param {String} data.userData.firstName - Имя
           * @param {String} data.userData.middleName - Отчество
           * @param {String} data.userData.lastName - Фамилия
           */
          data => {
            if (data.message === 'success') {
              localStorage.setItem('csrfToken', data.csrfToken)
              this.$store.dispatch('userDataStore/setUserInformation', data.userData)
              if (data.userData.accountActivated) {
                this.$router.push('/')
              } else {
                this.$router.push('/account-activating')
              }
            } else {
              this.errorMessage = Constants.ERROR_MESSAGES[data.message]
              this.errorDialogShow = true
            }
            this.enterSubmitting = false
          }
        ).catch(
          () => {
            this.$router.push('/connection-error')
          }
        )
      }
    }
  }
}
</script>
