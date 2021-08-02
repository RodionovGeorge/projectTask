<template>
<q-page
  class="column items-center justify-center"
>
  <transition
    name="registration-component"
    mode="out-in"
  >
    <div
      class="column items-center content-background content-shadow registration-page q-gutter-y-sm"
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
        class="registration-field"
        color="black"
      />
      <q-input
        v-model="userFirstName"
        ref="userFirstName"
        label="Имя"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите ваше имя']"
        class="registration-field"
        color="black"
      />
      <q-input
        v-model="userMiddleName"
        ref="userMiddleName"
        label="Отчество"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите ваше отчество']"
        class="registration-field"
        color="black"
      />
      <q-input
        v-model="userEmail"
        ref="userEmail"
        label="Электронная почта"
        outlined
        :rules="[val => !!val || 'Пожалуйста, введите ваш email']"
        class="registration-field"
        color="black"
      />
      <q-input
        v-model="userGroup"
        outlined
        unmasked-value
        mask="####"
        label="Учебная группа (если есть)"
        class="registration-field"
        color="black"
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
        class="registration-field"
        color="black"
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
</q-page>
</template>

<script>
export default {
  name: 'RegistrationPage',
  data () {
    return {
      step: 1,
      firstStepSubmitting: false,
      secondStepSubmitting: false,
      userLastName: '',
      userFirstName: '',
      userMiddleName: '',
      userEmail: '',
      userGroup: '',
      userSecretCode: ''
    }
  },
  methods: {
    onFirstStepClick () {
      const correctLastNameInput = this.$refs.userLastName.validate()
      const correctMiddleNameInput = this.$refs.userMiddleName.validate()
      const correctFirstNameInput = this.$refs.userFirstName.validate()
      const correctEmailInput = this.$refs.userEmail.validate()
      if (correctLastNameInput && correctMiddleNameInput && correctFirstNameInput && correctEmailInput) {
        // Отправка данных на сервер
        // this.firstStepSubmitting = true
        this.step = 2
      }
    },
    onSecondStepClick () {
      const correctSecretCodeInput = this.$refs.userSecretCode.validate()
      if (correctSecretCodeInput) {
        // Отправка данных на сервер
        // this.firstStepSubmitting = true
        this.secondStepSubmitting = true
      }
    }
  }
}
</script>

<style scoped>

</style>
