<template>
  <q-item
    clickable
    target="_self"
    :to="link"
    class="text-black"
  >
    <q-item-section>
      {{title}}
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'mainMenuButton',
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: '/my'
    }
  }
}
</script>
