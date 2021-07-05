<template>
  <q-page class="row justify-center items-center">
    <q-card flat square style="width:300px">
      <q-card-section>
        <h5 class="q-pa-none q-ma-none text-center">Log in</h5>
        <q-form class="q-gutter-y-md">
          <q-input v-model="login" outlined label="Login" :rules="[value=>value.length > 0 || 'Enter login']"></q-input>
          <q-input v-model="password" outlined type="password" label="Password" :rules="[value=>value.length > 0 || 'Enter password']"></q-input>
          <q-btn type="submit" unelevated outline size="lg" class="full-width" label="Log in"></q-btn>
        </q-form>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-btn flat label="Registration"></q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'pageLogin',
  data () {
    return {
      login: '',
      password: ''
    }
  }
}
</script>
