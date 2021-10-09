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
import { Constants, exceptionHandlerDecorator } from 'boot/Constants'

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
    async onEnter () {
      const correctLoginEnter = this.$refs.login.validate()
      const correctPasswordEnter = this.$refs.password.validate()
      if (correctLoginEnter && correctPasswordEnter) {
        this.enterSubmitting = true
        const requestData = {
          login: this.login,
          password: this.password
        }
        const response = await fetch(Constants.SERVER_URL + '/api/login', {
          method: 'POST',
          headers: Constants.HEADERS,
          body: JSON.stringify(requestData)
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          throw new Error(responseData.message)
        }
        localStorage.setItem('csrfToken', responseData.csrfToken)
        await this.$store.dispatch('userDataStore/setUserInformation', responseData.userData)
        responseData.userData.accountActivated
          ? await this.$router.push('/')
          : await this.$router.push('/account-activating')
        this.enterSubmitting = false
      }
    }
  },
  created () {
    this.onEnter = exceptionHandlerDecorator.call(this, [this.onEnter], 'enterSubmitting')
  }
}
</script>
