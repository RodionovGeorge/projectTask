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
          no-caps
          flat
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
</q-page>
</template>

<script>
export default {
  name: 'ForgotPasswordPage',
  data () {
    return {
      step: 1,
      firstStepSubmitted: false,
      secondStepSubmitted: false,
      thirdStepSubmitted: false,
      fourthStepSubmitted: false,
      userEmail: '',
      userCode: '',
      userNewPassword: ''
    }
  },
  methods: {
    onFirstStepClick () {
      const correctUserEmailInput = this.$refs.userEmail.validate()
      if (correctUserEmailInput) {
        this.step++
      }
    },
    onSecondStepClick () {
      const correctUserCodeInput = this.$refs.userCode.validate()
      if (correctUserCodeInput) {
        this.step++
      }
    },
    onThirdStepClick () {
      const correctUserNewPasswordInput = this.$refs.userNewPassword.validate()
      if (correctUserNewPasswordInput) {
        this.step++ // если успех
      }
    }
  }
}
</script>

<style scoped>

</style>
