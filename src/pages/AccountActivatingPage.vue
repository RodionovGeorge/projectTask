<template>
<q-page
  class="column items-center justify-center"
>
  <div
    class="content-shadow content-background account-recovery-page"
  >
    <p
      class="q-pb-none"
    >
      Ваш аккаунт необходимо активировать. После регистрации вам на почту был выслан код. Вы можете ввести его или
      запросить новый.
    </p>
    <q-input
      v-model="userSecretCode"
      ref="userSecretCode"
      label="Код из письма"
      :rules="[val => !!val.length || 'Пожалуйста, введите код из письма']"
      class="account-activating-field"
      outlined
    />
    <div
      style="display:flex; justify-content: space-between; width: 100%"
    >
      <q-btn
        label="Отправить код еще раз"
        no-caps
        flat
        @click="newCodeRequest"
      >
        <template
          v-slot:loading
        >
          <q-spinner
            :thickness="2"
          />
        </template>
      </q-btn>
      <q-btn
        label="Проверить код"
        no-caps
        :loading="codeSubmitted"
        @click="codeSubmit"
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
  </div>
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
  <q-dialog
    v-model="newCodeSuccessDialogShow"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card
      class="bg-green text-white"
      style="width: 300px"
    >
      <q-card-section>
        <div
          class="text-h6 text-center"
        >
          Успех
        </div>
      </q-card-section>

      <q-card-section
        class="q-pt-none text-center"
      >
        Код успешно отправлен!
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
  name: 'AccountActivatingPage',
  data () {
    return {
      codeSubmitted: false,
      errorDialogShow: false,
      newCodeSuccessDialogShow: false,
      userSecretCode: '',
      errorMessage: ''
    }
  },
  methods: {
    async codeSubmit () {
      const correctSecretCodeInput = this.$refs.userSecretCode.validate()
      if (correctSecretCodeInput) {
        this.secondStepSubmitting = true
        const data = {
          email: this.$store.state.userDataStore.userData.email,
          code: this.userSecretCode
        }
        const response = await fetch(Constants.SERVER_URL + '/api/account-activation', {
          method: 'PUT',
          headers: Constants.HEADERS,
          body: JSON.stringify(data)
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          if ('intervalLength' in responseData) {
            this.errorMessage = `С предыдущей попытки нужно подождать ${responseData.intervalLength / 60} м.`
            this.errorDialogShow = true
            this.secondStepSubmitting = false
          } else {
            throw new Error(responseData.message)
          }
        } else {
          await this.$store.dispatch('userDataStore/setAccountActivatedStatus', true)
          await this.$router.push('/')
          this.secondStepSubmitting = false
        }
      }
    },
    /* codeSubmit () {
      const correctSecretCodeInput = this.$refs.userSecretCode.validate()
      if (correctSecretCodeInput) {
        // Отправка данных на сервер
        this.secondStepSubmitting = true
        const data = {
          email: this.$store.state.userDataStore.userData.email,
          code: this.userSecretCode
        }
        fetch(Constants.SERVER_URL + '/api/account-activation', {
          method: 'PUT',
          headers: Constants.HEADERS,
          body: JSON.stringify(data)
        }).then(
          response => response.json()
        ).then(
          data => {
            if (data.message === 'success') {
              this.$store.dispatch('userDataStore/setAccountActivatedStatus', true)
              this.$router.push('/')
            } else {
              this.errorMessage = 'intervalLength' in data
                ? Constants.ERROR_MESSAGES[data.message](data.intervalLength)
                : Constants.ERROR_MESSAGES[data.message]
              this.errorDialogShow = true
            }
            this.secondStepSubmitting = false
          }
        )
      }
    }, */
    async newCodeRequest () {
      this.newCodeRequestSubmitting = true
      const response = await fetch(Constants.SERVER_URL + '/api/account-activation', {
        method: 'POST',
        headers: Constants.HEADERS,
        body: JSON.stringify({
          email: this.$store.state.userDataStore.userData.email
        })
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        if ('intervalLength' in responseData) {
          this.errorMessage = `С предыдущей попытки нужно подождать ${responseData.intervalLength / 60} м.`
          this.errorDialogShow = true
          this.newCodeRequestSubmitting = false
        } else {
          throw new Error(responseData.message)
        }
      } else {
        this.newCodeSuccessDialogShow = true
        this.newCodeRequestSubmitting = false
      }
    }
    /* newCodeRequest () {
      this.newCodeRequestSubmitting = true
      fetch(Constants.SERVER_URL + '/api/account-activation', {
        method: 'POST',
        headers: Constants.HEADERS,
        body: JSON.stringify({
          email: this.$store.state.userDataStore.userData.email
        })
      }).then(
        response => response.json()
      ).then(
        data => {
          if (data.message === 'success') {
            this.newCodeSuccessDialogShow = true
          } else {
            this.errorMessage = 'intervalLength' in data
              ? Constants.ERROR_MESSAGES[data.message](data.intervalLength)
              : Constants.ERROR_MESSAGES[data.message]
            this.errorDialogShow = true
          }
          this.newCodeRequestSubmitting = false
        }
      )
    } */
  },
  created () {
    this.newCodeRequest = exceptionHandlerDecorator.call(this, [this.newCodeRequest], 'newCodeRequestSubmitting')
    this.codeSubmit = exceptionHandlerDecorator.call(this, [this.codeSubmit], 'secondStepSubmitting')
  }
}
</script>

<style scoped>

</style>
