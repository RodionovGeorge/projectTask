<template>
  <div
    v-if="loading"
    style="margin-bottom: auto; margin-top: auto"
  >
    <q-spinner-radio
      size="100px"
      color="primary"
    />
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    loading: {
      type: Boolean,
      required: true,
      default: false
    }
  }
}
</script>

<style scoped>

</style>
