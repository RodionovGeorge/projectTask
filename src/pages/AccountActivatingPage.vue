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
      v-model="userCode"
      ref="userCode"
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
</q-page>
</template>

<script>
export default {
  name: 'AccountActivatingPage',
  data () {
    return {
      userCode: '',
      codeSubmitted: false
    }
  },
  methods: {
    codeSubmit () {
      // Что-то интересное
    },
    newCodeRequest () {
      // Что-то еще более интересное
    }
  }
}
</script>

<style scoped>

</style>
