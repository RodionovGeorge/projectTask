<template>
  <q-layout view="lHr lpR lfr">
    <q-header bordered class="text-white bg-primary">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar square size="50px">
            <img src="~assets/header-logo.svg">
          </q-avatar>
          Some name
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-footer>
      <q-toolbar>
        <q-toolbar-title>some title</q-toolbar-title>
      </q-toolbar>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  data () {
    return {
    }
  }
}
</script>
