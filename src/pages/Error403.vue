<template>
  <div
    class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div
        style="font-size: 30vh"
      >
        403
      </div>

      <div
        class="text-h2"
      >
        Forbidden
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="primary"
        unelevated
        to="/"
        label="На главную"
        no-caps
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error403'
}
</script>

<style scoped>

</style>
