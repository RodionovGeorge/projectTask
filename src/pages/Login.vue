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
          flat
          no-caps
          label="Регистрация"
        />
        <q-btn
          to="/account-recovery"
          flat
          no-caps
          label="Забыли пароль?"
        >
        </q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'pageLogin',
  data () {
    return {
      enterSubmitting: false,
      login: '',
      password: ''
    }
  },
  methods: {
    onEnter () {
      const correctLoginEnter = this.$refs.login.validate()
      const correctPasswordEnter = this.$refs.password.validate()
      if (correctLoginEnter && correctPasswordEnter) {
        // Что-то интересное
        this.enterSubmitting = true
      }
    }
  }
}
</script>
