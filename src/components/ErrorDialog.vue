<template>
  <q-dialog
    v-model="show"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card
      class="bg-red text-white"
      style="width: 300px"
    >
      <q-card-section>
        <div
          class="text-h6 text-center"
        >
          Ошибка
        </div>
      </q-card-section>

      <q-card-section
        class="q-pt-none text-center"
      >
        {{pErrorMessage}}
      </q-card-section>

      <q-card-actions
        align="center"
        class="bg-white text-black"
      >
        <q-btn
          flat
          label="OK"
          @click="off"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ErrorDialog',
  data () {
    return {
      errorDialogShow: this.pErrorDialogShow
    }
  },
  props: {
    pErrorDialogShow: {
      type: Boolean,
      required: true,
      default: false
    },
    pErrorMessage: {
      type: String,
      required: true,
      default: ''
    }
  },
  methods: {
    off () {
      this.$emit('off')
    }
  },
  computed: {
    show () {
      return this.pErrorDialogShow
    }
  }
}
</script>

<style scoped>

</style>
