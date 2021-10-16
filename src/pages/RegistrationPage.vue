<template>
<q-page
  class="column items-center justify-center"
>
  <transition
    name="registration-component"
    mode="out-in"
  >
    <div
      class="column items-center content-background content-shadow registration-page q-gutter-y-sm q-pa-xs"
      v-if="step === 1"
      key="firstStep"
    >
      <div
        class="text-h6"
      >
        Регистрация
      </div>
      <q-input
        v-model="userLastName"
        ref="userLastName"
        label="Фамилия"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите вашу фамилию']"
        maxlength="40"
        class="registration-field"
      />
      <q-input
        v-model="userFirstName"
        ref="userFirstName"
        label="Имя"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите ваше имя']"
        maxlength="40"
        class="registration-field"
      />
      <q-input
        v-model="userMiddleName"
        ref="userMiddleName"
        label="Отчество"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите ваше отчество']"
        maxlength="40"
        class="registration-field"
      />
      <q-input
        v-model="userEmail"
        ref="userEmail"
        label="Электронная почта"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите ваш email', val => val.length < 50 || 'Пароль слишком длинный!']"
        class="registration-field"
      />
      <q-input
        v-model="userPassword"
        ref="userPassword"
        label="Пароль"
        outlined
        type="password"
        :rules="[val => !!val || 'Пожалуйста, введите пароль']"
        maxlength="20"
        class="registration-field"
      />
      <q-input
        v-model="userGroup"
        outlined
        unmasked-value
        mask="####"
        :rules="[val => val.length === 4 || 'Номер группы состоит из 4 символов']"
        label="Учебная группа (если есть)"
        class="registration-field"
      />
      <q-btn
        label="Зарегистрироваться"
        type="submit"
        no-caps
        :loading="firstStepSubmitting"
        @click="onFirstStepClick"
      >
        <template
          v-slot:loading
        >
          <q-spinner-hourglass/>
        </template>
      </q-btn>
    </div>
    <div
      class="column items-center content-background content-shadow registration-page q-gutter-y-sm"
      v-else
      key="secondStep"
    >
      <p
        class="text-center q-mb-none q-mt-sm"
      >
        Мы отправили вам на почту проверочный код. Пожалуйста, введите его в строчку ниже.
      </p>
      <q-input
        v-model="userSecretCode"
        ref="userSecretCode"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите проверочный код']"
        label="Код из письма"
        maxlength="10"
        class="registration-field"
      />
      <div
        style="display:flex; justify-content: space-between; width: 100%"
      >
        <q-btn
          label="Отправить код еще раз"
          no-caps
          flat
          :loading="newCodeRequestSubmitting"
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
          label="Подтвердить почту"
          type="submit"
          :loading="secondStepSubmitting"
          no-caps
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
  </transition>
  <!-- Всплывающее окно о различных ошибках -->
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
  <!-- Всплывающее окно о успешной отправке нового кода -->
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
  name: 'RegistrationPage',
  data () {
    return {
      step: 1,
      firstStepSubmitting: false,
      secondStepSubmitting: false,
      newCodeRequestSubmitting: false,
      newCodeSuccessDialogShow: false,
      errorDialogShow: false,
      errorMessage: '',
      userLastName: '',
      userFirstName: '',
      userMiddleName: '',
      userEmail: '',
      userGroup: '',
      userPassword: '',
      userSecretCode: ''
    }
  },
  methods: {
    async onFirstStepClick () {
      const correctLastNameInput = this.$refs.userLastName.validate()
      const correctMiddleNameInput = this.$refs.userMiddleName.validate()
      const correctFirstNameInput = this.$refs.userFirstName.validate()
      const correctEmailInput = this.$refs.userEmail.validate()
      const correctPasswordInput = this.$refs.userPassword.validate()
      if (correctLastNameInput && correctMiddleNameInput && correctFirstNameInput && correctEmailInput && correctPasswordInput) {
        this.firstStepSubmitting = true
        const requestData = {
          lastName: this.userLastName,
          firstName: this.userFirstName,
          middleName: this.userMiddleName,
          email: this.userEmail,
          group: this.userGroup,
          password: this.userPassword
        }
        const response = await fetch(Constants.SERVER_URL + '/api/registration', {
          method: 'POST',
          headers: Constants.HEADERS,
          body: JSON.stringify(requestData)
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          throw new Error(responseData.message)
        }
        this.step++
        this.firstStepSubmitting = false
      }
    },
    async onSecondStepClick () {
      const correctSecretCodeInput = this.$refs.userSecretCode.validate()
      if (correctSecretCodeInput) {
        this.secondStepSubmitting = true
        const requestData = {
          email: this.userEmail,
          code: this.userSecretCode
        }
        const response = await fetch(Constants.SERVER_URL + '/api/account-activation', {
          method: 'PUT',
          headers: Constants.HEADERS,
          body: JSON.stringify(requestData)
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
          await this.$router.push('/login')
          this.secondStepSubmitting = false
        }
      }
    },
    async newCodeRequest () {
      this.newCodeRequestSubmitting = true
      const response = await fetch(Constants.SERVER_URL + '/api/account-activation', {
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
          this.newCodeRequestSubmitting = false
        } else {
          throw new Error(responseData.message)
        }
      } else {
        this.newCodeSuccessDialogShow = true
        this.newCodeRequestSubmitting = false
      }
    }
  },
  created () {
    this.onFirstStepClick = exceptionHandlerDecorator.call(this, [this.onFirstStepClick], 'firstStepSubmitting')
    this.onSecondStepClick = exceptionHandlerDecorator.call(this, [this.onSecondStepClick], 'secondStepSubmitting')
    this.newCodeRequest = exceptionHandlerDecorator.call(this, [this.newCodeRequest], 'newCodeRequestSubmitting')
  }
}
</script>

<style scoped>

</style>
