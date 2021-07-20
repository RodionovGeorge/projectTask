<template>
<q-page
  class="column items-center justify-center"
>
  <div
    class="column items-center content-background content-shadow registration-page q-gutter-y-sm"
  >
    <div
      class="text-h6"
    >
      Регистрация
    </div>
    <q-input
      v-model="userSurname"
      label="Фамилия"
      outlined
      :rules="[val => !!val || 'Пожалуйста, введите вашу фамилию']"
      class="registration-field"
      color="black"
    />
    <q-input
      v-model="userName"
      label="Имя"
      outlined
      :rules="[val => !!val || 'Пожалуйста, введите ваше имя']"
      class="registration-field"
      color="black"
    />
    <q-input
      v-model="userMiddleName"
      label="Отчество"
      outlined
      :rules="[val => !!val || 'Пожалуйста, введите ваше отчество']"
      class="registration-field"
      color="black"
    />
    <q-input
      v-model="userEmail"
      label="Электронная почта"
      outlined
      :rules="[val => !!val || 'Пожалуйста, введите ваш email']"
      class="registration-field"
      color="black"
    />
    <q-input
      v-model="userGroup"
      outlined
      label="Учебная группа"
      class="registration-field"
      color="black"
    />
    <div
      class="row q-gutter-x-sm"
    >
      <q-btn
        label="Отмена"
      />
      <q-btn
        label="Зарегистрироваться"
      />
    </div>
  </div>
</q-page>
</template>

<script>
export default {
  name: 'RegistrationPage',
  data () {
    return {
      userSurname: '',
      userName: '',
      userMiddleName: '',
      userEmail: '',
      userGroup: ''
    }
  }
}
</script>

<style scoped>

</style>
