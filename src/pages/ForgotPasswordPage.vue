<template>
<q-page
  class="row items-center justify-center"
>
  <transition
    name="recall-password-component"
    mode="out-in"
  >
    <!-- First step: User enters an email -->
    <div
      class="column items-center q-gutter-y-sm content-background content-shadow account-recovery-page"
      v-if="step === 1"
      key="firstStep"
    >
      <p
        class="q-mb-none text-center"
      >
        Пожалуйста, введите свой адрес электронной почты, на который мы отправим код для восстановления
      </p>
      <q-input
        v-model="userEmail"
        ref="userEmail"
        label="Электронная почта"
        :rules="[val => !!val.length || 'Пожалуйста, введите адрес электронной почты']"
        class="account-recovery-field"
        outlined
      />
      <q-btn
        label="Отправить код"
        no-caps
        :loading="firstStepSubmitted"
        @click="onFirstStepClick"
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
    <!-- Second step: User enters code from his email -->
    <div
      class="column items-center q-gutter-y-sm content-background content-shadow account-recovery-page"
      v-if="step === 2"
      key="secondStep"
    >
      <p
        class="q-mb-none text-center"
      >
        Пожалуйста, введите код из письма, которое мы вам отправили (письма часто попадают в спам)
      </p>
      <q-input
        v-model="userCode"
        ref="userCode"
        label="Код из письма"
        maxlength="10"
        :rules="[val => !!val.length || 'Пожалуйста, введите код из письма']"
        class="account-recovery-field"
        outlined
      />
      <div
        style="display:flex; justify-content: space-between; width: 100%"
      >
        <q-btn
          label="Отправить код еще раз"
          :loading="newCodeRequestSubmitted"
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
          :loading="secondStepSubmitted"
          @click="onSecondStepClick"
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
    <!-- Third step: User enters the new password -->
    <div
      class="column items-center q-gutter-y-sm content-background content-shadow account-recovery-page"
      v-if="step === 3"
      key="thirdStep"
    >
      <p
        class="q-mb-none text-center"
      >
        Пожалуйста, введите новый пароль для своего аккаунта
      </p>
      <q-input
        v-model="userNewPassword"
        ref="userNewPassword"
        type="password"
        label="Новый пароль"
        maxlength="20"
        :rules="[val => !!val.length || 'Пожалуйста, введите новый пароль']"
        class="account-recovery-field"
        outlined
      />
      <q-btn
        label="Подтвердить"
        no-caps
        :loading="thirdStepSubmitted"
        @click="onThirdStepClick"
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
    <div
      class="column items-center q-gutter-y-sm content-background content-shadow account-recovery-page"
      v-if="step === 4"
      key="fourthStep"
    >
      <p
        class="q-mb-none text-center"
      >
        Пароль был успешно изменен!
      </p>
      <q-btn
        to="/login"
        label="На страницу авторизации"
        no-caps
        :loading="fourthStepSubmitted"
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
  </transition>
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
  name: 'ForgotPasswordPage',
  data () {
    return {
      step: 1,
      firstStepSubmitted: false,
      secondStepSubmitted: false,
      thirdStepSubmitted: false,
      fourthStepSubmitted: false,
      newCodeRequestSubmitted: false,
      newCodeSuccessDialogShow: false,
      errorDialogShow: false,
      errorMessage: '',
      userEmail: '',
      userCode: '',
      userNewPassword: ''
    }
  },
  methods: {
    async onFirstStepClick () {
      const correctUserEmailInput = this.$refs.userEmail.validate()
      if (correctUserEmailInput) {
        this.firstStepSubmitted = true
        const response = await fetch(Constants.SERVER_URL + '/api/recall-password', {
          method: 'POST',
          headers: Constants.HEADERS,
          body: JSON.stringify({
            email: this.userEmail
          })
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          if ('intervalLength' in responseData) {
            this.errorMessage = `С предыдущей попытки нужно подождать ${responseData.intervalLength / 60} м.`
            this.errorDialogShow = true
            this.firstStepSubmitted = false
          } else {
            throw new Error(responseData.message)
          }
        } else {
          this.step++
          this.firstStepSubmitted = false
        }
      }
    },
    async onSecondStepClick () {
      const correctUserCodeInput = this.$refs.userCode.validate()
      if (correctUserCodeInput) {
        this.secondStepSubmitted = true
        const response = await fetch(Constants.SERVER_URL + '/api/recall-password', {
          method: 'PUT',
          headers: Constants.HEADERS,
          body: JSON.stringify({
            email: this.userEmail,
            code: this.userCode
          })
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          if ('intervalLength' in responseData) {
            this.errorMessage = `С предыдущей попытки нужно подождать ${responseData.intervalLength / 60} м.`
            this.errorDialogShow = true
            this.secondStepSubmitted = false
          } else {
            throw new Error(responseData.message)
          }
        } else {
          this.step++
          this.secondStepSubmitted = false
        }
      }
    },
    async onThirdStepClick () {
      const correctUserNewPasswordInput = this.$refs.userNewPassword.validate()
      if (correctUserNewPasswordInput) {
        this.thirdStepSubmitted = true
        const response = await fetch(Constants.SERVER_URL + '/api/change-password', {
          method: 'PUT',
          headers: Constants.HEADERS,
          body: JSON.stringify({
            email: this.userEmail,
            code: this.userCode,
            password: this.userNewPassword
          })
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          if ('intervalLength' in responseData) {
            this.errorMessage = `С предыдущей попытки нужно подождать ${responseData.intervalLength / 60} м.`
            this.errorDialogShow = true
            this.thirdStepSubmitted = false
          } else {
            throw new Error(responseData.message)
          }
        } else {
          this.step++
          this.thirdStepSubmitted = false
        }
      }
    },
    async newCodeRequest () {
      this.newCodeRequestSubmitted = true
      const response = await fetch(Constants.SERVER_URL + '/api/recall-password', {
        method: 'POST',
        headers: Constants.HEADERS,
        body: JSON.stringify({
          email: this.userEmail
        })
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        if ('intervalLength' in responseData) {
          this.errorMessage = `С предыдущей попытки нужно подождать ${responseData.intervalLength / 60} м.`
          this.errorDialogShow = true
          this.newCodeRequestSubmitted = false
        } else {
          throw new Error(responseData.message)
        }
      } else {
        this.newCodeSuccessDialogShow = true
        this.newCodeRequestSubmitted = false
      }
    }
  },
  created () {
    this.onFirstStepClick = exceptionHandlerDecorator.call(this, [this.onFirstStepClick], 'firstStepSubmitted')
    this.onSecondStepClick = exceptionHandlerDecorator.call(this, [this.onSecondStepClick], 'secondStepSubmitted')
    this.onThirdStepClick = exceptionHandlerDecorator.call(this, [this.onThirdStepClick], 'thirdStepSubmitted')
    this.newCodeRequest = exceptionHandlerDecorator.call(this, [this.newCodeRequest], 'newCodeRequestSubmitted')
  }
}
</script>

<style scoped>

</style>
