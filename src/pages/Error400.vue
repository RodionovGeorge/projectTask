<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div
        style="font-size: 30vh"
      >
        400
      </div>

      <div
        class="text-h2"
      >
        Bad request
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
  name: 'Error400'
}
</script>

<style scoped>

</style>
