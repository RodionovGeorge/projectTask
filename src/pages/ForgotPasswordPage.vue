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
        Пожалуйста, введите код из письма, которое мы вам отправили
      </p>
      <q-input
        v-model="userCode"
        ref="userCode"
        label="Код из письма"
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
import { Constants } from 'boot/Constants'

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
    onFirstStepClick () {
      const correctUserEmailInput = this.$refs.userEmail.validate()
      if (correctUserEmailInput) {
        this.firstStepSubmitted = true
        fetch(Constants.SERVER_URL + '/api/account/recall-password', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.userEmail
          })
        }).then(
          response => response.json()
        ).then(
          data => {
            if (data.message === 'success' || data.message === 'time interval has not passed') {
              this.step++
            } else {
              this.errorMessage = 'intervalLength' in data
                ? Constants.ERROR_MESSAGES[data.message](data.intervalLength)
                : Constants.ERROR_MESSAGES[data.message]
              this.errorDialogShow = true
            }
            this.firstStepSubmitted = false
          }
        )
      }
    },
    // !!!!
    // Заменить адрес отправки на нормальный
    // Заменить метод на PUT
    onSecondStepClick () {
      const correctUserCodeInput = this.$refs.userCode.validate()
      if (correctUserCodeInput) {
        this.secondStepSubmitted = true
        fetch(Constants.SERVER_URL + '/api/account/TMPrecall-password', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.userEmail,
            code: this.userCode
          })
        }).then(
          response => response.json()
        ).then(
          data => {
            if (data.message === 'success') {
              this.step++
            } else {
              this.errorMessage = 'intervalLength' in data
                ? Constants.ERROR_MESSAGES[data.message](data.intervalLength)
                : Constants.ERROR_MESSAGES[data.message]
              this.errorDialogShow = true
            }
            this.secondStepSubmitted = false
          }
        )
      }
    },
    onThirdStepClick () {
      const correctUserNewPasswordInput = this.$refs.userNewPassword.validate()
      if (correctUserNewPasswordInput) {
        this.thirdStepSubmitted = true
        fetch(Constants.SERVER_URL + '/api/account/change-password', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.userEmail,
            password: this.userNewPassword
          })
        }).then(
          response => response.json()
        ).then(
          data => {
            if (data.message === 'success') {
              this.step++
            } else {
              this.errorMessage = 'intervalLength' in data
                ? Constants.ERROR_MESSAGES[data.message](data.intervalLength)
                : Constants.ERROR_MESSAGES[data.message]
              this.errorDialogShow = true
            }
            this.thirdStepSubmitted = false
          }
        )
      }
    },
    newCodeRequest () {
      this.newCodeRequestSubmitted = true
      fetch(Constants.SERVER_URL + '/api/account/recall-password', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.userEmail
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
          this.newCodeRequestSubmitted = false
        }
      )
    }
  }
}
</script>

<style scoped>

</style>
